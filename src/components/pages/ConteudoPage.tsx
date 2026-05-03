'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import type { AulaComStatus, Page } from '@/types';
import { CONTEUDOS_SEED, CATEGORIA_CORES } from '@/data/conteudos';

interface Props {
  conteudoId: string;
  conteudoNome: string;
  onNavigate: (p: Page) => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
}

// Generate mock lessons for demo when no DB
function mockAulas(nome: string, total: number, gratuitas: number): AulaComStatus[] {
  const temas: Record<string, string[]> = {
    'Função Quadrática': ['Introdução à função do 2º grau','Coeficientes a, b e c','Zeros da função','Vértice da parábola','Gráfico e concavidade','Máximo e mínimo','Inequação do 2º grau','Problemas de otimização','Questões ENEM'],
    default: ['Introdução ao conteúdo','Conceitos fundamentais','Exemplos resolvidos','Exercícios básicos','Aprofundamento','Casos especiais','Questões de vestibular','Simulado ENEM'],
  };
  const titulos = temas[nome] || temas.default;
  return Array.from({ length: total }, (_, i) => ({
    _id: `aula-${i}`,
    titulo: titulos[i] ?? `Aula ${i + 1} — ${nome}`,
    descricao: 'Aula em breve disponível.',
    video_url: '',
    duracao: `${Math.floor(Math.random() * 15) + 8}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    conteudo_id: '',
    ordem: i + 1,
    tipo: i < gratuitas ? 'free' : 'premium',
    concluida: false,
    bloqueada: false,
  }));
}

export default function ConteudoPage({ conteudoId, conteudoNome, onNavigate, onOpenAuth }: Props) {
  const { token, isPremium, isLoggedIn } = useAuth();
  const [aulas, setAulas] = useState<AulaComStatus[]>([]);
  const [aulaAtiva, setAulaAtiva] = useState<AulaComStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [marcando, setMarcando] = useState(false);

  const conteudo = CONTEUDOS_SEED.find(c => c.nome === conteudoNome || c.nome === conteudoId);
  const cor = conteudo ? CATEGORIA_CORES[conteudo.categoria] : 'var(--accent)';

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/conteudos/${conteudoId}/aulas`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setAulas(data);
          setAulaAtiva(data[0] || null);
        } else throw new Error();
      } catch {
        // Fallback mock
        if (conteudo) {
          const mock = mockAulas(conteudo.nome, conteudo.totalAulas, conteudo.aulasGratuitas)
            .map(a => ({
              ...a,
              bloqueada: a.tipo === 'premium' && !isPremium,
            }));
          setAulas(mock);
          setAulaAtiva(mock[0] || null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [conteudoId, token, isPremium]);

  const marcarConcluida = async () => {
    if (!aulaAtiva || !token) return;
    setMarcando(true);
    try {
      await fetch('/api/progresso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ aula_id: aulaAtiva._id }),
      });
      setAulas(prev => prev.map(a => a._id === aulaAtiva._id ? { ...a, concluida: true } : a));
      setAulaAtiva(prev => prev ? { ...prev, concluida: true } : null);

      // Auto-advance to next
      const idx = aulas.findIndex(a => a._id === aulaAtiva._id);
      const next = aulas[idx + 1];
      if (next && !next.bloqueada) setAulaAtiva(next);
    } finally {
      setMarcando(false);
    }
  };

  const concluidas = aulas.filter(a => a.concluida).length;
  const pct = aulas.length > 0 ? Math.round((concluidas / aulas.length) * 100) : 0;

  const getYouTubeId = (url: string) => {
    const m = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
    return m ? m[1] : null;
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ color: 'var(--text3)' }}>Carregando aulas...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <section>
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a onClick={() => onNavigate('cursos')}>Cursos</a>
          <span>›</span>
          <span>{conteudoNome}</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{conteudo?.icone ?? '📚'}</div>
          <h2 className="section-title" style={{ marginBottom: '.4rem' }}>{conteudoNome}</h2>
          <p style={{ color: 'var(--text2)', fontSize: '.9rem', marginBottom: '1rem' }}>{conteudo?.descricao}</p>

          {/* Progress bar */}
          <div style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: 'var(--text3)', marginBottom: '.4rem' }}>
              <span>{concluidas}/{aulas.length} aulas concluídas</span>
              <span style={{ color: cor, fontWeight: 600 }}>{pct}%</span>
            </div>
            <div className="progress-bar" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: `${pct}%`, background: cor }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
          {/* LEFT: Video + info */}
          <div>
            {/* Video */}
            <div className="video-wrap" style={{ marginBottom: '1.25rem' }}>
              {aulaAtiva?.video_url && getYouTubeId(aulaAtiva.video_url) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(aulaAtiva.video_url)}`}
                  allowFullScreen
                  title={aulaAtiva.titulo}
                />
              ) : (
                <div className="video-placeholder">
                  <div className="play-btn" />
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 600 }}>
                    {aulaAtiva ? aulaAtiva.titulo : 'Selecione uma aula'}
                  </div>
                  <div style={{ fontSize: '.8rem' }}>Vídeo será adicionado em breve</div>
                </div>
              )}
            </div>

            {/* Aula info */}
            {aulaAtiva && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '1.1rem', fontWeight: 700, marginBottom: '.4rem' }}>
                      {aulaAtiva.titulo}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '.78rem', color: 'var(--text3)' }}>
                      <span>⏱ {aulaAtiva.duracao}</span>
                      <span>{aulaAtiva.tipo === 'free' ? '🟢 Gratuita' : '⭐ Premium'}</span>
                      {aulaAtiva.concluida && <span style={{ color: 'var(--green)' }}>✓ Concluída</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                    {isLoggedIn && !aulaAtiva.concluida && !aulaAtiva.bloqueada && (
                      <button className="btn btn-green btn-md" onClick={marcarConcluida} disabled={marcando}>
                        {marcando ? 'Salvando...' : '✓ Marcar como concluída'}
                      </button>
                    )}
                    {!isLoggedIn && (
                      <button className="btn btn-ghost btn-md" onClick={() => onOpenAuth('register')}>
                        Criar conta para salvar progresso
                      </button>
                    )}
                  </div>
                </div>
                {aulaAtiva.descricao && (
                  <p style={{ color: 'var(--text2)', fontSize: '.88rem', marginTop: '1rem', lineHeight: 1.7 }}>
                    {aulaAtiva.descricao}
                  </p>
                )}
                {aulaAtiva.materialPdf && (
                  <a href={aulaAtiva.materialPdf} target="_blank" rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', marginTop: '.75rem', color: 'var(--accent)', fontSize: '.82rem', textDecoration: 'none' }}>
                    📄 Baixar material em PDF
                  </a>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Lesson list */}
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>
              Aulas ({aulas.length})
            </div>
            <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '.25rem' }}>
              {aulas.map((aula) => (
                <div
                  key={aula._id}
                  className={`aula-item ${aula.bloqueada ? 'locked' : ''} ${aula.concluida ? 'concluida' : ''} ${aulaAtiva?._id === aula._id ? 'active-aula' : ''}`}
                  onClick={() => {
                    if (aula.bloqueada) {
                      if (!isLoggedIn) onOpenAuth('register');
                      else onNavigate('planos');
                      return;
                    }
                    setAulaAtiva(aula);
                  }}
                  style={{
                    border: aulaAtiva?._id === aula._id ? `1px solid ${cor}` : undefined,
                    background: aulaAtiva?._id === aula._id ? `${cor}10` : undefined,
                  }}
                >
                  <div className={`aula-num ${aula.concluida ? 'done' : aula.tipo === 'free' ? 'free-badge' : ''}`}>
                    {aula.concluida ? '✓' : aula.bloqueada ? '🔒' : aula.ordem}
                  </div>
                  <div className="aula-info">
                    <div className="aula-titulo">{aula.titulo}</div>
                    <div className="aula-meta">
                      <span>⏱ {aula.duracao}</span>
                      <span className={`aula-tipo-badge ${aula.tipo === 'premium' ? 'premium' : ''}`}>
                        {aula.tipo === 'free' ? 'GRÁTIS' : 'PREMIUM'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Premium upsell */}
            {!isPremium && aulas.some(a => a.bloqueada) && (
              <div style={{
                marginTop: '1rem', padding: '1.1rem', background: 'rgba(79,142,247,.07)',
                border: '1px solid var(--border2)', borderRadius: 12, textAlign: 'center',
              }}>
                <div style={{ fontSize: '.85rem', fontWeight: 600, marginBottom: '.3rem' }}>
                  🔒 {aulas.filter(a => a.bloqueada).length} aulas bloqueadas
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--text2)', marginBottom: '.85rem' }}>
                  Assine para ter acesso a todo o conteúdo
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => onNavigate('planos')}>
                  Ver planos
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
