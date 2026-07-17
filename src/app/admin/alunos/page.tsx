"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminPageShell, S } from "@/components/AdminShell";
import { getAdminToken } from "@/lib/adminToken";
import { makeAdminApi } from "@/lib/adminApi";

interface Usr {
  _id: string;
  nome: string;
  email: string;
  plano: "free" | "premium";
  progresso_total?: number;
  provider?: string;
  createdAt: string;
  assinaturaStatus?: string | null;
}

export default function AlunosPage() {
  const [users, setUsers]   = useState<Usr[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [q, setQ]           = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    const data = await makeAdminApi(token).get(
      `/api/admin/usuarios?page=${page}&q=${encodeURIComponent(q)}`
    );
    setUsers((data as any).users ?? []);
    setTotal((data as any).total ?? 0);
    setLoading(false);
  }, [page, q]);

  useEffect(() => { load(); }, [load]);

  const alterarPlano = async (userId: string, plano: "free" | "premium") => {
    const token = getAdminToken();
    if (!token) return;
    await makeAdminApi(token).patch("/api/admin/usuarios", { userId, plano });
    load();
  };

  const deletar = async (userId: string, nome: string) => {
    if (!confirm(`Deletar o usuário "${nome}"? Esta ação é irreversível.`)) return;
    const token = getAdminToken();
    if (!token) return;
    await makeAdminApi(token).del("/api/admin/usuarios", { userId });
    load();
  };

  return (
    <AdminPageShell activeId="usuarios" title="Alunos" backHref="/admin">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: ".75rem",
        }}
      >
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>
          Usuários{" "}
          <span style={{ fontSize: ".8rem", color: "#4d6380", fontFamily: "inherit" }}>
            ({total})
          </span>
        </h2>
        <input
          style={{ ...S.input, width: 280 }}
          placeholder="Buscar por nome ou e-mail..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
      </div>

      <div style={S.card}>
        {loading ? (
          <div style={{ color: "#4d6380", padding: "1rem" }}>Carregando...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
              <thead>
                <tr style={{ color: "#4d6380" }}>
                  {["Nome", "E-mail", "Plano", "Progresso", "Cadastro", "Ações"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: ".5rem .75rem",
                        borderBottom: "1px solid rgba(55,138,221,.1)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: "1px solid rgba(55,138,221,.06)" }}>
                    <td style={{ padding: ".6rem .75rem", fontWeight: 500 }}>{u.nome}</td>
                    <td style={{ padding: ".6rem .75rem", color: "#8fa4c8" }}>{u.email}</td>
                    <td style={{ padding: ".6rem .75rem" }}>
                      <select
                        style={{ ...S.select, padding: ".25rem .5rem", fontSize: ".75rem" }}
                        value={u.plano}
                        onChange={(e) => alterarPlano(u._id, e.target.value as "free" | "premium")}
                      >
                        <option value="free">free</option>
                        <option value="premium">premium</option>
                      </select>
                    </td>
                    <td style={{ padding: ".6rem .75rem", color: "#8fa4c8" }}>
                      {u.progresso_total ?? 0}%
                    </td>
                    <td style={{ padding: ".6rem .75rem", color: "#4d6380", whiteSpace: "nowrap" }}>
                      {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td style={{ padding: ".6rem .75rem" }}>
                      <button style={S.btn("danger")} onClick={() => deletar(u._id, u.nome)}>
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "1.5rem", color: "#4d6380", textAlign: "center" }}>
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        <div style={{ display: "flex", gap: ".5rem", marginTop: "1rem", alignItems: "center" }}>
          <button
            style={S.btn("ghost")}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Anterior
          </button>
          <span style={{ fontSize: ".78rem", color: "#4d6380" }}>Página {page}</span>
          <button
            style={S.btn("ghost")}
            onClick={() => setPage((p) => p + 1)}
            disabled={users.length < 20}
          >
            Próxima →
          </button>
        </div>
      </div>
    </AdminPageShell>
  );
}
