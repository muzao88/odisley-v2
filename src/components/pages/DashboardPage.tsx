"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import type { Categoria, Page } from "@/types";
import { CONTEUDOS_SEED, CATEGORIA_CORES } from "@/data/conteudos";
import FeedbackSection from "../FeedbackSection";

/**
 * Type-safe helper function to access categoria colors
 * Validates that the categoria exists in CATEGORIA_CORES before accessing
 */
function getCategoriaCor(cat: unknown): string {
  if (typeof cat === "string" && cat in CATEGORIA_CORES) {
    return CATEGORIA_CORES[cat as Categoria];
  }
  return "var(--accent)";
}

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

export default function DashboardPage({ onNavigate, onSelectConteudo }: Props) {
  const { user, token, isLoggedIn } = useAuth();
  const [progresso, setProgresso] = useState<ProgressoItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Encontra a aula mais prioritária para continuar (primeira de um curso em andamento)
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

          {/* Card Próxima Aula */}
          {sugestao?.proximaAula && (
            <div
              className="dashboard-card"
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
                className="dc-lesson"
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
          <div style={{ marginBottom: "2.5rem" }}>
            <div className="dash-section-title">📚 Em andamento</div>
            <div className="em-andamento-grid">
              {emAndamento.map((p) => {
                const cor = getCategoriaCor(p.categoria);
                return (
                  <div
                    key={p.conteudo_id}
                    className="em-andamento-card"
                    onClick={() => onSelectConteudo(p.conteudo_id, p.nome)}
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
                    <div className="cc-bar">
                      <div
                        className="cc-bar-fill"
                        style={{ width: `${p.percentual}%`, background: cor }}
                      />
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: "1rem",
            }}
          >
            {progresso.map((p) => {
              const cor = getCategoriaCor(p.categoria);
              return (
                <div
                  key={p.conteudo_id}
                  className="em-andamento-card"
                  onClick={() => onSelectConteudo(p.conteudo_id, p.nome)}
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
                  <div className="cc-bar" style={{ marginTop: ".75rem" }}>
                    <div
                      className="cc-bar-fill"
                      style={{ width: `${p.percentual}%`, background: cor }}
                    />
                  </div>
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

        {/* Avaliações e Sugestões */}
        <FeedbackSection />
      </section>
    </div>
  );
}
