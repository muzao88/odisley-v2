export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { AulaModel, ProgressoModel, UserModel } from "@/lib/models";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectDB();

    const aulas = await AulaModel.find({ conteudo_id: id })
      .sort({ ordem: 1 })
      .lean();

    // Obtém dados do usuário autenticado (opcional)
    const auth = req.headers.get("authorization");
    let userId: string | null = null;
    let plano: "free" | "premium" = "free";

    if (auth?.startsWith("Bearer ")) {
      const payload = verifyToken(auth.slice(7));
      if (payload) {
        userId = payload.id;
        const user = (await UserModel.findById(payload.id)
          .select("plano")
          .lean()) as { plano?: string } | null;
        if (user?.plano === "premium") plano = "premium";
      }
    }

    // Progresso do usuário para este conteúdo
    let progressoSet = new Set<string>();
    if (userId) {
      const progressos = await ProgressoModel.find({
        user_id: userId,
        aula_id: { $in: aulas.map((a: any) => a._id) },
        concluido: true,
      }).lean();
      progressos.forEach((p: any) => progressoSet.add(p.aula_id.toString()));
    }

    const result = aulas.map((aula: any) => {
      // Regra de bloqueio — simples e definitiva:
      // - tipo "free"    → sempre acessível (para qualquer usuário)
      // - tipo "premium" → bloqueada para usuários free, liberada para premium
      //
      // O campo `aulasGratuitas` no conteúdo é apenas um indicador visual
      // (quantas aulas foram marcadas como free). NÃO é usado para liberar
      // acesso aqui — o `tipo` individual de cada aula é a fonte de verdade.
      const bloqueada = plano !== "premium" && aula.tipo === "premium";

      const concluida = progressoSet.has(aula._id.toString());
      return { ...aula, concluida, bloqueada };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /conteudos/:id/aulas]", err);
    return NextResponse.json(
      { error: "Erro ao buscar aulas." },
      { status: 500 },
    );
  }
}
