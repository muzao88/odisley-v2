export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/lib/models";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

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

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }

    await connectDB();

    const user = await UserModel.findById(payload.id);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    if (user.provider && user.provider !== "local") {
      return NextResponse.json({ error: "Contas conectadas via Google/Apple não utilizam senha local." }, { status: 400 });
    }

    // Se o usuário não tiver senha cadastrada por algum motivo (mas provider local)
    if (user.senha) {
      const isMatch = await bcrypt.compare(currentPassword, user.senha);
      if (!isMatch) {
        return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });
      }
    }

    const hash = await bcrypt.hash(newPassword, 12);
    user.senha = hash;
    await user.save();

    return NextResponse.json({ success: true, message: "Senha atualizada com sucesso." });
  } catch (err) {
    console.error("[POST /auth/change-password]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
