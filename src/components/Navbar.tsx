'use client';

import { useState } from 'react';
import { useAuth } from './AuthContext';
import type { Page } from '@/types';

interface Props {
  currentPage: Page;
  onNavigate: (p: Page) => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
}

export default function Navbar({ currentPage, onNavigate, onOpenAuth }: Props) {
  const { user, logout, isLoggedIn } = useAuth();
  const [dropOpen, setDropOpen] = useState(false);

  const links: { label: string; page: Page }[] = [
    { label: 'Início', page: 'home' },
    { label: 'Cursos', page: 'cursos' },
    { label: 'Planos', page: 'planos' },
    { label: 'Sobre', page: 'sobre' },
  ];

  return (
    <nav>
      <div className="logo" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
        Odisley
      </div>

      <ul className="nav-links">
        {links.map(({ label, page }) => (
          <li key={page}>
            <a onClick={() => onNavigate(page)} className={currentPage === page ? 'active' : ''}>
              {label}
            </a>
          </li>
        ))}
        {isLoggedIn && (
          <li>
            <a onClick={() => onNavigate('dashboard')} className={currentPage === 'dashboard' ? 'active' : ''}>
              Meu progresso
            </a>
          </li>
        )}
      </ul>

      <div className="nav-right">
        {isLoggedIn ? (
          <div className="user-menu">
            <div className="user-avatar" onClick={() => setDropOpen(o => !o)}>
              {user?.nome?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className={`user-dropdown ${dropOpen ? 'open' : ''}`}>
              <div className="ud-item" style={{ fontWeight: 600, color: 'var(--text)', cursor: 'default' }}>
                {user?.nome}
              </div>
              <div style={{ fontSize: '.72rem', color: 'var(--text3)', padding: '0 .8rem .4rem' }}>
                Plano {user?.plano === 'premium' ? '⭐ Premium' : 'Gratuito'}
              </div>
              <div className="ud-divider" />
              <div className="ud-item" onClick={() => { onNavigate('dashboard'); setDropOpen(false); }}>
                📊 Meu progresso
              </div>
              {user?.plano === 'free' && (
                <div className="ud-item" onClick={() => { onNavigate('planos'); setDropOpen(false); }}>
                  ⭐ Fazer upgrade
                </div>
              )}
              <div className="ud-divider" />
              <div className="ud-item btn-danger" onClick={() => { logout(); setDropOpen(false); }}>
                Sair
              </div>
            </div>
          </div>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => onOpenAuth('login')}>Entrar</button>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('planos')}>Assinar agora</button>
          </>
        )}
      </div>
    </nav>
  );
}
