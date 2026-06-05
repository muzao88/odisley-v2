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

        {/* Lado Esquerdo - Azul */}
        <div className="auth-modal-left">
          <img 
            src="/logo.png" 
            alt="Odisley" 
            style={{ 
              width: "260px", 
              display: "block", 
              margin: "0 auto 20px auto", 
              filter: "brightness(0) invert(1)",
              cursor: "pointer"
            }} 
            onClick={onClose}
          />
          <p style={{ opacity: 0.9, marginBottom: "30px" }}>Acesse sua plataforma de estudos.</p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            marginBottom: "30px"
          }}>
            {mathSymbols.map((sym, i) => (
              <div key={i} style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                height: "60px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                fontWeight: "bold"
              }}>
                {sym}
              </div>
            ))}
          </div>

          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            padding: "15px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{ width: "30px", height: "30px", backgroundColor: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a4fd6", fontWeight: "bold" }}>✓</div>
            <div>
              <div style={{ fontWeight: "bold" }}>10.000+ estudantes</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>já fazem parte da Odisley</div>
            </div>
          </div>
        </div>

        {/* Lado Direito - Branco */}
        <div className="auth-modal-right">
          <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "25px" }}>
            {tab === "login" ? "Entrar" : tab === "register" ? "Criar conta" : "Escolher Nome"}
          </h2>

          {tab === "update_name" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#555" }}>Como quer ser chamado?</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" }}
                />
              </div>
              {error && <div style={{ color: "#ef4444", fontSize: "0.85rem" }}>{error}</div>}
              <button
                onClick={handleUpdateName}
                disabled={loading || !newName.trim()}
                style={{ backgroundColor: "#1a4fd6", color: "#fff", padding: "12px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer" }}
              >
                {loading ? "Salvando..." : "Confirmar e Entrar"}
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={tab === "login" ? handleLogin : handleRegister} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {tab === "register" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#555" }}>Nome completo</label>
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={regNome}
                      onChange={(e) => setRegNome(e.target.value)}
                      required
                      style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" }}
                    />
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#555" }}>E-mail</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={tab === "login" ? loginEmail : regEmail}
                    onChange={(e) => tab === "login" ? setLoginEmail(e.target.value) : setRegEmail(e.target.value)}
                    required
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#555" }}>Senha</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={tab === "login" ? loginSenha : regSenha}
                      onChange={(e) => tab === "login" ? setLoginSenha(e.target.value) : setRegSenha(e.target.value)}
                      required
                      style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd", outline: "none", width: "100%", boxSizing: "border-box" }}
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
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("Em breve."); }} style={{ color: "#1a4fd6", fontSize: "0.8rem", fontWeight: "bold", textDecoration: "none" }}>
                    Esqueci minha senha
                  </a>
                )}

                {error && <div style={{ color: "#ef4444", fontSize: "0.85rem", textAlign: "center" }}>{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: "#1a4fd6", color: "#fff", padding: "12px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}
                >
                  {loading ? "Processando..." : tab === "login" ? "Entrar na plataforma" : "Criar conta grátis"}
                </button>
              </form>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#eee" }} />
                <span style={{ fontSize: "0.8rem", color: "#999" }}>ou</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#eee" }} />
              </div>

              <button
                onClick={handleGoogleClick}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer", fontWeight: "600", color: "#444" }}
              >
                <GoogleIcon />
                {tab === "login" ? "Entrar com Google" : "Cadastrar com Google"}
              </button>

              <div style={{ marginTop: "20px", textAlign: "center", fontSize: "0.85rem" }}>
                {tab === "login" ? (
                  <>Não tem conta? <a href="#" onClick={(e) => { e.preventDefault(); setTab("register"); }} style={{ color: "#1a4fd6", fontWeight: "bold", textDecoration: "none" }}>Criar gratuitamente</a></>
                ) : (
                  <>Já tem conta? <a href="#" onClick={(e) => { e.preventDefault(); setTab("login"); }} style={{ color: "#1a4fd6", fontWeight: "bold", textDecoration: "none" }}>Fazer login</a></>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
