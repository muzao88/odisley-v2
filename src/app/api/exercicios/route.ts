export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ExercicioModel } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // Busca todos os exercícios para exibir na aba do aluno
    const exercicios = await ExercicioModel.find()
      .populate('conteudo_id', 'nome categoria icone')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(exercicios);
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao buscar exercícios' }, { status: 500 });
  }
}
