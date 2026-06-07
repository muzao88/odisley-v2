"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import type { Categoria, Page } from "@/types";
import { CONTEUDOS_SEED, CATEGORIA_CORES } from "@/data/conteudos";
import FeedbackSection from "../FeedbackSection";

/**
 * Safe helper to get categoria color with proper type checking
 * @param cat - Category value (any type)
 * @returns CSS color string or default accent color
 */
const obterCorCategoria = (cat: any): string => {
  if (!cat || typeof cat !== "string") return "var(--accent)";
  if (!(cat in CATEGORIA_CORES)) return "var(--accent)";
  return CATEGORIA_CORES[cat as Categoria];
};

interface ProgressoItem {
  conteudo_id: string;
  nome: string;
  categoria: Categoria;
  icone: string;
  total: number;
  concluidas: number;
  percentual: number;
  proximaAula?: {
    id: string;
    titulo: string;
    duracao: string;
    ordem: number;
  } | null;
}

interface Props {
  onNavigate: (p: Page) => void;
  onSelectConteudo: (id: string, nome: string) => void;
}

const NEW_MODULES = ["Função Modular", "Função Trigonométrica"];

const getInitials = (nome?: string) => {
  if (!nome) return "A";
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function DashboardPage({ onNavigate, onSelectConteudo }: Props) {
  const { user, token, isLoggedIn } = useAuth();
  const [progresso, setProgresso] = useState<ProgressoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !token || !user) {
      setProgresso(
        CONTEUDOS_SEED.map((c) => ({
          conteudo_id: c.nome,
          nome: c.nome,
          categoria: c.categoria,
          icone: c.icone,
          total: c.totalAulas,
          concluidas: 0,
          percentual: 0,
        })),
      );
      setLoading(false);
      return;
    }
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/progresso/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setProgresso(await res.json());
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [user, token, isLoggedIn]);

  const totalAulas = progresso.reduce((s, p) => s + p.total, 0);
  const totalConcluidas = progresso.reduce((s, p) => s + p.concluidas, 0);
  const totalPct =
    totalAulas > 0 ? Math.round((totalConcluidas / totalAulas) * 100) : 0;

  const emAndamento = progresso.filter(
    (p) => p.concluidas > 0 && p.percentual < 100,
  );

  const sugestao =
    emAndamento.find((p) => p.proximaAula) ||
    progresso.find((p) => p.proximaAula);

  const concluidos = progresso.filter((p) => p.percentual === 100);

  return (
    <div className="page">
      <section>
        <div
          style={{
            marginBottom: "2.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          {!isDark ? (
            (() => {
              const initials = getInitials(user?.nome);
              const nomeCompleto = user?.nome ?? "Aluno";
              const email = user?.email ?? "";
              const nomePlano = user?.plano === "premium" ? "Premium" : "Gratuito";
              const streak = totalConcluidas > 0 ? Math.min(totalConcluidas, 7) : 0;
              return (
                <div style={{
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  borderRadius: '14px', padding: '18px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  backdropFilter: 'blur(8px)', marginBottom: '16px',
                  width: '100%',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Avatar com iniciais */}
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: '700', color: '#fff',
                    }}>{initials}</div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e1b4b', letterSpacing: '-.3px' }}>{nomeCompleto}</div>
                      <div style={{ fontSize: '11px', color: '#a78bfa', marginTop: '2px' }}>{email}</div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px',
                        background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                        color: '#fff', fontSize: '10px', fontWeight: '700',
                        padding: '3px 10px', borderRadius: '999px',
                      }}>⭐ {nomePlano}</div>
                    </div>
                  </div>
                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '20px' }}>
                    {[{ num: totalConcluidas, label: 'AULAS' }, { num: emAndamento.length, label: 'CURSOS' }, { num: `${streak}🔥`, label: 'SEQUÊNCIA' }].map(s => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e1b4b' }}>{s.num}</div>
                        <div style={{ fontSize: '9px', color: '#a78bfa', fontWeight: '600', letterSpacing: '.06em' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          ) : (
            <div>
              <div className="section-tag">Área do aluno</div>
              <h2 className="section-title">
                Olá, {user?.nome?.split(" ")[0] ?? "Aluno"}! 👋
              </h2>
              <p style={{ color: "var(--text2)", fontSize: ".95rem" }}>
                Plano {user?.plano === "premium" ? "⭐ Premium" : "Gratuito"} ·{" "}
                {user?.plano === "free" && (
                  <span
                    style={{
                      color: "var(--accent)",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                    onClick={() => onNavigate("planos")}
                  >
                    Fazer upgrade →
                  </span>
                )}
              </p>
            </div>
          )}

          {sugestao?.proximaAula && (
            <div
              className="dashboard-card progress-card"
              style={{
                maxWidth: 380,
                margin: 0,
                padding: "1rem",
                flex: "1 1 300px",
              }}
            >
              <div className="dc-header" style={{ marginBottom: "0.75rem" }}>
                <span className="dc-title" style={{ fontSize: "0.85rem" }}>
                  Próxima aula
                </span>
                <span className="dc-badge">Continuar</span>
              </div>
              <div
                className="dc-lesson next-lesson-card"
                onClick={() =>
                  onSelectConteudo(sugestao.conteudo_id, sugestao.nome)
                }
                style={{ cursor: "pointer" }}
              >
                <div className="dc-lesson-icon">{sugestao.icone}</div>
                <div className="dc-lesson-info">
                  <div className="dc-lesson-title">
                    {sugestao.proximaAula.titulo}
                  </div>
                  <div className="dc-lesson-sub">
                    {sugestao.nome} · {sugestao.proximaAula.duracao}
                  </div>
                </div>
                <div className="dc-lesson-play" />
              </div>
            </div>
          )}
        </div>

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

        {emAndamento.length > 0 && (
          <div style={{ marginBottom: "2.5rem" }}>
            <div className="dash-section-title">📚 Em andamento</div>
            <div className="em-andamento-grid">
              {emAndamento.map((p) => {
                const cor = obterCorCategoria(p.categoria);
                return (
                  <div
                    key={p.conteudo_id}
                    className="em-andamento-card"
                    onClick={() => onSelectConteudo(p.conteudo_id, p.nome)}
                    style={!isDark ? {
                      background: 'rgba(255,255,255,0.6)',
                      border: '1px solid rgba(139,92,246,0.2)',
                      borderRadius: '12px', padding: '14px 16px',
                      backdropFilter: 'blur(8px)', marginBottom: '10px',
                    } : undefined}
                  >
                    <div className="eac-header">
                      <div className="eac-icon">{p.icone}</div>
                      <div>
                        <div className="eac-name">{p.nome}</div>
                        <div className="eac-pct">
                          {p.concluidas}/{p.total} aulas
                        </div>
                      </div>
                    </div>
                    <div className="cc-bar-label">
                      <span
                        style={{ fontSize: ".72rem", color: "var(--text3)" }}
                      >
                        Progresso
                      </span>
                      <span
                        style={{
                          fontSize: ".72rem",
                          color: cor,
                          fontWeight: 600,
                        }}
                      >
                        {p.percentual}%
                      </span>
                    </div>
                    {!isDark ? (
                      <div style={{ height: '5px', background: 'rgba(139,92,246,0.12)', borderRadius: '999px' }}>
                        <div style={{
                          height: '100%', width: `${p.percentual}%`,
                          background: 'linear-gradient(90deg, #7c3aed, #2563eb)',
                          borderRadius: '999px',
                        }} />
                      </div>
                    ) : (
                      <div className="cc-bar progress-bar-bg">
                        <div
                          className="cc-bar-fill"
                          style={{ width: `${p.percentual}%`, background: cor }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="dash-section-title">🗂 Todos os conteúdos</div>
          <div
            style={!isDark ? {
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px",
            } : {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: "1rem",
            }}
          >
            {progresso.map((p) => {
              const cor = obterCorCategoria(p.categoria);
              return (
                <div
                  key={p.conteudo_id}
                  className="em-andamento-card"
                  onClick={() => onSelectConteudo(p.conteudo_id, p.nome)}
                  style={!isDark ? {
                    background: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(139,92,246,0.15)',
                    borderRadius: '10px', padding: '12px',
                    backdropFilter: 'blur(8px)',
                  } : undefined}
                >
                  <div className="eac-header">
                    <div className="eac-icon">{p.icone}</div>
                    <div>
                      <div className="eac-name">
                        {p.nome}
                        {NEW_MODULES.includes(p.nome) && (
                          <span className="badge-new">Novo</span>
                        )}
                      </div>
                      <div
                        className="eac-pct"
                        style={{ fontSize: ".72rem", color: "var(--text3)" }}
                      >
                        {p.categoria}
                      </div>
                    </div>
                    {p.percentual === 100 && (
                      <div
                        style={{
                          marginLeft: "auto",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          color: "var(--green)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        <span>Concluído</span>
                        <span style={{ fontSize: "1rem" }}>✓</span>
                      </div>
                    )}
                  </div>
                  {!isDark ? (
                    <div style={{ height: '5px', background: 'rgba(139,92,246,0.12)', borderRadius: '999px', marginTop: '.75rem' }}>
                      <div style={{
                        height: '100%', width: `${p.percentual}%`,
                        background: 'linear-gradient(90deg, #7c3aed, #2563eb)',
                        borderRadius: '999px',
                      }} />
                    </div>
                  ) : (
                    <div className="cc-bar progress-bar-bg" style={{ marginTop: ".75rem" }}>
                      <div
                        className="cc-bar-fill"
                        style={{ width: `${p.percentual}%`, background: cor }}
                      />
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: ".7rem",
                      color: "var(--text3)",
                      marginTop: ".3rem",
                    }}
                  >
                    <span>
                      {p.concluidas}/{p.total} aulas
                    </span>
                    <span style={{ color: cor, fontWeight: 600 }}>
                      {p.percentual}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <FeedbackSection />
      </section>
    </div>
  );
}
