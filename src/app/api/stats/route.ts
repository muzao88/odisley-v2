import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel, ConteudoModel, AulaModel } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    
    const [activeStudents, contents, videoLessons] = await Promise.all([
      UserModel.countDocuments(),
      ConteudoModel.countDocuments(),
      AulaModel.countDocuments(),
    ]);

    return NextResponse.json({
      activeStudents,
      contents,
      videoLessons,
      averageRating: null, // Ainda não implementado no banco
    });
  } catch (err) {
    console.error('[GET /api/stats]', err);
    return NextResponse.json({ error: 'Erro ao carregar estatísticas.' }, { status: 500 });
  }
}
