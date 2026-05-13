import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { FeedbackModel, UserModel } from '@/lib/models';
import { verifyAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const ratingFilter = searchParams.get('rating');
    const planFilter = searchParams.get('plan');

    const filter: any = {};
    if (ratingFilter) filter.rating = Number(ratingFilter);

    if (planFilter) {
      const users = await UserModel.find({ plano: planFilter }).select('_id').lean();
      const userIds = users.map((u: any) => u._id);
      filter.user_id = { $in: userIds };
    }

    const feedbacks = await FeedbackModel.find(filter)
      .populate('user_id', 'nome email plano')
      .sort({ createdAt: -1 })
      .lean();

    // Estatísticas globais (independente de filtro para o painel de resumo)
    const totalFeedbacks = await FeedbackModel.countDocuments();
    const allStats = await FeedbackModel.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" }
        }
      }
    ]);
    const averageRating = allStats.length > 0 ? allStats[0].avgRating : 0;

    // Principais sugestões
    const suggestions = feedbacks
      .filter((f: any) => f.suggestion)
      .map((f: any) => ({
        text: f.suggestion,
        user: f.user_id?.nome || 'Anônimo'
      }))
      .slice(0, 5);

    return NextResponse.json({
      feedbacks,
      stats: {
        totalFeedbacks,
        averageRating: Number(averageRating.toFixed(1)),
        suggestions
      }
    });
  } catch (err) {
    console.error('[GET /api/admin/feedbacks]', err);
    return NextResponse.json({ error: 'Erro ao buscar feedbacks.' }, { status: 500 });
  }
}
