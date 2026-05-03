'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import type { Page } from '@/types';
import { CONTEUDOS_SEED, CATEGORIA_CORES } from '@/data/conteudos';

interface ProgressoItem {
  conteudo_id: string;
  nome: string;
  categoria: string;
  icone: string;
  total: number;
  concluidas: number;
  percentual: number;
}

interface Props { onNavigate: (p: Page) => void; onSelectConteudo: (id: string, nome: string) => void; }

export default function DashboardPage({ onNavigate, onSelectConteudo }: Props) {
  const { user, token, isLoggedIn } = useAuth();
  const [progresso, setProgresso] = useState<ProgressoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !token || !user) {
      // Fallback: show empty state
      setProgresso(CONTEUDOS_SEED.map(c => ({
        conteudo_id: c.nome,
        nome: c.nome,
        categoria: c.categoria,
        icone: c.icone,
        total: c.totalAulas,
        concluidas: 0,
        percentual: 0,
      })));
      setLoading(false);
      return;
    }
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/progresso/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setProgresso(await res.json());
      } catch {}
      finally { setLoading(false); }
    };
    fetch_();
  }, [user, token, isLoggedIn]);

  const totalAulas = progresso.reduce((s, p) => s + p.total, 0);
  const totalConcluidas = progresso.reduce((s, p) => s + p.concluidas, 0);
  const totalPct = totalAulas > 0 ? Math.round((totalConcluidas / totalAulas) * 100) : 0;
  const emAndamento = progresso.filter(p => p.concluidas > 0 && p.percentual < 100);
  const concluidos = progresso.filter(p => p.percentual === 100);

  return (
    <div className="page">
      <section>
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="section-tag">Área do aluno</div>
          <h2 className="section-title">
            Olá, {user?.nome?.split(' ')[0] ?? 'Aluno'}! 👋
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '.95rem' }}>
            Plano {user?.plano === 'premium' ? '⭐ Premium' : 'Gratuito'} ·{' '}
            {user?.plano === 'free' && (
              <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => onNavigate('planos')}>
                Fazer upgrade →
              </span>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="dash-grid">
          <div className="dash-stat">
            <div className="dash-stat-num">{totalPct}%</div>
            <div className="dash-stat-label">Progresso geral</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-num">{totalConcluidas}</div>
            <div className="dash-stat-label">Aulas concluídas</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-num">{emAndamento.length}</div>
            <div className="dash-stat-label">Em andamento</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-num">{concluidos.length}</div>
            <div className="dash-stat-label">Conteúdos finalizados</div>
          </div>
        </div>

        {/* Em andamento */}
        {emAndamento.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <div className="dash-section-title">📚 Em andamento</div>
            <div className="em-andamento-grid">
              {emAndamento.map(p => {
                const cor = CATEGORIA_CORES[p.categoria as any] ?? 'var(--accent)';
                return (
                  <div key={p.conteudo_id} className="em-andamento-card"
                    onClick={() => onSelectConteudo(p.conteudo_id, p.nome)}>
                    <div className="eac-header">
                      <div className="eac-icon">{p.icone}</div>
                      <div>
                        <div className="eac-name">{p.nome}</div>
                        <div className="eac-pct">{p.concluidas}/{p.total} aulas</div>
                      </div>
                    </div>
                    <div className="cc-bar-label">
                      <span style={{ fontSize: '.72rem', color: 'var(--text3)' }}>Progresso</span>
                      <span style={{ fontSize: '.72rem', color: cor, fontWeight: 600 }}>{p.percentual}%</span>
                    </div>
                    <div className="cc-bar">
                      <div className="cc-bar-fill" style={{ width: `${p.percentual}%`, background: cor }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All conteudos */}
        <div>
          <div className="dash-section-title">🗂 Todos os conteúdos</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
            {progresso.map(p => {
              const cor = CATEGORIA_CORES[p.categoria as any] ?? 'var(--accent)';
              return (
                <div key={p.conteudo_id} className="em-andamento-card"
                  onClick={() => onSelectConteudo(p.conteudo_id, p.nome)}>
                  <div className="eac-header">
                    <div className="eac-icon">{p.icone}</div>
                    <div>
                      <div className="eac-name">{p.nome}</div>
                      <div className="eac-pct" style={{ fontSize: '.72rem', color: 'var(--text3)' }}>{p.categoria}</div>
                    </div>
                    {p.percentual === 100 && (
                      <div style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: '1.1rem' }}>✓</div>
                    )}
                  </div>
                  <div className="cc-bar" style={{ marginTop: '.75rem' }}>
                    <div className="cc-bar-fill" style={{ width: `${p.percentual}%`, background: cor }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: 'var(--text3)', marginTop: '.3rem' }}>
                    <span>{p.concluidas}/{p.total} aulas</span>
                    <span style={{ color: cor, fontWeight: 600 }}>{p.percentual}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
