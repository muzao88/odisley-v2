export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { UserModel, ProgressoModel, FeedbackModel } from "@/lib/models";
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

    await connectDB();

    const userId = payload.id;

    // Remove do banco de dados
    const userDeleted = await UserModel.findByIdAndDelete(userId);
    if (!userDeleted) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // Limpa dados relacionados
    await ProgressoModel.deleteMany({ user_id: userId });
    await FeedbackModel.deleteMany({ user_id: userId });

    return NextResponse.json({ success: true, message: "Conta excluída com sucesso." });
  } catch (err) {
    console.error("[POST /auth/delete-account]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
