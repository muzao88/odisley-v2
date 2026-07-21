export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { ProgressoModel, AulaModel, UserModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const payload = verifyToken(auth.slice(7));
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }

    const { aula_id } = await req.json();
    if (!aula_id) {
      return NextResponse.json({ error: 'aula_id obrigatório.' }, { status: 400 });
    }

    await connectDB();

    // Converte user_id para ObjectId explicitamente (payload.id é string do JWT,
    // mas user_id no banco é ObjectId — sem conversão explícita o upsert cria
    // registros duplicados com tipos diferentes)
    const userObjectId = new mongoose.Types.ObjectId(payload.id);

    // Upsert progress record
    await ProgressoModel.findOneAndUpdate(
      { user_id: userObjectId, aula_id },
      { concluido: true, data_conclusao: new Date() },
      { upsert: true, new: true }
    );

    // Recalculate total progress for the user
    const totalAulas = await AulaModel.countDocuments();
    const totalConcluidas = await ProgressoModel.countDocuments({
      user_id: userObjectId,
      concluido: true,
    });
    const progresso_total = totalAulas > 0
      ? Math.round((totalConcluidas / totalAulas) * 100)
      : 0;

    await UserModel.findByIdAndUpdate(payload.id, { progresso_total });

    return NextResponse.json({ ok: true, progresso_total });
  } catch (err) {
    console.error('[POST /progresso]', err);
    return NextResponse.json({ error: 'Erro ao salvar progresso.' }, { status: 500 });
  }
}
