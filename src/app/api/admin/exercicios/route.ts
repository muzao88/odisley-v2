import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ExercicioModel } from '@/lib/models';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();
  const url = new URL(req.url);
  const conteudoId = url.searchParams.get('conteudoId');
  const dificuldade = url.searchParams.get('dificuldade');

  const filter: any = {};
  if (conteudoId && conteudoId !== 'todos') filter.conteudo_id = conteudoId;
  if (dificuldade && dificuldade !== 'todas') filter.dificuldade = dificuldade;

  const exercicios = await ExercicioModel.find(filter)
    .populate('conteudo_id', 'nome')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(exercicios);
}

export async function POST(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();
  const body = await req.json();

  if (!body.titulo || !body.conteudo_id) {
    return NextResponse.json({ error: 'Título e Módulo são obrigatórios.' }, { status: 400 });
  }

  const exercicio = await ExercicioModel.create({
    titulo: body.titulo,
    conteudo_id: body.conteudo_id,
    dificuldade: body.dificuldade || 'Médio',
    tipoAcesso: body.tipoAcesso || 'premium',
    questoes: body.questoes || [],
  });

  return NextResponse.json(exercicio, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();
  const { id, ...update } = await req.json();
  if (!id) return NextResponse.json({ error: 'id obrigatório.' }, { status: 400 });

  const exercicio = await ExercicioModel.findByIdAndUpdate(id, update, { new: true });
  if (!exercicio) return NextResponse.json({ error: 'Exercício não encontrado.' }, { status: 404 });

  return NextResponse.json(exercicio);
}

export async function DELETE(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id obrigatório.' }, { status: 400 });

  await ExercicioModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
