export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel, ConteudoModel, AulaModel, AssinaturaModel, ProgressoModel } from '@/lib/models';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();

  const [totalUsuarios, totalPremium, totalConteudos, totalAulas, assinaturasAtivas] =
    await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ plano: 'premium' }),
      ConteudoModel.countDocuments(),
      AulaModel.countDocuments(),
      AssinaturaModel.countDocuments({ status: 'ativa' }),
    ]);

  // ── 1. Cadastros por mês (últimos 6 meses incluindo o mês atual) ──────────
  const now = new Date();
  const seisMesesAtras = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const usuariosRecentes = await UserModel.find({
    createdAt: { $gte: seisMesesAtras }
  }).select('createdAt').lean();

  const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const mapCadastros: Record<string, number> = {};

  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const label = `${mesesNomes[d.getMonth()]}/${String(d.getFullYear()).slice(-2)}`;
    mapCadastros[label] = 0;
  }

  usuariosRecentes.forEach((u: any) => {
    if (!u.createdAt) return;
    const date = new Date(u.createdAt);
    const label = `${mesesNomes[date.getMonth()]}/${String(date.getFullYear()).slice(-2)}`;
    if (label in mapCadastros) {
      mapCadastros[label]++;
    }
  });

  const cadastrosPorMes = Object.entries(mapCadastros).map(([name, cadastros]) => ({
    name,
    cadastros,
  }));

  // ── 2. Engajamento por curso ──────────────────────────────────────────────
  const conteudos = await ConteudoModel.find().lean();
  const aulas = await AulaModel.find().select('_id conteudo_id').lean();
  const progressos = await ProgressoModel.find({ concluido: true }).select('user_id aula_id').lean();

  // aula_id → conteudo_id (string → string)
  const aulaToConteudo: Record<string, string> = {};
  aulas.forEach((a: any) => {
    aulaToConteudo[a._id.toString()] = a.conteudo_id.toString();
  });

  // conteudo_id → total de aulas
  const totalAulasPorCurso: Record<string, number> = {};
  conteudos.forEach((c: any) => { totalAulasPorCurso[c._id.toString()] = 0; });
  aulas.forEach((a: any) => {
    const cId = a.conteudo_id.toString();
    if (cId in totalAulasPorCurso) totalAulasPorCurso[cId]++;
  });

  // "user:curso" → aulas concluídas naquele curso por aquele user
  const completedMap: Record<string, number> = {};
  progressos.forEach((p: any) => {
    const cId = aulaToConteudo[p.aula_id.toString()];
    if (!cId) return;
    const key = `${p.user_id.toString()}:${cId}`;
    completedMap[key] = (completedMap[key] || 0) + 1;
  });

  // calcula média de progresso por curso somando as porcentagens de cada aluno
  const engajamentoCursos = conteudos
    .map((c: any) => {
      const cId = c._id.toString();
      const totalAulasCurso = totalAulasPorCurso[cId] || 0;

      if (totalAulasCurso === 0) return { name: c.nome, percentual: 0 };

      let sum = 0;
      let usersWithProgress = 0;
      Object.entries(completedMap).forEach(([key, completed]) => {
        const [, courseId] = key.split(':');
        if (courseId !== cId) return;
        usersWithProgress++;
        sum += Math.min(100, (completed / totalAulasCurso) * 100);
      });

      // Se nenhum aluno acessou, retorna 0
      const avg = usersWithProgress > 0 ? Math.round(sum / usersWithProgress) : 0;
      return { name: c.nome, percentual: avg };
    })
    .sort((a, b) => b.percentual - a.percentual)
    .slice(0, 8); // top 8 cursos

  // ── Últimos 5 usuários cadastrados ───────────────────────────────────────
  const recentes = await UserModel
    .find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('nome email plano createdAt')
    .lean();

  return NextResponse.json({
    totalUsuarios,
    totalPremium,
    totalFree: totalUsuarios - totalPremium,
    totalConteudos,
    totalAulas,
    assinaturasAtivas,
    recentes,
    cadastrosPorMes,
    engajamentoCursos,
  });
}
