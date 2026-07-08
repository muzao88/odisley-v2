'use client';

import { useState } from 'react';
import { IconMail, IconArrowLeft, IconCheck } from '@tabler/icons-react';
import Link from 'next/link';
import './forgotPassword.css';

export default function EsqueciMinhaSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar solicitação.');
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-pwd-container">
      <div className="forgot-pwd-card glass-panel">
        <Link href="/" className="back-link">
          <IconArrowLeft size={20} /> Voltar
        </Link>
        
        <h2>Esqueci minha senha</h2>

        {success ? (
          <div className="success-message">
            <IconCheck size={48} className="success-icon" />
            <p>Se esse e-mail existir no nosso sistema, você vai receber um link de redefinição em instantes.</p>
            <p className="small-text">Não esqueça de checar a caixa de spam.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="forgot-pwd-form">
            <p className="form-description">
              Digite seu e-mail cadastrado e enviaremos um link para você redefinir sua senha.
            </p>
            
            {errorMsg && <div className="error-message">{errorMsg}</div>}

            <div className="input-group">
              <IconMail className="input-icon" size={20} />
              <input
                type="email"
                required
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn primary-btn">
              {loading ? 'Enviando...' : 'Enviar link de redefinição'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
