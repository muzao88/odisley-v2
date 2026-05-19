export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { AulaModel, ConteudoModel } from '@/lib/models';
import { verifyAdmin } from '@/lib/adminAuth';

// GET — lista aulas de um conteúdo
export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();
  const conteudoId = new URL(req.url).searchParams.get('conteudoId');
  if (!conteudoId) return NextResponse.json({ error: 'conteudoId obrigatório.' }, { status: 400 });

  const aulas = await AulaModel.find({ conteudo_id: conteudoId }).sort({ ordem: 1 }).lean();
  return NextResponse.json(aulas);
}

// POST — cria nova aula
export async function POST(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();
  const body = await req.json();

  // Calcula a próxima ordem automaticamente
  const ultima = await AulaModel
    .findOne({ conteudo_id: body.conteudo_id })
    .sort({ ordem: -1 })
    .select('ordem')
    .lean() as { ordem?: number } | null;

  const ordem = body.ordem ?? ((ultima?.ordem ?? 0) + 1);

  const aula = await AulaModel.create({
    titulo:      body.titulo,
    descricao:   body.descricao || '',
    video_url:   body.video_url || '',
    duracao:     body.duracao || '0:00',
    conteudo_id: body.conteudo_id,
    ordem,
    tipo:        body.tipo || 'premium',
    materialPdf: body.materialPdf || '',
  });

  // Atualiza o totalAulas do conteúdo pai
  await ConteudoModel.findByIdAndUpdate(body.conteudo_id, {
    $inc: { totalAulas: 1 },
  });

  return NextResponse.json(aula, { status: 201 });
}

// PATCH — edita uma aula
export async function PATCH(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();
  const { id, ...update } = await req.json();
  if (!id) return NextResponse.json({ error: 'id obrigatório.' }, { status: 400 });

  const aula = await AulaModel.findByIdAndUpdate(id, update, { new: true });
  if (!aula) return NextResponse.json({ error: 'Aula não encontrada.' }, { status: 404 });

  return NextResponse.json(aula);
}

// DELETE — remove uma aula
export async function DELETE(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  await connectDB();
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id obrigatório.' }, { status: 400 });

  const aula = await AulaModel.findByIdAndDelete(id);
  if (aula) {
    // Decrementa o totalAulas do conteúdo pai
    await ConteudoModel.findByIdAndUpdate(aula.conteudo_id, {
      $inc: { totalAulas: -1 },
    });
  }

  return NextResponse.json({ ok: true });
}
