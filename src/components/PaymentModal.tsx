'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';
import type { PayMethod, PlanType } from '@/types';

interface Props { isOpen: boolean; plan: PlanType | null; onClose: () => void; }

export default function PaymentModal({ isOpen, plan, onClose }: Props) {
  const { user, token } = useAuth();
  const [method, setMethod] = useState<PayMethod>('pix');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  if (!isOpen || !plan) return null;

  const isAnual = plan === 'anual';
  const valor = isAnual ? 'R$ 29/mês' : 'R$ 39/mês';
  const detalhe = isAnual ? 'Cobrado anualmente — R$ 348/ano · Economia de R$ 120' : 'Cobrado mensalmente · Cancele quando quiser';
  const title = isAnual ? 'Plano Anual' : 'Plano Completo';

  const handleCheckout = async (gateway: 'stripe' | 'mercadopago') => {
    setLoading(true); setFeedback('');
    try {
      const endpoint = gateway === 'stripe'
        ? '/api/pagamento/stripe/checkout'
        : '/api/pagamento/mercadopago/checkout';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          plano: plan,
          userId: user?._id ?? 'guest',
          email: user?.email ?? '',
          nome: user?.nome ?? '',
        }),
      });

      const data = await res.json();

      if (data.url) {
        // Redireciona para a página de pagamento do gateway
        window.location.href = data.url;
      } else if (data.mock) {
        setFeedback(`⚙️ Modo desenvolvimento: ${data.message}`);
      } else {
        setFeedback('Erro ao iniciar pagamento. Tente novamente.');
      }
    } catch {
      setFeedback('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const surfaceStyle = {
    background: 'var(--bg3)', borderRadius: 12,
    padding: '1.25rem', border: '1px solid var(--border)',
    marginBottom: '1rem',
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-logo">Odisley</div>

        {/* Resumo do plano */}
        <div style={{ ...surfaceStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '1rem' }}>
              ⭐ {title}
            </div>
            <div style={{ fontSize: '.78rem', color: 'var(--text3)', marginTop: '.25rem' }}>{detalhe}</div>
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.3rem', color: 'var(--accent)' }}>
            {valor}
          </div>
        </div>

        {/* Método de pagamento */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '.78rem', color: 'var(--text3)', marginBottom: '.6rem', fontWeight: 600 }}>
            FORMA DE PAGAMENTO
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.5rem' }}>
            {(['pix', 'card', 'boleto'] as PayMethod[]).map(m => (
              <button key={m}
                onClick={() => setMethod(m)}
                style={{
                  padding: '.65rem .5rem',
                  borderRadius: 10, border: `1px solid ${method === m ? 'var(--accent)' : 'var(--border)'}`,
                  background: method === m ? 'rgba(79,142,247,.1)' : 'var(--bg3)',
                  color: method === m ? 'var(--accent)' : 'var(--text2)',
                  cursor: 'pointer', fontSize: '.8rem', fontWeight: 600,
                  fontFamily: "'DM Sans',sans-serif", transition: '.2s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.3rem',
                }}>
                <span style={{ fontSize: '1.1rem' }}>
                  {m === 'pix' ? '🟢' : m === 'card' ? '💳' : '📄'}
                </span>
                {m === 'pix' ? 'Pix' : m === 'card' ? 'Cartão' : 'Boleto'}
              </button>
            ))}
          </div>
        </div>

        {/* PIX */}
        {method === 'pix' && (
          <div style={surfaceStyle}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '.4rem' }}>📱</div>
              <div style={{ fontWeight: 600, fontSize: '.9rem' }}>Pague via Pix</div>
              <div style={{ fontSize: '.78rem', color: 'var(--text2)', marginTop: '.25rem' }}>
                Aprovação instantânea — sem taxa adicional
              </div>
            </div>
            <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '.6rem', fontFamily: 'monospace', fontSize: '.7rem', color: 'var(--accent)', wordBreak: 'break-all', textAlign: 'center' }}>
              00020126580014br.gov.bcb.pix0136odisley@email.com
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--text3)', textAlign: 'center', marginTop: '.6rem' }}>
              🔒 Pagamento processado pelo MercadoPago
            </div>
          </div>
        )}

        {/* CARTÃO */}
        {method === 'card' && (
          <div style={surfaceStyle}>
            <div style={{ fontSize: '.78rem', color: 'var(--text2)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Você será redirecionado para o checkout seguro do <strong>Stripe</strong> ou <strong>MercadoPago</strong> para inserir os dados do cartão com segurança.
            </div>
            <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
              {['Visa', 'Mastercard', 'Elo', 'Amex', 'Hipercard'].map(b => (
                <span key={b} style={{ fontSize: '.7rem', padding: '.2rem .6rem', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text3)' }}>{b}</span>
              ))}
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>
              🔒 Criptografia SSL · Dados não armazenados na plataforma
            </div>
          </div>
        )}

        {/* BOLETO */}
        {method === 'boleto' && (
          <div style={surfaceStyle}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '.4rem' }}>📄</div>
              <div style={{ fontWeight: 600, fontSize: '.9rem' }}>Boleto bancário</div>
              <div style={{ fontSize: '.78rem', color: 'var(--text2)', marginTop: '.4rem', lineHeight: 1.6 }}>
                Vencimento em <strong>3 dias úteis</strong><br />
                Aprovação em 1–2 dias após o pagamento
              </div>
              <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginTop: '.6rem' }}>
                🔒 Processado pelo MercadoPago
              </div>
            </div>
          </div>
        )}

        {feedback && (
          <div style={{ fontSize: '.78rem', padding: '.75rem', borderRadius: 8, marginBottom: '1rem',
            background: feedback.startsWith('⚙️') ? 'rgba(79,142,247,.1)' : 'rgba(247,79,110,.1)',
            color: feedback.startsWith('⚙️') ? 'var(--accent)' : 'var(--red)',
            border: `1px solid ${feedback.startsWith('⚙️') ? 'var(--border2)' : 'rgba(247,79,110,.3)'}`,
            lineHeight: 1.5,
          }}>
            {feedback}
          </div>
        )}

        {/* Botões de checkout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
          {method === 'card' ? (
            <>
              <button className="form-submit" onClick={() => handleCheckout('stripe')} disabled={loading}
                style={{ background: 'linear-gradient(135deg,#635bff,#7c5ef7)' }}>
                {loading ? 'Redirecionando...' : '💳 Pagar com Stripe'}
              </button>
              <button className="form-submit" onClick={() => handleCheckout('mercadopago')} disabled={loading}
                style={{ background: 'linear-gradient(135deg,#00b1ea,#009ee3)', marginTop: 0 }}>
                {loading ? 'Redirecionando...' : '💙 Pagar com MercadoPago'}
              </button>
            </>
          ) : (
            <button className="form-submit" onClick={() => handleCheckout('mercadopago')} disabled={loading}>
              {loading ? 'Processando...' : `Confirmar pagamento — ${isAnual ? 'R$ 348/ano' : 'R$ 39/mês'}`}
            </button>
          )}
        </div>

        <div style={{ fontSize: '.68rem', color: 'var(--text3)', textAlign: 'center', marginTop: '.75rem', lineHeight: 1.5 }}>
          🔒 Pagamento 100% seguro · Cancele a qualquer momento
        </div>
      </div>
    </div>
  );
}
