import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel, AssinaturaModel } from '@/lib/models';

// ── POST /api/pagamento/stripe/webhook ────────────────────────
// Recebe eventos do Stripe (pagamento confirmado, cancelamento, etc.)
// e atualiza o plano do usuário automaticamente
//
// No painel do Stripe, configure o webhook para apontar para:
// https://seusite.vercel.app/api/pagamento/stripe/webhook
// Eventos: checkout.session.completed, customer.subscription.deleted
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    // ── PRODUÇÃO ─────────────────────────────────────────────
    // const Stripe = require('stripe');
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    //
    // let event;
    // try {
    //   event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    // } catch (err: any) {
    //   return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    // }
    //
    // await connectDB();
    //
    // if (event.type === 'checkout.session.completed') {
    //   const session = event.data.object;
    //   const { userId, plano } = session.metadata;
    //   const expira = plano === 'anual'
    //     ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    //     : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    //
    //   await UserModel.findByIdAndUpdate(userId, {
    //     plano: 'premium',
    //     stripeCustomerId: session.customer,
    //     assinaturaStatus: 'ativa',
    //     assinaturaExpira: expira,
    //   });
    //
    //   await AssinaturaModel.create({
    //     user_id: userId,
    //     plano,
    //     status: 'ativa',
    //     gateway: 'stripe',
    //     gatewaySubscriptionId: session.subscription,
    //     valor: plano === 'anual' ? 348 : 39,
    //     expira,
    //   });
    // }
    //
    // if (event.type === 'customer.subscription.deleted') {
    //   const subscription = event.data.object;
    //   await UserModel.findOneAndUpdate(
    //     { stripeCustomerId: subscription.customer },
    //     { plano: 'free', assinaturaStatus: 'cancelada' }
    //   );
    // }
    // ─────────────────────────────────────────────────────────

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[stripe/webhook]', err);
    return NextResponse.json({ error: 'Erro no webhook.' }, { status: 500 });
  }
}
