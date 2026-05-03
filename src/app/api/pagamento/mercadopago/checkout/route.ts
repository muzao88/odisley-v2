import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel, AssinaturaModel } from '@/lib/models';

// ── POST /api/pagamento/mercadopago/checkout ──────────────────
// Cria preferência de pagamento no MercadoPago (Pix, Boleto, Cartão)
// Em produção: npm install mercadopago
export async function POST(req: NextRequest) {
  try {
    const { plano, userId, email, nome } = await req.json();

    if (!plano || !userId) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    const valor = plano === 'anual' ? 348 : 39;
    const titulo = plano === 'anual' ? 'Odisley Premium — Plano Anual' : 'Odisley Premium — Plano Mensal';

    // ── PRODUÇÃO ─────────────────────────────────────────────
    // const { MercadoPagoConfig, Preference } = require('mercadopago');
    //
    // const client = new MercadoPagoConfig({
    //   accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    // });
    //
    // const preference = new Preference(client);
    // const response = await preference.create({
    //   body: {
    //     items: [{
    //       title: titulo,
    //       unit_price: valor,
    //       quantity: 1,
    //       currency_id: 'BRL',
    //     }],
    //     payer: { email, name: nome },
    //     payment_methods: {
    //       excluded_payment_types: [],
    //       installments: plano === 'anual' ? 12 : 1,
    //     },
    //     back_urls: {
    //       success: `${process.env.NEXT_PUBLIC_URL}/sucesso`,
    //       failure: `${process.env.NEXT_PUBLIC_URL}/planos`,
    //       pending: `${process.env.NEXT_PUBLIC_URL}/pendente`,
    //     },
    //     auto_approve: true,
    //     metadata: { userId, plano },
    //     notification_url: `${process.env.NEXT_PUBLIC_URL}/api/pagamento/mercadopago/webhook`,
    //   },
    // });
    //
    // return NextResponse.json({ url: response.init_point, id: response.id });
    // ─────────────────────────────────────────────────────────

    // Mock para desenvolvimento
    return NextResponse.json({
      url: null,
      mock: true,
      message: 'Configure MERCADOPAGO_ACCESS_TOKEN no .env.local para ativar.',
      plano,
      valor,
      titulo,
    });
  } catch (err) {
    console.error('[mercadopago/checkout]', err);
    return NextResponse.json({ error: 'Erro ao criar preferência de pagamento.' }, { status: 500 });
  }
}
