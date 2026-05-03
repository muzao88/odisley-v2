import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json();

    if (!email || !senha) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 });
    }

    await connectDB();

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const valido = await bcrypt.compare(senha, user.senha);
    if (!valido) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const token = signToken({ id: user._id, email: user.email, plano: user.plano });

    return NextResponse.json({
      token,
      user: {
        _id: user._id,
        nome: user.nome,
        email: user.email,
        plano: user.plano,
        progresso_total: user.progresso_total,
      },
    });
  } catch (err: any) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
