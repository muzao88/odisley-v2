import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel, ConteudoModel, AulaModel, AssinaturaModel } from '@/lib/models';
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

  // Últimos 5 usuários cadastrados
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
  });
}
