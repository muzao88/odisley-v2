export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ExercicioModel } from '@/lib/models';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const exercicio = await ExercicioModel.findById(id)
      .populate('conteudo_id', 'nome categoria icone')
      .lean();

    if (!exercicio) {
      return NextResponse.json({ error: 'Exercício não encontrado' }, { status: 404 });
    }

    return NextResponse.json(exercicio);
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao buscar exercício' }, { status: 500 });
  }
}
