import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ProgressoModel, ConteudoModel, AulaModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }
    const payload = verifyToken(auth.slice(7));
    if (!payload || payload.id !== params.userId) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    await connectDB();

    const progressos = await ProgressoModel.find({
      user_id: params.userId,
      concluido: true,
    }).lean();

    const aulasConcluidas = new Set(progressos.map((p: any) => p.aula_id.toString()));

    const conteudos = await ConteudoModel.find().lean();
    const result = await Promise.all(
      conteudos.map(async (c: any) => {
        const aulas = await AulaModel.find({ conteudo_id: c._id }).sort({ ordem: 1 }).lean();
        const total = aulas.length;
        const concluidas = aulas.filter((a: any) => aulasConcluidas.has(a._id.toString())).length;
        
        // Encontra a primeira aula não concluída
        const proxima = aulas.find((a: any) => !aulasConcluidas.has(a._id.toString()));

        return {
          conteudo_id: c._id,
          nome: c.nome,
          categoria: c.categoria,
          icone: c.icone,
          total,
          concluidas,
          percentual: total > 0 ? Math.round((concluidas / total) * 100) : 0,
          proximaAula: proxima ? {
            id: proxima._id,
            titulo: proxima.titulo,
            duracao: proxima.duracao,
            ordem: proxima.ordem
          } : null
        };
      })
    );

    return NextResponse.json(result);

  } catch (err) {
    console.error('[GET /progresso/:userId]', err);
    return NextResponse.json({ error: 'Erro ao buscar progresso.' }, { status: 500 });
  }
}
