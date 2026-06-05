"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import type { AulaComStatus, Page } from "@/types";
import { CONTEUDOS_SEED, CATEGORIA_CORES } from "@/data/conteudos";

interface Props {
  conteudoId: string;
  conteudoNome: string;
  onNavigate: (p: Page) => void;
  onOpenAuth: (tab: "login" | "register") => void;
  onOpenUpgrade?: () => void;
}

// ── Títulos realistas por conteúdo ────────────────────────────────────────────
const TITULOS_MOCK: Record<string, string[]> = {
  "Matemática Básica": [
    "Números inteiros e operações",
    "Frações e decimais",
    "Potências e raízes",
    "Expressões numéricas",
    "MMC e MDC",
    "Números racionais",
    "Ordem de grandeza",
    "Revisão e simulado",
  ],
  "Razão e Proporção": [
    "O que é razão",
    "Proporção e propriedades",
    "Grandezas diretamente proporcionais",
    "Grandezas inversamente proporcionais",
    "Regra de três simples",
    "Problemas com proporção",
  ],
  Porcentagem: [
    "Conceito de porcentagem",
    "Cálculo de porcentagem",
    "Acréscimo e desconto",
    "Juros simples",
    "Juros compostos",
    "Taxa percentual",
    "Problemas ENEM",
  ],
  "Regra de Três": [
    "Regra de três simples direta",
    "Regra de três simples inversa",
    "Regra de três composta",
    "Problemas práticos",
    "Casos especiais",
  ],
  "Potenciação e Radiciação": [
    "Potências inteiras",
    "Propriedades das potências",
    "Notação científica",
    "Raiz quadrada",
    "Raiz cúbica",
    "Propriedades da radiciação",
    "Operações com radicais",
  ],
  "Expressões Algébricas": [
    "Monômios",
    "Polinômios",
    "Adição de polinômios",
    "Multiplicação de polinômios",
    "Divisão algébrica",
    "Valor numérico",
  ],
  "Produtos Notáveis": [
    "Quadrado da soma",
    "Quadrado da diferença",
    "Produto da soma pela diferença",
    "Cubo da soma",
    "Cubo da diferença",
  ],
  Fatoração: [
    "Fator comum em evidência",
    "Agrupamento",
    "Diferença de dois quadrados",
    "Trinômio quadrado perfeito",
    "Soma/diferença de cubos",
    "Trinômio geral",
  ],
  "Equações do 1º Grau": [
    "Conceito de equação",
    "Equações equivalentes",
    "Resolução de equações",
    "Problemas do 1º grau",
    "Equações com frações",
    "Aplicações práticas",
  ],
  "Equações do 2º Grau": [
    "Forma geral",
    "Fórmula de Bhaskara",
    "Discriminante (Δ)",
    "Natureza das raízes",
    "Relações de Girard",
    "Equações incompletas",
    "Problemas com x²",
    "Aplicações no ENEM",
  ],
  Inequações: [
    "Inequações do 1º grau",
    "Resolução e representação",
    "Inequações do 2º grau",
    "Estudo do sinal",
    "Inequações produto/quociente",
    "Sistemas de inequações",
  ],
  "Sistemas Lineares": [
    "Conceito de sistema",
    "Método da substituição",
    "Método da adição",
    "Método da comparação",
    "Interpretação gráfica",
    "Sistemas impossíveis/indeterminados",
    "Problemas com sistemas",
  ],
  "Função Afim": [
    "Conceito de função",
    "Lei de formação",
    "Coeficientes angular e linear",
    "Gráfico da função afim",
    "Zeros da função",
    "Função crescente e decrescente",
    "Problemas com função afim",
    "Aplicações no ENEM",
  ],
  "Função Quadrática": [
    "Forma geral ax²+bx+c",
    "Coeficientes a, b e c",
    "Vértice da parábola",
    "Zeros da função quadrática",
    "Gráfico e concavidade",
    "Máximo e mínimo",
    "Inequação do 2º grau",
    "Problemas de otimização",
    "Questões ENEM",
  ],
  "Função Exponencial": [
    "Definição e propriedades",
    "Gráfico da exponencial",
    "Crescimento exponencial",
    "Decaimento exponencial",
    "Equações exponenciais",
    "Aplicações práticas",
    "Questões vestibulares",
  ],
  "Função Logarítmica": [
    "Definição de logaritmo",
    "Propriedades dos logaritmos",
    "Log na base 10 e natural",
    "Equações logarítmicas",
    "Inequações logarítmicas",
    "Mudança de base",
    "Aplicações",
    "Questões ENEM",
  ],
  "Geometria Plana": [
    "Ponto, reta e plano",
    "Ângulos e classificação",
    "Triângulos",
    "Quadriláteros",
    "Polígonos regulares",
    "Círculo e circunferência",
    "Áreas de figuras planas",
    "Teorema de Pitágoras",
    "Semelhança",
    "Questões ENEM",
  ],
  "Geometria Espacial": [
    "Prismas — área e volume",
    "Pirâmides",
    "Cilindro",
    "Cone",
    "Esfera",
    "Poliedros de Platão",
    "Troncos",
    "Planificação",
    "Questões vestibulares",
  ],
  "Geometria Analítica": [
    "Sistema cartesiano",
    "Distância entre dois pontos",
    "Ponto médio e divisão",
    "Equação da reta",
    "Posições relativas de retas",
    "Distância ponto-reta",
    "Circunferência",
    "Cônicas",
    "Problemas ENEM",
    "Questões vestibulares",
  ],
  Trigonometria: [
    "Razões trigonométricas",
    "Seno, cosseno e tangente",
    "Triângulo retângulo",
    "Tabela trigonométrica",
    "Lei dos senos",
    "Lei dos cossenos",
    "Funções trigonométricas",
    "Gráficos",
    "Equações trig",
    "Questões ENEM",
  ],
  Estatística: [
    "Dados e tabelas",
    "Gráficos estatísticos",
    "Média aritmética",
    "Mediana",
    "Moda",
    "Desvio médio",
    "Variância",
    "Desvio padrão",
  ],
  Probabilidade: [
    "Espaço amostral",
    "Eventos e operações",
    "Probabilidade clássica",
    "Probabilidade condicional",
    "Eventos independentes",
    "Combinatória e probabilidade",
    "Questões ENEM",
  ],
  "Análise Combinatória": [
    "Princípio multiplicativo",
    "Fatorial",
    "Arranjos simples",
    "Permutações simples",
    "Permutações com repetição",
    "Combinações simples",
    "Aplicações",
    "Questões vestibulares",
    "Simulado ENEM",
  ],
  "Progressões (PA e PG)": [
    "PA — conceito e termo geral",
    "PA — soma dos termos",
    "PA — inserção de meios",
    "PG — conceito e razão",
    "PG — termo geral",
    "PG — soma dos termos",
    "PG infinita",
    "Questões ENEM",
  ],
};

