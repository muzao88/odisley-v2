export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { ConteudoModel, AulaModel, ProgressoModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const conteudos = await ConteudoModel.find().sort({ categoria: 1, nome: 1 }).lean();

    // Check auth token (optional — enrich with progress if logged in)
    const auth = req.headers.get('authorization');
    let userId: string | null = null;
    if (auth?.startsWith('Bearer ')) {
      const payload = verifyToken(auth.slice(7));
      if (payload) userId = payload.id;
    }

    // Busca TODOS os progressos do usuário de uma vez.
    // IMPORTANTE: user_id no banco é ObjectId (não string), por isso
    // é necessário converter o userId (string do JWT) para ObjectId antes da query.
    let aulasConcluidas = new Set<string>();
    if (userId) {
      let userIdQuery: any = userId;
      console.log('====== [DEBUG /api/conteudos] ======');
      console.log('userId original (JWT):', userId, '| tipo:', typeof userId);
      try {
        userIdQuery = new mongoose.Types.ObjectId(userId);
        console.log('userIdQuery convertido para ObjectId:', userIdQuery, '| é ObjectId?', userIdQuery instanceof mongoose.Types.ObjectId);
      } catch (err: any) {
        console.log('Falha ao converter userId para ObjectId:', err.message);
      }

      const progressos = await ProgressoModel.find({
        user_id: userIdQuery,
        concluido: true,
      }).select('aula_id').lean();

      console.log('Total de progressos brutos encontrados:', progressos.length);
      if (progressos.length > 0) {
        console.log('Primeiro progresso (raw):', progressos[0]);
      }

      // aula_id no banco também é ObjectId — .toString() normaliza para string
      aulasConcluidas = new Set(progressos.map((p: any) => p.aula_id.toString()));
      console.log('aulasConcluidas (Set size):', aulasConcluidas.size);
      console.log('====================================');
    }

    const result = await Promise.all(
      conteudos.map(async (c: any) => {
        // Busca as aulas reais desse conteúdo (precisa do tipo para contar gratuitas)
        const aulas = await AulaModel.find({ conteudo_id: c._id }).select('_id tipo').lean();

        // Conta aulas gratuitas dinamicamente a partir do campo real no banco
        const aulasGratisDinamica = (aulas as any[]).filter((a) => a.tipo === 'free').length;

        let aulasConcluidasCount = 0;
        if (userId) {
          if (aulas.length > 0) {
            // Aulas reais existem — cruza com o set de concluídas (ambos como string)
            const aulaIds = (aulas as any[]).map((a) => a._id.toString());
            aulasConcluidasCount = aulaIds.filter((id) => aulasConcluidas.has(id)).length;
          } else {
            // Fallback: sem aulas reais — usa IDs mock gerados por mockAulas() em ConteudoPage
            const prefix = mockAulaPrefix(c.nome);
            aulasConcluidasCount = [...aulasConcluidas].filter((id) =>
              id.startsWith(prefix)
            ).length;
          }
        }
        const percentual = c.totalAulas > 0
          ? Math.round((aulasConcluidasCount / c.totalAulas) * 100)
          : 0;

        return { ...c, aulasGratuitas: aulasGratisDinamica, aulasConcluidasCount, percentual };
      })
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error('[GET /conteudos]', err);
    return NextResponse.json({ error: 'Erro ao buscar conteúdos.' }, { status: 500 });
  }
}

// Replica a lógica de geração de _id de mockAulas() em ConteudoPage.tsx (linha 268):
// `aula-${nome.replace(/\s/g, "-").toLowerCase()}-${i}`
function mockAulaPrefix(nome: string): string {
  return `aula-${nome.replace(/\s/g, '-').toLowerCase()}-`;
}
