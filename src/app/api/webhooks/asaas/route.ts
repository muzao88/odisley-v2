import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel, AssinaturaModel, PaymentModel } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN;
    
    // 1. Validação de Segurança (asaas-access-token header)
    const token = req.headers.get('asaas-access-token');
    
    // Se você tiver configurado o token do webhook no Asaas e no .env.local
    if (ASAAS_WEBHOOK_TOKEN && token !== ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
    }

    const body = await req.json();
    const event = body.event;
    const payment = body.payment;

    if (!event || !payment) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    await connectDB();

    // Encontrar usuário pelo customer do Asaas
    const user = await UserModel.findOne({ asaasCustomerId: payment.customer });
    if (!user) {
      // Se não encontrou, talvez o customer não esteja salvo ou é pagamento avulso não mapeado
      console.warn(`Usuário não encontrado para o customer: ${payment.customer}`);
      return NextResponse.json({ received: true });
    }

    // Salvar/Atualizar a cobrança (payment) para o dashboard financeiro
    await PaymentModel.findOneAndUpdate(
      { paymentId: payment.id },
      {
        user_id: user._id,
        gateway: 'asaas',
        paymentId: payment.id,
        subscriptionId: payment.subscription,
        amount: payment.value,
        status: event, // PAYMENT_CONFIRMED, PAYMENT_OVERDUE, etc.
        billingType: payment.billingType,
        dueDate: payment.dueDate,
        paymentDate: payment.paymentDate || new Date(),
      },
      { upsert: true, new: true }
    );

    // Lidar com eventos que afetam o acesso (Assinatura e Usuário)
    // Eventos de sucesso que liberam o acesso
    if (['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'].includes(event)) {
      
      // Se tiver subscription, atualiza a AssinaturaModel
      if (payment.subscription) {
        await AssinaturaModel.findOneAndUpdate(
          { gatewaySubscriptionId: payment.subscription },
          {
            status: 'ativa',
            valor: payment.value,
            // Atualiza data de expiração baseada na próxima cobrança ou +30/+365 dias
            expira: new Date(new Date().getTime() + (31 * 24 * 60 * 60 * 1000)) // Simplificação (mínimo mensal)
          }
        );
      }

      // Libera acesso do usuário
      user.assinaturaStatus = 'ativa';
      user.planActive = true;
      user.plan = payment.value >= 200 ? 'anual' : 'mensal'; // R$ 348 vs R$ 39
      user.dataCompra = user.dataCompra || new Date();
      await user.save();

    } 
    // Eventos que bloqueiam o acesso
    else if (['PAYMENT_OVERDUE', 'PAYMENT_REFUNDED', 'SUBSCRIPTION_DELETED', 'PAYMENT_CHARGEBACK_REQUESTED'].includes(event)) {
      
      if (payment.subscription) {
        await AssinaturaModel.findOneAndUpdate(
          { gatewaySubscriptionId: payment.subscription },
          { 
            status: event === 'SUBSCRIPTION_DELETED' ? 'cancelada' : 'expirada',
            canceladaEm: new Date()
          }
        );
      }

      // Bloqueia o acesso do usuário
      user.assinaturaStatus = event === 'SUBSCRIPTION_DELETED' ? 'cancelada' : 'expirada';
      user.planActive = false;
      user.plan = 'free';
      await user.save();
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Erro interno no processamento do webhook' }, { status: 500 });
  }
}
