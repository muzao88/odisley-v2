import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel, AssinaturaModel } from '@/lib/models';

// ── POST /api/pagamento/mercadopago/webhook ───────────────────
// O MercadoPago envia uma notificação (IPN) quando o pagamento muda de status
// Configure no painel do MercadoPago → Suas integrações → Webhooks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // ── PRODUÇÃO ─────────────────────────────────────────────
    // if (type === 'payment') {
    //   const { MercadoPagoConfig, Payment } = require('mercadopago');
    //   const client = new MercadoPagoConfig({
    //     accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    //   });
    //
    //   const payment = new Payment(client);
    //   const paymentData = await payment.get({ id: data.id });
    //
    //   if (paymentData.status === 'approved') {
    //     const { userId, plano } = paymentData.metadata;
    //
    //     await connectDB();
    //
    //     const expira = plano === 'anual'
    //       ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    //       : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    //
    //     await UserModel.findByIdAndUpdate(userId, {
    //       plano: 'premium',
    //       mercadopagoId: paymentData.payer?.id,
    //       assinaturaStatus: 'ativa',
    //       assinaturaExpira: expira,
    //     });
    //
    //     await AssinaturaModel.create({
    //       user_id: userId,
    //       plano,
    //       status: 'ativa',
    //       gateway: 'mercadopago',
    //       gatewaySubscriptionId: String(paymentData.id),
    //       valor: plano === 'anual' ? 348 : 39,
    //       expira,
    //     });
    //   }
    // }
    // ─────────────────────────────────────────────────────────

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[mercadopago/webhook]', err);
    return NextResponse.json({ error: 'Erro no webhook.' }, { status: 500 });
  }
}
