"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  ComposedChart
} from "recharts";
import { AdminPageShell, S } from "@/components/AdminShell";
import { getAdminToken } from "@/lib/adminToken";
import { makeAdminApi } from "@/lib/adminApi";

export default function ReviewsPage() {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sentiment, setSentiment] = useState("");
  const [plan, setPlan]       = useState("");

  const load = useCallback(async () => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await makeAdminApi(token).get(`/api/admin/reviews?sentiment=${sentiment}&plan=${plan}`);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sentiment, plan]);

  useEffect(() => { load(); }, [load]);

  if (!data && loading) {
    return (
      <AdminPageShell activeId="feedbacks" title="Reviews e Satisfação" backHref="/admin">
        <div style={{ color: "#4d6380", padding: "2rem" }}>Carregando...</div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell activeId="feedbacks" title="Reviews e Satisfação" backHref="/admin">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>Feedback dos Alunos</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select style={S.select} value={sentiment} onChange={e => setSentiment(e.target.value)}>
            <option value="">Todos os sentimentos</option>
            <option value="positive">Positivos (4-5)</option>
            <option value="neutral">Neutros (3)</option>
            <option value="negative">Negativos (1-2)</option>
          </select>
          <select style={S.select} value={plan} onChange={e => setPlan(e.target.value)}>
            <option value="">Todos os planos</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ ...S.card, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#4d6380", marginBottom: "0.25rem" }}>Média Geral</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#f7c94f" }}>{data?.stats?.averageRating || 0} ★</div>
          </div>
          <div style={{ fontSize: "2rem" }}>⭐</div>
        </div>
        <div style={{ ...S.card, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#4d6380", marginBottom: "0.25rem" }}>Índice de Satisfação</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#3fcf8e" }}>{data?.stats?.satisfaction || 0}%</div>
          </div>
          <div style={{ fontSize: "2rem" }}>😊</div>
        </div>
        <div style={{ ...S.card, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#4d6380", marginBottom: "0.25rem" }}>Total de Reviews</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#378ADD" }}>{data?.stats?.total || 0}</div>
          </div>
          <div style={{ fontSize: "2rem" }}>📝</div>
        </div>
      </div>

      {/* Sentimento breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ ...S.card, padding: "1rem", borderLeft: "4px solid #3fcf8e" }}>
          <div style={{ fontSize: "0.75rem", color: "#8fa4c8" }}>Positivos (4-5 ★)</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#e2e8f0" }}>{data?.stats?.positive || 0}</div>
        </div>
        <div style={{ ...S.card, padding: "1rem", borderLeft: "4px solid #f7c94f" }}>
          <div style={{ fontSize: "0.75rem", color: "#8fa4c8" }}>Neutros (3 ★)</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#e2e8f0" }}>{data?.stats?.neutral || 0}</div>
        </div>
        <div style={{ ...S.card, padding: "1rem", borderLeft: "4px solid #f74f6e" }}>
          <div style={{ fontSize: "0.75rem", color: "#8fa4c8" }}>Negativos (1-2 ★)</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#e2e8f0" }}>{data?.stats?.negative || 0}</div>
        </div>
      </div>

      {/* Chart: Tendência 30 dias com MM7 */}
      <div style={{ ...S.card, marginBottom: "2rem" }}>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          Tendência de Satisfação (30 dias)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={data?.trend || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#378ADD" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#378ADD" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(55,138,221,0.1)" vertical={false} />
            <XAxis dataKey="label" stroke="#4d6380" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#4d6380" fontSize={11} tickLine={false} axisLine={false} domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0d1426", borderColor: "rgba(55,138,221,.18)", borderRadius: "8px", fontSize: "12px" }}
              labelStyle={{ color: "#8fa4c8", marginBottom: "0.25rem" }}
            />
            {/* Daily Avg */}
            <Area type="monotone" dataKey="avg" name="Média Diária" stroke="#378ADD" fillOpacity={1} fill="url(#colorAvg)" />
            {/* 7-Day Moving Average */}
            <Line type="monotone" dataKey="ma7" name="Média Móvel 7D" stroke="#f7c94f" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
            <thead>
              <tr style={{ color: "#4d6380" }}>
                <th style={{ textAlign: "left", padding: ".5rem .75rem", borderBottom: "1px solid rgba(55,138,221,.1)" }}>Aluno</th>
                <th style={{ textAlign: "left", padding: ".5rem .75rem", borderBottom: "1px solid rgba(55,138,221,.1)" }}>Nota</th>
                <th style={{ textAlign: "left", padding: ".5rem .75rem", borderBottom: "1px solid rgba(55,138,221,.1)" }}>Sentimento</th>
                <th style={{ textAlign: "left", padding: ".5rem .75rem", borderBottom: "1px solid rgba(55,138,221,.1)" }}>Progresso/Plataforma</th>
                <th style={{ textAlign: "left", padding: ".5rem .75rem", borderBottom: "1px solid rgba(55,138,221,.1)" }}>Feedback</th>
                <th style={{ textAlign: "left", padding: ".5rem .75rem", borderBottom: "1px solid rgba(55,138,221,.1)" }}>Data</th>
              </tr>
            </thead>
            <tbody>
              {data?.reviews?.map((f: any) => (
                <tr key={f._id} style={{ borderBottom: "1px solid rgba(55,138,221,.06)" }}>
                  <td style={{ padding: ".6rem .75rem" }}>
                    <div style={{ fontWeight: 600 }}>{f.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "#4d6380" }}>{f.email}</div>
                    <span style={S.badge(f.plan)}>{f.plan}</span>
                  </td>
                  <td style={{ padding: ".6rem .75rem", color: "#f7c94f", fontWeight: 700 }}>{f.rating} ★</td>
                  <td style={{ padding: ".6rem .75rem" }}>
                    {f.sentiment === 'positive' && <span style={{ color: "#3fcf8e", fontWeight: 600 }}>Positivo</span>}
                    {f.sentiment === 'neutral' && <span style={{ color: "#f7c94f", fontWeight: 600 }}>Neutro</span>}
                    {f.sentiment === 'negative' && <span style={{ color: "#f74f6e", fontWeight: 600 }}>Negativo</span>}
                  </td>
                  <td style={{ padding: ".6rem .75rem", fontSize: "0.75rem", color: "#8fa4c8" }}>
                    <div><span style={{color: "#4d6380"}}>Prog:</span> {f.progress_feeling}</div>
                    <div><span style={{color: "#4d6380"}}>Gosta:</span> {f.likes_platform}</div>
                  </td>
                  <td style={{ padding: ".6rem .75rem", color: "#8fa4c8", maxWidth: 300, whiteSpace: "normal" }}>
                    <div style={{ fontStyle: f.text ? 'italic' : 'normal' }}>{f.text || <em style={{opacity: 0.5}}>Sem comentário</em>}</div>
                    {f.suggestion && (
                      <div style={{marginTop: '0.4rem', borderLeft: '2px solid rgba(55,138,221,0.2)', paddingLeft: '0.5rem'}}>
                        <span style={{fontSize: '0.7rem', color: '#4d6380', display: 'block'}}>Sugestão:</span>
                        {f.suggestion}
                      </div>
                    )}
                    {f.requested_content && (
                      <div style={{marginTop: '0.4rem', color: '#378ADD', fontSize: '0.75rem'}}>
                        🔍 Deseja ver: <strong>{f.requested_content}</strong>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: ".6rem .75rem", color: "#4d6380", whiteSpace: 'nowrap' }}>
                    {new Date(f.date).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
              {data?.reviews?.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "1.5rem", color: "#4d6380", textAlign: "center" }}>
                    Nenhum feedback encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageShell>
  );
}
