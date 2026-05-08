import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models';
import { verifyAdmin } from '@/lib/adminAuth';

// GET — lista todos os usuários com paginação
export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, Number(searchParams.get('page')  || 1));
  const limit = Math.min(50, Number(searchParams.get('limit') || 20));
  const q     = searchParams.get('q') || '';

  const filter = q
    ? { $or: [
        { nome:  { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ] }
    : {};

  const [users, total] = await Promise.all([
    UserModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('nome email plano progresso_total provider createdAt assinaturaStatus')
      .lean(),
    UserModel.countDocuments(filter),
  ]);

  return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) });
}

// PATCH — altera plano de um usuário
export async function PATCH(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();

  const { userId, plano } = await req.json();
  if (!userId || !['free', 'premium'].includes(plano)) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { plano, assinaturaStatus: plano === 'premium' ? 'ativa' : null },
    { new: true },
  ).select('nome email plano');

  if (!user) return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });

  return NextResponse.json({ ok: true, user });
}

// DELETE — remove usuário
export async function DELETE(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId obrigatório.' }, { status: 400 });

  await UserModel.findByIdAndDelete(userId);
  return NextResponse.json({ ok: true });
}
