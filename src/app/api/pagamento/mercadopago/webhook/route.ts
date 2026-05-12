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

    if (type === 'payment') {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: data.id });

      if (paymentData.status === 'approved') {
        const { userId, plano } = paymentData.metadata;

        await connectDB();

        const expira = plano === 'anual'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await UserModel.findByIdAndUpdate(userId, {
          plano: 'premium',
          mercadopagoId: paymentData.payer?.id,
          assinaturaStatus: 'ativa',
          assinaturaExpira: expira,
        });

        await AssinaturaModel.create({
          user_id: userId,
          plano,
          status: 'ativa',
          gateway: 'mercadopago',
          gatewaySubscriptionId: String(paymentData.id),
          valor: plano === 'anual' ? 348 : 39,
          expira,
        });
        
        console.log(`[mercadopago/webhook] Pagamento aprovado: ${data.id} para o usuário ${userId}`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[mercadopago/webhook]', err);
    return NextResponse.json({ error: 'Erro no webhook.' }, { status: 500 });
  }
}

