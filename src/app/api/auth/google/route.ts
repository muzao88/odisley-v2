import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/lib/models";
import { signToken } from "@/lib/auth";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
  throw new Error(
    "[auth/google] GOOGLE_CLIENT_ID não definido nas variáveis de ambiente.",
  );
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ── POST /api/auth/google ─────────────────────────────────────
// Recebe o token do Google (obtido no front-end via Google Identity)
// Valida com a API do Google, cria ou busca o usuário no banco
// e retorna nosso JWT próprio
export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json(
        { error: "Token do Google não fornecido." },
        { status: 400 },
      );
    }

    // Verifica a assinatura criptográfica do token junto aos servidores do Google.
    // Isso garante que o token é genuíno e não foi forjado.
    let googlePayload: any;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      googlePayload = ticket.getPayload();
    } catch {
      return NextResponse.json(
        { error: "Token do Google inválido ou expirado." },
        { status: 401 },
      );
    }

    if (!googlePayload) {
      return NextResponse.json(
        { error: "Não foi possível obter dados do Google." },
        { status: 401 },
      );
    }

    const { sub: googleId, email, name, picture } = googlePayload;

    if (!email || !googleId) {
      return NextResponse.json(
        { error: "Dados insuficientes do Google." },
        { status: 400 },
      );
    }

    await connectDB();

    let user = await UserModel.findOne({
      $or: [{ email }, { providerId: googleId, provider: "google" }],
    });

    let isNewUser = false;

    if (!user) {
      // Cria novo usuário via Google
      isNewUser = true;
      user = await UserModel.create({
        nome: name || email.split("@")[0],
        email,
        senha: null,
        provider: "google",
        providerId: googleId,
        avatar: picture || null,
        plano: "free",
      });
    } else if (user.provider === "local") {
      // Usuário existente com e-mail — vincula conta Google
      user.provider = "google";
      user.providerId = googleId;
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    }

    const token = signToken({
      id: user._id,
      email: user.email,
      plano: user.plano,
    });

    return NextResponse.json({
      token,
      isNewUser,
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
    console.error("[POST /api/auth/google]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
