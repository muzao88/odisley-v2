"use client";

import { useState, useEffect, useCallback } from "react";
import type React from "react";
import { useAuth } from "../AuthContext";
import type { ConteudoComProgresso, Categoria, Page } from "@/types";
import {
  CONTEUDOS_SEED,
  CATEGORIAS_ORDER,
  CATEGORIA_CORES,
  CATEGORIA_ICONES,
} from "@/data/conteudos";

// ─── Tipos auxiliares ─────────────────────────────────────────────────────────

interface ConteudoCard extends ConteudoComProgresso {
  totalmenteGratuito?: boolean;
}

// ─── Mapa de preview de aulas (3 primeiras por conteúdo) ─────────────────────

const AULAS_PREVIEW: Record<string, [string, string, string]> = {
  "Matemática Básica": ["Números inteiros", "Frações", "Decimais"],
  "Razão e Proporção": [
    "Conceito de razão",
    "Proporção direta",
    "Grandezas inversas",
  ],
  Porcentagem: [
    "O que é porcentagem",
    "Cálculo de %",
    "Acréscimos e descontos",
  ],
  "Regra de Três": [
    "Regra de três simples",
    "Regra de três composta",
    "Problemas práticos",
  ],
  "Potenciação e Radiciação": ["Potências", "Propriedades", "Radiciação"],
  "Expressões Algébricas": ["Monômios", "Polinômios", "Operações"],
  "Produtos Notáveis": [
    "Quadrado da soma",
    "Quadrado da diferença",
    "Produto notável",
  ],
  Fatoração: ["Fator comum", "Agrupamento", "Diferença de quadrados"],
  "Equações do 1º Grau": ["Conceito de equação", "Resolução", "Problemas"],
  "Equações do 2º Grau": [
    "Fórmula de Bhaskara",
    "Discriminante",
    "Relações de Girard",
  ],
  Inequações: [
    "Inequações do 1º grau",
    "Inequações do 2º grau",
    "Representação",
  ],
  "Sistemas Lineares": [
    "Método substituição",
    "Método adição",
    "Interpretação gráfica",
  ],
  "Função Afim": ["Lei de formação", "Gráfico da reta", "Zeros da função"],
  "Função Quadrática": [
    "Coeficientes a,b,c",
    "Vértice da parábola",
    "Zeros da função",
  ],
  "Função Exponencial": ["Crescimento exponencial", "Decaimento", "Aplicações"],
  "Função Logarítmica": [
    "Definição de logaritmo",
    "Propriedades",
    "Equações log",
  ],
  "Geometria Plana": ["Ângulos e retas", "Triângulos", "Quadriláteros"],
  "Geometria Espacial": ["Prismas", "Pirâmides", "Cilindro e cone"],
  "Geometria Analítica": [
    "Plano cartesiano",
    "Distância entre pontos",
    "Equação da reta",
  ],
  Trigonometria: ["Seno e cosseno", "Tangente", "Lei dos senos"],
  Estatística: ["Média aritmética", "Mediana e moda", "Desvio padrão"],
  Probabilidade: ["Espaço amostral", "Eventos", "Cálculo de probabilidade"],
  "Análise Combinatória": [
    "Princípio multiplicativo",
    "Permutações",
    "Combinações",
  ],
  "Progressões (PA e PG)": ["PA - conceito", "PA - fórmulas", "PG - conceito"],
};

// ─── Card Gratuito ────────────────────────────────────────────────────────────

interface FreeCardProps {
  c: ConteudoCard;
  onSelectConteudo: (id: string, nome: string) => void;
}

