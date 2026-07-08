'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { IconLock, IconArrowLeft, IconCheck } from '@tabler/icons-react';
import Link from 'next/link';
import './resetPassword.css';

function RedefinirSenhaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorMsg('Link inválido ou expirado. Por favor, solicite um novo link de redefinição.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (novaSenha !== confirmarSenha) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }
    
    if (novaSenha.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao redefinir a senha.');
      }

      setSuccess(true);
      
      // Opcional: Redirecionar para o login após alguns segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-pwd-card glass-panel">
      <Link href="/login" className="back-link">
        <IconArrowLeft size={20} /> Voltar para o Login
      </Link>
      
      <h2>Criar Nova Senha</h2>

      {success ? (
        <div className="success-message">
          <IconCheck size={48} className="success-icon" />
          <p>Senha alterada com sucesso!</p>
          <p className="small-text">Você será redirecionado para o login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="reset-pwd-form">
          <p className="form-description">
            Crie uma nova senha segura para a sua conta.
          </p>
          
          {errorMsg && <div className="error-message">{errorMsg}</div>}

          <div className="input-group">
            <IconLock className="input-icon" size={20} />
            <input
              type="password"
              required
              placeholder="Nova Senha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              disabled={!token || loading}
            />
          </div>
          
          <div className="input-group">
            <IconLock className="input-icon" size={20} />
            <input
              type="password"
              required
              placeholder="Confirmar Nova Senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              disabled={!token || loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !token} 
            className="submit-btn primary-btn"
          >
            {loading ? 'Salvando...' : 'Redefinir Senha'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function RedefinirSenha() {
  return (
    <div className="reset-pwd-container">
      <Suspense fallback={<div className="reset-pwd-card glass-panel">Carregando...</div>}>
        <RedefinirSenhaContent />
      </Suspense>
    </div>
  );
}
