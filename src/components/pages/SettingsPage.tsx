"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthContext";
import type { Page } from "@/types";

interface Props {
  onNavigate: (p: Page) => void;
  onOpenUpgrade?: () => void;
}

export default function SettingsPage({ onNavigate, onOpenUpgrade }: Props) {
  const { user, token, refreshUser, logout } = useAuth();
  const [nome, setNome] = useState(user?.nome ?? "");
  const [savingNome, setSavingNome] = useState(false);
  const [nomeMsg, setNomeMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Avatar upload
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ?? null);

  // Sync avatarPreview when user changes (e.g. on refresh)
  useEffect(() => {
    setAvatarPreview(user?.avatar ?? null);
  }, [user?.avatar]);

  // Security Modal
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmNewPwd, setConfirmNewPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Preferences
  const [isDark, setIsDark] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Danger Zone
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Sync theme status
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Load email notification setting
    const savedNotifs = localStorage.getItem("odisley_email_notifications");
    if (savedNotifs !== null) {
      setEmailNotifications(savedNotifs === "true");
    }

    return () => observer.disconnect();
  }, []);

  const handleToggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleToggleNotifications = () => {
    const next = !emailNotifications;
    setEmailNotifications(next);
    localStorage.setItem("odisley_email_notifications", String(next));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarMsg({ type: 'error', text: 'Formato inválido. Use JPG, PNG ou WEBP.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMsg({ type: 'error', text: 'Imagem muito grande. Limite: 2MB.' });
      return;
    }

    setAvatarLoading(true);
    setAvatarMsg(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setAvatarPreview(base64);
      try {
        const res = await fetch('/api/auth/upload-avatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar: base64 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao salvar foto.');
        await refreshUser();
        setAvatarMsg({ type: 'success', text: 'Foto de perfil atualizada!' });
        setTimeout(() => setAvatarMsg(null), 3000);
      } catch (err: any) {
        setAvatarMsg({ type: 'error', text: err.message });
        setAvatarPreview(user?.avatar ?? null); // revert
      } finally {
        setAvatarLoading(false);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleSaveNome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setNomeMsg({ type: "error", text: "Nome não pode ficar vazio." });
      return;
    }
    setSavingNome(true);
    setNomeMsg(null);
    try {
      const res = await fetch("/api/auth/update-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar nome.");
      }
      await refreshUser();
      setNomeMsg({ type: "success", text: "Nome atualizado com sucesso!" });
    } catch (err: any) {
      setNomeMsg({ type: "error", text: err.message });
    } finally {
      setSavingNome(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPwd || !newPwd || !confirmNewPwd) {
      setPwdMsg({ type: "error", text: "Preencha todos os campos." });
      return;
    }
    if (newPwd !== confirmNewPwd) {
      setPwdMsg({ type: "error", text: "As novas senhas não coincidem." });
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ type: "error", text: "A nova senha deve ter pelo menos 6 caracteres." });
      return;
    }

    setPwdLoading(true);
    setPwdMsg(null);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao alterar senha.");
      }
      setPwdMsg({ type: "success", text: "Senha alterada com sucesso!" });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmNewPwd("");
      setTimeout(() => {
        setPwdMsg(null);
      }, 3000);
    } catch (err: any) {
      setPwdMsg({ type: "error", text: err.message });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao excluir conta.");
      }
      logout();
      onNavigate("home");
    } catch (err: any) {
      setDeleteError(err.message);
      setDeleteLoading(false);
    }
  };

  // Modern Lavender Styling Tokens
  const cardStyle = !isDark ? {
    background: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: '14px',
    backdropFilter: 'blur(8px)',
    padding: '22px 24px',
    marginBottom: '20px',
  } : {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '22px 24px',
    marginBottom: '20px',
  };

  const titleStyle = !isDark ? {
    color: '#1e1b4b',
    fontWeight: '700',
    fontSize: '1.25rem',
    marginBottom: '4px',
    fontFamily: "'Syne', sans-serif",
  } : {
    color: 'var(--text)',
    fontWeight: '700',
    fontSize: '1.25rem',
    marginBottom: '4px',
    fontFamily: "'Syne', sans-serif",
  };

  const subStyle = !isDark ? {
    color: '#a78bfa',
    fontSize: '0.85rem',
    marginBottom: '20px',
    fontWeight: '500',
  } : {
    color: 'var(--text3)',
    fontSize: '0.85rem',
    marginBottom: '20px',
  };

  const inputStyle = !isDark ? {
    border: '1px solid rgba(139,92,246,0.2)',
    background: 'rgba(255,255,255,0.5)',
    borderRadius: '8px',
    padding: '11px 14px',
    color: '#1e1b4b',
    width: '100%',
    outline: 'none',
    fontSize: '0.95rem',
    transition: 'border-color 0.2s',
  } : {
    border: '1px solid var(--border)',
    background: 'var(--bg2)',
    borderRadius: '8px',
    padding: '11px 14px',
    color: 'var(--text)',
    width: '100%',
    outline: 'none',
    fontSize: '0.95rem',
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: "6px",
    color: isDark ? "var(--text)" : "#1e1b4b",
  };

  return (
    <div className="page" style={{ maxWidth: "720px", margin: "0 auto", padding: "3rem 1rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <div className="section-tag">Ajustes</div>
        <h2 className="section-title" style={{ fontSize: "2.5rem" }}>Configurações</h2>
        <p style={{ color: "var(--text2)", fontSize: "0.95rem", marginTop: "4px" }}>
          Gerencie seu perfil, assinatura, segurança e preferências.
        </p>
      </div>

      {/* 1. Informações Pessoais */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>Informações Pessoais</h3>
        <p style={subStyle}>Edite seus dados de identificação e contato.</p>
        {/* Avatar picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              onClick={() => !avatarLoading && avatarInputRef.current?.click()}
              title="Clique para alterar a foto"
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: avatarPreview ? 'transparent' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: avatarLoading ? 'not-allowed' : 'pointer',
                overflow: 'hidden',
                border: '2px solid rgba(124,58,237,0.4)',
                boxShadow: '0 0 0 3px rgba(124,58,237,0.1)',
                transition: 'box-shadow 0.2s, transform 0.2s',
                position: 'relative',
              }}
            >
              {avatarLoading ? (
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  animation: 'spin 0.8s linear infinite',
                }} />
              ) : avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem' }}>{getInitials(user?.nome)}</span>
              )}
              {/* Overlay escuro no hover */}
              {!avatarLoading && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  borderRadius: '50%',
                }} className="avatar-overlay">
                  <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>📷<br />Alterar</span>
                </div>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: isDark ? 'var(--text)' : '#1e1b4b', marginBottom: '4px' }}>Foto de Perfil</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text3)', lineHeight: 1.5 }}>Clique na foto para alterar.<br />JPG, PNG ou WEBP · Máx. 2MB</div>
            {avatarMsg && (
              <div style={{ fontSize: '0.8rem', fontWeight: 500, marginTop: '6px', color: avatarMsg.type === 'success' ? 'var(--green)' : 'var(--red)' }}>
                {avatarMsg.text}
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleSaveNome} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Nome Completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={inputStyle}
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label style={labelStyle}>E-mail (Não editável)</label>
            <input
              type="email"
              value={user?.email ?? ""}
              readOnly
              style={{ ...inputStyle, opacity: 0.65, cursor: "not-allowed" }}
            />
          </div>
          {nomeMsg && (
            <div style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: nomeMsg.type === "success" ? "var(--green)" : "var(--red)",
            }}>
              {nomeMsg.text}
            </div>
          )}
          <button
            type="submit"
            disabled={savingNome}
            className="btn btn-primary btn-sm"
            style={{ alignSelf: "flex-start", marginTop: "4px" }}
          >
            {savingNome ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>

      {/* 2. Segurança */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>Segurança</h3>
        <p style={subStyle}>Gerencie a senha de acesso à sua conta.</p>
        {(user?.provider === "google" || user?.provider === "apple") ? (
          <p style={{ fontSize: "0.88rem", color: "var(--text2)" }}>
            Sua conta está conectada através do login do <strong>{user?.provider}</strong>. Não é necessário senha local.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: isDark ? 'var(--text)' : '#1e1b4b', display: 'block', marginBottom: '6px' }}>
                Senha atual
              </label>
              <input
                type="password"
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: isDark ? 'var(--bg2)' : 'rgba(139,92,246,0.05)',
                  border: isDark ? '1px solid var(--border)' : '1px solid rgba(139,92,246,0.2)',
                  borderRadius: '8px', fontSize: '13px',
                  color: isDark ? 'var(--text)' : '#1e1b4b', outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: isDark ? 'var(--text)' : '#1e1b4b', display: 'block', marginBottom: '6px' }}>
                Nova senha
              </label>
              <input
                type="password"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: isDark ? 'var(--bg2)' : 'rgba(139,92,246,0.05)',
                  border: isDark ? '1px solid var(--border)' : '1px solid rgba(139,92,246,0.2)',
                  borderRadius: '8px', fontSize: '13px',
                  color: isDark ? 'var(--text)' : '#1e1b4b', outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: isDark ? 'var(--text)' : '#1e1b4b', display: 'block', marginBottom: '6px' }}>
                Confirmar nova senha
              </label>
              <input
                type="password"
                value={confirmNewPwd}
                onChange={e => setConfirmNewPwd(e.target.value)}
                placeholder="Repita a nova senha"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: isDark ? 'var(--bg2)' : 'rgba(139,92,246,0.05)',
                  border: isDark ? '1px solid var(--border)' : '1px solid rgba(139,92,246,0.2)',
                  borderRadius: '8px', fontSize: '13px',
                  color: isDark ? 'var(--text)' : '#1e1b4b', outline: 'none',
                }}
              />
            </div>
            {pwdMsg && (
              <div style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                color: pwdMsg.type === "success" ? "var(--green)" : "var(--red)",
              }}>
                {pwdMsg.text}
              </div>
            )}
            <button
              onClick={handleChangePassword}
              disabled={pwdLoading}
              style={{
                alignSelf: 'flex-start',
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                color: '#fff', fontSize: '13px', fontWeight: '600',
                borderRadius: '8px', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124,58,237,0.25)',
                opacity: pwdLoading ? 0.7 : 1,
              }}>
              {pwdLoading ? "Salvando..." : "Salvar nova senha"}
            </button>
          </div>
        )}
      </div>

      {/* 3. Preferências */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>Preferências</h3>
        <p style={subStyle}>Escolha como prefere usar o Odisley.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: isDark ? "var(--text)" : "#1e1b4b" }}>
                Tema Escuro (Dark Mode)
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text2)" }}>
                Alternar visualização entre os temas claro e escuro.
              </div>
            </div>
            <button
              onClick={handleToggleTheme}
              style={{
                background: isDark ? "var(--accent)" : "rgba(139,92,246,0.2)",
                border: "none",
                width: "48px",
                height: "26px",
                borderRadius: "999px",
                position: "relative",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              <div style={{
                width: "20px",
                height: "20px",
                background: "#fff",
                borderRadius: "50%",
                position: "absolute",
                top: "3px",
                left: isDark ? "25px" : "3px",
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: isDark ? "var(--text)" : "#1e1b4b" }}>
                Notificações por E-mail
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text2)" }}>
                Receba lembretes de estudos e novidades na plataforma.
              </div>
            </div>
            <button
              onClick={handleToggleNotifications}
              style={{
                background: emailNotifications ? "var(--accent)" : "rgba(139,92,246,0.2)",
                border: "none",
                width: "48px",
                height: "26px",
                borderRadius: "999px",
                position: "relative",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              <div style={{
                width: "20px",
                height: "20px",
                background: "#fff",
                borderRadius: "50%",
                position: "absolute",
                top: "3px",
                left: emailNotifications ? "25px" : "3px",
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Plano Atual */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>Assinatura</h3>
        <p style={subStyle}>Veja detalhes e status do seu plano ativo.</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: 700, fontSize: "1.1rem", color: isDark ? "var(--text)" : "#1e1b4b" }}>
                Plano {user?.plano === "premium" ? "Premium" : "Gratuito"}
              </span>
              <span style={{
                display: "inline-flex",
                background: user?.plano === "premium" ? "linear-gradient(135deg, #7c3aed, #2563eb)" : "rgba(139,92,246,0.15)",
                color: user?.plano === "premium" ? "#fff" : "var(--accent)",
                fontSize: "10px",
                fontWeight: "700",
                padding: "3px 9px",
                borderRadius: "999px",
              }}>
                {user?.plano === "premium" ? "ATIVO" : "BÁSICO"}
              </span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text2)", marginTop: "4px" }}>
              {user?.plano === "premium"
                ? "Você tem acesso irrestrito a todos os conteúdos, videoaulas e exercícios."
                : "Aproveite a demonstração gratuita ou faça upgrade para liberar todo o site."}
            </p>
          </div>
          {user?.plano !== "premium" && (
            <button
              onClick={() => {
                if (onOpenUpgrade) onOpenUpgrade();
                else onNavigate("planos");
              }}
              className="btn"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                padding: "10px 20px",
                borderRadius: "8px",
                boxShadow: "0 4px 15px rgba(124,58,237,0.25)",
                cursor: "pointer",
              }}
            >
              Fazer upgrade
            </button>
          )}
        </div>
      </div>

      {/* 5. Danger Zone */}
      <div style={{ ...cardStyle, border: isDark ? "1px solid rgba(ef,68,68,0.2)" : "1px solid rgba(239,68,68,0.3)", background: isDark ? "rgba(239,68,68,0.02)" : "rgba(239,68,68,0.02)" }}>
        <h3 style={{ ...titleStyle, color: "var(--red)" }}>Zona de Perigo</h3>
        <p style={subStyle}>Ações destrutivas e irreversíveis.</p>
        {!deleteConfirmOpen ? (
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="btn btn-ghost btn-sm"
            style={{ borderColor: "rgba(239,68,68,0.4)", color: "var(--red)", background: "transparent" }}
          >
            Excluir Conta
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--red)", fontWeight: 500 }}>
              ⚠️ Atenção: Isso excluirá permanentemente seu cadastro, progresso e feedbacks. Não há como reverter.
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="btn btn-sm"
                style={{ background: "var(--red)", color: "#fff", border: "none" }}
              >
                {deleteLoading ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleteLoading}
                className="btn btn-ghost btn-sm"
              >
                Cancelar
              </button>
            </div>
            {deleteError && (
              <div style={{ fontSize: "0.85rem", color: "var(--red)", fontWeight: 500 }}>
                {deleteError}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
