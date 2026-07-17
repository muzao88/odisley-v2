"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminPageShell, S } from "@/components/AdminShell";
import { getAdminToken } from "@/lib/adminToken";
import { makeAdminApi } from "@/lib/adminApi";

interface Payment {
  customer: string;
  amount: number;
  method: string;
  date: string;
  status: string;
}

interface FinData {
  mrr: number;
  recentes: Payment[];
  warning?: string;
}

export default function FinanceiroPage() {
  const [data, setData] = useState<FinData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    const res = await makeAdminApi(token).get("/api/admin/financeiro");
    if (res && typeof res.mrr === "number") {
      setData(res);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <AdminPageShell activeId="financeiro" title="Financeiro" backHref="/admin">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>Métricas Financeiras (Asaas)</h2>
        <button style={S.btn("ghost")} onClick={load}>Atualizar Dados</button>
      </div>

      {loading ? (
        <div style={{ color: "#4d6380", padding: "2rem", textAlign: "center" }}>Carregando dados financeiros...</div>
      ) : !data ? (
        <div style={{ color: "#f74f6e", padding: "2rem", textAlign: "center" }}>Erro ao carregar dados do Asaas.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {data.warning && (
            <div style={{ background: "rgba(247, 201, 79, 0.15)", border: "1px solid rgba(247, 201, 79, 0.3)", padding: "1rem", borderRadius: 8, color: "#f7c94f", fontSize: "0.85rem" }}>
              ⚠️ {data.warning}
            </div>
          )}

          {/* MRR Card */}
          <div style={{ ...S.card, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem 2rem", background: "linear-gradient(135deg, rgba(55,138,221,0.1), rgba(24,95,165,0.05))" }}>
            <div>
              <div style={{ fontSize: "0.85rem", color: "#8fa4c8", marginBottom: "0.25rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>MRR (Monthly Recurring Revenue)</div>
              <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#3fcf8e", fontFamily: "'Syne', sans-serif" }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.mrr)}
              </div>
            </div>
            <div style={{ fontSize: "3rem", opacity: 0.8 }}>💰</div>
          </div>

          <div style={S.card}>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: "1.25rem" }}>Cobranças Recentes</h3>
            
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
              <thead>
                <tr style={{ color: "#4d6380" }}>
                  {["Cliente (ID/Nome)", "Data", "Valor", "Método", "Status"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: ".5rem .75rem", borderBottom: "1px solid rgba(55,138,221,.1)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentes.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "1.5rem", color: "#4d6380", textAlign: "center" }}>Nenhuma cobrança encontrada.</td></tr>
                ) : data.recentes.map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(55,138,221,.06)" }}>
                    <td style={{ padding: ".75rem", fontWeight: 600 }}>{p.customer}</td>
                    <td style={{ padding: ".75rem", color: "#8fa4c8" }}>{new Date(p.date).toLocaleDateString("pt-BR")}</td>
                    <td style={{ padding: ".75rem", fontWeight: 600, color: "#e2e8f0" }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amount)}</td>
                    <td style={{ padding: ".75rem" }}>
                      <span style={{ ...S.badge(p.method === 'Pix' ? 'free' : 'premium'), background: "rgba(55,138,221,.08)", color: "#8fa4c8" }}>
                        {p.method}
                      </span>
                    </td>
                    <td style={{ padding: ".75rem" }}>
                      <span style={{ 
                        ...S.badge('premium'), 
                        background: p.status === 'CONFIRMED' || p.status === 'RECEIVED' ? 'rgba(63,207,142,.15)' : 'rgba(247,79,110,.15)', 
                        color: p.status === 'CONFIRMED' || p.status === 'RECEIVED' ? '#3fcf8e' : '#f74f6e' 
                      }}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}
