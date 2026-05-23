export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { authRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Validar variáveis de ambiente obrigatórias em runtime
  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!ADMIN_USER || !ADMIN_PASS_HASH || !JWT_SECRET) {
    console.error("[admin/login] Variáveis de ambiente não configuradas na Vercel.");
    return NextResponse.json(
      { error: "Configuração do servidor incompleta." },
      { status: 500 },
    );
  }


  try {
    // Rate limiting para brute-force protection
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (!authRateLimit(ip)) {
      return NextResponse.json(
        { error: "Muitas tentativas de login. Tente novamente em 15 minutos." },
        { status: 429 },
      );
    }

    const { usuario, senha } = await req.json();

    if (!usuario || !senha) {
      return NextResponse.json(
        { error: "Usuário e senha são obrigatórios." },
        { status: 400 },
      );
    }

    // Verificar usuário
    if (usuario !== ADMIN_USER) {
      // Delay artificial para dificultar brute-force
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json(
        { error: "Usuário ou senha incorretos." },
        { status: 401 },
      );
    }

    // Comparar senha com hash bcrypt
    const senhaValida = await bcrypt.compare(senha, ADMIN_PASS_HASH);

    if (!senhaValida) {
      // Delay artificial para dificultar brute-force
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json(
        { error: "Usuário ou senha incorretos." },
        { status: 401 },
      );
    }

    // Gerar JWT
    const token = jwt.sign({ role: "admin", usuario }, JWT_SECRET, {
      expiresIn: "4h",
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("[admin/login] Erro:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
