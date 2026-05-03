import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel, AssinaturaModel } from '@/lib/models';

// ── POST /api/pagamento/stripe/checkout ───────────────────────
// Cria uma sessão de checkout no Stripe e retorna a URL
// Em produção: npm install stripe
export async function POST(req: NextRequest) {
  try {
    const { plano, userId } = await req.json();

    if (!plano || !userId) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    // ── PRODUÇÃO ─────────────────────────────────────────────
    // const Stripe = require('stripe');
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    //
    // const priceId = plano === 'anual'
    //   ? process.env.STRIPE_PRICE_ANUAL   // ex: price_1ABC...
    //   : process.env.STRIPE_PRICE_MENSAL; // ex: price_1XYZ...
    //
    // const session = await stripe.checkout.sessions.create({
    //   mode: 'subscription',
    //   payment_method_types: ['card'],
    //   line_items: [{ price: priceId, quantity: 1 }],
    //   success_url: `${process.env.NEXT_PUBLIC_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_URL}/planos`,
    //   metadata: { userId, plano },
    //   locale: 'pt-BR',
    // });
    //
    // return NextResponse.json({ url: session.url });
    // ─────────────────────────────────────────────────────────

    // Mock para desenvolvimento (remove em produção)
    return NextResponse.json({
      url: null,
      mock: true,
      message: 'Configure STRIPE_SECRET_KEY no .env.local para ativar o checkout real.',
      plano,
      valor: plano === 'anual' ? 348 : 39,
    });
  } catch (err) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'Erro ao criar sessão de pagamento.' }, { status: 500 });
  }
}
