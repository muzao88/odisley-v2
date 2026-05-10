"use client";

import React, { useState, useEffect, useCallback } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Stats {
  totalUsuarios: number;
  totalPremium: number;
  totalFree: number;
  totalConteudos: number;
  totalAulas: number;
  assinaturasAtivas: number;
  recentes: Usr[];
}
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

type Aba = "overview" | "usuarios" | "conteudos";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const api = (token: string) => ({
  get: (url: string) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) =>
      r.json(),
    ),
  post: (url: string, body: object) =>
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  patch: (url: string, body: object) =>
    fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  del: (url: string, body: object) =>
    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
});

// ─── CSS inline ───────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1e",
    color: "#e2e8f0",
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,

  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 2rem",
    height: 60,
    background: "#0d1426",
    borderBottom: "1px solid rgba(55,138,221,.18)",
    position: "sticky" as const,
    top: 0,
    zIndex: 50,
  },

  logo: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: "1.1rem",
    background: "linear-gradient(135deg, #378ADD, #185FA5)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

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

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN
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
      sessionStorage.setItem("admin_token", data.token);
      onLogin(data.token);
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0f1e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#0d1426",
          border: "1px solid rgba(55,138,221,.22)",
          borderRadius: 20,
          padding: "2.5rem",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              ...S.logo,
              fontSize: "1.6rem",
              display: "inline-block",
            }}
          >
            Odisley
          </div>
          <div
            style={{ fontSize: ".78rem", color: "#4d6380", marginTop: ".3rem" }}
          >
            Painel Administrativo
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: ".78rem",
                color: "#8fa4c8",
                marginBottom: ".4rem",
                fontWeight: 600,
              }}
            >
              Usuário
            </label>
            <input
              style={S.input}
              type="text"
              placeholder="admin"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: ".78rem",
                color: "#8fa4c8",
                marginBottom: ".4rem",
                fontWeight: 600,
              }}
            >
              Senha
            </label>
            <input
              style={S.input}
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && (
            <div
              style={{
                fontSize: ".78rem",
                color: "#f74f6e",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              ⚠ {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...S.btn("primary"),
              width: "100%",
              padding: ".75rem",
              fontSize: ".92rem",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Entrando..." : "Entrar no painel"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABA: VISÃO GERAL
// ═══════════════════════════════════════════════════════════════════════════════
function Overview({ token }: { token: string }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api(token).get("/api/admin/stats").then(setStats);
  }, [token]);

  if (!stats)
    return (
      <div style={{ color: "#4d6380", padding: "2rem" }}>Carregando...</div>
    );

  const statCards = [
    {
      label: "Total de usuários",
      value: stats.totalUsuarios,
      icon: "👥",
      color: "#378ADD",
    },
    {
      label: "Assinantes Premium",
      value: stats.totalPremium,
      icon: "⭐",
      color: "#f7c94f",
    },
    {
      label: "Usuários Gratuitos",
      value: stats.totalFree,
      icon: "🆓",
      color: "#8fa4c8",
    },
    {
      label: "Conteúdos",
      value: stats.totalConteudos,
      icon: "📚",
      color: "#3fcf8e",
    },
    {
      label: "Aulas cadastradas",
      value: stats.totalAulas,
      icon: "🎬",
      color: "#f7934f",
    },
    {
      label: "Assinaturas ativas",
      value: stats.assinaturasAtivas,
      icon: "💳",
      color: "#f7c94f",
    },
  ];

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Syne',sans-serif",
          fontWeight: 800,
          marginBottom: "1.5rem",
        }}
      >
        Visão Geral
      </h2>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {statCards.map((s) => (
          <div
            key={s.label}
            style={{ ...S.card, borderLeft: `3px solid ${s.color}` }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: ".4rem" }}>
              {s.icon}
            </div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: "1.8rem",
                fontWeight: 800,
                color: s.color,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: ".73rem",
                color: "#4d6380",
                marginTop: ".15rem",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Últimos cadastrados */}
      <div style={S.card}>
        <h3
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 700,
            marginBottom: "1rem",
            fontSize: ".95rem",
          }}
        >
          Últimos usuários cadastrados
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: ".82rem",
          }}
        >
          <thead>
            <tr style={{ color: "#4d6380" }}>
              <th
                style={{
                  textAlign: "left",
                  padding: ".5rem .75rem",
                  borderBottom: "1px solid rgba(55,138,221,.1)",
                }}
              >
                Nome
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: ".5rem .75rem",
                  borderBottom: "1px solid rgba(55,138,221,.1)",
                }}
              >
                E-mail
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: ".5rem .75rem",
                  borderBottom: "1px solid rgba(55,138,221,.1)",
                }}
              >
                Plano
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: ".5rem .75rem",
                  borderBottom: "1px solid rgba(55,138,221,.1)",
                }}
              >
                Cadastro
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.recentes.map((u) => (
              <tr
                key={u._id}
                style={{ borderBottom: "1px solid rgba(55,138,221,.06)" }}
              >
                <td style={{ padding: ".6rem .75rem" }}>{u.nome}</td>
                <td style={{ padding: ".6rem .75rem", color: "#8fa4c8" }}>
                  {u.email}
                </td>
                <td style={{ padding: ".6rem .75rem" }}>
                  <span style={S.badge(u.plano)}>{u.plano}</span>
                </td>
                <td style={{ padding: ".6rem .75rem", color: "#4d6380" }}>
                  {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABA: USUÁRIOS
// ═══════════════════════════════════════════════════════════════════════════════
function Usuarios({ token }: { token: string }) {
  const [users, setUsers] = useState<Usr[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api(token).get(
      `/api/admin/usuarios?page=${page}&q=${encodeURIComponent(q)}`,
    );
    setUsers(data.users ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [token, page, q]);

  useEffect(() => {
    load();
  }, [load]);

  const alterarPlano = async (userId: string, plano: "free" | "premium") => {
    await api(token).patch("/api/admin/usuarios", { userId, plano });
    load();
  };

  const deletar = async (userId: string, nome: string) => {
    if (!confirm(`Deletar o usuário "${nome}"? Esta ação é irreversível.`))
      return;
    await api(token).del("/api/admin/usuarios", { userId });
    load();
  };

  return (
    <div>
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
          <span
            style={{
              fontSize: ".8rem",
              color: "#4d6380",
              fontFamily: "inherit",
            }}
          >
            ({total})
          </span>
        </h2>
        <input
          style={{ ...S.input, width: 260 }}
          placeholder="Buscar por nome ou e-mail..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div style={S.card}>
        {loading ? (
          <div style={{ color: "#4d6380", padding: "1rem" }}>Carregando...</div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: ".82rem",
            }}
          >
            <thead>
              <tr style={{ color: "#4d6380" }}>
                {[
                  "Nome",
                  "E-mail",
                  "Plano",
                  "Progresso",
                  "Cadastro",
                  "Ações",
                ].map((h) => (
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
                <tr
                  key={u._id}
                  style={{ borderBottom: "1px solid rgba(55,138,221,.06)" }}
                >
                  <td style={{ padding: ".6rem .75rem", fontWeight: 500 }}>
                    {u.nome}
                  </td>
                  <td style={{ padding: ".6rem .75rem", color: "#8fa4c8" }}>
                    {u.email}
                  </td>
                  <td style={{ padding: ".6rem .75rem" }}>
                    <select
                      style={{
                        ...S.select,
                        padding: ".25rem .5rem",
                        fontSize: ".75rem",
                      }}
                      value={u.plano}
                      onChange={(e) =>
                        alterarPlano(
                          u._id,
                          e.target.value as "free" | "premium",
                        )
                      }
                    >
                      <option value="free">free</option>
                      <option value="premium">premium</option>
                    </select>
                  </td>
                  <td style={{ padding: ".6rem .75rem", color: "#8fa4c8" }}>
                    {u.progresso_total ?? 0}%
                  </td>
                  <td
                    style={{
                      padding: ".6rem .75rem",
                      color: "#4d6380",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td style={{ padding: ".6rem .75rem" }}>
                    <button
                      style={S.btn("danger")}
                      onClick={() => deletar(u._id, u.nome)}
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Paginação */}
        <div
          style={{
            display: "flex",
            gap: ".5rem",
            marginTop: "1rem",
            alignItems: "center",
          }}
        >
          <button
            style={S.btn("ghost")}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Anterior
          </button>
          <span style={{ fontSize: ".78rem", color: "#4d6380" }}>
            Página {page}
          </span>
          <button
            style={S.btn("ghost")}
            onClick={() => setPage((p) => p + 1)}
            disabled={users.length < 20}
          >
            Próxima →
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABA: CONTEÚDOS
// ═══════════════════════════════════════════════════════════════════════════════
const CATEGORIAS = [
  "Fundamentos",
  "Álgebra",
  "Funções",
  "Geometria",
  "Estatística e Probabilidade",
  "Matemática Discreta",
];

// ═══════════════════════════════════════════════════════════════════════════════
// PAINEL INLINE DE AULAS (por conteúdo)
// ═══════════════════════════════════════════════════════════════════════════════
function ConteudoAulasPanel({
  token,
  conteudo,
  onReloadConteudos,
}: {
  token: string;
  conteudo: Conteudo;
  onReloadConteudos: () => void;
}) {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [editando, setEditando] = useState<Aula | null>(null);
  const [loadingAulas, setLoadingAulas] = useState(true);
  const [form, setForm] = useState({
    titulo: "",
    video_url: "",
    duracao: "",
    descricao: "",
    tipo: "premium" as "free" | "premium",
  });

  const load = useCallback(async () => {
    setLoadingAulas(true);
    const data = await api(token).get(
      `/api/admin/aulas?conteudoId=${conteudo._id}`,
    );
    setAulas(Array.isArray(data) ? data : []);
    setLoadingAulas(false);
  }, [token, conteudo._id]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () =>
    setForm({
      titulo: "",
      video_url: "",
      duracao: "",
      descricao: "",
      tipo: "premium",
    });

  const salvar = async () => {
    if (!form.titulo) return alert("Título obrigatório.");
    if (editando) {
      await api(token).patch("/api/admin/aulas", { id: editando._id, ...form });
      setEditando(null);
    } else {
      await api(token).post("/api/admin/aulas", {
        ...form,
        conteudo_id: conteudo._id,
      });
    }
    resetForm();
    await load();
    onReloadConteudos();
  };

  const deletar = async (id: string, titulo: string) => {
    if (!confirm(`Deletar "${titulo}"?`)) return;
    await api(token).del("/api/admin/aulas", { id });
    await load();
    onReloadConteudos();
  };

  const iniciarEdicao = (a: Aula) => {
    setEditando(a);
    setForm({
      titulo: a.titulo,
      video_url: a.video_url,
      duracao: a.duracao,
      descricao: a.descricao,
      tipo: a.tipo,
    });
  };

  const innerCard: React.CSSProperties = {
    background: "#0d1426",
    border: "1px solid rgba(55,138,221,.1)",
    borderRadius: 10,
    padding: "1rem",
    marginBottom: ".75rem",
  };

  return (
    <div
      style={{
        marginTop: ".5rem",
        border: "1px solid rgba(55,138,221,.22)",
        borderRadius: 12,
        padding: "1.25rem",
        background: "#101828",
      }}
    >
      <h4
        style={{
          fontFamily: "'Syne',sans-serif",
          fontWeight: 700,
          fontSize: ".88rem",
          marginBottom: "1rem",
          color: "#378ADD",
        }}
      >
        🎬 Aulas de &ldquo;{conteudo.nome}&rdquo;
        <span
          style={{ fontWeight: 400, color: "#4d6380", marginLeft: ".5rem" }}
        >
          ({aulas.length} cadastradas)
        </span>
      </h4>

      {/* Mini formulário */}
      <div style={innerCard}>
        <div
          style={{
            fontSize: ".72rem",
            color: "#8fa4c8",
            marginBottom: ".6rem",
            fontWeight: 600,
          }}
        >
          {editando ? `✏️ Editando: ${editando.titulo}` : "➕ Nova aula"}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: ".5rem",
            marginBottom: ".5rem",
          }}
        >
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                fontSize: ".68rem",
                color: "#8fa4c8",
                display: "block",
                marginBottom: ".2rem",
              }}
            >
              Título *
            </label>
            <input
              style={S.input}
              placeholder="Ex: Introdução ao tema"
              value={form.titulo}
              onChange={(e) =>
                setForm((f) => ({ ...f, titulo: e.target.value }))
              }
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                fontSize: ".68rem",
                color: "#8fa4c8",
                display: "block",
                marginBottom: ".2rem",
              }}
            >
              URL do vídeo (YouTube)
            </label>
            <input
              style={S.input}
              placeholder="https://youtube.com/watch?v=..."
              value={form.video_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, video_url: e.target.value }))
              }
            />
          </div>
          <div>
            <label
              style={{
                fontSize: ".68rem",
                color: "#8fa4c8",
                display: "block",
                marginBottom: ".2rem",
              }}
            >
              Duração
            </label>
            <input
              style={S.input}
              placeholder="14:32"
              value={form.duracao}
              onChange={(e) =>
                setForm((f) => ({ ...f, duracao: e.target.value }))
              }
            />
          </div>
          <div>
            <label
              style={{
                fontSize: ".68rem",
                color: "#8fa4c8",
                display: "block",
                marginBottom: ".2rem",
              }}
            >
              Tipo
            </label>
            <select
              style={{ ...S.select, width: "100%" }}
              value={form.tipo}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  tipo: e.target.value as "free" | "premium",
                }))
              }
            >
              <option value="premium">⭐ Premium</option>
              <option value="free">🆓 Gratuita</option>
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                fontSize: ".68rem",
                color: "#8fa4c8",
                display: "block",
                marginBottom: ".2rem",
              }}
            >
              Descrição (opcional)
            </label>
            <input
              style={S.input}
              placeholder="Breve descrição da aula..."
              value={form.descricao}
              onChange={(e) =>
                setForm((f) => ({ ...f, descricao: e.target.value }))
              }
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: ".4rem" }}>
          <button style={S.btn("primary")} onClick={salvar}>
            {editando ? "Salvar alterações" : "Adicionar aula"}
          </button>
          {editando && (
            <button
              style={S.btn("ghost")}
              onClick={() => {
                setEditando(null);
                resetForm();
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Lista de aulas */}
      {loadingAulas ? (
        <div
          style={{
            color: "#4d6380",
            fontSize: ".8rem",
            textAlign: "center",
            padding: ".75rem",
          }}
        >
          Carregando aulas...
        </div>
      ) : aulas.length === 0 ? (
        <div
          style={{
            color: "#4d6380",
            fontSize: ".8rem",
            textAlign: "center",
            padding: ".75rem",
          }}
        >
          Nenhuma aula cadastrada ainda.
        </div>
      ) : (
        <div style={innerCard}>
          {aulas.map((a, idx) => (
            <div
              key={a._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".75rem",
                padding: ".6rem 0",
                borderBottom:
                  idx < aulas.length - 1
                    ? "1px solid rgba(55,138,221,.07)"
                    : "none",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "rgba(55,138,221,.12)",
                  color: "#378ADD",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: ".68rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {a.ordem}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: ".83rem",
                    marginBottom: ".12rem",
                  }}
                >
                  {a.titulo}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: ".6rem",
                    fontSize: ".68rem",
                    color: "#4d6380",
                  }}
                >
                  <span>⏱ {a.duracao || "—"}</span>
                  <span style={S.badge(a.tipo === "free" ? "free" : "premium")}>
                    {a.tipo === "free" ? "Gratuita" : "Premium"}
                  </span>
                  {a.video_url && (
                    <span style={{ color: "#3fcf8e" }}>✓ Vídeo</span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: ".3rem", flexShrink: 0 }}>
                <button
                  style={{
                    ...S.btn("ghost"),
                    padding: ".35rem .65rem",
                    fontSize: ".75rem",
                  }}
                  onClick={() => iniciarEdicao(a)}
                >
                  ✏️ Editar
                </button>
                <button
                  style={{
                    ...S.btn("danger"),
                    padding: ".35rem .65rem",
                    fontSize: ".75rem",
                  }}
                  onClick={() => deletar(a._id, a.titulo)}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABA: CONTEÚDOS
// ═══════════════════════════════════════════════════════════════════════════════
function Conteudos({ token }: { token: string }) {
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [form, setForm] = useState({
    nome: "",
    categoria: CATEGORIAS[0],
    descricao: "",
    icone: "📚",
    aulasGratuitas: 2,
  });
  const [editando, setEditando] = useState<Conteudo | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await api(token).get("/api/admin/conteudos");
    setConteudos(Array.isArray(data) ? data : []);
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const salvar = async () => {
    if (!form.nome) return alert("Nome obrigatório.");
    if (editando) {
      await api(token).patch("/api/admin/conteudos", {
        id: editando._id,
        ...form,
      });
      setEditando(null);
    } else {
      await api(token).post("/api/admin/conteudos", form);
    }
    setForm({
      nome: "",
      categoria: CATEGORIAS[0],
      descricao: "",
      icone: "📚",
      aulasGratuitas: 2,
    });
    load();
  };

  const deletar = async (id: string, nome: string) => {
    if (!confirm(`Deletar "${nome}"?`)) return;
    await api(token).del("/api/admin/conteudos", { id });
    load();
  };

  const iniciarEdicao = (c: Conteudo) => {
    setEditando(c);
    setForm({
      nome: c.nome,
      categoria: c.categoria,
      descricao: c.descricao,
      icone: c.icone,
      aulasGratuitas: c.aulasGratuitas ?? 2,
    });
    setExpandedId(null);
  };

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Syne',sans-serif",
          fontWeight: 800,
          marginBottom: "1.5rem",
        }}
      >
        Conteúdos / Matérias
      </h2>

      {/* Formulário */}
      <div style={{ ...S.card, marginBottom: "1.5rem" }}>
        <h3
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 700,
            fontSize: ".9rem",
            marginBottom: "1rem",
          }}
        >
          {editando ? `✏️ Editando: ${editando.nome}` : "➕ Novo conteúdo"}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
            gap: ".75rem",
            marginBottom: ".75rem",
          }}
        >
          <div>
            <label
              style={{
                fontSize: ".72rem",
                color: "#8fa4c8",
                display: "block",
                marginBottom: ".3rem",
              }}
            >
              Nome *
            </label>
            <input
              style={S.input}
              placeholder="Ex: Função Quadrática"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: ".72rem",
                color: "#8fa4c8",
                display: "block",
                marginBottom: ".3rem",
              }}
            >
              Categoria *
            </label>
            <select
              style={{ ...S.select, width: "100%" }}
              value={form.categoria}
              onChange={(e) =>
                setForm((f) => ({ ...f, categoria: e.target.value }))
              }
            >
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: ".72rem",
                color: "#8fa4c8",
                display: "block",
                marginBottom: ".3rem",
              }}
            >
              Ícone (emoji)
            </label>
            <input
              style={S.input}
              placeholder="📚"
              value={form.icone}
              onChange={(e) =>
                setForm((f) => ({ ...f, icone: e.target.value }))
              }
            />
          </div>
          <div>
            <label
              style={{
                fontSize: ".72rem",
                color: "#8fa4c8",
                display: "block",
                marginBottom: ".3rem",
              }}
            >
              Aulas gratuitas
            </label>
            <input
              style={S.input}
              type="number"
              min={0}
              placeholder="2"
              value={form.aulasGratuitas}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  aulasGratuitas: Number(e.target.value),
                }))
              }
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                fontSize: ".72rem",
                color: "#8fa4c8",
                display: "block",
                marginBottom: ".3rem",
              }}
            >
              Descrição
            </label>
            <input
              style={S.input}
              placeholder="Breve descrição do conteúdo..."
              value={form.descricao}
              onChange={(e) =>
                setForm((f) => ({ ...f, descricao: e.target.value }))
              }
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: ".5rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button style={S.btn("primary")} onClick={salvar}>
            {editando ? "Salvar alterações" : "Criar conteúdo"}
          </button>
          {editando && (
            <button
              style={S.btn("ghost")}
              onClick={() => {
                setEditando(null);
                setForm({
                  nome: "",
                  categoria: CATEGORIAS[0],
                  descricao: "",
                  icone: "📚",
                  aulasGratuitas: 2,
                });
              }}
            >
              Cancelar
            </button>
          )}
          {!editando && (
            <span style={{ fontSize: ".72rem", color: "#4d6380" }}>
              💡 &ldquo;Aulas gratuitas&rdquo; define quantas primeiras aulas
              ficam acessíveis para usuários free.
            </span>
          )}
        </div>
      </div>

      {/* Lista */}
      <div style={S.card}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: ".82rem",
          }}
        >
          <thead>
            <tr style={{ color: "#4d6380" }}>
              {[
                "Ícone",
                "Nome",
                "Categoria",
                "Gratuitas",
                "Total",
                "Ações",
              ].map((h) => (
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
            {conteudos.map((c) => (
              <React.Fragment key={c._id}>
                <tr
                  style={{
                    borderBottom:
                      expandedId === c._id
                        ? "none"
                        : "1px solid rgba(55,138,221,.06)",
                  }}
                >
                  <td style={{ padding: ".6rem .75rem", fontSize: "1.3rem" }}>
                    {c.icone}
                  </td>
                  <td style={{ padding: ".6rem .75rem", fontWeight: 600 }}>
                    {c.nome}
                  </td>
                  <td style={{ padding: ".6rem .75rem", color: "#8fa4c8" }}>
                    {c.categoria}
                  </td>
                  <td
                    style={{
                      padding: ".6rem .75rem",
                      color: "#3fcf8e",
                      fontWeight: 600,
                    }}
                  >
                    {c.aulasGratuitas ?? 0}
                  </td>
                  <td
                    style={{
                      padding: ".6rem .75rem",
                      color: "#378ADD",
                      fontWeight: 600,
                    }}
                  >
                    {c.totalAulas}
                  </td>
                  <td style={{ padding: ".6rem .75rem" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: ".4rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        style={S.btn("ghost")}
                        onClick={() => iniciarEdicao(c)}
                      >
                        Editar
                      </button>
                      <button
                        style={{
                          ...S.btn("primary"),
                          background:
                            expandedId === c._id
                              ? "rgba(55,138,221,.2)"
                              : "linear-gradient(135deg,#378ADD,#185FA5)",
                        }}
                        onClick={() =>
                          setExpandedId(expandedId === c._id ? null : c._id)
                        }
                      >
                        {expandedId === c._id
                          ? "▲ Fechar aulas"
                          : "▼ Gerenciar aulas"}
                      </button>
                      <button
                        style={S.btn("danger")}
                        onClick={() => deletar(c._id, c.nome)}
                      >
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedId === c._id && (
                  <tr>
                    <td colSpan={6} style={{ padding: ".25rem .75rem 1rem" }}>
                      <ConteudoAulasPanel
                        token={token}
                        conteudo={c}
                        onReloadConteudos={load}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {conteudos.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "1.5rem",
                    color: "#4d6380",
                    textAlign: "center",
                  }}
                >
                  Nenhum conteúdo cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABA: AULAS (mantida para retrocompatibilidade)
// ═══════════════════════════════════════════════════════════════════════════════
function Aulas({
  token,
  conteudo,
  onVoltar,
}: {
  token: string;
  conteudo: Conteudo;
  onVoltar: () => void;
}) {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [editando, setEditando] = useState<Aula | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    video_url: "",
    duracao: "",
    descricao: "",
    tipo: "premium" as "free" | "premium",
  });

  const load = useCallback(async () => {
    const data = await api(token).get(
      `/api/admin/aulas?conteudoId=${conteudo._id}`,
    );
    setAulas(Array.isArray(data) ? data : []);
  }, [token, conteudo._id]);

  useEffect(() => {
    load();
  }, [load]);

  const salvar = async () => {
    if (!form.titulo) return alert("Título obrigatório.");
    if (editando) {
      await api(token).patch("/api/admin/aulas", { id: editando._id, ...form });
      setEditando(null);
    } else {
      await api(token).post("/api/admin/aulas", {
        ...form,
        conteudo_id: conteudo._id,
      });
    }
    setForm({
      titulo: "",
      video_url: "",
      duracao: "",
      descricao: "",
      tipo: "premium",
    });
    load();
  };

  const deletar = async (id: string, titulo: string) => {
    if (!confirm(`Deletar a aula "${titulo}"?`)) return;
    await api(token).del("/api/admin/aulas", { id });
    load();
  };

  const iniciarEdicao = (a: Aula) => {
    setEditando(a);
    setForm({
      titulo: a.titulo,
      video_url: a.video_url,
      duracao: a.duracao,
      descricao: a.descricao,
      tipo: a.tipo,
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <button style={S.btn("ghost")} onClick={onVoltar}>
          ← Voltar
        </button>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>
          {conteudo.icone} {conteudo.nome}
          <span
            style={{
              fontSize: ".75rem",
              color: "#4d6380",
              fontWeight: 400,
              marginLeft: ".5rem",
            }}
          >
            ({aulas.length} aulas)
          </span>
        </h2>
      </div>

      {/* Formulário */}
      <div style={{ ...S.card, marginBottom: "1.5rem" }}>
        <h3
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 700,
            fontSize: ".9rem",
            marginBottom: "1rem",
          }}
        >
          {editando ? `✏️ Editando: ${editando.titulo}` : "➕ Nova aula"}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            gap: ".75rem",
            marginBottom: ".75rem",
          }}
        >
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                fontSize: ".72rem",
                color: "#8fa4c8",
                display: "block",
                marginBottom: ".3rem",
              }}
            >
              Título *
            </label>
            <input
              style={S.input}
              placeholder="Ex: Vértice da parábola"
              value={form.titulo}
              onChange={(e) =>
                setForm((f) => ({ ...f, titulo: e.target.value }))
              }
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                fontSize: ".72rem",
                color: "#8fa4c8",
                display: "block",
                marginBottom: ".3rem",
              }}
            >
              URL do vídeo (YouTube)
            </label>
            <input
              style={S.input}
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.video_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, video_url: e.target.value }))
              }
            />
          </div>
          <div>
            <label
              style={{
                fontSize: ".72rem",
                color: "#8fa4c8",
                display: "block",
                marginBottom: ".3rem",
              }}
            >
              Duração
            </label>
            <input
              style={S.input}
              placeholder="14:32"
              value={form.duracao}
              onChange={(e) =>
                setForm((f) => ({ ...f, duracao: e.target.value }))
              }
            />
          </div>
          <div>
            <label
              style={{
                fontSize: ".72rem",
                color: "#8fa4c8",
                display: "block",
                marginBottom: ".3rem",
              }}
            >
              Tipo
            </label>
            <select
              style={{ ...S.select, width: "100%" }}
              value={form.tipo}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  tipo: e.target.value as "free" | "premium",
                }))
              }
            >
              <option value="premium">Premium</option>
              <option value="free">Gratuita</option>
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label
              style={{
                fontSize: ".72rem",
                color: "#8fa4c8",
                display: "block",
                marginBottom: ".3rem",
              }}
            >
              Descrição
            </label>
            <input
              style={S.input}
              placeholder="Breve descrição da aula..."
              value={form.descricao}
              onChange={(e) =>
                setForm((f) => ({ ...f, descricao: e.target.value }))
              }
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button style={S.btn("primary")} onClick={salvar}>
            {editando ? "Salvar alterações" : "Adicionar aula"}
          </button>
          {editando && (
            <button
              style={S.btn("ghost")}
              onClick={() => {
                setEditando(null);
                setForm({
                  titulo: "",
                  video_url: "",
                  duracao: "",
                  descricao: "",
                  tipo: "premium",
                });
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Lista de aulas */}
      <div style={S.card}>
        {aulas.length === 0 ? (
          <div
            style={{ color: "#4d6380", textAlign: "center", padding: "1.5rem" }}
          >
            Nenhuma aula cadastrada ainda.
          </div>
        ) : (
          aulas.map((a) => (
            <div
              key={a._id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: ".85rem 0",
                borderBottom: "1px solid rgba(55,138,221,.07)",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(55,138,221,.12)",
                  color: "#378ADD",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: ".72rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {a.ordem}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: ".88rem",
                    marginBottom: ".15rem",
                  }}
                >
                  {a.titulo}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: ".75rem",
                    fontSize: ".72rem",
                    color: "#4d6380",
                  }}
                >
                  <span>⏱ {a.duracao || "—"}</span>
                  <span style={S.badge(a.tipo === "free" ? "free" : "premium")}>
                    {a.tipo}
                  </span>
                  {a.video_url && (
                    <span style={{ color: "#3fcf8e" }}>✓ Vídeo</span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: ".4rem", flexShrink: 0 }}>
                <button style={S.btn("ghost")} onClick={() => iniciarEdicao(a)}>
                  Editar
                </button>
                <button
                  style={S.btn("danger")}
                  onClick={() => deletar(a._id, a.titulo)}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAINEL PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
function Painel({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [aba, setAba] = useState<Aba>("overview");

  const abas: { id: Aba; label: string; icon: string }[] = [
    { id: "overview", label: "Visão Geral", icon: "📊" },
    { id: "usuarios", label: "Usuários", icon: "👥" },
    { id: "conteudos", label: "Conteúdos & Aulas", icon: "📚" },
  ];

  return (
    <div style={S.page}>
      {/* Navbar */}
      <nav style={S.nav}>
        <div style={S.logo}>Odisley Admin</div>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          {abas.map((a) => (
            <button
              key={a.id}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: aba === a.id ? "#378ADD" : "#4d6380",
                fontWeight: aba === a.id ? 700 : 500,
                fontSize: ".85rem",
                fontFamily: "'DM Sans',sans-serif",
                borderBottom:
                  aba === a.id ? "2px solid #378ADD" : "2px solid transparent",
                paddingBottom: ".25rem",
                transition: ".15s",
              }}
              onClick={() => setAba(a.id)}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
        <button style={S.btn("ghost")} onClick={onLogout}>
          Sair
        </button>
      </nav>

      {/* Conteúdo */}
      <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
        {aba === "overview" && <Overview token={token} />}
        {aba === "usuarios" && <Usuarios token={token} />}
        {aba === "conteudos" && <Conteudos token={token} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_token");
    if (saved) setToken(saved);
  }, []);

  const logout = () => {
    sessionStorage.removeItem("admin_token");
    setToken(null);
  };

  if (!token) return <LoginScreen onLogin={setToken} />;
  return <Painel token={token} onLogout={logout} />;
}
