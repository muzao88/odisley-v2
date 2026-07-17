import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { FeedbackModel, UserModel } from '@/lib/models';
import { verifyAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

/** Calcula sentimento a partir da nota numérica */
function calcSentiment(rating: number): 'positive' | 'neutral' | 'negative' {
  if (rating >= 4) return 'positive';
  if (rating === 3) return 'neutral';
  return 'negative';
}

/** Calcula média móvel simples de N períodos */
function movingAverage(data: number[], window: number): number[] {
  return data.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    return parseFloat((slice.reduce((s, v) => s + v, 0) / slice.length).toFixed(2));
  });
}

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const sentiment = searchParams.get('sentiment'); // 'positive' | 'neutral' | 'negative' | null
    const plan      = searchParams.get('plan');       // 'free' | 'premium' | null

    // ── 1. Filtro por plano (resolve user_ids primeiro) ───────────────────────
    let userIdFilter: Record<string, unknown> = {};
    if (plan) {
      const users = await UserModel.find({ plano: plan }).select('_id').lean();
      userIdFilter = { user_id: { $in: users.map((u: any) => u._id) } };
    }

    // ── 2. Filtro por sentimento → converte para rating range ─────────────────
    let ratingFilter: Record<string, unknown> = {};
    if (sentiment === 'positive') ratingFilter = { rating: { $gte: 4 } };
    else if (sentiment === 'neutral') ratingFilter = { rating: 3 };
    else if (sentiment === 'negative') ratingFilter = { rating: { $lte: 2 } };

    const filter = { ...userIdFilter, ...ratingFilter };

    // ── 3. Busca feedbacks com dados do usuário ───────────────────────────────
    const feedbacks = await FeedbackModel.find(filter)
      .populate('user_id', 'nome email plano createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const reviews = feedbacks.map((f: any) => ({
      _id:       f._id,
      name:      f.user_id?.nome  ?? 'Anônimo',
      email:     f.user_id?.email ?? '',
      plan:      f.user_id?.plano ?? 'free',
      rating:    f.rating,
      text:      f.comment ?? '',
      suggestion: f.suggestion ?? '',
      requested_content: f.requested_content ?? '',
      progress_feeling: f.progress_feeling,
      likes_platform:   f.likes_platform,
      sentiment: calcSentiment(f.rating),
      date:      f.createdAt,
    }));

    // ── 4. Estatísticas gerais (ignoram filtros) ──────────────────────────────
    const [totalFeedbacks, allStats] = await Promise.all([
      FeedbackModel.countDocuments(),
      FeedbackModel.aggregate([
        { $group: { _id: null, avg: { $avg: '$rating' }, positive: { $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] } }, neutral: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } }, negative: { $sum: { $cond: [{ $lte: ['$rating', 2] }, 1, 0] } } } },
      ]),
    ]);

    const statsRaw   = allStats[0] ?? { avg: 0, positive: 0, neutral: 0, negative: 0 };
    const avgRating  = parseFloat((statsRaw.avg as number).toFixed(1));
    const satisfaction = totalFeedbacks > 0
      ? Math.round(((statsRaw.positive as number) / totalFeedbacks) * 100)
      : 0;

    // ── 5. Tendência diária dos últimos 30 dias + média móvel 7 dias ──────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyAgg = await FeedbackModel.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id:   { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          avg:   { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Gera todos os 30 dias (sem gaps)
    const trendMap: Record<string, { avg: number; count: number }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      trendMap[key] = { avg: 0, count: 0 };
    }
    dailyAgg.forEach((row: any) => {
      trendMap[row._id] = { avg: parseFloat(row.avg.toFixed(2)), count: row.count };
    });

    const trendEntries = Object.entries(trendMap).sort(([a], [b]) => a.localeCompare(b));
    const rawAvgs      = trendEntries.map(([, v]) => v.avg);
    const ma7          = movingAverage(rawAvgs, 7);

    const trend = trendEntries.map(([date, v], i) => ({
      date,             // 'YYYY-MM-DD'
      label: date.slice(5), // 'MM-DD'
      avg:   v.avg,
      count: v.count,
      ma7:   ma7[i],
    }));

    return NextResponse.json({
      reviews,
      stats: {
        total:        totalFeedbacks,
        averageRating: avgRating,
        satisfaction,  // % de reviews positivas
        positive: statsRaw.positive,
        neutral:  statsRaw.neutral,
        negative: statsRaw.negative,
      },
      trend, // 30 days with daily avg + 7-day MA
    });
  } catch (err) {
    console.error('[GET /api/admin/reviews]', err);
    return NextResponse.json({ error: 'Erro ao buscar reviews.' }, { status: 500 });
  }
}