function FreeCard({ c, onSelectConteudo }: FreeCardProps) {
  return (
    <div
      onClick={() => onSelectConteudo(c._id, c.nome)}
      style={{
        background:
          "linear-gradient(135deg, rgba(63,207,142,.08) 0%, rgba(63,207,142,.04) 100%)",
        border: "2px solid rgba(63,207,142,.45)",
        borderRadius: "var(--radius)",
        padding: "1.5rem",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: ".7rem",
        transition: "all .25s",
        boxShadow: "0 0 0 0 rgba(63,207,142,0)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 16px 48px rgba(63,207,142,.18)";
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(63,207,142,.8)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 0 0 0 rgba(63,207,142,0)";
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "rgba(63,207,142,.45)";
      }}
    >
      {/* Faixa verde no topo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, #3fcf8e, #2eb87e)",
        }}
      />

      {/* Badge GRATUITO */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "rgba(63,207,142,.18)",
          border: "1px solid rgba(63,207,142,.45)",
          color: "#3fcf8e",
          fontSize: ".62rem",
          fontWeight: 800,
          letterSpacing: ".1em",
          padding: "3px 10px",
          borderRadius: 20,
          textTransform: "uppercase",
        }}
      >
        ✓ GRATUITO
      </div>

      {/* Ícone */}
      <div style={{ fontSize: "2rem", lineHeight: 1 }}>{c.icone}</div>

      {/* Nome */}
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "1rem",
          color: "var(--text)",
          lineHeight: 1.3,
        }}
      >
        {c.nome}
      </div>

      {/* Descrição */}
      <div
        style={{ fontSize: ".78rem", color: "var(--text2)", lineHeight: 1.55 }}
      >
        {c.descricao}
      </div>

      {/* Meta */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: ".5rem",
          fontSize: ".75rem",
          color: "#3fcf8e",
          fontWeight: 600,
        }}
      >
        <span>▶</span>
        <span>{c.totalAulas} aulas · Acesso livre</span>
      </div>

      {/* Barra de progresso */}
      {c.percentual > 0 && (
        <div className="cc-bar-wrap">
          <div className="cc-bar-label">
            <span style={{ color: "var(--text3)" }}>
              {c.aulasConcluidasCount}/{c.totalAulas} concluídas
            </span>
            <span style={{ color: "#3fcf8e", fontWeight: 700 }}>
              {c.percentual}%
            </span>
          </div>
          <div className="cc-bar">
            <div
              className="cc-bar-fill"
              style={{ width: `${c.percentual}%`, background: "#3fcf8e" }}
            />
          </div>
        </div>
      )}

      {/* CTA */}
      <div
        style={{
          marginTop: ".25rem",
          padding: ".55rem 1rem",
          background: "rgba(63,207,142,.15)",
          border: "1px solid rgba(63,207,142,.3)",
          borderRadius: 10,
          textAlign: "center",
          color: "#3fcf8e",
          fontWeight: 700,
          fontSize: ".82rem",
        }}
      >
        Começar agora →
      </div>
    </div>
  );
}

// ─── Card Premium ─────────────────────────────────────────────────────────────

interface PremiumCardProps {
  c: ConteudoCard;
  cor: string;
  canAccess: boolean;
  onClick: () => void;
}

