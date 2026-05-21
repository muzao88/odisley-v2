export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Validar variáveis de ambiente obrigatórias
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const JWT_SECRET = process.env.JWT_SECRET;

if (!ADMIN_USER || !ADMIN_PASS || !JWT_SECRET) {
  throw new Error(
    "[admin/login] Variáveis de ambiente obrigatórias não definidas: ADMIN_USER, ADMIN_PASS, JWT_SECRET. Defina-as no .env.local e no painel de deploy.",
  );
}

// Após o guard acima, as variáveis são garantidamente strings
const JWT_SECRET_SAFE = JWT_SECRET as string;

export async function POST(req: NextRequest) {
  try {
    const { usuario, senha } = await req.json();

    if (usuario !== ADMIN_USER || senha !== ADMIN_PASS) {
      // Delay artificial para dificultar brute-force
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json(
        { error: "Usuário ou senha incorretos." },
        { status: 401 },
      );
    }

    const token = jwt.sign({ role: "admin", usuario }, JWT_SECRET_SAFE, {
      expiresIn: "4h",
    });

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
