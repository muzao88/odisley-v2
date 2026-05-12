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

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, plano } = session.metadata as any;

        if (!userId) break;

        const expira = plano === 'anual'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Atualiza usuário
        await UserModel.findByIdAndUpdate(userId, {
          plano: 'premium',
          stripeCustomerId: session.customer as string,
          assinaturaStatus: 'ativa',
          assinaturaExpira: expira,
          dataCompra: new Date(),
        });

        // Registra assinatura
        await AssinaturaModel.findOneAndUpdate(
          { user_id: userId, gateway: 'stripe' },
          {
            plano,
            status: 'ativa',
            gatewaySubscriptionId: session.subscription as string,
            valor: plano === 'anual' ? 348 : 39,
            expira,
          },
          { upsert: true, new: true }
        );

        console.log(`[stripe/webhook] Checkout finalizado. Plano liberado para: ${userId}`);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const userId = subscription.metadata.userId;

          if (userId) {
            const expira = new Date(subscription.current_period_end * 1000);
            
            await UserModel.findByIdAndUpdate(userId, {
              plano: 'premium',
              assinaturaStatus: 'ativa',
              assinaturaExpira: expira,
            });

            await AssinaturaModel.findOneAndUpdate(
              { user_id: userId, gateway: 'stripe' },
              { status: 'ativa', expira },
              { upsert: true }
            );
            
            console.log(`[stripe/webhook] Renovação confirmada para o usuário ${userId}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        await UserModel.findOneAndUpdate(
          { stripeCustomerId: customerId },
          { assinaturaStatus: 'cancelada' } // Poderia ser 'atrasada' se preferir
        );
        console.log(`[stripe/webhook] Falha no pagamento da fatura para o cliente ${customerId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await UserModel.findOneAndUpdate(
          { stripeCustomerId: subscription.customer as string },
          { plano: 'free', assinaturaStatus: 'cancelada' }
        );
        
        await AssinaturaModel.findOneAndUpdate(
          { gatewaySubscriptionId: subscription.id },
          { status: 'expirada' }
        );

        console.log(`[stripe/webhook] Assinatura cancelada para o cliente ${subscription.customer}`);
        break;
      }

      default:
        console.log(`[stripe/webhook] Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[stripe/webhook]', err);
    return NextResponse.json({ error: 'Erro no webhook.' }, { status: 500 });
  }
}

