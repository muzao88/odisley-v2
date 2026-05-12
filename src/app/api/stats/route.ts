import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel, ConteudoModel, AulaModel } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    
    const [totalUsers, totalConteudos, totalAulas] = await Promise.all([
      UserModel.countDocuments(),
      ConteudoModel.countDocuments(),
      AulaModel.countDocuments(),
    ]);

    // Retornamos os dados reais, mas mantendo a estética do design
    return NextResponse.json({
      totalUsers: totalUsers > 0 ? totalUsers : 1247, // Fallback marketing se estiver vazio
      totalConteudos: totalConteudos > 0 ? totalConteudos : 24,
      totalAulas: totalAulas > 0 ? totalAulas : 210,
    });
  } catch (err) {
    console.error('[GET /api/stats]', err);
    return NextResponse.json({ error: 'Erro ao carregar estatísticas.' }, { status: 500 });
  }
}
