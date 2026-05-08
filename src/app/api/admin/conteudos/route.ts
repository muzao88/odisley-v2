import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ConteudoModel } from '@/lib/models';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();
  const conteudos = await ConteudoModel.find().sort({ categoria: 1, nome: 1 }).lean();
  return NextResponse.json(conteudos);
}

export async function POST(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();
  const body = await req.json();

  const conteudo = await ConteudoModel.create({
    nome:          body.nome,
    categoria:     body.categoria,
    descricao:     body.descricao || '',
    icone:         body.icone || '📚',
    totalAulas:    body.totalAulas || 0,
    aulasGratuitas: body.aulasGratuitas || 0,
  });

  return NextResponse.json(conteudo, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();
  const { id, ...update } = await req.json();
  if (!id) return NextResponse.json({ error: 'id obrigatório.' }, { status: 400 });

  const conteudo = await ConteudoModel.findByIdAndUpdate(id, update, { new: true });
  if (!conteudo) return NextResponse.json({ error: 'Conteúdo não encontrado.' }, { status: 404 });

  return NextResponse.json(conteudo);
}

export async function DELETE(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id obrigatório.' }, { status: 400 });

  await ConteudoModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
