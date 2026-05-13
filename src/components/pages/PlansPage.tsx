'use client';

import { useEffect } from 'react';
import type { PlanType } from '@/types';
import { useAuth } from '@/components/AuthContext';

interface Props { onOpenAuth: (tab: 'login' | 'register') => void; onOpenPayment: (plan: PlanType) => void; }

export default function PlansPage({ onOpenAuth, onOpenPayment }: Props) {
  const { user, isLoggedIn, isPremium, refreshUser } = useAuth();

  // Revalida o plano ao entrar na página para garantir dados frescos
  useEffect(() => {
    if (isLoggedIn) {
      refreshUser();
    }
  }, [isLoggedIn, refreshUser]);
  return (
    <div className="page">
      <section style={{ textAlign: 'center' }}>
        <div className="section-tag centered">Assinatura</div>
        <h2 className="section-title">Planos para cada objetivo</h2>
        <p className="section-sub" style={{ margin: '0 auto 1rem' }}>
          Comece grátis. Faça upgrade quando quiser. Cancele a qualquer momento.
        </p>

        <div className="plans-grid">
          {/* FREE */}
          <div className="plan-card">
            <div className="plan-name">Plano Gratuito</div>
            <div className="plan-price">
              <span className="plan-currency">R$</span>
              <span className="plan-amount">0</span>
              <span className="plan-period">/ sempre</span>
            </div>
            <div className="plan-desc">Ideal para experimentar a plataforma antes de se comprometer.</div>
            <ul className="plan-features">
              <li><span className="check">✓</span><span>2 aulas gratuitas por conteúdo</span></li>
              <li><span className="check">✓</span><span>Acesso ao progresso básico</span></li>
              <li><span className="check">✓</span><span>24 conteúdos disponíveis</span></li>
              <li><span className="cross">✗</span><span className="feat-disabled">Todas as videoaulas</span></li>
              <li><span className="cross">✗</span><span className="feat-disabled">Simulados e exercícios</span></li>
            </ul>
            {!isLoggedIn ? (
              <button className="btn-plan outline" onClick={() => onOpenAuth('register')}>
                Criar conta grátis
              </button>
            ) : user?.plano === 'free' ? (
              <div className="plan-status">Seu plano atual</div>
            ) : (
              <div className="plan-status active">Você já possui acesso premium</div>
            )}
          </div>

          {/* MONTHLY featured */}
          <div className="plan-card featured">
            <div className="plan-badge">⭐ Mais popular</div>
            <div className="plan-name">Plano Completo</div>
            <div className="plan-price">
              <span className="plan-currency">R$</span>
              <span className="plan-amount">39</span>
              <span className="plan-period">/ mês</span>
            </div>
            <div className="plan-desc">Acesso total a todos os conteúdos, simulados e suporte prioritário.</div>
            <ul className="plan-features">
              <li><span className="check">✓</span><span>Todas as aulas desbloqueadas</span></li>
              <li><span className="check">✓</span><span>200+ videoaulas de matemática</span></li>
              <li><span className="check">✓</span><span>Exercícios e simulados ENEM</span></li>
              <li><span className="check">✓</span><span>Acompanhamento de progresso</span></li>
              <li><span className="check">✓</span><span>Certificado de conclusão</span></li>
            </ul>
            {isPremium ? (
              <div className="plan-status active">Plano ativo</div>
            ) : (
              <button className="btn-plan solid" onClick={() => onOpenPayment('mensal')}>
                Assinar agora
              </button>
            )}
            <div className="plan-pix">🟢 Pix · Cartão · Boleto</div>
          </div>

          {/* ANNUAL */}
          <div className="plan-card">
            <div className="plan-name">Plano Anual</div>
            <div className="plan-price">
              <span className="plan-currency">R$</span>
              <span className="plan-amount">29</span>
              <span className="plan-period">/ mês</span>
            </div>
            <div className="plan-desc">Economize 26% — a melhor opção para quem está focado na aprovação.</div>
            <ul className="plan-features">
              <li><span className="check">✓</span><span>Tudo do Plano Completo</span></li>
              <li><span className="check">✓</span><span>Economia de R$ 120/ano</span></li>
              <li><span className="check">✓</span><span>Correção de redação</span></li>
              <li><span className="check">✓</span><span>Suporte via WhatsApp</span></li>
              <li><span className="check">✓</span><span>Prioridade em novos conteúdos</span></li>
            </ul>
            {isPremium ? (
              <div className="plan-status active">Plano ativo</div>
            ) : (
              <button className="btn-plan solid" onClick={() => onOpenPayment('anual')}>
                Assinar anual
              </button>
            )}
            <div className="plan-pix">🟢 Pix · Cartão · Boleto</div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 640, margin: '4rem auto 0', textAlign: 'left' }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            Perguntas frequentes
          </div>
          {[
            { q: 'Posso cancelar quando quiser?', r: 'Sim! O plano mensal pode ser cancelado a qualquer momento, sem multa.' },
            { q: 'Quanto tempo tenho acesso?', r: 'O acesso é válido enquanto a assinatura estiver ativa.' },
            { q: 'As aulas funcionam no celular?', r: 'Sim, a plataforma é 100% responsiva e funciona em qualquer dispositivo.' },
            { q: 'Como funciona o plano gratuito?', r: 'Você tem acesso a 2 aulas de cada um dos 24 conteúdos, sem precisar de cartão.' },
          ].map(({ q, r }) => (
            <div key={q} style={{ padding: '1.1rem 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '.4rem' }}>{q}</div>
              <div style={{ color: 'var(--text2)', fontSize: '.85rem', lineHeight: 1.6 }}>{r}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
