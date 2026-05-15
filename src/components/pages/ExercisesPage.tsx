"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import type { Page, ExercicioComProgresso, Exercicio } from "@/types";
import {
  CONTEUDOS_SEED,
  CATEGORIAS_ORDER,
  CATEGORIA_CORES,
  CATEGORIA_ICONES,
} from "@/data/conteudos";
import { EXERCICIOS_SEED } from "@/data/exercicios";

interface Props {
  onNavigate: (p: Page) => void;
  onOpenAuth: (tab: "login" | "register") => void;
  onStartExercise: (id: string) => void;
}

export default function ExercisesPage({ onNavigate, onOpenAuth, onStartExercise }: Props) {
  const { user, isLoggedIn } = useAuth();
  const [exercises, setExercises] = useState<ExercicioComProgresso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/exercicios");
        const data = await res.json();
        
        if (Array.isArray(data)) {
          const mapped: ExercicioComProgresso[] = data.map((ex: any) => {
            const baseEx: Exercicio = {
              _id: String(ex._id),
              titulo: String(ex.titulo),
              conteudo_id: String(ex.conteudo_id?.nome || "Geral"),
              dificuldade: (ex.dificuldade || "Médio") as 'Fácil' | 'Médio' | 'Difícil',
              totalQuestoes: Number(ex.questoes?.length || 0),
              premium: ex.tipoAcesso === "premium"
            };
            
            // Simular progresso (mockado por enquanto)
            if (!isLoggedIn) {
              return { ...baseEx, questoesRespondidas: 0, status: "Não iniciado", percentual: 0 };
            }
            
            const hash = String(ex._id).split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
            const rand = hash % 10;
            
            if (rand < 2) {
              return { ...baseEx, questoesRespondidas: baseEx.totalQuestoes, status: "Concluído", percentual: 100 };
            } else if (rand < 5) {
              const resp = Math.floor(baseEx.totalQuestoes * 0.4);
              return { ...baseEx, questoesRespondidas: resp, status: "Em andamento", percentual: Math.round((resp / baseEx.totalQuestoes) * 100) };
            } else {
              return { ...baseEx, questoesRespondidas: 0, status: "Não iniciado", percentual: 0 };
            }
          });
          setExercises(mapped);
        } else {
          // Fallback to seed data
          setExercises(EXERCICIOS_SEED.map(ex => ({ ...ex, questoesRespondidas: 0, status: "Não iniciado", percentual: 0 })));
        }
      } catch (err) {
        console.error("Erro ao carregar exercícios:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isLoggedIn]);

  if (loading) return null;

  const canAccess = (ex: Exercicio) => {
    if (!ex.premium) return true;
    return user?.plano === "premium";
  };

  return (
    <div className="page">
      <section>
        <div style={{ marginBottom: "2.5rem" }}>
          <div className="section-tag">Prática</div>
          <h2 className="section-title">Exercícios por Módulo</h2>
          <p className="section-sub">
            Treine seus conhecimentos com questões selecionadas para o ENEM e vestibulares.
          </p>
        </div>

        {CATEGORIAS_ORDER.map((cat) => {
          const catExercises = exercises.filter(ex => {
            const conteudo = CONTEUDOS_SEED.find(c => c.nome === ex.conteudo_id);
            return conteudo?.categoria === cat;
          });

          if (catExercises.length === 0) return null;

          const cor = CATEGORIA_CORES[cat];

          return (
            <div key={cat} style={{ marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: "50%", 
                  background: `${cor}15`, border: `1px solid ${cor}30`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem"
                }}>
                  {CATEGORIA_ICONES[cat]}
                </div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", fontWeight: 800 }}>{cat}</h3>
              </div>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
                gap: "1.25rem" 
              }}>
                {catExercises.map((ex) => (
                  <ExerciseCard 
                    key={ex._id} 
                    ex={ex} 
                    cor={cor} 
                    hasAccess={canAccess(ex)} 
                    onOpenAuth={onOpenAuth}
                    onStart={onStartExercise}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function ExerciseCard({ ex, cor, hasAccess, onOpenAuth, onStart }: { ex: ExercicioComProgresso, cor: string, hasAccess: boolean, onOpenAuth: any, onStart: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);

  const getStatusColor = (status: string) => {
    if (status === "Concluído") return "#3fcf8e"; // dark green
    if (status === "Em andamento") return "var(--accent)";
    return "#4d6380"; // dark text3
  };

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered 
          ? `linear-gradient(145deg, #1a2235 0%, ${cor}08 100%)` 
          : "#1a2235",
        border: `1px solid ${hovered ? cor + "50" : "rgba(55, 138, 221, 0.12)"}`,
        borderRadius: "var(--radius)",
        padding: "1.4rem",
        cursor: "pointer",
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-6px)" : "none",
        boxShadow: hovered 
          ? `0 20px 40px rgba(0,0,0,0.25), 0 0 0 1px ${cor}20` 
          : "none",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        minHeight: "180px",
        overflow: "hidden"
      }}
      onClick={() => {
        if (!hasAccess) {
          onOpenAuth("register");
        } else {
          onStart(ex._id);
        }
      }}
    >
      {/* Glow decorativo no hover */}
      <div style={{
        position: "absolute",
        top: "-20%",
        right: "-10%",
        width: "120px",
        height: "120px",
        background: `radial-gradient(circle, ${cor}15 0%, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.3s",
        pointerEvents: "none"
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 1 }}>
        <div style={{ 
          fontSize: "0.68rem", 
          fontWeight: 800, 
          textTransform: "uppercase", 
          color: cor,
          letterSpacing: "0.1em",
          background: `${cor}10`,
          padding: "2px 8px",
          borderRadius: "4px"
        }}>
          {ex.conteudo_id}
        </div>
        {!hasAccess && (
          <div style={{ 
            background: "rgba(0,0,0,0.2)", 
            width: "28px", 
            height: "28px", 
            borderRadius: "50%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            fontSize: "0.9rem",
            backdropFilter: "blur(4px)"
          }}>
            🔒
          </div>
        )}
      </div>

      <h4 style={{ 
        fontFamily: "'Syne', sans-serif", 
        fontSize: "1.05rem", 
        fontWeight: 800, 
        color: "#eef2ff",
        lineHeight: 1.3,
        zIndex: 1
      }}>
        {ex.titulo}
      </h4>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.78rem", color: "#8fa4c8", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "1rem" }}>🎯</span>
          <span style={{ 
            color: ex.dificuldade === "Fácil" ? "#3fcf8e" : ex.dificuldade === "Médio" ? "#f7c94f" : "#f74f6e",
            fontWeight: 700
          }}>
            {ex.dificuldade}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "1rem" }}>📋</span>
          <span style={{ fontWeight: 500 }}>{ex.totalQuestoes} questões</span>
        </div>
      </div>

      <div style={{ marginTop: "auto", paddingTop: "0.75rem", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
             <div style={{ width: 6, height: 6, borderRadius: "50%", background: getStatusColor(ex.status) }} />
             <span style={{ color: getStatusColor(ex.status), fontWeight: 700 }}>
               {ex.status}
             </span>
          </div>
          {ex.status === "Em andamento" && (
            <span style={{ color: "#4d6380", fontWeight: 600 }}>
              {ex.questoesRespondidas} / {ex.totalQuestoes}
            </span>
          )}
        </div>
        <div style={{ height: 6, background: "#131928", borderRadius: "100px", overflow: "hidden" }}>
          <div 
            style={{ 
              width: `${ex.percentual}%`, 
              background: ex.status === "Concluído" 
                ? "linear-gradient(90deg, var(--green), #2eb87e)" 
                : `linear-gradient(90deg, ${cor}, ${cor}cc)`,
              height: "100%",
              borderRadius: "100px",
              transition: "width 0.5s ease-out"
            }} 
          />
        </div>
      </div>
    </div>
  );
}
