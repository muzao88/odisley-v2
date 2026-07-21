export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models';
import { sendEmail } from '@/lib/resend';
import { InactiveEmail } from '@/lib/emails/InactiveEmail';

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  try {
    // 1. Verificação de Autenticação / Secret Token
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret) {
      const authHeader = req.headers.get('authorization');
      const urlKey = req.nextUrl.searchParams.get('key');
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

      if (bearerToken !== cronSecret && urlKey !== cronSecret) {
        console.warn('[Cron Inatividade] Acesso negado: Secret token inválido ou ausente.');
        return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
      }
    }

    await connectDB();

    // 2. Definir o limite de inatividade (>= 2 dias atrás)
    const doisDiasEmMs = 2 * 24 * 60 * 60 * 1000;
    const doisDiasAtras = new Date(Date.now() - doisDiasEmMs);

    // 3. Buscar alunos inativos com ultimoAcesso <= doisDiasAtras E emailInatividadeEnviado != true
    const alunosInativos = await UserModel.find({
      ultimoAcesso: { $lte: doisDiasAtras },
      emailInatividadeEnviado: { $ne: true },
    }).select('_id nome email ultimoAcesso emailInatividadeEnviado');

    const totalFound = alunosInativos.length;
    console.log(`[Cron Inatividade] ${totalFound} alunos inativos encontrados (sem acesso desde ${doisDiasAtras.toISOString()}).`);

    let enviados = 0;
    let falhas = 0;

    // 4. Processar envios
    for (const aluno of alunosInativos) {
      try {
        // Marcação Otimista: Marca a flag ANTES de disparar o e-mail para evitar envios duplicados por retries da Vercel
        await UserModel.findByIdAndUpdate(aluno._id, { emailInatividadeEnviado: true });

        const emailResult = await sendEmail({
          to: aluno.email,
          subject: 'Sentimos sua falta na Odisley Matemática! 📚',
          react: InactiveEmail({ nome: aluno.nome }),
        });

        if (emailResult.success) {
          enviados++;
        } else {
          falhas++;
          console.error(`[Cron Inatividade Erro] Revertendo flag do aluno ${aluno.email} devido a erro no envio: ${emailResult.error}`);
          // Reverte a flag para permitir nova tentativa em execução posterior do cron
          await UserModel.findByIdAndUpdate(aluno._id, { emailInatividadeEnviado: false });
        }
      } catch (err: any) {
        falhas++;
        console.error(`[Cron Inatividade Erro] Exceção no processamento do aluno ${aluno.email}:`, err);
        await UserModel.findByIdAndUpdate(aluno._id, { emailInatividadeEnviado: false });
      }
    }

    console.log(`[Cron Inatividade Concluído] Total: ${totalFound} | Enviados: ${enviados} | Falhas: ${falhas}`);

    return NextResponse.json({
      success: true,
      mensagem: `Processamento de e-mails de inatividade concluído.`,
      stats: {
        totalEncontrados: totalFound,
        enviadosComSucesso: enviados,
        falhas,
      },
      executadoEm: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Cron Inatividade Exceção]', err);
    return NextResponse.json(
      { error: 'Erro interno ao processar cron de inatividade.', detalhes: err?.message },
      { status: 500 }
    );
  }
}
