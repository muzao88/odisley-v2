'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export default function FeedbackSection() {
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [likesPlatform, setLikesPlatform] = useState('');
  const [progressFeeling, setProgressFeeling] = useState('');
  const [comment, setComment] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [requestedContent, setRequestedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (token) {
      fetch('/api/feedback', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => {
        if (data.feedback) {
          setRating(data.feedback.rating);
          setLikesPlatform(data.feedback.likes_platform);
          setProgressFeeling(data.feedback.progress_feeling);
          setComment(data.feedback.comment || '');
          setSuggestion(data.feedback.suggestion || '');
          setRequestedContent(data.feedback.requested_content || '');
          setSubmitted(true);
        }
      })
      .catch(console.error)
      .finally(() => setFetching(false));
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !likesPlatform || !progressFeeling) {
      setMessage('⚠️ Por favor, preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          likes_platform: likesPlatform,
          progress_feeling: progressFeeling,
          comment,
          suggestion,
          requested_content: requestedContent
        })
      });

      if (res.ok) {
        setSubmitted(true);
        setIsEditing(false);
        setMessage('✅ Obrigado pelo seu feedback! Ele foi enviado com sucesso.');
      } else {
        setMessage('❌ Erro ao enviar feedback. Tente novamente.');
      }
    } catch {
      setMessage('❌ Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return null;

  if (submitted && !isEditing) {
    return (
      <div className="dashboard-card" style={{ marginTop: '2rem' }}>
        <div className="dc-header">
          <span className="dc-title">Sua Avaliação</span>
          <span className="dc-badge">Enviado</span>
        </div>
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <p style={{ fontWeight: 600, color: 'var(--text)' }}>Obrigado pelo seu feedback!</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: '0.5rem' }}>
            Sua opinião é muito importante para continuarmos melhorando a Odisley.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '1.2rem', color: 'var(--gold)', margin: '1rem 0' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} style={{ opacity: rating >= star ? 1 : 0.2 }}>★</span>
            ))}
          </div>
          <button 
            className="btn btn-ghost btn-sm" 
            style={{ marginTop: '0.5rem' }}
            onClick={() => setIsEditing(true)}
          >
            Editar minha avaliação
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card" style={{ marginTop: '2rem' }}>
      <div className="dc-header">
        <span className="dc-title">Avaliações e Sugestões</span>
        <span className="dc-badge">Feedback</span>
      </div>
      
      <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '1.5rem' }}>
        Queremos saber sua opinião! Como está sua experiência na plataforma?
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 1. Avaliação */}
        <div>
          <label className="form-label">Você está gostando da plataforma? *</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {['Sim', 'Mais ou menos', 'Não'].map(opt => (
              <button
                key={opt}
                type="button"
                className={`mtab ${likesPlatform === opt ? 'active' : ''}`}
                style={{ flex: 1, padding: '0.6rem' }}
                onClick={() => setLikesPlatform(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label">Nota de 1 a 5 estrelas *</label>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '1.8rem', color: 'var(--gold)', marginTop: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star} 
                style={{ cursor: 'pointer', opacity: rating >= star ? 1 : 0.2, transition: '0.2s' }}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label">Comentário opcional</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Conte-nos mais sobre sua experiência..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>

        <div className="dc-divider" />

        {/* 2. Desempenho */}
        <div>
          <label className="form-label">Como você sente que está evoluindo nos estudos? *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
            {['Estou evoluindo bem', 'Estou evoluindo aos poucos', 'Estou com dificuldade', 'Ainda não comecei'].map(opt => (
              <button
                key={opt}
                type="button"
                className={`mtab ${progressFeeling === opt ? 'active' : ''}`}
                style={{ padding: '0.6rem', fontSize: '0.75rem' }}
                onClick={() => setProgressFeeling(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="dc-divider" />

        {/* 3. Sugestões */}
        <div>
          <label className="form-label">O que podemos melhorar na plataforma?</label>
          <textarea
            className="form-input"
            rows={2}
            placeholder="Sugestões de funcionalidades, design, etc..."
            value={suggestion}
            onChange={e => setSuggestion(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>

        <div>
          <label className="form-label">Qual conteúdo você gostaria de ver aqui?</label>
          <input
            className="form-input"
            type="text"
            placeholder="Ex: Logaritmos, Probabilidade..."
            value={requestedContent}
            onChange={e => setRequestedContent(e.target.value)}
          />
        </div>

        {message && (
          <div style={{ 
            fontSize: '0.85rem', 
            color: message.includes('✅') ? 'var(--green)' : 'var(--red)',
            textAlign: 'center',
            background: message.includes('✅') ? 'rgba(63,207,142,0.1)' : 'rgba(247,79,110,0.1)',
            padding: '0.75rem',
            borderRadius: '8px'
          }}>
            {message}
          </div>
        )}

        <button 
          className="form-submit" 
          type="submit" 
          disabled={loading}
          style={{ marginTop: '0.5rem' }}
        >
          {loading ? 'Enviando...' : (submitted ? 'Atualizar minha avaliação' : 'Enviar avaliação')}
        </button>
      </form>
    </div>
  );
}
