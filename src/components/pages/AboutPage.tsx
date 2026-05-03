'use client';

import type { Page } from '@/types';

interface Props { onNavigate: (p: Page) => void; }

export default function AboutPage({ onNavigate }: Props) {
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
                { num: '+1.200', label: 'Alunos formados' },
                { num: '200+', label: 'Videoaulas' },
                { num: '24', label: 'Conteúdos' },
                { num: '5 ★', label: 'Avaliação média' },
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
              <button className="btn btn-ghost btn-lg" onClick={() => onNavigate('planos')}>
                Ver planos
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
