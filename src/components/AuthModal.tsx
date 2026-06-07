"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import type { AuthTab } from "@/types";

interface Props {
  isOpen: boolean;
  initialTab: AuthTab;
  onClose: () => void;
}

export default function AuthModal({ isOpen, initialTab, onClose }: Props) {
  const { login } = useAuth();
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [regNome, setRegNome] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regSenha, setRegSenha] = useState("");
  const [newName, setNewName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setTab(initialTab);
    setError("");
  }, [initialTab, isOpen]);

  // Captura o token do Google quando volta do redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash.includes("id_token")) return;

    const params = new URLSearchParams(hash.slice(1));
    const id_token = params.get("id_token");
    if (!id_token) return;

    window.history.replaceState({}, "", window.location.pathname);

    fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: id_token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.token) {
          login(data.user, data.token);
          if (data.isNewUser) {
            setTab("update_name");
          } else {
            onClose();
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleGoogleClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === "SEU_GOOGLE_CLIENT_ID") {
      setError("Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
      return;
    }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/api/auth/google/callback`,
      response_type: "id_token",
      scope: "openid email profile",
      nonce: Math.random().toString(36).slice(2),
      prompt: "select_account",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, senha: loginSenha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      login(data.user, data.token);
      onClose();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: regNome, email: regEmail, senha: regSenha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      login(data.user, data.token);
      onClose();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    setError("");
    setLoading(true);
    try {
      const t = localStorage.getItem("odisley_token");
      if (!t) return;
      const res = await fetch("/api/auth/update-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ nome: newName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      login(data.user, t);
      onClose();
    } catch {
      setError("Erro ao atualizar nome.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const mathSymbols = ["∑", "π", "∫", "x²", "√", "∞", "θ", "Δ", "≠"];

  const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="auth-modal-container">
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "#888",
            zIndex: 10
          }}
        >
          ✕
        </button>

        {/* Lado Esquerdo - Gradiente */}
        <div className="auth-modal-left" style={{
          background: 'linear-gradient(145deg, #1e1b4b 0%, #3730a3 40%, #1d4ed8 100%)',
          padding: '36px 32px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow superior direito */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '220px', height: '220px', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.35) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          {/* Glow inferior esquerdo */}
          <div style={{
            position: 'absolute', bottom: '-40px', left: '-40px',
            width: '180px', height: '180px', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Conteúdo do lado esquerdo */}
          <div style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            gap: '24px', height: '100%',
          }}>
            {/* Logo no topo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }} onClick={onClose}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 18 18">
                  <text x="9" y="14" textAnchor="middle" fontSize="14" fontWeight="800" fill="white" fontFamily="-apple-system,sans-serif">O</text>
                </svg>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff', letterSpacing: '-.3px', cursor: 'pointer' }}>Odisley</span>
            </div>

            {/* Título + subtítulo + grid no meio */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{
                fontSize: '22px', fontWeight: '800', color: '#fff',
                letterSpacing: '-.5px', lineHeight: 1.3, marginBottom: '10px',
              }}>
                A plataforma definitiva para o seu aprendizado.
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                Matemática para vestibular e ENEM com trilha completa e progresso rastreado aula por aula.
              </p>

              {/* Grid de símbolos matemáticos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '20px' }}>
                {mathSymbols.map(s => (
                  <div key={s} style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px', padding: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', color: 'rgba(255,255,255,0.7)', fontWeight: '600',
                  }}>{s}</div>
                ))}
              </div>
            </div>

            {/* Badge inferior — compacto */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px', padding: '12px 16px',
              position: 'relative', zIndex: 1,
              alignSelf: 'flex-start',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', color: '#fff', flexShrink: 0,
              }}>✓</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap' }}>
                  Mais de 10.000
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '1px', whiteSpace: 'nowrap' }}>
                  estudantes ativos na plataforma
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito - Fundo lavanda */}
        <div className="auth-modal-right" style={{
          background: '#f3f0ff', padding: '36px 32px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-80px', right: '-80px',
            width: '260px', height: '260px', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.10) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1e1b4b', letterSpacing: '-.5px', marginBottom: '4px' }}>
            {tab === "login" ? "Entrar na conta" : tab === "register" ? "Criar conta" : "Escolher Nome"}
          </h1>
          <p style={{ fontSize: '13px', color: '#a78bfa', marginBottom: '24px' }}>
            {tab === "login" ? "Bem-vindo de volta! 👋" : tab === "register" ? "Cadastre-se para começar! 🚀" : "Quase lá! 🎉"}
          </p>

          {tab === "update_name" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#1e1b4b', marginBottom: '6px', display: 'block' }}>Como quer ser chamado?</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px',
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: '9px', fontSize: '13px', color: '#1e1b4b',
                    outline: 'none',
                  }}
                />
              </div>
              {error && <div style={{ color: "#ef4444", fontSize: "0.85rem" }}>{error}</div>}
              <button
                onClick={handleUpdateName}
                disabled={loading || !newName.trim()}
                style={{
                  width: '100%', padding: '12px',
                  background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  color: '#fff', fontSize: '14px', fontWeight: '700',
                  borderRadius: '10px', border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(124,58,237,0.30)',
                }}
              >
                {loading ? "Salvando..." : "Confirmar e Entrar"}
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={tab === "login" ? handleLogin : handleRegister} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {tab === "register" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#1e1b4b', marginBottom: '6px', display: 'block' }}>Nome completo</label>
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={regNome}
                      onChange={(e) => setRegNome(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '10px 14px',
                        background: 'rgba(255,255,255,0.7)',
                        border: '1px solid rgba(139,92,246,0.2)',
                        borderRadius: '9px', fontSize: '13px', color: '#1e1b4b',
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#1e1b4b', marginBottom: '6px', display: 'block' }}>E-mail</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={tab === "login" ? loginEmail : regEmail}
                    onChange={(e) => tab === "login" ? setLoginEmail(e.target.value) : setRegEmail(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '10px 14px',
                      background: 'rgba(255,255,255,0.7)',
                      border: '1px solid rgba(139,92,246,0.2)',
                      borderRadius: '9px', fontSize: '13px', color: '#1e1b4b',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#1e1b4b', marginBottom: '6px', display: 'block' }}>Senha</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={tab === "login" ? loginSenha : regSenha}
                      onChange={(e) => tab === "login" ? setLoginSenha(e.target.value) : setRegSenha(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '10px 45px 10px 14px',
                        background: 'rgba(255,255,255,0.7)',
                        border: '1px solid rgba(139,92,246,0.2)',
                        borderRadius: '9px', fontSize: '13px', color: '#1e1b4b',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#888", cursor: "pointer" }}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                {tab === "login" && (
                  <span onClick={(e) => { e.preventDefault(); alert("Em breve."); }} style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '500', cursor: 'pointer' }}>
                    Esqueci minha senha
                  </span>
                )}

                {error && <div style={{ color: "#ef4444", fontSize: "0.85rem", textAlign: "center" }}>{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '12px',
                    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                    color: '#fff', fontSize: '14px', fontWeight: '700',
                    borderRadius: '10px', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(124,58,237,0.30)',
                    marginBottom: '14px',
                  }}
                >
                  {loading ? "Processando..." : tab === "login" ? "Entrar na plataforma" : "Criar conta grátis"}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
                <span style={{ fontSize: '11px', color: '#a78bfa' }}>ou</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
              </div>

              <button
                onClick={handleGoogleClick}
                style={{
                  width: '100%', padding: '11px',
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  borderRadius: '10px', fontSize: '13px', fontWeight: '500',
                  color: '#1e1b4b', cursor: 'pointer', marginBottom: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <GoogleIcon />
                {tab === "login" ? "Entrar com Google" : "Cadastrar com Google"}
              </button>

              <p style={{ fontSize: '12px', color: '#a78bfa', textAlign: 'center' }}>
                {tab === "login" ? (
                  <>Não tem uma conta?{' '}<span onClick={(e) => { e.preventDefault(); setTab("register"); }} style={{ color: '#7c3aed', fontWeight: '600', cursor: 'pointer' }}>Criar conta</span></>
                ) : (
                  <>Já tem uma conta?{' '}<span onClick={(e) => { e.preventDefault(); setTab("login"); }} style={{ color: '#7c3aed', fontWeight: '600', cursor: 'pointer' }}>Fazer login</span></>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
