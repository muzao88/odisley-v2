'use client';

import { useState, useEffect } from 'react';
import type { Page } from '@/types';

interface Props { onNavigate: (p: Page) => void; }

export default function AboutPage({ onNavigate }: Props) {
  const [stats, setStats] = useState({
    activeStudents: 0,
    contents: 0,
    videoLessons: 0,
    averageRating: null as number | null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        if (data.activeStudents !== undefined) setStats(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="page">
      <section style={{ background: 'var(--bg2)' }}>
        <div className="about-inner">
          <div>
            <div className="about-photo-wrap">
              <div className="about-initial">O</div>
              <div className="about-name">Prof. Odisley</div>
              <div className="about-role">Matemática · Vestibular · ENEM</div>
              <div className="about-badges">
                <span className="badge">🎓 UFPR — Lic. Matemática</span>
                <span className="badge">🔬 Mestrando Profmat/UTFPR</span>
                <span className="badge">📚 Especialista em educação</span>
              </div>
            </div>
            <div className="about-stats-grid">
              {[
                { 
                  num: loading ? '...' : (stats.activeStudents > 0 ? stats.activeStudents : '0'), 
                  label: stats.activeStudents === 1 ? 'Aluno ativo' : 'Alunos ativos' 
                },
                { num: loading ? '...' : stats.videoLessons, label: 'Videoaulas' },
                { num: loading ? '...' : stats.contents, label: 'Conteúdos' },
                { 
                  num: loading ? '...' : (stats.averageRating ? `${stats.averageRating} ★` : '—'), 
                  label: stats.averageRating ? 'Avaliação média' : 'Ainda sem avaliações' 
                },
              ].map(({ num, label }) => (
                <div className="as-item" key={label}>
                  <div className="as-num">{num}</div>
                  <div className="as-label">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="about-text">
            <div className="section-tag">Sobre o professor</div>
            <h2 className="section-title">Quem é o Odisley?</h2>
            <p>
              Odisley é professor graduado em Matemática (Licenciatura) pela Universidade Federal do
              Paraná (UFPR). Possui experiência no ensino voltado para vestibulares e ENEM, com foco
              em didática simplificada e resultados práticos.
            </p>
            <p>
              Possui especializações na área de educação e atualmente está cursando mestrado em
              Matemática pelo programa Profmat na Universidade Tecnológica Federal do Paraná (UTFPR).
            </p>
            <p>
              Seu objetivo é tornar o aprendizado mais acessível, direto e eficiente para todos os
              alunos — independentemente do nível de conhecimento inicial.
            </p>
            <p className="quote">"A matemática não é difícil. Ela só precisa ser bem ensinada."</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => onNavigate('cursos')}>
                Ver os cursos
              </button>
              <button className="btn btn-ghost btn-secondary btn-lg" onClick={() => onNavigate('planos')}>
                Ver planos
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
