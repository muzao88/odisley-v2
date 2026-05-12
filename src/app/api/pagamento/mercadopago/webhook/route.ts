import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { connectDB } from '@/lib/mongodb';
import { UserModel, AssinaturaModel } from '@/lib/models';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // Mercado Pago envia 'payment' como tipo principal para notificações de pagamento
    if (type === 'payment') {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: data.id });

      if (paymentData.status === 'approved') {
        const { userId, plano } = paymentData.metadata;

        if (!userId) {
          console.warn(`[mercadopago/webhook] Webhook recebido sem userId no metadata: ${data.id}`);
          return NextResponse.json({ ok: true });
        }

        await connectDB();

        const expira = plano === 'anual'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Atualiza usuário para PREMIUM imediatamente
        await UserModel.findByIdAndUpdate(userId, {
          plano: 'premium',
          mercadopagoId: String(paymentData.payer?.id || ''),
          assinaturaStatus: 'ativa',
          assinaturaExpira: expira,
          dataCompra: new Date(),
        });

        // Registra ou atualiza a assinatura no histórico
        await AssinaturaModel.findOneAndUpdate(
          { user_id: userId, gateway: 'mercadopago' },
          {
            plano,
            status: 'ativa',
            gatewaySubscriptionId: String(paymentData.id),
            valor: plano === 'anual' ? 348 : 39,
            expira,
          },
          { upsert: true, new: true }
        );
        
        console.log(`[mercadopago/webhook] Pagamento APROVADO: ${data.id} para o usuário ${userId}. Plano: ${plano}`);
      } else {
        console.log(`[mercadopago/webhook] Pagamento ${data.id} com status: ${paymentData.status}`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[mercadopago/webhook]', err);
    return NextResponse.json({ error: 'Erro no webhook.' }, { status: 500 });
  }
}

