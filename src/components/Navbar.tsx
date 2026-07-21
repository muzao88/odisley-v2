"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import type { Page } from "@/types";
import {
  IconHome,
  IconBook2,
  IconPencil,
  IconCreditCard,
  IconInfoCircle,
  IconLayoutDashboard,
  IconLogin,
  IconLogout,
  IconSun,
  IconMoon
} from "@tabler/icons-react";

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
  isConteudoAtivo?: boolean;
}

/** Extrai as iniciais do nome (até 2 letras). */
function getInitials(nome?: string): string {
  if (!nome) return "U";
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar({ currentPage, onNavigate, onOpenAuth, isConteudoAtivo }: Props) {
  const { user, token, logout, isLoggedIn } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const streak = totalAulasConcluidas > 0 ? Math.min(totalAulasConcluidas, 7) : 0;

  const checkActive = (page: Page) => {
    if (page === "home") return currentPage === "home";
    if (page === "cursos") return currentPage === "cursos" || !!isConteudoAtivo;
    if (page === "exercicios") return currentPage === "exercicios" || currentPage === "resolucao";
    if (page === "planos") return currentPage === "planos";
    if (page === "sobre") return currentPage === "sobre";
    if (page === "dashboard") return currentPage === "dashboard" || currentPage === "configuracoes";
    return false;
  };

  const items = [
    { label: "Início", page: "home" as Page, icon: <IconHome size={20} /> },
    { label: "Cursos", page: "cursos" as Page, icon: <IconBook2 size={20} /> },
    { label: "Exercícios", page: "exercicios" as Page, icon: <IconPencil size={20} /> },
    { label: "Planos", page: "planos" as Page, icon: <IconCreditCard size={20} /> },
    { label: "Sobre", page: "sobre" as Page, icon: <IconInfoCircle size={20} /> },
  ];

  if (isLoggedIn) {
    items.push({ label: "Meu progresso", page: "dashboard" as Page, icon: <IconLayoutDashboard size={20} /> });
  }

  const initials = getInitials(user?.nome);

  const LogoIcon = (
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
  );

  const UserMenuContent = (
    <div className={`user-dropdown ${dropOpen ? "open" : ""}`}>
      <div className="ud-header">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.nome}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
          />
        ) : (
          <div className="ud-header-avatar">{initials}</div>
        )}
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

      <div className="ud-progress-section">
        <div className="ud-progress-labels">
          <span>Progresso geral</span>
          <span>{progressoPct}%</span>
        </div>
        <div className="ud-progress-track">
          <div className="ud-progress-fill" style={{ width: `${progressoPct}%` }} />
        </div>
      </div>

      <div className="ud-divider" />

      {user?.plano === "free" && (
        <div className="ud-item ud-upgrade" onClick={() => { onNavigate("planos"); setDropOpen(false); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Fazer upgrade
        </div>
      )}

      <div className="ud-item" onClick={() => { onNavigate("dashboard"); setDropOpen(false); }}>
        <IconLayoutDashboard size={16} />
        Meu progresso
      </div>

      <div className="ud-item" onClick={() => { onNavigate("configuracoes"); setDropOpen(false); }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        Configurações
      </div>

      <div className="ud-divider" />

      <div className="ud-item ud-logout" onClick={() => { logout(); setDropOpen(false); }}>
        <IconLogout size={16} />
        Sair
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="desktop-sidebar">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "1.5rem" }}>
          {/* Logo */}
          <div onClick={() => onNavigate("home")} style={{ cursor: "pointer", display: "flex", justifyContent: "center" }} title="Odisley">
            {LogoIcon}
          </div>

          {/* Nav Items */}
          <div className="sidebar-nav">
            {items.map((item) => {
              const active = checkActive(item.page);
              return (
                <button
                  key={item.page}
                  className={`sidebar-btn ${active ? "active" : ""}`}
                  onClick={() => onNavigate(item.page)}
                >
                  <div className="sidebar-icon">{item.icon}</div>
                  <span className="sidebar-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer: Theme + User */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", width: "100%" }}>
          <button className="theme-toggle" onClick={toggleTheme} title={isDark ? "Mudar para claro" : "Mudar para escuro"}>
            {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>

          {isLoggedIn ? (
            <div className="user-menu desktop-user-menu" ref={menuRef}>
              <div className="ud-avatar-btn" onClick={() => setDropOpen((o) => !o)}>
                {user?.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : initials}
              </div>
              {UserMenuContent}
            </div>
          ) : (
            <button className="sidebar-btn sidebar-login" onClick={() => onOpenAuth("login")}>
              <IconLogin size={20} />
              <span className="sidebar-label">Entrar</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── MOBILE TOPBAR & DRAWER ── */}
      <div className="mobile-topbar-wrapper">
        <header className="mobile-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className={`mobile-menu-toggle ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span />
              <span />
              <span />
            </button>
            <div className="logo" onClick={() => onNavigate("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              {LogoIcon}
              <span style={{ fontSize: '17px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text)' }}>Odisley</span>
            </div>
          </div>
          <div className="mobile-topbar-right">
            {/* Theme toggle visível diretamente na topbar mobile */}
            <button
              className="theme-toggle mobile-topbar-theme-btn"
              onClick={toggleTheme}
              title={isDark ? "Mudar para claro" : "Mudar para escuro"}
            >
              {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
            </button>

            {isLoggedIn ? (
              <div className="user-menu mobile-user-menu" ref={menuRef}>
                <div className="ud-avatar-btn" onClick={() => setDropOpen((o) => !o)}>
                  {user?.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : initials}
                </div>
                {UserMenuContent}
              </div>
            ) : (
              <button className="btn btn-ghost btn-secondary btn-sm" onClick={() => onOpenAuth("login")}>
                Entrar
              </button>
            )}
          </div>
        </header>

        {/* Scrim overlay */}
        <div className={`mobile-menu-scrim ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)} />

        {/* Drawer */}
        <div className={`mobile-menu-overlay ${mobileMenuOpen ? "open" : ""}`}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem" }}>
            {LogoIcon}
            <span style={{ fontSize: '19px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text)' }}>Odisley</span>
          </div>

          <ul className="mobile-menu-links">
            {items.map((item) => {
              const active = checkActive(item.page);
              return (
                <li key={item.page}>
                  <a
                    onClick={() => { onNavigate(item.page); setMobileMenuOpen(false); }}
                    className={`mobile-nav-link ${active ? "active" : ""}`}
                  >
                    <span className="mobile-nav-icon">{item.icon}</span>
                    {item.label}
                  </a>
                </li>
              );
            })}
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
                  <button className="btn btn-primary btn-sm" onClick={() => { onNavigate("planos"); setMobileMenuOpen(false); }} style={{ width: "100%" }}>
                    ⭐ Upgrade Premium
                  </button>
                )}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  style={{ width: "100%", marginTop: "0.5rem", background: "rgba(247,79,110,.1)", border: "1px solid rgba(247,79,110,.2)", color: "var(--red)" }}
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost btn-secondary btn-sm" onClick={() => { onOpenAuth("login"); setMobileMenuOpen(false); }} style={{ width: "100%" }}>
                  Entrar
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => { onNavigate("planos"); setMobileMenuOpen(false); }} style={{ width: "100%" }}>
                  Assinar agora
                </button>
              </>
            )}
            
            {/* Theme Toggle in mobile drawer */}
            <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem", background: "var(--surface2)", borderRadius: "10px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Tema</span>
              <button className="theme-toggle" onClick={toggleTheme} title="Mudar tema" style={{ width: 32, height: 32 }}>
                {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
