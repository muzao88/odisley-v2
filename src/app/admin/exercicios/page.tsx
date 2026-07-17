"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminPageShell, S } from "@/components/AdminShell";
import { getAdminToken } from "@/lib/adminToken";
import { makeAdminApi } from "@/lib/adminApi";

interface Questao {
  enunciado: string;
  alternativas: { A: string; B: string; C: string; D: string; E: string };
  respostaCorreta: string;
}

interface Exercicio {
  _id: string;
  titulo: string;
  conteudo_id: { _id: string; nome: string } | string;
  dificuldade: "Fácil" | "Médio" | "Difícil";
  tipoAcesso: "free" | "premium";
  questoes: Questao[];
  createdAt: string;
}

const emptyForm = {
  titulo: "",
  conteudo_id: "",
  dificuldade: "Médio" as "Fácil" | "Médio" | "Difícil",
  tipoAcesso: "premium" as "free" | "premium",
  questoes: [] as Questao[],
};

export default function ExerciciosPage() {
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [conteudos, setConteudos]   = useState<{ _id: string; nome: string }[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editando, setEditando]     = useState<Exercicio | null>(null);
  const [filtroConteudo, setFiltroConteudo]       = useState("todos");
  const [filtroDificuldade, setFiltroDificuldade] = useState("todas");
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    const [exs, conts] = await Promise.all([
      makeAdminApi(token).get(`/api/admin/exercicios?conteudoId=${filtroConteudo}&dificuldade=${filtroDificuldade}`),
      makeAdminApi(token).get("/api/admin/conteudos"),
    ]);
    setExercicios(Array.isArray(exs) ? exs : []);
    setConteudos(Array.isArray(conts) ? conts : []);
    setLoading(false);
  }, [filtroConteudo, filtroDificuldade]);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm(emptyForm); setEditando(null); };

  const addQuestao = () =>
    setForm((f) => ({
      ...f,
      questoes: [...f.questoes, { enunciado: "", alternativas: { A: "", B: "", C: "", D: "", E: "" }, respostaCorreta: "A" }],
    }));

  const removeQuestao = (i: number) =>
    setForm((f) => ({ ...f, questoes: f.questoes.filter((_, idx) => idx !== i) }));

  const updateQuestao = (i: number, field: string, value: string) => {
    setForm((f) => {
      const qs = [...f.questoes];
      const q  = { ...qs[i] };
      if (field === "enunciado") q.enunciado = value;
      else if (field === "respostaCorreta") q.respostaCorreta = value;
      else if (field.startsWith("alternativas.")) {
        const alt = field.split(".")[1] as keyof typeof q.alternativas;
        q.alternativas = { ...q.alternativas, [alt]: value };
      }
      qs[i] = q;
      return { ...f, questoes: qs };
    });
  };

  const salvar = async () => {
    if (!form.titulo || !form.conteudo_id) return alert("Preencha o título e o módulo.");
    if (form.questoes.length === 0) return alert("Adicione pelo menos uma questão.");
    const token = getAdminToken();
    if (!token) return;
    if (editando) {
      await makeAdminApi(token).patch("/api/admin/exercicios", { id: editando._id, ...form });
    } else {
      await makeAdminApi(token).post("/api/admin/exercicios", form);
    }
    setShowForm(false);
    resetForm();
    load();
  };

  const editar = (ex: Exercicio) => {
    setEditando(ex);
    setForm({
      titulo: ex.titulo,
      conteudo_id: typeof ex.conteudo_id === "string" ? ex.conteudo_id : ex.conteudo_id._id,
      dificuldade: ex.dificuldade,
      tipoAcesso: ex.tipoAcesso,
      questoes: ex.questoes,
    });
    setShowForm(true);
  };

  const deletar = async (id: string, titulo: string) => {
    if (!confirm(`Deletar o exercício "${titulo}"?`)) return;
    const token = getAdminToken();
    if (!token) return;
    await makeAdminApi(token).del("/api/admin/exercicios", { id });
    load();
  };

  return (
    <AdminPageShell activeId="exercicios" title="Gestão de Exercícios" backHref="/admin">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>Exercícios</h2>
        <button style={S.btn("green")} onClick={() => { resetForm(); setShowForm(true); }}>
          + Novo Exercício
        </button>
      </div>

      {showForm ? (
        <div style={{ ...S.card, marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1.25rem", fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>
            {editando ? "Editar Exercício" : "Novo Exercício"}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: ".72rem", color: "#8fa4c8", display: "block", marginBottom: ".3rem" }}>Título</label>
              <input style={S.input} value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Exercícios de Fixação - Módulo 1" />
            </div>
            <div>
              <label style={{ fontSize: ".72rem", color: "#8fa4c8", display: "block", marginBottom: ".3rem" }}>Módulo Vinculado</label>
              <select style={{ ...S.select, width: "100%" }} value={form.conteudo_id} onChange={(e) => setForm((f) => ({ ...f, conteudo_id: e.target.value }))}>
                <option value="">Selecione um módulo...</option>
                {conteudos.map((c) => <option key={c._id} value={c._id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: ".72rem", color: "#8fa4c8", display: "block", marginBottom: ".3rem" }}>Dificuldade</label>
              <select style={{ ...S.select, width: "100%" }} value={form.dificuldade} onChange={(e) => setForm((f) => ({ ...f, dificuldade: e.target.value as any }))}>
                {["Fácil", "Médio", "Difícil"].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: ".72rem", color: "#8fa4c8", display: "block", marginBottom: ".3rem" }}>Tipo de Acesso</label>
              <select style={{ ...S.select, width: "100%" }} value={form.tipoAcesso} onChange={(e) => setForm((f) => ({ ...f, tipoAcesso: e.target.value as any }))}>
                <option value="free">Gratuito</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: 700 }}>Questões ({form.questoes.length})</h4>
              <button style={S.btn("ghost")} onClick={addQuestao}>+ Adicionar Questão</button>
            </div>
            {form.questoes.map((q, i) => (
              <div key={i} style={{ background: "rgba(55,138,221,0.05)", border: "1px solid rgba(55,138,221,0.1)", borderRadius: 10, padding: "1.25rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#378ADD" }}>Questão {i + 1}</span>
                  <button style={{ ...S.btn("danger"), padding: "2px 8px", fontSize: "0.7rem" }} onClick={() => removeQuestao(i)}>Remover</button>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ fontSize: ".72rem", color: "#8fa4c8", display: "block", marginBottom: ".3rem" }}>Enunciado</label>
                  <textarea style={{ ...S.input, minHeight: 80, resize: "vertical" } as React.CSSProperties} value={q.enunciado} onChange={(e) => updateQuestao(i, "enunciado", e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  {(["A", "B", "C", "D", "E"] as const).map((alt) => (
                    <div key={alt}>
                      <label style={{ fontSize: ".72rem", color: "#8fa4c8", display: "block", marginBottom: ".2rem" }}>Alternativa {alt}</label>
                      <input style={S.input} value={q.alternativas[alt]} onChange={(e) => updateQuestao(i, `alternativas.${alt}`, e.target.value)} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: ".72rem", color: "#8fa4c8", display: "block", marginBottom: ".2rem" }}>Resposta Correta</label>
                    <select style={{ ...S.select, width: "100%" }} value={q.respostaCorreta} onChange={(e) => updateQuestao(i, "respostaCorreta", e.target.value)}>
                      {["A", "B", "C", "D", "E"].map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button style={S.btn("primary")} onClick={salvar}>Salvar Exercício</button>
            <button style={S.btn("ghost")} onClick={() => { setShowForm(false); resetForm(); }}>Cancelar</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <select style={S.select} value={filtroConteudo} onChange={(e) => setFiltroConteudo(e.target.value)}>
              <option value="todos">Todos os módulos</option>
              {conteudos.map((c) => <option key={c._id} value={c._id}>{c.nome}</option>)}
            </select>
            <select style={S.select} value={filtroDificuldade} onChange={(e) => setFiltroDificuldade(e.target.value)}>
              <option value="todas">Todas as dificuldades</option>
              {["Fácil", "Médio", "Difícil"].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div style={S.card}>
            {loading ? (
              <div style={{ color: "#4d6380", padding: "2rem", textAlign: "center" }}>Carregando...</div>
            ) : exercicios.length === 0 ? (
              <div style={{ color: "#4d6380", padding: "2rem", textAlign: "center" }}>Nenhum exercício encontrado.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
                  <thead>
                    <tr style={{ color: "#4d6380" }}>
                      {["Exercício", "Módulo", "Dificuldade", "Acesso", "Questões", "Ações"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: ".5rem .75rem", borderBottom: "1px solid rgba(55,138,221,.1)", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {exercicios.map((ex) => (
                      <tr key={ex._id} style={{ borderBottom: "1px solid rgba(55,138,221,.06)" }}>
                        <td style={{ padding: ".75rem" }}>
                          <div style={{ fontWeight: 600 }}>{ex.titulo}</div>
                          <div style={{ fontSize: "0.7rem", color: "#4d6380" }}>
                            Cadastrado em {new Date(ex.createdAt).toLocaleDateString("pt-BR")}
                          </div>
                        </td>
                        <td style={{ padding: ".75rem" }}>{(ex.conteudo_id as any)?.nome}</td>
                        <td style={{ padding: ".75rem" }}>
                          <span style={{ color: ex.dificuldade === "Fácil" ? "#3fcf8e" : ex.dificuldade === "Médio" ? "#f7c94f" : "#f74f6e", fontWeight: 700 }}>
                            {ex.dificuldade}
                          </span>
                        </td>
                        <td style={{ padding: ".75rem" }}>
                          <span style={S.badge(ex.tipoAcesso)}>{ex.tipoAcesso}</span>
                        </td>
                        <td style={{ padding: ".75rem" }}>{ex.questoes.length}</td>
                        <td style={{ padding: ".75rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button style={S.btn("ghost")} onClick={() => editar(ex)}>Editar</button>
                            <button style={S.btn("danger")} onClick={() => deletar(ex._id, ex.titulo)}>Excluir</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AdminPageShell>
  );
}
