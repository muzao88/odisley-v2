import { NextRequest, NextResponse } from 'next/server';
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

    const result = await Promise.all(
      conteudos.map(async (c: any) => {
        let aulasConcluidasCount = 0;
        if (userId) {
          const aulas = await AulaModel.find({ conteudo_id: c._id }).select('_id').lean();
          const aulaIds = aulas.map((a: any) => a._id);
          aulasConcluidasCount = await ProgressoModel.countDocuments({
            user_id: userId,
            aula_id: { $in: aulaIds },
            concluido: true,
          });
        }
        const percentual = c.totalAulas > 0
          ? Math.round((aulasConcluidasCount / c.totalAulas) * 100)
          : 0;

        return { ...c, aulasConcluidasCount, percentual };
      })
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error('[GET /conteudos]', err);
    return NextResponse.json({ error: 'Erro ao buscar conteúdos.' }, { status: 500 });
  }
}
