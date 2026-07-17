"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminPageShell, S } from "@/components/AdminShell";
import { getAdminToken } from "@/lib/adminToken";
import { makeAdminApi } from "@/lib/adminApi";

interface Conteudo {
  _id: string;
  nome: string;
  categoria: string;
  descricao: string;
  icone: string;
  totalAulas: number;
  aulasGratuitas: number;
}

interface Aula {
  _id: string;
  titulo: string;
  video_url: string;
  duracao: string;
  ordem: number;
  tipo: "free" | "premium";
  descricao: string;
}

const CATEGORIAS = ["Fundamentos", "Álgebra", "Funções", "Geometria", "Estatística e Probabilidade", "Matemática Discreta"];

function ConteudoAulasPanel({ conteudo, onReloadConteudos }: { conteudo: Conteudo; onReloadConteudos: () => void }) {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [editando, setEditando] = useState<Aula | null>(null);
  const [loadingAulas, setLoadingAulas] = useState(true);
  const [form, setForm] = useState({ titulo: "", video_url: "", duracao: "", descricao: "", tipo: "premium" as "free" | "premium" });

  const load = useCallback(async () => {
    const token = getAdminToken();
    if (!token) return;
    setLoadingAulas(true);
    const data = await makeAdminApi(token).get(`/api/admin/aulas?conteudoId=${conteudo._id}`);
    setAulas(Array.isArray(data) ? data : []);
    setLoadingAulas(false);
  }, [conteudo._id]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => setForm({ titulo: "", video_url: "", duracao: "", descricao: "", tipo: "premium" });

  const salvar = async () => {
    if (!form.titulo) return alert("Título obrigatório.");
    const token = getAdminToken();
    if (!token) return;
    if (editando) {
      await makeAdminApi(token).patch("/api/admin/aulas", { id: editando._id, ...form });
      setEditando(null);
    } else {
      await makeAdminApi(token).post("/api/admin/aulas", { ...form, conteudo_id: conteudo._id });
    }
    resetForm();
    await load();
    onReloadConteudos();
  };

  const deletar = async (id: string, titulo: string) => {
    if (!confirm(`Deletar "${titulo}"?`)) return;
    const token = getAdminToken();
    if (!token) return;
    await makeAdminApi(token).del("/api/admin/aulas", { id });
    await load();
    onReloadConteudos();
  };

  const iniciarEdicao = (a: Aula) => {
    setEditando(a);
    setForm({ titulo: a.titulo, video_url: a.video_url, duracao: a.duracao, descricao: a.descricao, tipo: a.tipo });
  };

  const innerCard: React.CSSProperties = { background: "#0d1426", border: "1px solid rgba(55,138,221,.1)", borderRadius: 10, padding: "1rem", marginBottom: ".75rem" };

  return (
    <div style={{ marginTop: ".5rem", border: "1px solid rgba(55,138,221,.22)", borderRadius: 12, padding: "1.25rem", background: "#101828" }}>
      <h4 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".88rem", marginBottom: "1rem", color: "#378ADD" }}>
        🎬 Aulas de &ldquo;{conteudo.nome}&rdquo;
        <span style={{ fontWeight: 400, color: "#4d6380", marginLeft: ".5rem" }}>({aulas.length} cadastradas)</span>
      </h4>

      <div style={innerCard}>
        <div style={{ fontSize: ".72rem", color: "#8fa4c8", marginBottom: ".6rem", fontWeight: 600 }}>
          {editando ? `✏️ Editando: ${editando.titulo}` : "➕ Nova aula"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".5rem", marginBottom: ".5rem" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: ".68rem", color: "#8fa4c8", display: "block", marginBottom: ".2rem" }}>Título *</label>
            <input style={S.input} placeholder="Ex: Introdução ao tema" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: ".68rem", color: "#8fa4c8", display: "block", marginBottom: ".2rem" }}>URL do vídeo (YouTube)</label>
            <input style={S.input} placeholder="https://youtube.com/watch?v=..." value={form.video_url} onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: ".68rem", color: "#8fa4c8", display: "block", marginBottom: ".2rem" }}>Duração</label>
            <input style={S.input} placeholder="14:32" value={form.duracao} onChange={(e) => setForm((f) => ({ ...f, duracao: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: ".68rem", color: "#8fa4c8", display: "block", marginBottom: ".2rem" }}>Tipo</label>
            <select style={{ ...S.select, width: "100%" }} value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as "free" | "premium" }))}>
              <option value="premium">⭐ Premium</option>
              <option value="free">🆓 Gratuita</option>
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: ".68rem", color: "#8fa4c8", display: "block", marginBottom: ".2rem" }}>Descrição (opcional)</label>
            <input style={S.input} placeholder="Breve descrição da aula..." value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: "flex", gap: ".4rem" }}>
          <button style={S.btn("primary")} onClick={salvar}>{editando ? "Salvar alterações" : "Adicionar aula"}</button>
          {editando && <button style={S.btn("ghost")} onClick={() => { setEditando(null); resetForm(); }}>Cancelar</button>}
        </div>
      </div>

      {loadingAulas ? (
        <div style={{ color: "#4d6380", fontSize: ".8rem", textAlign: "center", padding: ".75rem" }}>Carregando aulas...</div>
      ) : aulas.length === 0 ? (
        <div style={{ color: "#4d6380", fontSize: ".8rem", textAlign: "center", padding: ".75rem" }}>Nenhuma aula cadastrada ainda.</div>
      ) : (
        <div style={innerCard}>
          {aulas.map((a, idx) => (
            <div key={a._id} style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".6rem 0", borderBottom: idx < aulas.length - 1 ? "1px solid rgba(55,138,221,.07)" : "none", flexWrap: "wrap" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(55,138,221,.12)", color: "#378ADD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".68rem", fontWeight: 700, flexShrink: 0 }}>{a.ordem}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: ".83rem", marginBottom: ".12rem" }}>{a.titulo}</div>
                <div style={{ display: "flex", gap: ".6rem", fontSize: ".68rem", color: "#4d6380" }}>
                  <span>⏱ {a.duracao || "—"}</span>
                  <span style={S.badge(a.tipo === "free" ? "free" : "premium")}>{a.tipo === "free" ? "Gratuita" : "Premium"}</span>
                  {a.video_url && <span style={{ color: "#3fcf8e" }}>✓ Vídeo</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: ".3rem", flexShrink: 0 }}>
                <button style={{ ...S.btn("ghost"), padding: ".35rem .65rem", fontSize: ".75rem" }} onClick={() => iniciarEdicao(a)}>✏️ Editar</button>
                <button style={{ ...S.btn("danger"), padding: ".35rem .65rem", fontSize: ".75rem" }} onClick={() => deletar(a._id, a.titulo)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AulasPage() {
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [form, setForm] = useState({ nome: "", categoria: CATEGORIAS[0], descricao: "", icone: "📚", aulasGratuitas: 2 });
  const [editando, setEditando] = useState<Conteudo | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getAdminToken();
    if (!token) return;
    const data = await makeAdminApi(token).get("/api/admin/conteudos");
    setConteudos(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const salvar = async () => {
    if (!form.nome) return alert("Nome obrigatório.");
    const token = getAdminToken();
    if (!token) return;
    if (editando) {
      await makeAdminApi(token).patch("/api/admin/conteudos", { id: editando._id, ...form });
      setEditando(null);
    } else {
      await makeAdminApi(token).post("/api/admin/conteudos", form);
    }
    setForm({ nome: "", categoria: CATEGORIAS[0], descricao: "", icone: "📚", aulasGratuitas: 2 });
    load();
  };

  const deletar = async (id: string, nome: string) => {
    if (!confirm(`Deletar "${nome}"?`)) return;
    const token = getAdminToken();
    if (!token) return;
    await makeAdminApi(token).del("/api/admin/conteudos", { id });
    load();
  };

  const iniciarEdicao = (c: Conteudo) => {
    setEditando(c);
    setForm({ nome: c.nome, categoria: c.categoria, descricao: c.descricao, icone: c.icone, aulasGratuitas: c.aulasGratuitas ?? 2 });
    setExpandedId(null);
  };

  return (
    <AdminPageShell activeId="conteudos" title="Conteúdos & Aulas" backHref="/admin">
      <div style={{ ...S.card, marginBottom: "1.5rem" }}>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".9rem", marginBottom: "1rem" }}>{editando ? `✏️ Editando: ${editando.nome}` : "➕ Novo conteúdo"}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: ".75rem", marginBottom: ".75rem" }}>
          <div>
            <label style={{ fontSize: ".72rem", color: "#8fa4c8", display: "block", marginBottom: ".3rem" }}>Nome *</label>
            <input style={S.input} placeholder="Ex: Função Quadrática" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: ".72rem", color: "#8fa4c8", display: "block", marginBottom: ".3rem" }}>Categoria *</label>
            <select style={{ ...S.select, width: "100%" }} value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}>
              {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: ".72rem", color: "#8fa4c8", display: "block", marginBottom: ".3rem" }}>Ícone (emoji)</label>
            <input style={S.input} placeholder="📚" value={form.icone} onChange={(e) => setForm((f) => ({ ...f, icone: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: ".72rem", color: "#8fa4c8", display: "block", marginBottom: ".3rem" }}>Aulas gratuitas</label>
            <input style={S.input} type="number" min={0} placeholder="2" value={form.aulasGratuitas} onChange={(e) => setForm((f) => ({ ...f, aulasGratuitas: Number(e.target.value) }))} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: ".72rem", color: "#8fa4c8", display: "block", marginBottom: ".3rem" }}>Descrição</label>
            <input style={S.input} placeholder="Breve descrição do conteúdo..." value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
          <button style={S.btn("primary")} onClick={salvar}>{editando ? "Salvar alterações" : "Criar conteúdo"}</button>
          {editando && <button style={S.btn("ghost")} onClick={() => { setEditando(null); setForm({ nome: "", categoria: CATEGORIAS[0], descricao: "", icone: "📚", aulasGratuitas: 2 }) }}>Cancelar</button>}
          {!editando && <span style={{ fontSize: ".72rem", color: "#4d6380" }}>💡 &ldquo;Aulas gratuitas&rdquo; define quantas primeiras aulas ficam acessíveis para usuários free.</span>}
        </div>
      </div>

      <div style={S.card}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
          <thead>
            <tr style={{ color: "#4d6380" }}>
              {["Ícone", "Nome", "Categoria", "Gratuitas", "Total", "Ações"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: ".5rem .75rem", borderBottom: "1px solid rgba(55,138,221,.1)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {conteudos.map((c) => (
              <React.Fragment key={c._id}>
                <tr style={{ borderBottom: expandedId === c._id ? "none" : "1px solid rgba(55,138,221,.06)" }}>
                  <td style={{ padding: ".6rem .75rem", fontSize: "1.3rem" }}>{c.icone}</td>
                  <td style={{ padding: ".6rem .75rem", fontWeight: 600 }}>{c.nome}</td>
                  <td style={{ padding: ".6rem .75rem", color: "#8fa4c8" }}>{c.categoria}</td>
                  <td style={{ padding: ".6rem .75rem", color: "#3fcf8e", fontWeight: 600 }}>{c.aulasGratuitas ?? 0}</td>
                  <td style={{ padding: ".6rem .75rem", color: "#378ADD", fontWeight: 600 }}>{c.totalAulas}</td>
                  <td style={{ padding: ".6rem .75rem" }}>
                    <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
                      <button style={S.btn("ghost")} onClick={() => iniciarEdicao(c)}>Editar</button>
                      <button style={{ ...S.btn("primary"), background: expandedId === c._id ? "rgba(55,138,221,.2)" : "linear-gradient(135deg,#378ADD,#185FA5)" }} onClick={() => setExpandedId(expandedId === c._id ? null : c._id)}>
                        {expandedId === c._id ? "▲ Fechar aulas" : "▼ Gerenciar aulas"}
                      </button>
                      <button style={S.btn("danger")} onClick={() => deletar(c._id, c.nome)}>Deletar</button>
                    </div>
                  </td>
                </tr>
                {expandedId === c._id && (
                  <tr>
                    <td colSpan={6} style={{ padding: ".25rem .75rem 1rem" }}>
                      <ConteudoAulasPanel conteudo={c} onReloadConteudos={load} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {conteudos.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "1.5rem", color: "#4d6380", textAlign: "center" }}>Nenhum conteúdo cadastrado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
}
