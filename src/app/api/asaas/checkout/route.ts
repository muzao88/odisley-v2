import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel, AssinaturaModel } from '@/lib/models';
import { getServerSession } from 'next-auth'; // assumindo que pode usar next-auth no futuro, ou auth custom

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, plano, billingType, creditCard, creditCardHolderInfo } = body;
    // plano deve ser 'mensal' ou 'anual'
    // billingType: 'CREDIT_CARD', 'PIX', 'BOLETO'

    if (!userId || !plano || !billingType) {
      return NextResponse.json({ error: 'Faltam dados (userId, plano, billingType)' }, { status: 400 });
    }

    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    if (!ASAAS_API_KEY) {
      return NextResponse.json({ error: 'ASAAS_API_KEY não configurada' }, { status: 500 });
    }

    const user = await UserModel.findById(userId);
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const headers = {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
    };

    // 1. Criar ou Obter Customer no Asaas
    let customerId = user.asaasCustomerId;
    
    if (!customerId) {
      const customerRes = await fetch('https://api.asaas.com/v3/customers', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: user.nome,
          email: user.email,
        }),
      });
      
      const customerData = await customerRes.json();
      
      if (!customerRes.ok) {
        return NextResponse.json({ error: 'Erro ao criar Customer no Asaas', details: customerData }, { status: 400 });
      }

      customerId = customerData.id;
      user.asaasCustomerId = customerId;
      await user.save();
    }

    // 2. Criar a Assinatura (Subscription)
    const valor = plano === 'mensal' ? 39.00 : 29.00;
    const cycle = plano === 'mensal' ? 'MONTHLY' : 'YEARLY';
    
    const subscriptionPayload: any = {
      customer: customerId,
      billingType, // PIX, BOLETO, CREDIT_CARD
      value: plano === 'anual' ? 29.00 * 12 : 39.00, // No anual cobra R$ 348/ano, ou R$ 29 se a regra de negócio for R$29 * 12
      nextDueDate: new Date().toISOString().split('T')[0], // Cobrar hoje
      cycle,
      description: `Assinatura ${plano} - Odisley`
    };

    if (billingType === 'CREDIT_CARD' && creditCard && creditCardHolderInfo) {
      subscriptionPayload.creditCard = creditCard;
      subscriptionPayload.creditCardHolderInfo = creditCardHolderInfo;
    }

    const subRes = await fetch('https://api.asaas.com/v3/subscriptions', {
      method: 'POST',
      headers,
      body: JSON.stringify(subscriptionPayload),
    });

    const subData = await subRes.json();

    if (!subRes.ok) {
      return NextResponse.json({ error: 'Erro ao criar Subscription no Asaas', details: subData }, { status: 400 });
    }

    // Opcional: já salvar no banco a assinatura como "pendente" aguardando webhook
    await AssinaturaModel.create({
      user_id: user._id,
      plano,
      status: 'cancelada', // Começa como inativa até confirmar o webhook
      gateway: 'asaas',
      gatewaySubscriptionId: subData.id,
      valor: subData.value,
      expira: new Date(Date.now() + (plano === 'mensal' ? 30 : 365) * 24 * 60 * 60 * 1000)
    });

    return NextResponse.json({ 
      success: true, 
      subscription: subData,
      message: 'Assinatura criada com sucesso. Aguardando confirmação de pagamento.'
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
