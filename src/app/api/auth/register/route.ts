export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models';
import { signToken } from '@/lib/auth';
import { sendEmail } from '@/lib/resend';
import { WelcomeEmail } from '@/lib/emails/WelcomeEmail';

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha } = await req.json();

    if (!nome || !email || !senha) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 });
    }
    if (typeof nome !== 'string' || typeof email !== 'string' || typeof senha !== 'string') {
      return NextResponse.json({ error: 'Formato de dados inválido.' }, { status: 400 });
    }
    if (senha.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    await connectDB();

    const existe = await UserModel.findOne({ email });
    if (existe) {
      return NextResponse.json({ error: 'E-mail já cadastrado.' }, { status: 409 });
    }

    const hash = await bcrypt.hash(senha, 12);
    const user = await UserModel.create({
      nome,
      email,
      senha: hash,
      ultimoAcesso: new Date(),
      emailBoasVindasEnviado: false,
    });

    // Envia e-mail de boas-vindas de forma assíncrona/não-bloqueante
    sendEmail({
      to: user.email,
      subject: 'Bem-vindo(a) à Odisley Matemática! 🚀',
      react: WelcomeEmail({ nome: user.nome }),
    }).then(async (res) => {
      if (res.success) {
        await UserModel.findByIdAndUpdate(user._id, { emailBoasVindasEnviado: true });
      }
    }).catch((err) => {
      console.error('[register email async error]', err);
    });

    const token = signToken({ id: user._id, email: user.email, plano: user.plano });

    return NextResponse.json({
      token,
      user: { _id: user._id, nome: user.nome, email: user.email, plano: user.plano, progresso_total: 0, provider: user.provider },
    }, { status: 201 });
  } catch (err: any) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
