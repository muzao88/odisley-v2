"use client";

import { useState, useEffect } from "react";
import type React from "react";
import { useAuth } from "../AuthContext";
import type { ConteudoComProgresso, Categoria, Page } from "@/types";
import {
  CONTEUDOS_SEED,
  CATEGORIAS_ORDER,
  CATEGORIA_CORES,
  CATEGORIA_ICONES,
} from "@/data/conteudos";

// Retorna o status real de acesso de um conteúdo
function isGratuito(nome: string): boolean {
  const seed = CONTEUDOS_SEED.find((s) => s.nome === nome);
  return seed?.totalmenteGratuito === true;
}

// Card individual de conteúdo com badge de acesso correto
function ConteudoCard({
  c,
  cor,
  onSelectConteudo,
}: {
  c: ConteudoComProgresso;
  cor: string;
  onSelectConteudo: (id: string, nome: string) => void;
}) {
  const gratuito = isGratuito(c.nome);
  return (
    <div
      className="conteudo-card"
      onClick={() => onSelectConteudo(c._id, c.nome)}
      style={{ "--card-color": cor } as React.CSSProperties}
    >
      {/* Faixa colorida no topo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: cor,
        }}
      />

      {/* Badge de acesso — canto superior direito */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          padding: "2px 8px",
          borderRadius: 20,
          fontSize: ".65rem",
          fontWeight: 700,
          letterSpacing: ".03em",
          background: gratuito
            ? "rgba(63,207,142,.15)"
            : "rgba(79,142,247,.13)",
          color: gratuito ? "#3fcf8e" : "#4f8ef7",
          border: `1px solid ${gratuito ? "rgba(63,207,142,.3)" : "rgba(79,142,247,.3)"}`,
        }}
      >
        {gratuito ? "🟢 GRATUITO" : "⭐ PREMIUM"}
      </div>

      <div className="cc-icon">{c.icone}</div>
      <div className="cc-name">{c.nome}</div>

      {/* Linha de info — sem mencionar aulas grátis para premium */}
      <div className="cc-aulas">
        {c.totalAulas} aulas
        {gratuito ? " · Acesso livre" : " · Exclusivo assinantes"}
      </div>

      <div className="cc-bar-wrap">
        <div className="cc-bar-label">
          <span>
            {c.aulasConcluidasCount}/{c.totalAulas} concluídas
          </span>
          <span style={{ color: cor, fontWeight: 600 }}>{c.percentual}%</span>
        </div>
        <div className="cc-bar">
          <div
            className="cc-bar-fill"
            style={{ width: `${c.percentual}%`, background: cor }}
          />
        </div>
      </div>
    </div>
  );
}

interface Props {
  onNavigate: (p: Page) => void;
  onSelectConteudo: (id: string, nome: string) => void;
}

export default function CoursesPage({ onNavigate, onSelectConteudo }: Props) {
  const { token } = useAuth();
  const [conteudos, setConteudos] = useState<ConteudoComProgresso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConteudos = async () => {
      try {
        const res = await fetch("/api/conteudos", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          setConteudos(await res.json());
        } else {
          // Fallback to seed data
          setConteudos(
            CONTEUDOS_SEED.map((c) => ({
              ...c,
              _id: c.nome,
              aulasConcluidasCount: 0,
              percentual: 0,
            })) as any,
          );
        }
      } catch {
        setConteudos(
          CONTEUDOS_SEED.map((c) => ({
            ...c,
            _id: c.nome,
            aulasConcluidasCount: 0,
            percentual: 0,
          })) as any,
        );
      } finally {
        setLoading(false);
      }
    };
    fetchConteudos();
  }, [token]);

  const byCategoria = CATEGORIAS_ORDER.reduce<
    Record<Categoria, ConteudoComProgresso[]>
  >((acc, cat) => {
    acc[cat] = conteudos.filter((c) => c.categoria === cat);
    return acc;
  }, {} as any);

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
        <div style={{ color: "var(--text3)", fontFamily: "'Syne',sans-serif" }}>
          Carregando conteúdos...
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <section>
        <div className="section-tag">Trilha de estudos</div>
        <h2 className="section-title">Conteúdos de Matemática</h2>
        <p className="section-sub" style={{ marginBottom: "3rem" }}>
          24 conteúdos organizados do básico ao avançado. Clique em qualquer
          card para começar.
        </p>

        {CATEGORIAS_ORDER.map((cat) => {
          const items = byCategoria[cat] || [];
          if (items.length === 0) return null;
          const cor = CATEGORIA_CORES[cat];
          return (
            <div className="category-section" key={cat}>
              <div className="category-header">
                <div
                  className="category-icon"
                  style={{ background: `${cor}20` }}
                >
                  {CATEGORIA_ICONES[cat]}
                </div>
                <div>
                  <div className="category-name">{cat}</div>
                  <div className="category-count">{items.length} conteúdos</div>
                </div>
              </div>
              <div className="conteudo-grid">
                {items.map((c) => (
                  <ConteudoCard
                    key={c._id}
                    c={c}
                    cor={cor}
                    onSelectConteudo={onSelectConteudo}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Upsell */}
        <div
          style={{
            marginTop: "2rem",
            padding: "1.75rem 2rem",
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
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                marginBottom: ".3rem",
              }}
            >
              🔒 Aulas bloqueadas?
            </div>
            <div style={{ color: "var(--text2)", fontSize: ".88rem" }}>
              Assine o plano premium para desbloquear todos os conteúdos e
              simulados.
            </div>
          </div>
          <button
            className="btn btn-primary btn-md"
            onClick={() => onNavigate("planos")}
          >
            Ver planos →
          </button>
        </div>
      </section>
    </div>
  );
}
