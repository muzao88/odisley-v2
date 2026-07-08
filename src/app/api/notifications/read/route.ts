import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { NotificationModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    await connectDB();
    
    // Marca todas as notificações não lidas como lidas
    await NotificationModel.updateMany(
      { userId: decoded.id, lida: false },
      { $set: { lida: true } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro em notifications-read:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