// ── Gerador de aulas mock ─────────────────────────────────────────────────────
function mockAulas(
  nome: string,
  total: number,
  totalmenteGratuito: boolean,
): AulaComStatus[] {
  const titulos = TITULOS_MOCK[nome] ?? [];
  const duracoes = [
    "08:30",
    "11:15",
    "09:45",
    "14:20",
    "07:55",
    "12:40",
    "10:10",
    "13:05",
    "08:50",
    "15:30",
  ];

  return Array.from({ length: total }, (_, i) => ({
    _id: `aula-${nome.replace(/\s/g, "-").toLowerCase()}-${i}`,
    titulo: titulos[i] ?? `Aula ${i + 1} — ${nome}`,
    descricao: "Aula disponível para assinantes.",
    video_url: "",
    duracao: duracoes[i % duracoes.length],
    conteudo_id: nome,
    ordem: i + 1,
    tipo: totalmenteGratuito ? "free" : "premium",
    concluida: false,
    bloqueada: false,
  }));
}

// ── Ícone SVG de cadeado ──────────────────────────────────────────────────────
function LockIcon({
  size = 24,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// ── Tela de bloqueio premium ──────────────────────────────────────────────────
function PremiumLockScreen({
  conteudoNome,
  totalAulas,
  aulaAtiva,
  onNavigate,
  onOpenAuth,
  isLoggedIn,
  onOpenUpgrade,
}: {
  conteudoNome: string;
  totalAulas: number;
  aulaAtiva: AulaComStatus | null;
  onNavigate: (p: Page) => void;
  onOpenAuth: (tab: "login" | "register") => void;
  isLoggedIn: boolean;
  onOpenUpgrade?: () => void;
}) {
  return (
    <div className="premium-lock-screen">
      {/* Glow de fundo decorativo */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 320,
          height: 320,
          background:
            "radial-gradient(circle, rgba(24,95,165,.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Ícone de cadeado */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(55,138,221,.25), rgba(24,95,165,.35))",
          border: "1px solid rgba(55,138,221,.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.25rem",
          boxShadow: "0 0 32px rgba(55,138,221,.2)",
        }}
      >
        <LockIcon size={32} color="#B5D4F4" />
      </div>

      {/* Título da aula selecionada ou nome do curso */}
      {aulaAtiva && (
        <div
          style={{
            fontSize: ".72rem",
            color: "rgba(255,255,255,.4)",
            textTransform: "uppercase",
            letterSpacing: ".1em",
            marginBottom: ".3rem",
          }}
        >
          {conteudoNome}
        </div>
      )}
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: aulaAtiva ? "1.1rem" : "1.35rem",
          fontWeight: 800,
          color: "#fff",
          marginBottom: ".35rem",
          letterSpacing: "-0.01em",
          maxWidth: 380,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {aulaAtiva ? aulaAtiva.titulo : "Conteúdo Premium"}
      </div>

      {/* Duração da aula selecionada */}
      {aulaAtiva && (
        <div
          style={{
            fontSize: ".78rem",
            color: "rgba(255,255,255,.4)",
            marginBottom: ".75rem",
          }}
        >
          ⏱ {aulaAtiva.duracao} · ⭐ Premium
        </div>
      )}

      {/* Subtítulo */}
      <div
        style={{
          fontSize: ".88rem",
          color: "rgba(255,255,255,.55)",
          marginBottom: "1.5rem",
          maxWidth: 360,
          lineHeight: 1.55,
          textAlign: "center",
        }}
      >
        Assine para assistir as{" "}
        <strong style={{ color: "rgba(255,255,255,.8)" }}>
          {totalAulas} aulas
        </strong>{" "}
        de{" "}
        <strong style={{ color: "rgba(255,255,255,.8)" }}>
          {conteudoNome}
        </strong>
      </div>

      {/* Lista de benefícios */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: ".45rem",
          marginBottom: "1.75rem",
        }}
      >
        {[
          "Acesso imediato a todos os conteúdos",
          "Todos os 24 conteúdos desbloqueados",
          "Cancele quando quiser, sem burocracia",
        ].map((b) => (
          <div
            key={b}
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              fontSize: ".8rem",
              color: "rgba(255,255,255,.7)",
            }}
          >
            <span
              style={{ color: "#3fcf8e", fontWeight: 700, fontSize: ".9rem" }}
            >
              ✓
            </span>
            {b}
          </div>
        ))}
      </div>

      {/* Botão CTA principal */}
      <button
        className="btn btn-primary"
        onClick={() => {
          if (isLoggedIn) {
            onOpenUpgrade?.();
          } else {
            onOpenAuth("login");
          }
        }}
        style={{
          background: "linear-gradient(90deg, #185FA5, #378ADD)",
          border: "none",
          padding: ".75rem 2rem",
          fontSize: ".95rem",
          fontWeight: 700,
          borderRadius: 10,
          cursor: "pointer",
          color: "#fff",
          letterSpacing: ".02em",
          boxShadow: "0 4px 20px rgba(55,138,221,.35)",
          marginBottom: ".75rem",
        }}
      >
        ⭐ Assinar agora — R$39/mês
      </button>

      {/* Link login */}
      {!isLoggedIn ? (
        <button
          onClick={() => onOpenAuth("login")}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,.4)",
            fontSize: ".78rem",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Já sou assinante → Fazer login
        </button>
      ) : (
        <div style={{ fontSize: ".78rem", color: "rgba(255,255,255,.35)" }}>
          Sua conta não possui assinatura ativa
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function ConteudoPage({
  conteudoId,
  conteudoNome,
  onNavigate,
  onOpenAuth,
  onOpenUpgrade,
}: Props) {
  const { token, isPremium, isLoggedIn } = useAuth();
  const [aulas, setAulas] = useState<AulaComStatus[]>([]);
  const [aulaAtiva, setAulaAtiva] = useState<AulaComStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [marcando, setMarcando] = useState(false);

  const conteudo = CONTEUDOS_SEED.find(
    (c) => c.nome === conteudoNome || c.nome === conteudoId,
  );

  const cor = conteudo ? CATEGORIA_CORES[conteudo.categoria] : "var(--accent)";
  const isGratuito = conteudo?.totalmenteGratuito === true;
  const isPremiumLocked = !isGratuito && !isPremium;

  // ── Fetch de aulas ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const headers: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {};
        const res = await fetch(`/api/conteudos/${conteudoId}/aulas`, {
          headers,
        });
        if (!res.ok) throw new Error("api-error");
        const data: AulaComStatus[] = await res.json();
        setAulas(data);
        setAulaAtiva(data[0] ?? null);
      } catch {
        // Fallback mock
        if (conteudo) {
          const mock = mockAulas(
            conteudo.nome,
            conteudo.totalAulas,
            isGratuito,
          ).map<AulaComStatus>((a) => ({
            ...a,
            // Para cursos premium, todas as aulas ficam bloqueadas para não-assinantes
            // Premium users have access to everything
            bloqueada: !isGratuito && !isPremium,
          }));
          setAulas(mock);
          setAulaAtiva(mock[0] ?? null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetch_();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conteudoId, token, isPremium]);

  // ── Marcar aula como concluída ──────────────────────────────────────────────
  const marcarConcluida = async () => {
    // Nunca marca como concluída se a aula estiver bloqueada (proteção dupla)
    if (!aulaAtiva || !token || aulaAtiva.bloqueada) return;
    setMarcando(true);
    try {
      await fetch("/api/progresso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ aula_id: aulaAtiva._id }),
      });
      setAulas((prev) =>
        prev.map((a) =>
          a._id === aulaAtiva._id ? { ...a, concluida: true } : a,
        ),
      );
      setAulaAtiva((prev) => (prev ? { ...prev, concluida: true } : null));
      // Auto-avança para próxima aula disponível
      const idx = aulas.findIndex((a) => a._id === aulaAtiva._id);
      const next = aulas[idx + 1];
      if (next && !next.bloqueada) setAulaAtiva(next);
    } finally {
      setMarcando(false);
    }
  };

  const concluidas = aulas.filter((a) => a.concluida).length;
  const pct =
    aulas.length > 0 ? Math.round((concluidas / aulas.length) * 100) : 0;

  const getYouTubeId = (url: string): string | null => {
    const m = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
    return m ? m[1] : null;
  };

  // ── Clique em aula bloqueada ─────────────────────────────────────────────────────────
  const handleAulaBloqueadaClick = (aula: AulaComStatus) => {
    // Sempre troca a aula ativa para o usuário ver o título selecionado
    setAulaAtiva(aula);

    if (!isLoggedIn) {
      onOpenAuth("login");
    } else if (!isPremium) {
      onOpenUpgrade?.();
    }
  };

  // ── Integração simplificada para conclusão automática ──────────────────────
  useEffect(() => {
    const handleYoutubeMessage = (event: MessageEvent) => {
      // Verifica se a mensagem vem do YouTube
      if (!event.origin.includes("youtube.com")) return;

      try {
        const data = JSON.parse(event.data);
        // O evento "onStateChange" com data 0 significa que o vídeo acabou
        if (data.event === "infoDelivery" && data.info && data.info.playerState === 0) {
          console.log("YouTube: Vídeo finalizado!");
          marcarConcluida();
        }
      } catch (e) {
        // Ignora mensagens que não sejam JSON (comum em extensões do browser)
      }
    };

    window.addEventListener("message", handleYoutubeMessage);
    return () => window.removeEventListener("message", handleYoutubeMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aulaAtiva]);

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        className="page"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <div style={{ color: "var(--text3)", fontSize: ".95rem" }}>
          Carregando aulas...
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="page">
      <section>
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a onClick={() => onNavigate("cursos")} style={{ cursor: "pointer" }}>
            Cursos
          </a>
          <span>›</span>
          <span>{conteudoNome}</span>
        </div>

        {/* ── Banner de aviso / confirmação de acesso ──────────────────────── */}
        {isPremium && !isGratuito ? (
          // ✅ Banner verde para usuários premium
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: ".85rem 1.25rem",
              marginBottom: "1.5rem",
              background:
                "linear-gradient(90deg, rgba(63,207,142,.1), rgba(63,207,142,.06))",
              border: "1px solid rgba(63,207,142,.35)",
              borderRadius: "var(--radius)",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".6rem",
                flex: 1,
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>✅</span>
              <span
                style={{
                  fontSize: ".85rem",
                  color: "var(--text2)",
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: "#3fcf8e" }}>
                  Premium ativo — Acesso livre a este conteúdo.
                </strong>{" "}
                Todas as aulas estão liberadas para você.
              </span>
            </div>
            <span
              style={{
                fontSize: ".72rem",
                fontWeight: 700,
                color: "#3fcf8e",
                background: "rgba(63,207,142,.15)",
                padding: "3px 10px",
                borderRadius: 20,
                border: "1px solid rgba(63,207,142,.3)",
                whiteSpace: "nowrap",
                flexShrink: 0,
                letterSpacing: ".04em",
              }}
            >
              ✓ LIBERADO
            </span>
          </div>
        ) : isPremiumLocked ? (
          // 🔒 Banner de bloqueio para usuários não-premium
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: ".85rem 1.25rem",
              marginBottom: "1.5rem",
              background:
                "linear-gradient(90deg, rgba(24,95,165,.12), rgba(55,138,221,.08))",
              border: "1px solid rgba(55,138,221,.3)",
              borderRadius: "var(--radius)",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
                flex: 1,
              }}
            >
              <LockIcon size={16} color="#B5D4F4" />
              <span
                style={{
                  fontSize: ".85rem",
                  color: "var(--text2)",
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: "var(--text)" }}>
                  🔒 Este conteúdo é exclusivo para assinantes Premium.
                </strong>{" "}
                Assine e tenha acesso a todos os 24 conteúdos da plataforma.
              </span>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (isLoggedIn) {
                  onOpenUpgrade?.();
                } else {
                  onOpenAuth("login");
                }
              }}
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              ⭐ Assinar Premium
            </button>
          </div>
        ) : null}

        {/* ── Header do conteúdo ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>
            {conteudo?.icone ?? "📚"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".75rem",
              flexWrap: "wrap",
              marginBottom: ".4rem",
            }}
          >
            <h2 className="section-title" style={{ margin: 0 }}>
              {conteudoNome}
            </h2>

            {/* Badge de acesso */}
            {isGratuito ? (
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: ".7rem",
                  fontWeight: 700,
                  background: "rgba(63,207,142,.15)",
                  color: "#3fcf8e",
                  border: "1px solid rgba(63,207,142,.3)",
                  letterSpacing: ".03em",
                }}
              >
                🟢 GRATUITO
              </span>
            ) : isPremium ? (
              // ✅ Badge verde para usuário premium em conteúdo premium
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: ".7rem",
                  fontWeight: 700,
                  background: "rgba(63,207,142,.15)",
                  color: "#3fcf8e",
                  border: "1px solid rgba(63,207,142,.35)",
                  letterSpacing: ".03em",
                }}
              >
                ✅ ACESSO LIVRE
              </span>
            ) : (
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: ".7rem",
                  fontWeight: 700,
                  background: "rgba(55,138,221,.13)",
                  color: "#378ADD",
                  border: "1px solid rgba(55,138,221,.3)",
                  letterSpacing: ".03em",
                }}
              >
                ⭐ EXCLUSIVO PREMIUM
              </span>
            )}
          </div>

          <p
            style={{
              color: "var(--text2)",
              fontSize: ".9rem",
              marginBottom: "1rem",
            }}
          >
            {conteudo?.descricao}
          </p>

          {/* Barra de progresso — sempre visível. Premium bloqueado mostra 0/X */}
          <div style={{ maxWidth: 400 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: ".75rem",
                color: "var(--text3)",
                marginBottom: ".4rem",
              }}
            >
              <span>
                {isPremiumLocked
                  ? `0/${aulas.length} aulas concluídas`
                  : `${concluidas}/${aulas.length} aulas concluídas`}
              </span>
              <span
                style={{
                  color: isPremiumLocked ? "var(--text3)" : cor,
                  fontWeight: 600,
                }}
              >
                {isPremiumLocked ? "0%" : `${pct}%`}
              </span>
            </div>
            <div className="progress-bar" style={{ height: 6 }}>
              <div
                className="progress-fill"
                style={{
                  width: isPremiumLocked ? "0%" : `${pct}%`,
                  background: cor,
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Grid principal: vídeo + lista de aulas ────────────────────────── */}
        <div className="conteudo-main-grid">
          {/* ── LEFT: Player / Tela de bloqueio + info da aula ──────────────── */}
          <div>
            {/* Player ou tela de bloqueio */}
            {/* Bloqueia se: (1) curso inteiro é premium-locked, OU (2) a aula selecionada está bloqueada individualmente */}
            {isPremiumLocked || aulaAtiva?.bloqueada === true ? (
              <div style={{ marginBottom: "1.25rem" }}>
                <PremiumLockScreen
                  conteudoNome={conteudoNome}
                  totalAulas={aulas.length}
                  aulaAtiva={aulaAtiva}
                  onNavigate={onNavigate}
                  onOpenAuth={onOpenAuth}
                  isLoggedIn={isLoggedIn}
                  onOpenUpgrade={onOpenUpgrade}
                />
              </div>
            ) : (
              <div className="video-wrap" style={{ marginBottom: "1.25rem" }}>
                {aulaAtiva?.video_url && getYouTubeId(aulaAtiva.video_url) ? (
                  <iframe
                    id={`yt-player-${aulaAtiva._id}`}
                    src={`https://www.youtube.com/embed/${getYouTubeId(aulaAtiva.video_url)}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                    allowFullScreen
                    title={aulaAtiva.titulo}
                  />
                ) : (
                  <div className="video-placeholder">
                    <div className="play-btn" />
                    <div
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      {aulaAtiva ? aulaAtiva.titulo : "Selecione uma aula"}
                    </div>
                    <div style={{ fontSize: ".8rem" }}>
                      Vídeo será adicionado em breve
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* Info da aula ativa — exibe sempre (mesmo bloqueada, mostra título) */}
            {aulaAtiva && (
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        marginBottom: ".4rem",
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem",
                      }}
                    >
                      {isPremiumLocked && (
                        <LockIcon size={16} color="var(--text3)" />
                      )}
                      {aulaAtiva.titulo}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        fontSize: ".78rem",
                        color: "var(--text3)",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>⏱ {aulaAtiva.duracao}</span>
                      {isPremiumLocked ? (
                        <span style={{ color: "var(--accent)" }}>
                          ⭐ Premium
                        </span>
                      ) : (
                        <span>
                          {aulaAtiva.tipo === "free"
                            ? "🟢 Gratuita"
                            : "⭐ Premium"}
                        </span>
                      )}
                      {aulaAtiva.concluida && !isPremiumLocked && (
                        <span style={{ color: "var(--green)" }}>
                          ✓ Concluída
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div
                    style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}
                  >
                    {isPremiumLocked ? (
                      <button
                        className="btn btn-primary btn-md"
                        onClick={() => {
                          if (isLoggedIn) {
                            onOpenUpgrade?.();
                          } else {
                            onOpenAuth("login");
                          }
                        }}
                      >
                        🔓 Desbloquear acesso
                      </button>
                    ) : (
                      <>
                        {isLoggedIn &&
                          !aulaAtiva.concluida &&
                          !aulaAtiva.bloqueada && (
                            <button
                              className="btn btn-green btn-md"
                              onClick={marcarConcluida}
                              disabled={marcando}
                            >
                              {marcando
                                ? "Salvando..."
                                : "✓ Marcar como concluída"}
                            </button>
                          )}
                        {!isLoggedIn && (
                          <button
                            className="btn btn-ghost btn-md"
                            onClick={() => onOpenAuth("register")}
                          >
                            Criar conta para salvar progresso
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Descrição da aula — só para cursos acessíveis */}
                {!isPremiumLocked && aulaAtiva.descricao && (
                  <p
                    style={{
                      color: "var(--text2)",
                      fontSize: ".88rem",
                      marginTop: "1rem",
                      lineHeight: 1.7,
                    }}
                  >
                    {aulaAtiva.descricao}
                  </p>
                )}

                {!isPremiumLocked && aulaAtiva.materialPdf && (
                  <a
                    href={aulaAtiva.materialPdf}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: ".4rem",
                      marginTop: ".75rem",
                      color: "var(--accent)",
                      fontSize: ".82rem",
                      textDecoration: "none",
                    }}
                  >
                    📄 Baixar material em PDF
                  </a>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Lista de aulas ─────────────────────────────────────────── */}
          <div>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                marginBottom: "1rem",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>Aulas ({aulas.length})</span>
              {isPremium && !isGratuito ? (
                // ✅ Badge verde de acesso liberado para premium
                <span
                  style={{
                    fontSize: ".68rem",
                    fontWeight: 600,
                    color: "#3fcf8e",
                    background: "rgba(63,207,142,.12)",
                    padding: "2px 8px",
                    borderRadius: 20,
                    border: "1px solid rgba(63,207,142,.3)",
                    fontFamily: "inherit",
                  }}
                >
                  ✓ Todas liberadas
                </span>
              ) : isPremiumLocked ? (
                <span
                  style={{
                    fontSize: ".68rem",
                    fontWeight: 600,
                    color: "#B5D4F4",
                    background: "rgba(24,95,165,.15)",
                    padding: "2px 8px",
                    borderRadius: 20,
                    border: "1px solid rgba(55,138,221,.25)",
                    fontFamily: "inherit",
                  }}
                >
                  🔒 Bloqueadas
                </span>
              ) : null}
            </div>

            <div
              style={{
                maxHeight: "70vh",
                overflowY: "auto",
                paddingRight: ".25rem",
              }}
            >
              {aulas.map((aula) => {
                const isActive = aulaAtiva?._id === aula._id;
                const isLocked = aula.bloqueada || isPremiumLocked;

                return (
                  <div
                    key={aula._id}
                    onClick={() => {
                      if (isLocked) {
                        // Seleciona a aula para mostrar título/duração no player de bloqueio
                        handleAulaBloqueadaClick(aula);
                        return;
                      }
                      setAulaAtiva(aula);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: ".75rem",
                      padding: ".65rem .75rem",
                      borderRadius: 10,
                      marginBottom: ".35rem",
                      // cursor pointer mesmo bloqueada — o usuário pode selecionar
                      cursor: "pointer",
                      border: isActive
                        ? `1px solid ${cor}`
                        : "1px solid transparent",
                      background: isActive ? `${cor}10` : "var(--surface)",
                      opacity: isLocked ? 0.65 : 1,
                      transition:
                        "opacity .15s, background .15s, border-color .15s",
                      position: "relative",
                    }}
                    title={
                      isLocked
                        ? "Conteúdo exclusivo para assinantes Premium"
                        : aula.titulo
                    }
                  >
                    {/* Número / ícone */}
                    <div
                      style={{
                        minWidth: 28,
                        height: 28,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: ".75rem",
                        fontWeight: 700,
                        flexShrink: 0,
                        background:
                          aula.concluida && !isPremiumLocked
                            ? "rgba(63,207,142,.18)"
                            : isLocked
                              ? "rgba(24,95,165,.15)"
                              : isActive
                                ? `${cor}22`
                                : "var(--bg3)",
                        color:
                          aula.concluida && !isPremiumLocked
                            ? "#3fcf8e"
                            : isLocked
                              ? "#B5D4F4"
                              : isActive
                                ? cor
                                : "var(--text3)",
                        border:
                          aula.concluida && !isPremiumLocked
                            ? "1px solid rgba(63,207,142,.3)"
                            : isLocked
                              ? "1px solid rgba(55,138,221,.25)"
                              : "none",
                      }}
                    >
                      {aula.concluida && !isPremiumLocked ? (
                        "✓"
                      ) : isLocked ? (
                        <LockIcon size={13} color="#B5D4F4" />
                      ) : (
                        aula.ordem
                      )}
                    </div>

                    {/* Conteúdo da aula */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: ".83rem",
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? "var(--text)" : "var(--text2)",
                          lineHeight: 1.35,
                          marginBottom: ".2rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {aula.titulo}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".5rem",
                          fontSize: ".7rem",
                          color: "var(--text3)",
                        }}
                      >
                        <span>⏱ {aula.duracao}</span>
                        {isLocked ? (
                          <span
                            style={{
                              color: "#B5D4F4",
                              background: "rgba(24,95,165,.12)",
                              padding: "1px 6px",
                              borderRadius: 4,
                              fontSize: ".65rem",
                              fontWeight: 700,
                              letterSpacing: ".03em",
                            }}
                          >
                            PREMIUM
                          </span>
                        ) : isPremium && aula.tipo !== "free" ? (
                          // ✅ Indicador verde de aula liberada para assinante premium
                          <span
                            style={{
                              color: "#3fcf8e",
                              background: "rgba(63,207,142,.1)",
                              padding: "1px 6px",
                              borderRadius: 4,
                              fontSize: ".65rem",
                              fontWeight: 700,
                              letterSpacing: ".03em",
                            }}
                          >
                            LIBERADO
                          </span>
                        ) : (
                          <span
                            style={{
                              color:
                                aula.tipo === "free" ? "#3fcf8e" : "#378ADD",
                              background:
                                aula.tipo === "free"
                                  ? "rgba(63,207,142,.1)"
                                  : "rgba(55,138,221,.1)",
                              padding: "1px 6px",
                              borderRadius: 4,
                              fontSize: ".65rem",
                              fontWeight: 700,
                              letterSpacing: ".03em",
                            }}
                          >
                            {aula.tipo === "free" ? "GRÁTIS" : "PREMIUM"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Card premium ativo (verde) ou upsell (azul) ─────────────── */}
            {isPremium && !isGratuito ? (
              // ✅ Card de confirmação premium — visível somente para assinantes
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1.25rem",
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, rgba(63,207,142,.08), rgba(63,207,142,.04))",
                  border: "1px solid rgba(63,207,142,.25)",
                  borderRadius: 14,
                }}
              >
                <div style={{ fontSize: "1.4rem", marginBottom: ".5rem" }}>
                  🏆
                </div>
                <div
                  style={{
                    fontSize: ".88rem",
                    fontWeight: 700,
                    marginBottom: ".3rem",
                    fontFamily: "'Syne', sans-serif",
                    color: "#3fcf8e",
                  }}
                >
                  Premium ativo
                </div>
                <div
                  style={{
                    fontSize: ".75rem",
                    color: "var(--text2)",
                    lineHeight: 1.55,
                  }}
                >
                  Você tem acesso livre a todas as{" "}
                  <strong style={{ color: "#3fcf8e" }}>{aulas.length} aulas</strong>{" "}
                  deste conteúdo.
                </div>
              </div>
            ) : isPremiumLocked ? (
              // 🔒 Card de upsell — somente para não-assinantes
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1.25rem",
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, rgba(24,95,165,.07), rgba(55,138,221,.08))",
                  border: "1px solid rgba(55,138,221,.2)",
                  borderRadius: 14,
                }}
              >
                <div style={{ fontSize: "1.4rem", marginBottom: ".5rem" }}>
                  🔒
                </div>
                <div
                  style={{
                    fontSize: ".88rem",
                    fontWeight: 700,
                    marginBottom: ".3rem",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  Conteúdo exclusivo para assinantes
                </div>
                <div
                  style={{
                    fontSize: ".75rem",
                    color: "var(--text2)",
                    marginBottom: "1rem",
                    lineHeight: 1.55,
                  }}
                >
                  {aulas.length} aulas disponíveis no plano Premium.
                  <br />
                  Assine e desbloqueie todos os 24 conteúdos da plataforma.
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (isLoggedIn) {
                      onOpenUpgrade?.();
                    } else {
                      onOpenAuth("login");
                    }
                  }}
                  style={{ width: "100%" }}
                >
                  ⭐ Assinar agora
                </button>
                {!isLoggedIn ? (
                  <div
                    style={{
                      marginTop: ".7rem",
                      fontSize: ".73rem",
                      color: "var(--text3)",
                    }}
                  >
                    Já assina?{" "}
                    <span
                      role="button"
                      tabIndex={0}
                      style={{
                        color: "var(--accent)",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                      onClick={() => onOpenAuth("login")}
                      onKeyDown={(e) =>
                        e.key === "Enter" && onOpenAuth("login")
                      }
                    >
                      Fazer login
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: ".7rem",
                      fontSize: ".73rem",
                      color: "var(--text3)",
                    }}
                  >
                    Sua conta atual não possui assinatura ativa.
                  </div>
                )}
              </div>
            ) : null}

            {/* ── Card de upsell — para logados sem premium com aulas bloqueadas (cursos mistos) */}
            {!isPremiumLocked &&
              !isPremium &&
              aulas.some((a) => a.bloqueada) && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1.25rem",
                    textAlign: "center",
                    background:
                      "linear-gradient(135deg, rgba(24,95,165,.07), rgba(55,138,221,.08))",
                    border: "1px solid rgba(55,138,221,.2)",
                    borderRadius: 14,
                  }}
                >
                  <div style={{ fontSize: "1.3rem", marginBottom: ".4rem" }}>
                    🔒
                  </div>
                  <div
                    style={{
                      fontSize: ".88rem",
                      fontWeight: 700,
                      marginBottom: ".25rem",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    Mais aulas disponíveis no Premium
                  </div>
                  <div
                    style={{
                      fontSize: ".75rem",
                      color: "var(--text2)",
                      marginBottom: "1rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {aulas.filter((a) => a.bloqueada).length} aulas bloqueadas.
                    Assine e desbloqueie tudo.
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      if (isLoggedIn) {
                        onOpenUpgrade?.();
                      } else {
                        onOpenAuth("login");
                      }
                    }}
                  >
                    ⭐ Assinar agora
                  </button>
                  {!isLoggedIn && (
                    <div
                      style={{
                        marginTop: ".6rem",
                        fontSize: ".72rem",
                        color: "var(--text3)",
                      }}
                    >
                      Já assina?{" "}
                      <span
                        role="button"
                        tabIndex={0}
                        style={{
                          color: "var(--accent)",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                        onClick={() => onOpenAuth("login")}
                        onKeyDown={(e) =>
                          e.key === "Enter" && onOpenAuth("login")
                        }
                      >
                        Faça login
                      </span>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </section>
    </div>
  );
}