function PremiumCard({ c, cor, canAccess, onClick }: PremiumCardProps) {
  const [hovered, setHovered] = useState(false);
  const preview = AULAS_PREVIEW[c.nome] ?? ["Aula 1", "Aula 2", "Aula 3"];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--surface)",
        border: `1px solid ${hovered ? cor + "60" : "var(--border)"}`,
        borderRadius: "var(--radius)",
        padding: "0",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all .25s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 16px 48px rgba(0,0,0,.35), 0 0 0 1px ${cor}30`
          : "none",
        minHeight: 220,
      }}
    >
      {/* Faixa colorida no topo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${cor}, ${cor}99)`,
          opacity: hovered ? 1 : 0.5,
          transition: "opacity .25s",
        }}
      />

      {/* Badge PREMIUM */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 3,
          background: "rgba(124,94,247,.15)",
          border: "1px solid rgba(124,94,247,.4)",
          color: "#a78bfa",
          fontSize: ".62rem",
          fontWeight: 800,
          letterSpacing: ".1em",
          padding: "3px 10px",
          borderRadius: 20,
          textTransform: "uppercase",
        }}
      >
        ⭐ PREMIUM
      </div>

      {/* ── Conteúdo padrão (sem hover) ── */}
      <div
        style={{
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: ".65rem",
          flex: 1,
          opacity: hovered ? 0 : 1,
          transition: "opacity .2s",
          pointerEvents: hovered ? "none" : "auto",
        }}
      >
        {/* Thumbnail / ícone grande */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: `${cor}18`,
            border: `1px solid ${cor}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            lineHeight: 1,
          }}
        >
          {c.icone}
        </div>

        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: ".97rem",
            color: "var(--text)",
            lineHeight: 1.3,
            paddingRight: "3rem",
          }}
        >
          {c.nome}
        </div>

        <div
          style={{
            fontSize: ".77rem",
            color: "var(--text2)",
            lineHeight: 1.55,
          }}
        >
          {c.descricao}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".45rem",
            fontSize: ".74rem",
            color: "var(--text3)",
            marginTop: "auto",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "rgba(79,142,247,.12)",
              fontSize: ".7rem",
            }}
          >
            🎞
          </span>
          <span>{c.totalAulas} aulas</span>
          <span style={{ color: "var(--border2)", margin: "0 .15rem" }}>·</span>
          <span
            style={{
              color: "rgba(124,94,247,.9)",
              fontWeight: 600,
            }}
          >
            🔒 Assinantes
          </span>
        </div>
      </div>

      {/* ── Overlay de hover ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(160deg, ${cor}15 0%, rgba(0,0,0,.88) 100%)`,
          backdropFilter: "blur(2px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: ".7rem",
          padding: "1.25rem",
          opacity: hovered ? 1 : 0,
          transition: "opacity .22s",
          zIndex: 2,
        }}
      >
        {/* Ícone cadeado grande */}
        {!canAccess && (
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(124,94,247,.18)",
              border: "1px solid rgba(124,94,247,.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
            }}
          >
            🔒
          </div>
        )}

        {/* Preview das 3 primeiras aulas */}
        <div style={{ width: "100%" }}>
          <div
            style={{
              fontSize: ".67rem",
              fontWeight: 700,
              color: cor,
              textTransform: "uppercase",
              letterSpacing: ".1em",
              marginBottom: ".4rem",
              textAlign: "center",
            }}
          >
            Conteúdo da aula
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: ".3rem" }}
          >
            {preview.map((titulo, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".5rem",
                  padding: ".35rem .6rem",
                  borderRadius: 8,
                  background: "rgba(255,255,255,.05)",
                  fontSize: ".75rem",
                  color: "var(--text2)",
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: `${cor}25`,
                    border: `1px solid ${cor}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".6rem",
                    color: cor,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {titulo}
                </span>
              </div>
            ))}
            <div
              style={{
                fontSize: ".68rem",
                color: "var(--text3)",
                textAlign: "center",
                padding: ".2rem 0",
              }}
            >
              + {c.totalAulas - 3} aulas adicionais
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            padding: ".55rem 1.1rem",
            background: canAccess
              ? `linear-gradient(135deg, ${cor}, ${cor}99)`
              : "linear-gradient(135deg, #7c5ef7, #4f8ef7)",
            borderRadius: 10,
            color: "#fff",
            fontWeight: 700,
            fontSize: ".8rem",
            textAlign: "center",
            width: "100%",
            boxShadow: "0 4px 16px rgba(0,0,0,.3)",
          }}
        >
          {canAccess ? "▶ Acessar agora" : "🔓 Desbloquear com Premium"}
        </div>
      </div>
    </div>
  );
}

// ─── Banner Upsell ────────────────────────────────────────────────────────────

interface UpsellBannerProps {
  onNavigate: (p: Page) => void;
  onOpenAuth?: (tab: "login" | "register") => void;
  isLoggedIn: boolean;
}

function UpsellBanner({
  onNavigate,
  onOpenAuth,
  isLoggedIn,
}: UpsellBannerProps) {
  return (
    <div
      style={{
        margin: "2.5rem 0",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        position: "relative",
        border: "1px solid rgba(124,94,247,.3)",
      }}
    >
      {/* Fundo gradiente */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(124,94,247,.12) 0%, rgba(79,142,247,.08) 50%, rgba(63,207,142,.06) 100%)",
          zIndex: 0,
        }}
      />
      {/* Glow decorativo */}
      <div
        style={{
          position: "absolute",
          top: "-40%",
          left: "60%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,94,247,.2) 0%, transparent 70%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "2rem 2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        {/* Lado esquerdo */}
        <div style={{ maxWidth: 520 }}>
          <div
            style={{
              fontSize: ".68rem",
              fontWeight: 800,
              color: "#a78bfa",
              letterSpacing: ".12em",
              textTransform: "uppercase",
              marginBottom: ".5rem",
            }}
          >
            ⭐ Plano Premium
          </div>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "1.35rem",
              color: "var(--text)",
              marginBottom: ".5rem",
              lineHeight: 1.3,
            }}
          >
            Desbloqueie todos os{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #7c5ef7, #4f8ef7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              23 conteúdos premium
            </span>
          </div>
          <div
            style={{
              color: "var(--text2)",
              fontSize: ".88rem",
              lineHeight: 1.6,
            }}
          >
            190+ aulas em vídeo HD · Simulados ENEM · Material PDF · Progresso
            salvo · Suporte prioritário
          </div>

          {/* Benefícios rápidos */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              marginTop: ".85rem",
            }}
          >
            {[
              "📹 190+ aulas",
              "📊 6 categorias",
              "🎯 Simulados ENEM",
              "📄 PDFs",
            ].map((b) => (
              <span
                key={b}
                style={{
                  padding: ".3rem .75rem",
                  borderRadius: 20,
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.1)",
                  fontSize: ".75rem",
                  color: "var(--text2)",
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Lado direito — CTAs */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: ".75rem",
            minWidth: 180,
          }}
        >
          <button
            className="btn btn-primary btn-md"
            onClick={() => onNavigate("planos")}
            style={{ justifyContent: "center", fontWeight: 800 }}
          >
            Ver planos →
          </button>
          {!isLoggedIn && onOpenAuth && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onOpenAuth("register")}
              style={{ justifyContent: "center" }}
            >
              Criar conta grátis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Seção por Categoria ──────────────────────────────────────────────────────

interface CategoriaSecaoProps {
  cat: Categoria;
  items: ConteudoCard[];
  cor: string;
  canAccess: boolean;
  onCardClick: (c: ConteudoCard) => void;
  onSelectConteudo: (id: string, nome: string) => void;
}

function CategoriaSecao({
  cat,
  items,
  cor,
  canAccess,
  onCardClick,
  onSelectConteudo,
}: CategoriaSecaoProps) {
  const totalAulas = items.reduce((s, c) => s + c.totalAulas, 0);

  return (
    <div className="category-section">
      {/* Cabeçalho da categoria */}
      <div className="category-header" style={{ marginBottom: "1.25rem" }}>
        <div
          className="category-icon"
          style={{
            background: `${cor}20`,
            border: `1px solid ${cor}30`,
            fontSize: "1.2rem",
          }}
        >
          {CATEGORIA_ICONES[cat]}
        </div>
        <div style={{ flex: 1 }}>
          <div className="category-name" style={{ color: "var(--text)" }}>
            {cat}
          </div>
          <div className="category-count">
            {items.length} conteúdos · {totalAulas} aulas
          </div>
        </div>
        {/* Pill colorida */}
        <div
          style={{
            padding: ".28rem .8rem",
            borderRadius: 20,
            background: `${cor}18`,
            border: `1px solid ${cor}35`,
            fontSize: ".7rem",
            fontWeight: 700,
            color: cor,
          }}
        >
          {cor === "#4f8ef7"
            ? "🔢"
            : cor === "#7c5ef7"
              ? "🔡"
              : cor === "#3fcf8e"
                ? "📈"
                : cor === "#f7934f"
                  ? "📐"
                  : cor === "#f7c94f"
                    ? "📊"
                    : "🔁"}{" "}
          {items.length} módulos
        </div>
      </div>

      {/* Grid de cards */}
      <div className="conteudo-grid">
        {items.map((c) => {
          if (c.totalmenteGratuito) {
            return (
              <FreeCard key={c._id} c={c} onSelectConteudo={onSelectConteudo} />
            );
          }
          return (
            <PremiumCard
              key={c._id}
              c={c}
              cor={cor}
              canAccess={canAccess}
              onClick={() => onCardClick(c)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  onNavigate: (p: Page) => void;
  onSelectConteudo: (id: string, nome: string) => void;
  onOpenAuth?: (tab: "login" | "register") => void;
}

export default function CoursesPage({
  onNavigate,
  onSelectConteudo,
  onOpenAuth,
}: Props) {
  const { token, isLoggedIn, isPremium } = useAuth();
  const [conteudos, setConteudos] = useState<ConteudoCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch conteúdos com fallback para seed
  useEffect(() => {
    const fetchConteudos = async () => {
      try {
        const res = await fetch("/api/conteudos", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data: ConteudoCard[] = await res.json();
          // Se o banco ainda não tem conteúdos cadastrados, usa o seed
          if (data.length === 0) {
            setConteudos(buildFromSeed());
          } else {
            // Enriquecer com o flag totalmenteGratuito do seed
            const enriched = data.map((c) => {
              const seed = CONTEUDOS_SEED.find((s) => s.nome === c.nome);
              return {
                ...c,
                totalmenteGratuito: seed?.totalmenteGratuito === true,
              };
            });
            setConteudos(enriched);
          }
        } else {
          setConteudos(buildFromSeed());
        }
      } catch {
        setConteudos(buildFromSeed());
      } finally {
        setLoading(false);
      }
    };
    fetchConteudos();
  }, [token]);

  // ── REGRA DE ACESSO ─────────────────────────────────────────────────────────
  // TODOS os usuários podem abrir qualquer conteúdo e visualizar a lista de aulas.
  // O bloqueio acontece APENAS ao tentar assistir/consumir (dentro da ConteudoPage).
  const handlePremiumCardClick = useCallback(
    (c: ConteudoCard) => {
      // Sempre abre o conteúdo — a ConteudoPage gerencia o que é acessível
      onSelectConteudo(c._id, c.nome);
    },
    [onSelectConteudo],
  );

  // Agrupa por categoria
  const byCategoria = CATEGORIAS_ORDER.reduce<
    Record<Categoria, ConteudoCard[]>
  >(
    (acc, cat) => {
      acc[cat] = conteudos.filter((c) => c.categoria === cat);
      return acc;
    },
    {} as Record<Categoria, ConteudoCard[]>,
  );

  // Totais para o header
  const totalAulas = conteudos.reduce((s, c) => s + c.totalAulas, 0);
  const totalConteudos = conteudos.length;

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
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "3px solid var(--border2)",
            borderTopColor: "var(--accent)",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <div
          style={{
            color: "var(--text3)",
            fontFamily: "'Syne', sans-serif",
            fontSize: ".9rem",
          }}
        >
          Carregando conteúdos...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Divisor de categorias para inserção do banner ────────────────────────────
  // Insere o banner upsell após a 2ª categoria (índice 1 → entre Fundamentos e Álgebra vs Funções)
  const BANNER_AFTER_INDEX = 1;

  return (
    <div className="page">
      <section>
        {/* ── Header heroico ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "3rem" }}>
          <div className="section-tag">
            Trilha completa · ENEM &amp; Concursos
          </div>
          <h2 className="section-title" style={{ fontSize: "2.4rem" }}>
            Conteúdos de{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, var(--accent), var(--accent2))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Matemática
            </span>
          </h2>
          <p
            className="section-sub"
            style={{ marginBottom: "2rem", maxWidth: 560 }}
          >
            Do básico ao avançado. Tudo que você precisa para dominar a
            Matemática no ENEM e concursos públicos — em um só lugar.
          </p>

          {/* Stats impressionantes */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {[
              {
                num: `${totalConteudos}`,
                label: "Conteúdos",
                icon: "📚",
                cor: "#4f8ef7",
              },
              {
                num: `${totalAulas}+`,
                label: "Aulas em vídeo",
                icon: "🎬",
                cor: "#7c5ef7",
              },
              { num: "6", label: "Categorias", icon: "🗂️", cor: "#3fcf8e" },
              { num: "ENEM", label: "Alinhado", icon: "🎯", cor: "#f7934f" },
            ].map(({ num, label, icon, cor }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".65rem",
                  padding: ".65rem 1.1rem",
                  borderRadius: 12,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${cor}18`,
                    border: `1px solid ${cor}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  {icon}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      color: cor,
                      lineHeight: 1,
                    }}
                  >
                    {num}
                  </div>
                  <div
                    style={{
                      fontSize: ".72rem",
                      color: "var(--text3)",
                      marginTop: 2,
                    }}
                  >
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Status de acesso ───────────────────────────────────────────────── */}
        {isLoggedIn && !isPremium && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".75rem",
              padding: ".85rem 1.25rem",
              borderRadius: 12,
              marginBottom: "2rem",
              background: "rgba(247,193,79,.07)",
              border: "1px solid rgba(247,193,79,.25)",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>💡</span>
            <div>
              <span
                style={{
                  color: "var(--gold)",
                  fontWeight: 700,
                  fontSize: ".88rem",
                }}
              >
                Você está no plano gratuito.{" "}
              </span>
              <span style={{ color: "var(--text2)", fontSize: ".88rem" }}>
                Acesse Matemática Básica gratuitamente ou assine para
                desbloquear tudo.
              </span>
            </div>
            <button
              className="btn btn-sm"
              onClick={() => onNavigate("planos")}
              style={{
                marginLeft: "auto",
                flexShrink: 0,
                background: "rgba(247,193,79,.15)",
                border: "1px solid rgba(247,193,79,.35)",
                color: "var(--gold)",
                fontWeight: 700,
              }}
            >
              Ver planos
            </button>
          </div>
        )}

        {/* ── Categorias + Banner intercalado ────────────────────────────────── */}
        {CATEGORIAS_ORDER.map((cat, idx) => {
          const items = byCategoria[cat] ?? [];
          if (items.length === 0) return null;
          const cor = CATEGORIA_CORES[cat];

          return (
            <div key={cat}>
              <CategoriaSecao
                cat={cat}
                items={items}
                cor={cor}
                canAccess={isPremium}
                onCardClick={handlePremiumCardClick}
                onSelectConteudo={onSelectConteudo}
              />

              {/* Banner upsell após a 2ª categoria */}
              {idx === BANNER_AFTER_INDEX && !isPremium && (
                <UpsellBanner
                  onNavigate={onNavigate}
                  onOpenAuth={onOpenAuth}
                  isLoggedIn={isLoggedIn}
                />
              )}
            </div>
          );
        })}

        {/* ── Banner final de upsell (para usuários premium mostramos um encerramento elegante) ── */}
        {!isPremium ? (
          <div
            style={{
              marginTop: "2rem",
              padding: "2rem 2.5rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  marginBottom: ".3rem",
                  fontSize: "1rem",
                }}
              >
                🔒 Conteúdos bloqueados?
              </div>
              <div style={{ color: "var(--text2)", fontSize: ".88rem" }}>
                Assine o Premium e desbloqueie todos os {totalConteudos - 1}{" "}
                conteúdos, simulados e muito mais.
              </div>
            </div>
            <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
              {!isLoggedIn && onOpenAuth && (
                <button
                  className="btn btn-ghost btn-md"
                  onClick={() => onOpenAuth("register")}
                >
                  Criar conta
                </button>
              )}
              <button
                className="btn btn-primary btn-md"
                onClick={() => onNavigate("planos")}
              >
                Assinar Premium →
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              marginTop: "2rem",
              padding: "1.5rem 2rem",
              background:
                "linear-gradient(135deg, rgba(63,207,142,.08), rgba(79,142,247,.05))",
              border: "1px solid rgba(63,207,142,.25)",
              borderRadius: "var(--radius)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span style={{ fontSize: "1.8rem" }}>🏆</span>
            <div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  color: "#3fcf8e",
                  marginBottom: ".2rem",
                }}
              >
                Você tem acesso completo!
              </div>
              <div style={{ color: "var(--text2)", fontSize: ".88rem" }}>
                Aproveite todos os {totalConteudos} conteúdos e {totalAulas}+
                aulas sem limitações.
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Helper: monta dados a partir do seed ────────────────────────────────────

function buildFromSeed(): ConteudoCard[] {
  return CONTEUDOS_SEED.map((c) => ({
    _id: c.nome,
    nome: c.nome,
    categoria: c.categoria,
    descricao: c.descricao,
    icone: c.icone,
    totalAulas: c.totalAulas,
    aulasGratuitas: c.aulasGratuitas,
    aulasConcluidasCount: 0,
    percentual: 0,
    totalmenteGratuito: c.totalmenteGratuito === true,
  }));
}
