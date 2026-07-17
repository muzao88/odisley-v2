"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IconLayoutDashboard,
  IconUsers,
  IconBook2,
  IconPencil,
  IconMessage2,
  IconReceipt2,
  IconLogout,
  IconChevronLeft,
} from "@tabler/icons-react";
import { getAdminToken, clearAdminToken } from "@/lib/adminToken";

// ─── Design tokens ───────────────────────────────────────────────────────────
export const S = {
  badge: (color: string) =>
    ({
      padding: "2px 8px",
      borderRadius: 20,
      fontSize: ".68rem",
      fontWeight: 700,
      background:
        color === "premium"
          ? "rgba(247,201,79,.18)"
          : color === "free"
            ? "rgba(55,138,221,.12)"
            : "rgba(63,207,142,.12)",
      color:
        color === "premium"
          ? "#f7c94f"
          : color === "free"
            ? "#378ADD"
            : "#3fcf8e",
    }) as React.CSSProperties,

  card: {
    background: "#131d35",
    border: "1px solid rgba(55,138,221,.14)",
    borderRadius: 14,
    padding: "1.25rem",
  } as React.CSSProperties,

  input: {
    background: "#0d1426",
    border: "1px solid rgba(55,138,221,.2)",
    borderRadius: 8,
    color: "#e2e8f0",
    padding: ".55rem .85rem",
    fontSize: ".85rem",
    outline: "none",
    width: "100%",
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,

  select: {
    background: "#0d1426",
    border: "1px solid rgba(55,138,221,.2)",
    borderRadius: 8,
    color: "#e2e8f0",
    padding: ".55rem .85rem",
    fontSize: ".85rem",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,

  btn: (variant: "primary" | "danger" | "ghost" | "green") =>
    ({
      padding: ".5rem 1.1rem",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: ".82rem",
      fontFamily: "'DM Sans', sans-serif",
      transition: ".15s",
      background:
        variant === "primary"
          ? "linear-gradient(135deg,#378ADD,#185FA5)"
          : variant === "danger"
            ? "rgba(247,79,110,.15)"
            : variant === "green"
              ? "linear-gradient(135deg,#3fcf8e,#2eb87e)"
              : "rgba(55,138,221,.1)",
      color:
        variant === "danger"
          ? "#f74f6e"
          : variant === "ghost"
            ? "#8fa4c8"
            : "#fff",
      outline:
        variant === "danger"
          ? "1px solid rgba(247,79,110,.3)"
          : variant === "ghost"
            ? "1px solid rgba(55,138,221,.2)"
            : "none",
      outlineOffset: -1,
    }) as React.CSSProperties,
};

// ─── Nav items ───────────────────────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  sidebarLabel: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview",    label: "Visão Geral",       sidebarLabel: "Geral",      href: "/admin",             icon: <IconLayoutDashboard size={20} /> },
  { id: "usuarios",    label: "Alunos",             sidebarLabel: "Alunos",     href: "/admin/alunos",      icon: <IconUsers size={20} /> },
  { id: "conteudos",   label: "Conteúdos & Aulas",  sidebarLabel: "Aulas",      href: "/admin/aulas",       icon: <IconBook2 size={20} /> },
  { id: "exercicios",  label: "Exercícios",          sidebarLabel: "Exercícios", href: "/admin/exercicios",  icon: <IconPencil size={20} /> },
  { id: "financeiro",  label: "Financeiro",          sidebarLabel: "Finanças",   href: "/admin/financeiro",  icon: <IconReceipt2 size={20} /> },
  { id: "feedbacks",   label: "Reviews",             sidebarLabel: "Reviews",    href: "/admin/reviews",     icon: <IconMessage2 size={20} /> },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export function AdminSidebar({ activeId }: { activeId: string }) {
  const router = useRouter();

  const logout = () => {
    clearAdminToken();
    router.replace("/admin");
  };

  return (
    <aside
      style={{
        width: 68,
        flexShrink: 0,
        background: "#0d1426",
        borderRight: "1px solid rgba(55,138,221,.14)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1.25rem 0",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "1.5rem" }}>
        {/* Logo → overview */}
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "1.2rem",
            background: "linear-gradient(135deg, #378ADD, #185FA5)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            cursor: "pointer",
          }}
          onClick={() => router.push("/admin")}
        >
          OD
        </div>

        {/* Nav */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", alignItems: "center" }}>
          {NAV_ITEMS.map((item) => {
            const active = activeId === item.id;
            return (
              <button
                key={item.id}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 10,
                  background: active ? "rgba(55, 138, 221, 0.15)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: active ? "#378ADD" : "#4d6380",
                  transition: "all 0.15s ease",
                  padding: 0,
                  gap: "0.25rem",
                }}
                onClick={() => router.push(item.href)}
              >
                <div style={{ color: active ? "#378ADD" : "#8fa4c8" }}>{item.icon}</div>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: active ? 600 : 500,
                    fontFamily: "'DM Sans', sans-serif",
                    color: active ? "#378ADD" : "#8fa4c8",
                  }}
                >
                  {item.sidebarLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <button
        style={{
          width: 52, height: 52, borderRadius: 10,
          background: "transparent", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", color: "#f74f6e", transition: "all 0.15s ease",
          padding: 0, gap: "0.25rem",
        }}
        onClick={logout}
      >
        <IconLogout size={20} />
        <span style={{ fontSize: "9px", fontWeight: 500, fontFamily: "'DM Sans', sans-serif", color: "#f74f6e" }}>
          Sair
        </span>
      </button>
    </aside>
  );
}

// ─── Topbar ──────────────────────────────────────────────────────────────────
export function AdminTopbar({ title, backHref }: { title: string; backHref?: string }) {
  const router = useRouter();
  return (
    <header
      style={{
        height: 48,
        flexShrink: 0,
        borderBottom: "1px solid rgba(55,138,221,.14)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0 1.5rem",
        background: "#0d1426",
      }}
    >
      {backHref && (
        <button
          style={{ ...S.btn("ghost"), display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", fontSize: "0.78rem" }}
          onClick={() => router.push(backHref)}
        >
          <IconChevronLeft size={14} /> Voltar
        </button>
      )}
      <h1 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e2e8f0", fontFamily: "'Syne', sans-serif", margin: 0 }}>
        {title}
      </h1>
      <span
        style={{
          display: "flex", alignItems: "center", gap: "0.35rem",
          fontSize: "0.68rem", fontWeight: 700, color: "#3fcf8e",
          background: "rgba(63,207,142,.1)", border: "1px solid rgba(63,207,142,.2)",
          padding: "1px 6px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.03em",
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#3fcf8e", display: "inline-block", boxShadow: "0 0 6px #3fcf8e" }} />
        AO VIVO
      </span>
    </header>
  );
}

// ─── AdminPageShell — wrapper para sub-rotas ──────────────────────────────────
export function AdminPageShell({
  activeId,
  title,
  backHref,
  children,
}: {
  activeId: string;
  title: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#4d6380", fontFamily: "'DM Sans', sans-serif" }}>Verificando autenticação...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "#0a0f1e",
        color: "#e2e8f0",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <AdminSidebar activeId={activeId} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <AdminTopbar title={title} backHref={backHref} />
        <main style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
