'use client';

import type { Page } from '@/types';

interface Props { onNavigate: (p: Page) => void; }

export default function Footer({ onNavigate }: Props) {
  return (
    <footer>
      <div className="footer-logo">
        <img 
          src="/logo.png" 
          alt="Odisley" 
          style={{ 
            width: "180px", 
            filter: "brightness(0) invert(1)",
            cursor: "pointer"
          }} 
          onClick={() => onNavigate('home')}
        />
      </div>
      <div className="footer-tagline">Matemática do zero à aprovação.</div>
      <ul className="footer-links">
        <li><a onClick={() => onNavigate('home')}>Início</a></li>
        <li><a onClick={() => onNavigate('cursos')}>Cursos</a></li>
        <li><a onClick={() => onNavigate('planos')}>Planos</a></li>
        <li><a onClick={() => onNavigate('sobre')}>Sobre</a></li>
        <li><a>Termos de uso</a></li>
        <li><a>Privacidade</a></li>
      </ul>
      <div className="footer-copy">© 2025 Odisley. Todos os direitos reservados.</div>
    </footer>
  );
}
