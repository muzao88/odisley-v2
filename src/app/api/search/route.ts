import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ConteudoModel, AulaModel, ExercicioModel } from '@/lib/models';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    await connectDB();

    const regex = new RegExp(query, 'i');

    // Buscar em Conteudos (Cursos/Módulos)
    const conteudos = await ConteudoModel.find({ nome: regex }).limit(3);
    
    // Buscar em Aulas
    const aulas = await AulaModel.find({ titulo: regex }).limit(3);
    
    // Buscar em Exercícios
    const exercicios = await ExercicioModel.find({ titulo: regex }).limit(3);

    const results = [
      ...conteudos.map(c => ({ _id: c._id, tipo: 'curso', titulo: c.nome })),
      ...aulas.map(a => ({ _id: a._id, tipo: 'aula', titulo: a.titulo })),
      ...exercicios.map(e => ({ _id: e._id, tipo: 'exercicio', titulo: e.titulo }))
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Erro em search:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
