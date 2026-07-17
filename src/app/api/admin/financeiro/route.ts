export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (auth !== true) return auth;

  const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
  if (!ASAAS_API_KEY) {
    // Retorna dados mockados se a chave não estiver configurada ainda (para não quebrar a UI)
    return NextResponse.json({
      mrr: 1250.00,
      recentes: [
        { customer: 'João Silva', amount: 39.00, method: 'Pix', date: new Date().toISOString(), status: 'CONFIRMED' },
        { customer: 'Maria Souza', amount: 29.00, method: 'Cartão', date: new Date(Date.now() - 86400000).toISOString(), status: 'CONFIRMED' }
      ],
      warning: 'ASAAS_API_KEY não configurada. Exibindo dados simulados.'
    });
  }

  try {
    const headers = { 'access_token': ASAAS_API_KEY, 'Content-Type': 'application/json' };
    
    // Buscar assinaturas ativas para calcular MRR
    const subsRes = await fetch('https://api.asaas.com/v3/subscriptions?status=ACTIVE&limit=100', { headers });
    const subsData = await subsRes.json();
    
    let mrr = 0;
    if (subsData && subsData.data) {
      subsData.data.forEach((sub: any) => {
        if (sub.cycle === 'MONTHLY') mrr += sub.value;
        else if (sub.cycle === 'YEARLY') mrr += sub.value / 12;
      });
    }

    // Buscar pagamentos recentes
    const payRes = await fetch('https://api.asaas.com/v3/payments?limit=20', { headers });
    const payData = await payRes.json();

    const recentes = payData.data ? payData.data.map((p: any) => {
      let customerName = 'Cliente';
      // Asaas não retorna o nome do cliente direto no /payments, normalmente precisa cruzar com /customers
      // Mas para simplificar vamos tentar usar algo disponível ou genérico se não tiver fallback
      if (p.customer) {
        customerName = p.customer; 
      }
      return {
        customer: customerName,
        amount: p.value,
        method: p.billingType === 'PIX' ? 'Pix' : p.billingType === 'CREDIT_CARD' ? 'Cartão' : 'Boleto',
        date: p.dueDate || p.dateCreated,
        status: p.status
      };
    }) : [];

    return NextResponse.json({
      mrr: Math.round(mrr * 100) / 100,
      recentes
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
