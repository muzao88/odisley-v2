import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/lib/models";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const payload = verifyToken(auth.slice(7));
    if (!payload) {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 });
    }

    const { nome } = await req.json();

    if (!nome || typeof nome !== "string" || nome.trim() === "") {
      return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
    }

    await connectDB();

    const user = await UserModel.findByIdAndUpdate(
      payload.id,
      { nome: nome.trim() },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    return NextResponse.json({
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
    console.error("[POST /auth/update-name]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
