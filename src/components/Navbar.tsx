"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./AuthContext";
import type { Page } from "@/types";

interface ProgressoItem {
  conteudo_id: string;
  nome: string;
  total: number;
  concluidas: number;
  percentual: number;
}

interface Props {
  currentPage: Page;
  onNavigate: (p: Page) => void;
  onOpenAuth: (tab: "login" | "register") => void;
}

/** Extrai as iniciais do nome (até 2 letras). */
function getInitials(nome?: string): string {
  if (!nome) return "U";
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar({ currentPage, onNavigate, onOpenAuth }: Props) {
  const { user, token, logout, isLoggedIn } = useAuth();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // --- Progress data for the dropdown ---
  const [progressData, setProgressData] = useState<ProgressoItem[]>([]);
  const hasFetched = useRef(false);

  const fetchProgress = useCallback(async () => {
    if (!user?._id || !token) return;
    try {
      const res = await fetch(`/api/progresso/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: ProgressoItem[] = await res.json();
        setProgressData(data);
      }
    } catch {}
  }, [user?._id, token]);

  // Fetch once when dropdown opens for the first time
  useEffect(() => {
    if (dropOpen && isLoggedIn && !hasFetched.current) {
      hasFetched.current = true;
      fetchProgress();
    }
  }, [dropOpen, isLoggedIn, fetchProgress]);

  // Reset hasFetched when user changes
  useEffect(() => {
    hasFetched.current = false;
    setProgressData([]);
  }, [user?._id]);

  // Close dropdown on outside click
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropOpen]);

  // Computed stats
  const totalAulasConcluidas = progressData.reduce((s, p) => s + p.concluidas, 0);
  const totalAulas = progressData.reduce((s, p) => s + p.total, 0);
  const cursosAtivos = progressData.filter(
    (p) => p.concluidas > 0 && p.percentual < 100
  ).length;
  const progressoPct =
    totalAulas > 0 ? Math.round((totalAulasConcluidas / totalAulas) * 100) : 0;
  // Streak is not tracked in the DB — we show a placeholder based on recent activity
  const streak = totalAulasConcluidas > 0 ? Math.min(totalAulasConcluidas, 7) : 0;

  // Restaura preferência salva ao montar
  useEffect(() => {
    const saved = localStorage.getItem("odisley_theme");
    const dark = saved === "dark";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("odisley_theme", next ? "dark" : "light");
  };

  const links: { label: string; page: Page }[] = [
    { label: "Início", page: "home" },
    { label: "Cursos", page: "cursos" },
    { label: "Exercícios", page: "exercicios" },
    { label: "Planos", page: "planos" },
    { label: "Sobre", page: "sobre" },
  ];

  const initials = getInitials(user?.nome);

  return (
    <nav style={{ padding: '16px 32px', position: 'relative' }}>
      <div
        className="logo"
        onClick={() => onNavigate("home")}
        style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <text
                x="9" y="14"
                textAnchor="middle"
                fontSize="15"
                fontWeight="800"
                fill="white"
                fontFamily="-apple-system, sans-serif"
              >O</text>
            </svg>
          </div>
          <span style={{
            fontSize: '17px',
            fontWeight: '800',
            letterSpacing: '-0.5px',
            color: 'var(--text)',
          }}>Odisley</span>
        </div>
      </div>

      <ul className="nav-links" style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '28px',
        listStyle: 'none',
        margin: 0,
        padding: 0,
      }}>
        {links.map(({ label, page }) => (
          <li key={page}>
            <a
              onClick={() => onNavigate(page)}
              className={`nav-link ${currentPage === page ? "active" : ""}`}
              style={currentPage === page ? {
                fontSize: '15px',
                letterSpacing: '-0.2px',
                paddingBottom: '2px',
                ...(isDark ? {
                  fontWeight: '600',
                  color: 'var(--text)',
                  borderBottom: '2px solid #7c3aed',
                } : {})
              } : {
                fontSize: '15px',
                letterSpacing: '-0.2px',
                transition: 'color 0.15s',
                ...(isDark ? {
                  fontWeight: '500',
                  color: 'var(--text3)',
                } : {})
              }}
            >
              {label}
            </a>
          </li>
        ))}
        {isLoggedIn && (
          <li>
            <a
              onClick={() => onNavigate("dashboard")}
              className={`nav-link ${currentPage === "dashboard" ? "active" : ""}`}
              style={currentPage === "dashboard" ? {
                fontSize: '15px',
                letterSpacing: '-0.2px',
                paddingBottom: '2px',
                ...(isDark ? {
                  fontWeight: '600',
                  color: 'var(--text)',
                  borderBottom: '2px solid #7c3aed',
                } : {})
              } : {
                fontSize: '15px',
                letterSpacing: '-0.2px',
                transition: 'color 0.15s',
                ...(isDark ? {
                  fontWeight: '500',
                  color: 'var(--text3)',
                } : {})
              }}
            >
              Meu progresso
            </a>
          </li>
        )}
      </ul>

      <div className="nav-right">
        {/* Botão de tema claro/escuro */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
          aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
        >
          {isDark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
            </svg>
          )}
        </button>

        {isLoggedIn ? (
          <div className="user-menu" ref={menuRef}>
            {/* Avatar com iniciais */}
            <div className="ud-avatar-btn" onClick={() => setDropOpen((o) => !o)}>
              {initials}
            </div>

            {/* ─── Dropdown ─── */}
            <div className={`user-dropdown ${dropOpen ? "open" : ""}`}>
              {/* Header: avatar + nome + email + badge */}
              <div className="ud-header">
                <div className="ud-header-avatar">{initials}</div>
                <div className="ud-header-info">
                  <div className="ud-header-name">{user?.nome}</div>
                  <div className="ud-header-email">
                    {user?.email}
                    <span className={`ud-plan-badge ${user?.plano === "premium" ? "premium" : ""}`}>
                      {user?.plano === "premium" ? "Premium" : "Gratuito"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini stats row */}
              <div className="ud-stats-row">
                <div className="ud-stat">
                  <span className="ud-stat-value">{totalAulasConcluidas}</span>
                  <span className="ud-stat-label">Aulas</span>
                </div>
                <div className="ud-stat-divider" />
                <div className="ud-stat">
                  <span className="ud-stat-value">{cursosAtivos}</span>
                  <span className="ud-stat-label">Cursos</span>
                </div>
                <div className="ud-stat-divider" />
                <div className="ud-stat">
                  <span className="ud-stat-value">{streak}🔥</span>
                  <span className="ud-stat-label">Sequência</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="ud-progress-section">
                <div className="ud-progress-labels">
                  <span>Progresso geral</span>
                  <span>{progressoPct}%</span>
                </div>
                <div className="ud-progress-track">
                  <div
                    className="ud-progress-fill"
                    style={{ width: `${progressoPct}%` }}
                  />
                </div>
              </div>

              <div className="ud-divider" />

              {/* Menu items */}
              {user?.plano === "free" && (
                <div
                  className="ud-item ud-upgrade"
                  onClick={() => { onNavigate("planos"); setDropOpen(false); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Fazer upgrade
                </div>
              )}

              <div
                className="ud-item"
                onClick={() => { onNavigate("dashboard"); setDropOpen(false); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Meu progresso
              </div>

              <div
                className="ud-item"
                onClick={() => { onNavigate("configuracoes"); setDropOpen(false); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Configurações
              </div>

              <div className="ud-divider" />

              <div
                className="ud-item ud-logout"
                onClick={() => { logout(); setDropOpen(false); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sair
              </div>
            </div>
          </div>
        ) : (
          <div className="nav-auth-buttons" style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-ghost btn-secondary btn-sm"
              onClick={() => onOpenAuth("login")}
            >
              Entrar
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate("planos")}
            >
              Assinar agora
            </button>
          </div>
        )}

        {/* Botão Hambúrguer para Mobile */}
        <button
          className={`mobile-menu-toggle ${mobileMenuOpen ? "open" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Scrim (fundo escurecido) para Mobile */}
      <div
        className={`mobile-menu-scrim ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Menu Lateral Mobile Drawer */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? "open" : ""}`}>
        <ul className="mobile-menu-links">
          {links.map(({ label, page }) => (
            <li key={page}>
              <a
                onClick={() => {
                  onNavigate(page);
                  setMobileMenuOpen(false);
                }}
                className={`nav-link ${currentPage === page ? "active" : ""}`}
              >
                {label}
              </a>
            </li>
          ))}
          {isLoggedIn && (
            <li>
              <a
                onClick={() => {
                  onNavigate("dashboard");
                  setMobileMenuOpen(false);
                }}
                className={`nav-link ${currentPage === "dashboard" ? "active" : ""}`}
              >
                Meu progresso
              </a>
            </li>
          )}
        </ul>

        <div className="mobile-menu-actions">
          {isLoggedIn ? (
            <>
              <div style={{ padding: "0 0.5rem", color: "var(--text)", fontWeight: 600 }}>
                Olá, {user?.nome?.split(" ")[0]}!
              </div>
              <div style={{ fontSize: "0.80rem", color: "var(--text3)", padding: "0 0.5rem 1rem" }}>
                Plano {user?.plano === "premium" ? "⭐ Premium" : "Gratuito"}
              </div>
              {user?.plano === "free" && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    onNavigate("planos");
                    setMobileMenuOpen(false);
                  }}
                  style={{ width: "100%" }}
                >
                  ⭐ Upgrade Premium
                </button>
              )}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                style={{ width: "100%", marginTop: "0.5rem", background: "rgba(247,79,110,.1)", border: "1px solid rgba(247,79,110,.2)", color: "var(--red)" }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-ghost btn-secondary btn-sm"
                onClick={() => {
                  onOpenAuth("login");
                  setMobileMenuOpen(false);
                }}
                style={{ width: "100%" }}
              >
                Entrar
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onNavigate("planos");
                  setMobileMenuOpen(false);
                }}
                style={{ width: "100%" }}
              >
                Assinar agora
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

