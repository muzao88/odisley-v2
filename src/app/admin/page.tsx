"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from "recharts";
import { AdminPageShell, S } from "@/components/AdminShell";
import { getAdminToken, setAdminToken } from "@/lib/adminToken";
import { makeAdminApi } from "@/lib/adminApi";

// ─── Interfaces ─────────────────────────────────────────────────────────────
interface Stats {
  totalUsuarios: number;
  totalPremium: number;
  totalFree: number;
  totalConteudos: number;
  totalAulas: number;
  assinaturasAtivas: number;
  recentes: any[];
  cadastrosPorMes?: { name: string; cadastros: number }[];
  engajamentoCursos?: { name: string; percentual: number }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin: (t: string) => void }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error);
        return;
      }
      setAdminToken(data.token);
      onLogin(data.token);
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 380, background: "#0d1426", border: "1px solid rgba(55,138,221,.22)", borderRadius: 20, padding: "2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.6rem", background: "linear-gradient(135deg, #378ADD, #185FA5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }}>
            Odisley
          </div>
          <div style={{ fontSize: ".78rem", color: "#4d6380", marginTop: ".3rem" }}>Painel Administrativo</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: ".78rem", color: "#8fa4c8", marginBottom: ".4rem", fontWeight: 600 }}>Usuário</label>
            <input style={S.input} type="text" placeholder="admin" value={usuario} onChange={(e) => setUsuario(e.target.value)} required autoFocus />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: ".78rem", color: "#8fa4c8", marginBottom: ".4rem", fontWeight: 600 }}>Senha</label>
            <input style={S.input} type="password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>
          {erro && <div style={{ fontSize: ".78rem", color: "#f74f6e", marginBottom: "1rem", textAlign: "center" }}>⚠ {erro}</div>}
          <button type="submit" disabled={loading} style={{ ...S.btn("primary"), width: "100%", padding: ".75rem", fontSize: ".92rem", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Entrando..." : "Entrar no painel"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
function Overview() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (token) makeAdminApi(token).get("/api/admin/stats").then(setStats);
  }, []);

  if (!stats) return <div style={{ color: "#4d6380", padding: "2rem" }}>Carregando...</div>;

  const statCards = [
    { label: "Usuários", value: stats.totalUsuarios, icon: "👥", color: "#378ADD", href: "/admin/alunos" },
    { label: "Premium", value: stats.totalPremium, icon: "⭐", color: "#f7c94f", href: "/admin/alunos" },
    { label: "Conteúdos", value: stats.totalConteudos, icon: "🎓", color: "#3fcf8e", href: "/admin/aulas" },
    { label: "Videoaulas", value: stats.totalAulas, icon: "🎬", color: "#f7934f", href: "/admin/exercicios" },
  ];

  const planData = [
    { name: "Gratuito", value: stats.totalFree, color: "#378ADD" },
    { name: "Premium", value: stats.totalPremium, color: "#f7c94f" },
  ];

  const conversionRate = stats.totalUsuarios > 0 ? ((stats.totalPremium / stats.totalUsuarios) * 100).toFixed(1) : "0.0";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* 4-column metric grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
        {statCards.map((s) => (
          <div
            key={s.label}
            style={{
              ...S.card, display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.85rem 1.15rem", cursor: s.href ? "pointer" : "default",
              transition: "transform 0.2s"
            }}
            onClick={() => s.href && router.push(s.href)}
            onMouseEnter={(e) => { if (s.href) e.currentTarget.style.transform = "translateY(-2px)" }}
            onMouseLeave={(e) => { if (s.href) e.currentTarget.style.transform = "none" }}
          >
            <div>
              <div style={{ fontSize: "1.375rem", fontWeight: 500, color: "#e2e8f0" }}>{s.value}</div>
              <div style={{ fontSize: "0.75rem", color: "#8fa4c8", marginTop: "0.15rem" }}>{s.label}</div>
            </div>
            <div style={{ fontSize: "1.75rem" }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Grid de 2 colunas para os gráficos */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.25rem" }}>
        {/* Coluna da Esquerda (2/3) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={S.card}>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#e2e8f0", marginBottom: "0.75rem" }}>
              Engajamento por curso (média de progresso)
            </h3>
            <ResponsiveContainer width="100%" height={(stats.engajamentoCursos?.length || 4) * 36 + 20}>
              <BarChart data={stats.engajamentoCursos || []} layout="vertical" margin={{ top: 4, right: 30, left: 10, bottom: 4 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#4d6380" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" stroke="#8fa4c8" fontSize={9} width={130} tickLine={false} axisLine={false} tickFormatter={(name: string) => name.length > 18 ? name.slice(0, 17) + '…' : name} />
                <Tooltip contentStyle={{ backgroundColor: "#0d1426", borderColor: "rgba(55,138,221,.18)", borderRadius: "8px", fontSize: "12px" }} formatter={(value: any) => [`${value}%`, "Progresso Médio"]} />
                <Bar dataKey="percentual" radius={[0, 4, 4, 0]} barSize={14} minPointSize={2}>
                  {(stats.engajamentoCursos || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percentual > 0 ? (index % 2 === 0 ? "#378ADD" : "#185FA5") : "#1a2540"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={S.card}>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#e2e8f0", marginBottom: "0.75rem" }}>
              Novos cadastros por mês
            </h3>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={stats.cadastrosPorMes || []} margin={{ top: 4, right: 12, left: -28, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#4d6380" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#4d6380" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0d1426", borderColor: "rgba(55,138,221,.18)", borderRadius: "8px", fontSize: "12px" }} formatter={(value: any) => [value, "Cadastros"]} />
                <Bar dataKey="cadastros" fill="#3fcf8e" radius={[4, 4, 0, 0]} barSize={22} minPointSize={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coluna da Direita (1/3) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Card Reviews redirect (new) */}
          <div
            style={{ ...S.card, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "transform 0.2s" }}
            onClick={() => router.push("/admin/reviews")}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
          >
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>Satisfação</div>
              <div style={{ fontSize: "0.75rem", color: "#8fa4c8" }}>Ver feedbacks dos clientes</div>
            </div>
            <div style={{ fontSize: "1.75rem" }}>💬</div>
          </div>

          <div style={{ ...S.card, display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
            <div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#e2e8f0", marginBottom: "1.25rem" }}>
                Distribuição de planos
              </h3>
              <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={planData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                      {planData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0d1426", borderColor: "rgba(55,138,221,.18)", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f7c94f" }}>{conversionRate}%</div>
                  <div style={{ fontSize: "0.55rem", color: "#8fa4c8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Conversão</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "1rem" }}>
              {planData.map((p) => {
                const percentage = stats.totalUsuarios > 0 ? ((p.value / stats.totalUsuarios) * 100).toFixed(0) : "0";
                return (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "#8fa4c8", padding: "0.2rem 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: p.color }} />
                      <span>{p.name}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{p.value} ({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(getAdminToken());
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!token) return <LoginScreen onLogin={setToken} />;

  return (
    <AdminPageShell activeId="overview" title="Visão Geral">
      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        <Overview />
      </div>
    </AdminPageShell>
  );
}
