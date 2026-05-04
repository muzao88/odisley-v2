'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import type { AuthTab } from '@/types';

interface Props { isOpen: boolean; initialTab: AuthTab; onClose: () => void; }

export default function AuthModal({ isOpen, initialTab, onClose }: Props) {
  const { login } = useAuth();
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSenha, setRegSenha] = useState('');

  // Captura o token do Google quando volta do redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash.includes('id_token')) return;

    const params = new URLSearchParams(hash.slice(1));
    const id_token = params.get('id_token');
    if (!id_token) return;

    // Limpa o hash da URL
    window.history.replaceState({}, '', window.location.pathname);

    // Faz login com o token do Google
    fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: id_token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.token) login(data.user, data.token);
      })
      .catch(() => {});
  }, []);

  const handleGoogleClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'SEU_GOOGLE_CLIENT_ID') {
      setError('Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID no .env.local.');
      return;
    }

    // Redireciona a página inteira — sem popup, sem bloqueio
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/api/auth/google/callback`,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: Math.random().toString(36).slice(2),
      prompt: 'select_account',
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  const handleLogin = async () => {
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, senha: loginSenha }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      login(data.user, data.token); onClose();
    } catch { setError('Erro de conexão.'); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: regNome, email: regEmail, senha: regSenha }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      login(data.user, data.token); onClose();
    } catch { setError('Erro de conexão.'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const oauthBtn: React.CSSProperties = {
    width: '100%', padding: '.75rem 1rem',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '.75rem',
    background: 'var(--bg3)', border: '1px solid var(--border2)',
    borderRadius: 10, cursor: 'pointer', transition: '.2s',
    fontFamily: "'DM Sans', sans-serif", fontSize: '.9rem', fontWeight: 500,
    color: 'var(--text)',
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-logo">Odisley</div>

        <div className="modal-tabs">
          <button className={`mtab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}>Entrar</button>
          <button className={`mtab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}>Criar conta</button>
        </div>

        {/* OAuth */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '1.25rem' }}>

          {/* Google — redireciona a página, sem popup */}
          <button style={oauthBtn} onClick={handleGoogleClick}
            onMouseOver={e => (e.currentTarget.style.borderColor = '#4f8ef7')}
            onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border2)')}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {`${tab === 'login' ? 'Entrar' : 'Cadastrar'} com Google`}
          </button>

          {/* Apple */}
          <button style={{ ...oauthBtn, opacity: .4, cursor: 'not-allowed' }} disabled>
            <svg width="15" height="17" viewBox="0 0 814 1000" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-107.9C58.3 645.1 36 506.7 36 372.8c0-194.3 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
            </svg>
            {tab === 'login' ? 'Entrar' : 'Cadastrar'} com Apple
            <span style={{ fontSize: '.68rem', color: 'var(--text3)' }}>(em breve)</span>
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.1rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: '.72rem', color: 'var(--text3)' }}>ou com e-mail</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Formulário */}
        {tab === 'login' ? (
          <>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input type="email" className="form-input" placeholder="seu@email.com"
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input type="password" className="form-input" placeholder="••••••••"
                value={loginSenha} onChange={e => setLoginSenha(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button className="form-submit" onClick={handleLogin} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar na plataforma'}
            </button>
            <div className="modal-switch">
              Não tem conta?{' '}
              <a onClick={() => { setTab('register'); setError(''); }}>Criar gratuitamente</a>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input type="text" className="form-input" placeholder="Seu nome"
                value={regNome} onChange={e => setRegNome(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input type="email" className="form-input" placeholder="seu@email.com"
                value={regEmail} onChange={e => setRegEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input type="password" className="form-input" placeholder="Mínimo 6 caracteres"
                value={regSenha} onChange={e => setRegSenha(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()} />
            </div>
            {error && <div className="form-error">{error}</div>}
            <button className="form-submit" onClick={handleRegister} disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
            <div className="modal-switch">
              Já tem conta?{' '}
              <a onClick={() => { setTab('login'); setError(''); }}>Entrar</a>
            </div>
          </>
        )}

        <div style={{ fontSize: '.67rem', color: 'var(--text3)', textAlign: 'center', marginTop: '.85rem', lineHeight: 1.5 }}>
          Ao continuar, você concorda com os{' '}
          <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>Termos de uso</span>
          {' '}e{' '}
          <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>Política de privacidade</span>.
        </div>
      </div>
    </div>
  );
}
