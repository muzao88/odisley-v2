import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: NextRequest) {
  try {
    const { plano, userId } = await req.json();

    if (!plano || !userId) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    const priceId = plano === 'anual'
      ? process.env.STRIPE_PRICE_ANUAL
      : process.env.STRIPE_PRICE_MENSAL;

    if (!priceId) {
      return NextResponse.json({ error: 'Configuração de preços não encontrada.' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/?status=cancelled`,
      // Metadados na sessão (para checkout.session.completed)
      metadata: { userId, plano },
      // Metadados na subscription (para invoice.paid em renovações)
      subscription_data: {
        metadata: { userId, plano },
      },
      locale: 'pt-BR',
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json({ error: 'Erro ao criar sessão de pagamento.' }, { status: 500 });
  }
}

