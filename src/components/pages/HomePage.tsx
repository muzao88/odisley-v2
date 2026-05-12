import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import type { Page } from "@/types";
import {
  CONTEUDOS_SEED,
  CATEGORIAS_ORDER,
  CATEGORIA_CORES,
} from "@/data/conteudos";

interface Props {
  onNavigate: (p: Page) => void;
  onOpenAuth: (tab: "login" | "register") => void;
  onSelectConteudo: (id: string, nome: string) => void;
}

const DEPOIMENTOS = [
  {
    text: "As aulas de Matemática foram decisivas para minha aprovação na UFPR. O Odisley explica de um jeito que finalmente faz sentido!",
    nome: "Lucas Mendes",
    role: "Aprovado em Engenharia Civil — UFPR",
    ini: "LM",
    av: "av-blue",
  },
  {
    text: "Consegui tirar 920 em Matemática no ENEM depois de estudar pela plataforma. O acompanhamento de progresso me ajudou muito.",
    nome: "Ana Sofia Rocha",
    role: "ENEM 2024 · Nota 920 em Mat.",
    ini: "AS",
    av: "av-purple",
  },
  {
    text: "Plataforma incrível! Estudo pelo celular no ônibus. As videoaulas são curtas e objetivas. Valeu cada centavo!",
    nome: "Pedro Oliveira",
    role: "Aprovado em Medicina — UEL",
    ini: "PO",
    av: "av-green",
  },
];

