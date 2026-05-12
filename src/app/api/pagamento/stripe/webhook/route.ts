import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/lib/mongodb';
import { UserModel, AssinaturaModel } from '@/lib/models';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error(`[stripe/webhook] Signature verification failed.`, err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    await connectDB();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, plano } = session.metadata as any;

      const expira = plano === 'anual'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await UserModel.findByIdAndUpdate(userId, {
        plano: 'premium',
        stripeCustomerId: session.customer as string,
        assinaturaStatus: 'ativa',
        assinaturaExpira: expira,
      });

      await AssinaturaModel.create({
        user_id: userId,
        plano,
        status: 'ativa',
        gateway: 'stripe',
        gatewaySubscriptionId: session.subscription as string,
        valor: plano === 'anual' ? 348 : 39,
        expira,
      });

      console.log(`[stripe/webhook] Pagamento confirmado para o usuário ${userId}`);
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      await UserModel.findOneAndUpdate(
        { stripeCustomerId: subscription.customer as string },
        { plano: 'free', assinaturaStatus: 'cancelada' }
      );
      console.log(`[stripe/webhook] Assinatura cancelada para o cliente ${subscription.customer}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[stripe/webhook]', err);
    return NextResponse.json({ error: 'Erro no webhook.' }, { status: 500 });
  }
}

