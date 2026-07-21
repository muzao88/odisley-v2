import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel, NotificationModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
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
    const user = await UserModel.findById(decoded.id).select('nome streakAtual streakMaximo ultimaAtividade');

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Calcula e ajusta o streak no momento da visualização se necessário
    const agora = new Date();
    const ultimaAtividade = user.ultimaAtividade ? new Date(user.ultimaAtividade) : null;
    let perdeuStreak = false;

    if (ultimaAtividade) {
      const getMidnightInSaoPaulo = (d: Date) => {
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Sao_Paulo', year: 'numeric', month: 'numeric', day: 'numeric'
        }).formatToParts(d);
        const year = parseInt(parts.find(p => p.type === 'year')?.value || '0', 10);
        const month = parseInt(parts.find(p => p.type === 'month')?.value || '0', 10) - 1;
        const day = parseInt(parts.find(p => p.type === 'day')?.value || '0', 10);
        return new Date(year, month, day);
      };
      
      const msPorDia = 1000 * 60 * 60 * 24;
      const dataAgora = getMidnightInSaoPaulo(agora);
      const dataUltima = getMidnightInSaoPaulo(ultimaAtividade);
      
      const diferencaDias = Math.round((dataAgora.getTime() - dataUltima.getTime()) / msPorDia);
      
      if (diferencaDias > 1 && user.streakAtual > 0) {
        // Passou de 1 dia desde a última atividade, perdeu a ofensiva (mas não zera até que ele logue, porém para exibição é zero ou precisa resetar. Vamos mostrar 0)
        perdeuStreak = true;
      }
    }

    const streakDisplay = perdeuStreak ? 0 : (user.streakAtual || 0);

    const notifications = await NotificationModel.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const unreadCount = await NotificationModel.countDocuments({ userId: user._id, lida: false });

    return NextResponse.json({
      nome: user.nome,
      streak: streakDisplay,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Erro em topbar-data:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
