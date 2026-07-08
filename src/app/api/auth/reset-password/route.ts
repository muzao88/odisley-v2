import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel, PasswordResetTokenModel } from '@/lib/models';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, novaSenha } = await req.json();

    if (!token || !novaSenha || novaSenha.length < 6) {
      return NextResponse.json({ error: 'Dados inválidos ou senha muito curta (mínimo 6 caracteres).' }, { status: 400 });
    }

    await connectDB();

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetTokenDoc = await PasswordResetTokenModel.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetTokenDoc) {
      return NextResponse.json({ error: 'Link de redefinição inválido ou expirado. Por favor, solicite um novo.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    // Atualiza a senha do usuário
    await UserModel.findByIdAndUpdate(resetTokenDoc.userId, {
      $set: { senha: hashedPassword }
    });

    // Marca o token como usado
    await PasswordResetTokenModel.findByIdAndUpdate(resetTokenDoc._id, {
      $set: { used: true }
    });

    return NextResponse.json({ message: 'Senha alterada com sucesso!' });
  } catch (error) {
    console.error('Erro no reset-password:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
