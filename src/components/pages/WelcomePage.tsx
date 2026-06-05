"use client";

import React, { useState } from "react";
import { useAuth } from "../AuthContext";

interface Props {
  onContinue: () => void;
}

export default function WelcomePage({ onContinue }: Props) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  
  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  
  // Register states
  const [regNome, setRegNome] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regSenha, setRegSenha] = useState("");

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
        body: JSON.stringify({
          nome: regNome,
          email: regEmail,
          senha: regSenha,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      login(data.user, data.token);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === "SEU_GOOGLE_CLIENT_ID") {
      alert("Configuração do Google pendente.");
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
    <div className="welcome-container">
      {/* Lado Esquerdo - Azul Royal */}
      <div className="welcome-left">
        <div style={{ maxWidth: "400px", width: "100%", zIndex: 2 }}>
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
            onClick={onContinue}
          />
          <p style={{ fontSize: "1.2rem", opacity: 0.9, marginBottom: "40px" }}>A plataforma definitiva para o seu aprendizado.</p>
          
          {/* Grid 3x3 de Símbolos Matemáticos */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "15px",
            marginBottom: "40px"
          }}>
            {mathSymbols.map((sym, i) => (
              <div key={i} style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                height: "80px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: "bold"
              }}>
                {sym}
              </div>
            ))}
          </div>

          {/* Card de Social Proof */}
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            padding: "20px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "15px"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#fff",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1a4fd6",
              fontSize: "1.2rem"
            }}>
              ✓
            </div>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Mais de 10.000</div>
              <div style={{ opacity: 0.8, fontSize: "0.9rem" }}>estudantes ativos na plataforma</div>
            </div>
          </div>
        </div>
        
        {/* Elemento Decorativo de Fundo */}
        <div style={{
          position: "absolute",
          top: "-10%",
          right: "-10%",
          width: "300px",
          height: "300px",
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          borderRadius: "50%",
          zIndex: 1
        }} />
      </div>

      {/* Lado Direito - Branco */}
      <div className="welcome-right">
        <div style={{ maxWidth: "400px", width: "100%" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "30px", color: "#333" }}>
            {isLogin ? "Entrar na conta" : "Criar sua conta"}
          </h2>

          <form onSubmit={isLogin ? handleLogin : handleRegister} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {!isLogin && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#555" }}>Nome completo</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={regNome}
                  onChange={(e) => setRegNome(e.target.value)}
                  required={!isLogin}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "1rem",
                    outline: "none"
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#555" }}>E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={isLogin ? loginEmail : regEmail}
                onChange={(e) => isLogin ? setLoginEmail(e.target.value) : setRegEmail(e.target.value)}
                required
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "1rem",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#555" }}>Senha</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={isLogin ? loginSenha : regSenha}
                  onChange={(e) => isLogin ? setLoginSenha(e.target.value) : setRegSenha(e.target.value)}
                  required
                  style={{
                    padding: "12px 45px 12px 16px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "1rem",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#888"
                  }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <div style={{ textAlign: "left" }}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert("Em breve: recuperação de senha."); }}
                  style={{ color: "#1a4fd6", fontSize: "0.85rem", textDecoration: "none", fontWeight: "600" }}
                >
                  Esqueci minha senha
                </a>
              </div>
            )}

            {error && (
              <div style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "10px", borderRadius: "8px", fontSize: "0.9rem", textAlign: "center" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "#1a4fd6",
                color: "#fff",
                padding: "14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "10px",
                transition: "opacity 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
            >
              {loading ? "Processando..." : isLogin ? "Entrar na plataforma" : "Criar minha conta"}
            </button>
          </form>

          {/* Divisor "ou" */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "25px 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#eee" }} />
            <span style={{ fontSize: "0.8rem", color: "#999", fontWeight: "500" }}>ou</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#eee" }} />
          </div>

          {/* Botão Google */}
          <button
            onClick={handleGoogleClick}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              backgroundColor: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: "600",
              color: "#444"
            }}
          >
            <GoogleIcon />
            {isLogin ? "Entrar com Google" : "Cadastrar com Google"}
          </button>

          {/* Link para alternar entre Login/Register */}
          <div style={{ marginTop: "30px", textAlign: "center", fontSize: "0.9rem", color: "#666" }}>
            {isLogin ? (
              <>
                Não tem uma conta?{" "}
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setIsLogin(false); setError(""); }}
                  style={{ color: "#1a4fd6", fontWeight: "bold", textDecoration: "none" }}
                >
                  Criar conta
                </a>
              </>
            ) : (
              <>
                Já tem uma conta?{" "}
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setIsLogin(true); setError(""); }}
                  style={{ color: "#1a4fd6", fontWeight: "bold", textDecoration: "none" }}
                >
                  Fazer login
                </a>
              </>
            )}
          </div>
          
          {/* Link para continuar sem login (mantendo funcionalidade) */}
          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onContinue(); }}
              style={{ color: "#999", fontSize: "0.8rem", textDecoration: "none" }}
            >
              Continuar sem login
            </a>
          </div>
      </div>
    </div>
  </div>
  );
}
