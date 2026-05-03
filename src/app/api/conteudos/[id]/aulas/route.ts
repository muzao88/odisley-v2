import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { AulaModel, ProgressoModel, UserModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const aulas = await AulaModel.find({ conteudo_id: params.id })
      .sort({ ordem: 1 })
      .lean();

    // Get user info
    const auth = req.headers.get('authorization');
    let userId: string | null = null;
    let plano: 'free' | 'premium' = 'free';

    if (auth?.startsWith('Bearer ')) {
      const payload = verifyToken(auth.slice(7));
      if (payload) {
        userId = payload.id;
        const user = await UserModel.findById(payload.id).select('plano').lean() as any;
        if (user) plano = user.plano;
      }
    }

    // Get progress for this user
    let progressoSet = new Set<string>();
    if (userId) {
      const progressos = await ProgressoModel.find({
        user_id: userId,
        aula_id: { $in: aulas.map((a: any) => a._id) },
        concluido: true,
      }).lean();
      progressos.forEach((p: any) => progressoSet.add(p.aula_id.toString()));
    }

    const result = aulas.map((aula: any) => {
      const bloqueada = aula.tipo === 'premium' && plano === 'free';
      const concluida = progressoSet.has(aula._id.toString());
      return { ...aula, concluida, bloqueada };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[GET /conteudos/:id/aulas]', err);
    return NextResponse.json({ error: 'Erro ao buscar aulas.' }, { status: 500 });
  }
}
