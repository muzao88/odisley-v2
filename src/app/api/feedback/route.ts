import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { FeedbackModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }
    const payload = verifyToken(auth.slice(7));
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }

    await connectDB();
    const feedback = await FeedbackModel.findOne({ user_id: payload.id });

    return NextResponse.json({ feedback });
  } catch (err) {
    console.error('[GET /api/feedback]', err);
    return NextResponse.json({ error: 'Erro ao buscar feedback.' }, { status: 500 });
  }
}

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

    const data = await req.json();
    const { rating, likes_platform, progress_feeling, comment, suggestion, requested_content } = data;

    if (!rating || !likes_platform || !progress_feeling) {
      return NextResponse.json({ error: 'Dados obrigatórios ausentes.' }, { status: 400 });
    }

    await connectDB();

    const feedback = await FeedbackModel.findOneAndUpdate(
      { user_id: payload.id },
      {
        rating,
        likes_platform,
        progress_feeling,
        comment,
        suggestion,
        requested_content,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: 'Feedback enviado com sucesso!', feedback });
  } catch (err) {
    console.error('[POST /api/feedback]', err);
    return NextResponse.json({ error: 'Erro ao enviar feedback.' }, { status: 500 });
  }
}
