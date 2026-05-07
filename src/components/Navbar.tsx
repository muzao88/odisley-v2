"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import type { Page } from "@/types";

interface Props {
  currentPage: Page;
  onNavigate: (p: Page) => void;
  onOpenAuth: (tab: "login" | "register") => void;
}

export default function Navbar({ currentPage, onNavigate, onOpenAuth }: Props) {
  const { user, logout, isLoggedIn } = useAuth();
  const [dropOpen, setDropOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Restaura preferência salva ao montar
  useEffect(() => {
    const saved = localStorage.getItem("odisley_theme");
    const dark = saved !== "light";
    setIsDark(dark);
    document.documentElement.classList.toggle("light", !dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("light", !next);
    localStorage.setItem("odisley_theme", next ? "dark" : "light");
  };

  const links: { label: string; page: Page }[] = [
    { label: "Início", page: "home" },
    { label: "Cursos", page: "cursos" },
    { label: "Planos", page: "planos" },
    { label: "Sobre", page: "sobre" },
  ];

  return (
    <nav>
      <div
        className="logo"
        onClick={() => onNavigate("home")}
        style={{ cursor: "pointer" }}
      >
        Odisley
      </div>

      <ul className="nav-links">
        {links.map(({ label, page }) => (
          <li key={page}>
            <a
              onClick={() => onNavigate(page)}
              className={currentPage === page ? "active" : ""}
            >
              {label}
            </a>
          </li>
        ))}
        {isLoggedIn && (
          <li>
            <a
              onClick={() => onNavigate("dashboard")}
              className={currentPage === "dashboard" ? "active" : ""}
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
            // ☀️ Sol — clica para ir ao tema claro
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
            // 🌙 Lua — clica para voltar ao escuro
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
            </svg>
          )}
        </button>

        {isLoggedIn ? (
          <div className="user-menu">
            <div className="user-avatar" onClick={() => setDropOpen((o) => !o)}>
              {user?.nome?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className={`user-dropdown ${dropOpen ? "open" : ""}`}>
              <div
                className="ud-item"
                style={{
                  fontWeight: 600,
                  color: "var(--text)",
                  cursor: "default",
                }}
              >
                {user?.nome}
              </div>
              <div
                style={{
                  fontSize: ".72rem",
                  color: "var(--text3)",
                  padding: "0 .8rem .4rem",
                }}
              >
                Plano {user?.plano === "premium" ? "⭐ Premium" : "Gratuito"}
              </div>
              <div className="ud-divider" />
              <div
                className="ud-item"
                onClick={() => {
                  onNavigate("dashboard");
                  setDropOpen(false);
                }}
              >
                📊 Meu progresso
              </div>
              {user?.plano === "free" && (
                <div
                  className="ud-item"
                  onClick={() => {
                    onNavigate("planos");
                    setDropOpen(false);
                  }}
                >
                  ⭐ Fazer upgrade
                </div>
              )}
              <div className="ud-divider" />
              <div
                className="ud-item btn-danger"
                onClick={() => {
                  logout();
                  setDropOpen(false);
                }}
              >
                Sair
              </div>
            </div>
          </div>
        ) : (
          <>
            <button
              className="btn btn-ghost btn-sm"
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
          </>
        )}
      </div>
    </nav>
  );
}
