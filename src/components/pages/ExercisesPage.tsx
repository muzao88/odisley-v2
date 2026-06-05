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
  onOpenUpgrade?: () => void;
}

export default function ExercisesPage({ onNavigate, onOpenAuth, onStartExercise, onOpenUpgrade }: Props) {
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
                    isLoggedIn={isLoggedIn}
                    onOpenAuth={onOpenAuth}
                    onNavigate={onNavigate}
                    onOpenUpgrade={onOpenUpgrade}
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

function ExerciseCard({ ex, cor, hasAccess, isLoggedIn, onOpenAuth, onNavigate, onOpenUpgrade, onStart }: { ex: ExercicioComProgresso, cor: string, hasAccess: boolean, isLoggedIn: boolean, onOpenAuth: any, onNavigate: any, onOpenUpgrade: any, onStart: (id: string) => void }) {
  const getStatusColor = (status: string) => {
    if (status === "Concluído") return "#16a34a";
    if (status === "Em andamento") return "#7c3aed";
    return "#a1a1aa";
  };

  const getDificuldadeColor = (dificuldade: string) => {
    if (dificuldade === "Fácil") return { text: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
    if (dificuldade === "Médio") return { text: "#ea580c", bg: "#fff7ed", border: "#fed7aa" };
    return { text: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
  };

  const diffStyles = getDificuldadeColor(ex.dificuldade);

  return (
    <div 
      className="exercise-card"
      style={{
        borderRadius: '12px',
        padding: '14px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, transform 0.15s',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '180px',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '';
      }}
      onClick={() => {
        if (!hasAccess) {
          if (!isLoggedIn) {
            onOpenAuth("login");
          } else {
            onOpenUpgrade?.();
          }
        } else {
          onStart(ex._id);
        }
      }}
    >
      <div>
        {/* Topo do card com seta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          {/* badge da categoria */}
          <span style={{
            fontSize: '9px',
            fontWeight: '700',
            letterSpacing: '0.08em',
            background: 'rgba(139,92,246,0.08)',
            color: '#7c3aed',
            border: '1px solid rgba(139,92,246,0.2)',
            padding: '2px 8px',
            borderRadius: '999px',
            textTransform: 'uppercase',
          }}>
            {ex.conteudo_id || "MATEMÁTICA"}
          </span>
          {!hasAccess ? (
            <span style={{ fontSize: '12px' }}>🔒</span>
          ) : (
            <i className="ti ti-arrow-right" style={{ fontSize: '14px', color: '#d4d4d8' }} />
          )}
        </div>

        {/* Título do card */}
        <div style={{
          fontSize: '14px',
          fontWeight: '700',
          color: 'var(--text)',
          marginBottom: '10px',
          letterSpacing: '-0.2px',
        }}>
          {ex.titulo}
        </div>

        {/* Dificuldade e quantidade de questões */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '10px', fontWeight: '500', color: diffStyles.text,
            background: diffStyles.bg, border: `1px solid ${diffStyles.border}`,
            padding: '2px 8px', borderRadius: '999px',
          }}>
            <i className="ti ti-flame" /> {ex.dificuldade}
          </span>

          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            fontSize: '10px', color: '#71717a',
          }}>
            <i className="ti ti-file-text" /> {ex.totalQuestoes} {ex.totalQuestoes === 1 ? 'questão' : 'questões'}
          </span>
        </div>
      </div>

      <div>
        {/* Divisor interno */}
        <div style={{ height: '1px', background: '#f4f4f5', margin: '10px 0' }} className="exercise-card-divider" />

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text3)', fontWeight: '500' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: getStatusColor(ex.status) }} />
            {ex.status}
          </div>
          {ex.status === "Em andamento" && (
            <span style={{ fontSize: '10px', color: '#71717a', fontWeight: '500' }}>
              {ex.questoesRespondidas} / {ex.totalQuestoes}
            </span>
          )}
        </div>

        {/* Botão */}
        <button style={{
          width: '100%',
          marginTop: '10px',
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          color: '#fff',
          fontSize: '11px',
          fontWeight: '600',
          padding: '8px',
          borderRadius: '7px',
          border: 'none',
          cursor: 'pointer',
        }}>
          {ex.status === "Não iniciado" ? "Iniciar exercício" : ex.status === "Em andamento" ? "Continuar exercício" : "Refazer exercício"}
        </button>
      </div>
    </div>
  );
}
