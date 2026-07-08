import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel, PasswordResetTokenModel } from '@/lib/models';
import { rateLimit } from '@/lib/rateLimit';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123'); // Fallback placeholder if missing

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    // Identificador para rate limit: email e IP
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const identifier = `forgot_pwd_${email}_${ip}`;
    
    // Max 3 pedidos por email a cada 15 min
    if (!rateLimit(identifier, 3, 15 * 60 * 1000)) {
      return NextResponse.json({ error: 'Muitas requisições. Tente novamente mais tarde.' }, { status: 429 });
    }

    await connectDB();
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() });

    // Se não achar o usuário, retorna sucesso para não revelar se o email existe
    if (!user) {
      return NextResponse.json({ message: 'Se o e-mail existir, você receberá um link em instantes.' });
    }

    // Invalida tokens antigos do mesmo usuário
    await PasswordResetTokenModel.updateMany(
      { userId: user._id, used: false },
      { $set: { used: true } }
    );

    // Gera token seguro e seu hash
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    await PasswordResetTokenModel.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${origin}/redefinir-senha?token=${resetToken}`;

    // Envia o e-mail
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Odisley Matemática <naoresponda@odisley.com.br>', // Altere para o seu domínio verificado no Resend
        to: user.email,
        subject: 'Redefinição de Senha - Odisley Matemática',
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #6366f1;">Olá, ${user.nome}!</h2>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <a href="${resetUrl}" style="display: inline-block; margin-top: 10px; margin-bottom: 20px; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Redefinir Senha</a>
            <p>Este link expira em 30 minutos.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eaeaea;" />
            <p style="font-size: 12px; color: #666;">Se você não solicitou a redefinição de senha, pode ignorar este e-mail com segurança. A sua senha não será alterada a menos que você acesse o link acima.</p>
          </div>
        `
      });
    } else {
      console.warn("[Aviso] RESEND_API_KEY não configurada. Simulando envio para:", user.email);
      console.log("Token gerado (url):", resetUrl);
    }

    return NextResponse.json({ message: 'Se o e-mail existir, você receberá um link em instantes.' });
  } catch (error) {
    console.error('Erro no forgot-password:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
