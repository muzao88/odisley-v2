import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
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
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const agora = new Date();
    const ultimaAtividade = user.ultimaAtividade ? new Date(user.ultimaAtividade) : null;
    
    let novoStreakAtual = user.streakAtual || 0;
    
    if (ultimaAtividade) {
      const dataAgora = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
      const dataUltima = new Date(ultimaAtividade.getFullYear(), ultimaAtividade.getMonth(), ultimaAtividade.getDate());
      
      const msPorDia = 1000 * 60 * 60 * 24;
      const diferencaDias = Math.floor((dataAgora.getTime() - dataUltima.getTime()) / msPorDia);

      if (diferencaDias === 1) {
        // Logou no dia seguinte (streak continua)
        novoStreakAtual += 1;
      } else if (diferencaDias > 1) {
        // Quebrou o streak
        novoStreakAtual = 1;
      }
      // Se for 0 (mesmo dia), mantém o streak
    } else {
      // Primeira atividade
      novoStreakAtual = 1;
    }

    const streakMaximo = Math.max(user.streakMaximo || 0, novoStreakAtual);

    await UserModel.findByIdAndUpdate(user._id, {
      $set: {
        ultimaAtividade: agora,
        streakAtual: novoStreakAtual,
        streakMaximo: streakMaximo
      }
    });

    return NextResponse.json({ success: true, streakAtual: novoStreakAtual });
  } catch (error) {
    console.error('Erro em user-activity:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
