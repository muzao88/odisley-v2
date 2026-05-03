import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models';
import { signToken } from '@/lib/auth';

// ── POST /api/auth/google ─────────────────────────────────────
// Recebe o token do Google (obtido no front-end via Google Identity)
// Valida com a API do Google, cria ou busca o usuário no banco
// e retorna nosso JWT próprio
export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json({ error: 'Token do Google não fornecido.' }, { status: 400 });
    }

    // Decodifica o JWT do Google (sem verificar assinatura aqui — em produção use a lib google-auth-library)
    // Para produção: npm install google-auth-library
    // const { OAuth2Client } = require('google-auth-library');
    // const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    // const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    // const payload = ticket.getPayload();

    // Decodificação simples do JWT (base64) — APENAS PARA DESENVOLVIMENTO
    // Em produção, substitua pelo bloco comentado acima
    const parts = credential.split('.');
    if (parts.length < 2) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 400 });
    }

    let payload: any;
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
    } catch {
      return NextResponse.json({ error: 'Erro ao decodificar token.' }, { status: 400 });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email || !googleId) {
      return NextResponse.json({ error: 'Dados insuficientes do Google.' }, { status: 400 });
    }

    await connectDB();

    // Busca usuário existente pelo email ou pelo providerId
    let user = await UserModel.findOne({
      $or: [{ email }, { providerId: googleId, provider: 'google' }],
    });

    if (!user) {
      // Cria novo usuário via Google
      user = await UserModel.create({
        nome: name || email.split('@')[0],
        email,
        senha: null,
        provider: 'google',
        providerId: googleId,
        avatar: picture || null,
        plano: 'free',
      });
    } else if (user.provider === 'local') {
      // Usuário existente com e-mail — vincula conta Google
      user.provider = 'google';
      user.providerId = googleId;
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    }

    const token = signToken({ id: user._id, email: user.email, plano: user.plano });

    return NextResponse.json({
      token,
      user: {
        _id: user._id,
        nome: user.nome,
        email: user.email,
        plano: user.plano,
        avatar: user.avatar,
        progresso_total: user.progresso_total,
      },
    });
  } catch (err) {
    console.error('[POST /api/auth/google]', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
