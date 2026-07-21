export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { ProgressoModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json([], { status: 401 });
    }

    const payload = verifyToken(auth.slice(7));
    if (!payload) {
      return NextResponse.json([], { status: 401 });
    }

    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(payload.id);

    const progressos = await ProgressoModel.find({
      user_id: userObjectId,
      concluido: true,
    }).lean();

    const concluidas = progressos.map((p: any) => p.aula_id.toString());
    
    return NextResponse.json(concluidas);
  } catch (err) {
    console.error('[GET /progresso/aulas-concluidas]', err);
    return NextResponse.json([], { status: 500 });
  }
}