export default function HomePage({ onNavigate, onOpenAuth, onSelectConteudo }: Props) {
  const { user, isLoggedIn, token } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 1200,
    totalConteudos: 24,
    totalAulas: 200,
  });
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca estatísticas gerais
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.totalUsers) setStats(data);
      })
      .catch(console.error);

    // Se logado, busca progresso real para o card do Hero
    if (isLoggedIn && user && token) {
      fetch(`/api/progresso/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            // Ordena por percentual (maior primeiro) e pega os top 4
            const sorted = [...data]
              .sort((a, b) => b.percentual - a.percentual)
              .slice(0, 4);
            setUserProgress(sorted);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, user, token]);

  const preview = CONTEUDOS_SEED.slice(0, 6);

  // Dados padrão APENAS para visitantes deslogados
  const defaultHeroProgress = [
    { nome: "Função Quadrática", percentual: 78, categoria: "Álgebra", icone: "📐" },
    { nome: "Potenciação", percentual: 100, categoria: "Fundamentos", icone: "🔢" },
    { nome: "Razão e Proporção", percentual: 55, categoria: "Fundamentos", icone: "⚖️" },
    { nome: "Geometria Plana", percentual: 30, categoria: "Geometria", icone: "📏" },
  ];

  const isUsingRealData = isLoggedIn && userProgress.length > 0;
  const displayProgress = isUsingRealData ? userProgress : defaultHeroProgress;


  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-glow" />
          <div className="hero-glow2" />
          <div className="hero-grid" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span />
            Netflix de Matemática para o ENEM
          </div>
          <h1>
            Matemática que
            <br />
            <em>te aprova</em>
          </h1>
          <p className="hero-sub">
            Trilha completa de matemática para vestibular e ENEM. Videoaulas
            objetivas, progresso rastreado aula por aula e acesso de onde
            quiser.
          </p>
          <div className="hero-btns">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => isLoggedIn ? onNavigate("cursos") : onOpenAuth("register")}
            >
              {isLoggedIn ? "Continuar estudando" : "Começar grátis agora"}
            </button>
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => onNavigate("cursos")}
            >
              Ver todos os cursos
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-num">+{stats.totalUsers.toLocaleString('pt-BR')}</div>
              <div className="stat-label">Alunos ativos</div>
            </div>
            <div className="stat">
              <div className="stat-num">{stats.totalConteudos}</div>
              <div className="stat-label">Conteúdos</div>
            </div>
            <div className="stat">
              <div className="stat-num">{stats.totalAulas}+</div>
              <div className="stat-label">Videoaulas</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="dashboard-card">
            <div className="dc-header">
              <span className="dc-title">
                {isLoggedIn ? "Seu progresso real" : "Meu progresso"}
              </span>
              <span className="dc-badge">Em andamento</span>
            </div>
            {displayProgress.map((p) => {
              const cor = CATEGORIA_CORES[p.categoria as import('@/types').Categoria] || "var(--accent)";
              return (
                <div className="dc-pi" key={p.nome}>
                  <div className="dc-pi-header">
                    <span className="dc-pi-label">{p.icone} {p.nome}</span>
                    <span className="dc-pi-pct">{p.percentual}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ 
                        width: `${p.percentual}%`,
                        background: cor
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="dc-divider" />
            <div className="dc-next">Próxima aula</div>
            {isLoggedIn && userProgress.length > 0 ? (
              // Pega o primeiro curso que tem uma próxima aula
              (() => {
                const p = userProgress.find(item => item.proximaAula) || userProgress[0];
                return (
                  <div className="dc-lesson" onClick={() => onSelectConteudo(p.conteudo_id, p.nome)} style={{ cursor: 'pointer' }}>
                    <div className="dc-lesson-icon">{p.icone}</div>
                    <div className="dc-lesson-info">
                      <div className="dc-lesson-title">{p.proximaAula?.titulo || "Continuar curso"}</div>
                      <div className="dc-lesson-sub">{p.nome} {p.proximaAula?.duracao ? `· ${p.proximaAula.duracao}` : ""}</div>
                    </div>
                    <div className="dc-lesson-play" />
                  </div>
                );
              })()
            ) : (
              <div className="dc-lesson">
                <div className="dc-lesson-icon">📐</div>
                <div className="dc-lesson-info">
                  <div className="dc-lesson-title">Vértice da parábola</div>
                  <div className="dc-lesson-sub">Função Quadrática · 14 min</div>
                </div>
                <div className="dc-lesson-play" />
              </div>
            )}
          </div>
        </div>
      </section>



      {/* PREVIEW DE CONTEÚDOS */}
      <section style={{ background: "var(--bg2)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "2.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div className="section-tag">Trilha completa</div>
            <h2 className="section-title">24 conteúdos de matemática</h2>
            <p className="section-sub">
              Do básico ao avançado, tudo que cai no ENEM e vestibulares.
            </p>
          </div>
          <button
            className="btn btn-ghost btn-md"
            onClick={() => onNavigate("cursos")}
          >
            Ver todos os conteúdos →
          </button>
        </div>
        <div className="conteudo-grid">
          {preview.map((c) => {
            const cor = CATEGORIA_CORES[c.categoria];
            return (
              <div
                key={c.nome}
                className="conteudo-card"
                onClick={() => onNavigate("cursos")}
                style={{ "--card-color": cor } as any}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: cor,
                    opacity: 0,
                    transition: ".25s",
                  }}
                  className="card-top-bar"
                />
                <div className="cc-icon">{c.icone}</div>
                <div className="cc-name">{c.nome}</div>
                <div className="cc-aulas">
                  {c.totalAulas} aulas · {c.aulasGratuitas} gratuitas
                </div>
                <div className="cc-bar-wrap">
                  <div className="cc-bar-label">
                    <span>Progresso</span>
                    <span>0%</span>
                  </div>
                  <div className="cc-bar">
                    <div
                      className="cc-bar-fill"
                      style={{ width: "0%", background: cor }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section>
        <div className="centered" style={{ marginBottom: "3rem" }}>
          <div className="section-tag">Depoimentos</div>
          <h2 className="section-title">Alunos que foram aprovados</h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: "1.25rem",
          }}
        >
          {DEPOIMENTOS.map((t) => (
            <div
              key={t.nome}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "1.6rem",
              }}
            >
              <div
                style={{
                  color: "var(--gold)",
                  marginBottom: "1rem",
                  letterSpacing: ".1em",
                }}
              >
                ★★★★★
              </div>
              <p
                style={{
                  color: "var(--text2)",
                  fontSize: ".88rem",
                  lineHeight: 1.7,
                  marginBottom: "1.25rem",
                  fontStyle: "italic",
                }}
              >
                "{t.text}"
              </p>
              <div
                style={{ display: "flex", alignItems: "center", gap: ".7rem" }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background:
                      t.av === "av-blue"
                        ? "rgba(55,138,221,.15)"
                        : t.av === "av-purple"
                          ? "rgba(24,95,165,.18)"
                          : "rgba(63,207,142,.15)",
                    color:
                      t.av === "av-blue"
                        ? "var(--accent)"
                        : t.av === "av-purple"
                          ? "var(--accent2)"
                          : "var(--green)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 700,
                    fontSize: ".85rem",
                    flexShrink: 0,
                  }}
                >
                  {t.ini}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: ".88rem" }}>
                    {t.nome}
                  </div>
                  <div style={{ fontSize: ".72rem", color: "var(--text3)" }}>
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: "var(--bg2)", textAlign: "center" }}>
        <div className="section-tag centered">Comece hoje</div>
        <h2 className="section-title">Pronto para ser aprovado?</h2>
        <p className="section-sub centered" style={{ marginBottom: "2rem" }}>
          Junte-se a mais de 1.200 alunos que já estudam com o professor
          Odisley.
        </p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn btn-primary btn-lg"
            onClick={() => onOpenAuth("register")}
          >
            Criar conta gratuita
          </button>
          <button
            className="btn btn-ghost btn-lg"
            onClick={() => onNavigate("planos")}
          >
            Ver planos e preços
          </button>
        </div>
      </section>
    </>
  );
}
