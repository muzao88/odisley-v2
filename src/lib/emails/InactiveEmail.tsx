import React from 'react';

interface InactiveEmailProps {
  nome: string;
}

export function InactiveEmail({ nome }: InactiveEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://odisley-v2.vercel.app';

  return (
    <div
      style={{
        backgroundColor: '#0b0b18',
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: '#f1f0ff',
        margin: '0',
        padding: '30px 10px',
      }}
    >
      <table
        align="center"
        border={0}
        cellPadding={0}
        cellSpacing={0}
        width="100%"
        style={{
          maxWidth: '600px',
          backgroundColor: '#0a0a16',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(124, 58, 237, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Header */}
        <tbody>
          <tr>
            <td
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%)',
                padding: '32px 24px',
                textAlign: 'center',
              }}
            >
              <h1
                style={{
                  color: '#ffffff',
                  fontSize: '24px',
                  fontWeight: '800',
                  margin: '0 0 6px 0',
                  letterSpacing: '-0.5px',
                }}
              >
                Odisley Matemática
              </h1>
              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '14px',
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                Sentimos sua falta na plataforma! 📚
              </p>
            </td>
          </tr>

          {/* Body */}
          <tr>
            <td style={{ padding: '32px 28px' }}>
              <h2
                style={{
                  color: '#ffffff',
                  fontSize: '20px',
                  fontWeight: '700',
                  marginTop: '0',
                  marginBottom: '16px',
                }}
              >
                Olá, {nome}!
              </h2>

              <p
                style={{
                  color: '#8fa4c8',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                }}
              >
                Notamos que você não acessa suas aulas de matemática há alguns dias. Sabemos que a rotina pode ser corrida, mas a <strong>constância nos estudos</strong> é o segredo para garantir uma excelente pontuação no ENEM!
              </p>

              <div
                style={{
                  backgroundColor: '#111124',
                  borderRadius: '12px',
                  padding: '20px',
                  borderLeft: '4px solid #f7934f',
                  marginBottom: '24px',
                }}
              >
                <p
                  style={{
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
                    margin: '0 0 6px 0',
                  }}
                >
                  💡 Dica de estudo do dia:
                </p>
                <p
                  style={{
                    color: '#8fa4c8',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    margin: 0,
                  }}
                >
                  Mesmo 15 a 20 minutos por dia já fazem uma enorme diferença na retenção do conteúdo e mantêm seu hábito de estudos ativo.
                </p>
              </div>

              {/* CTA Button */}
              <div style={{ textAlign: 'center', margin: '32px 0 24px 0' }}>
                <a
                  href={baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    padding: '14px 32px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
                  }}
                >
                  Retomando meus estudos
                </a>
              </div>

              <p
                style={{
                  color: '#8fa4c8',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  marginBottom: '0',
                }}
              >
                Estamos torcendo pelo seu sucesso. Vamos juntos mandar muito bem na prova! 💪
              </p>
            </td>
          </tr>

          {/* Footer */}
          <tr>
            <td
              style={{
                backgroundColor: '#06060f',
                padding: '20px 24px',
                textAlign: 'center',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <p style={{ color: '#4d6380', fontSize: '12px', margin: '0 0 8px 0' }}>
                © {new Date().getFullYear()} Odisley Matemática. Todos os direitos reservados.
              </p>
              <p style={{ color: '#4d6380', fontSize: '11px', margin: 0 }}>
                Você está recebendo este e-mail por ser aluno cadastrado na Odisley. |{' '}
                <a
                  href={`${baseUrl}`}
                  style={{ color: '#8fa4c8', textDecoration: 'underline' }}
                >
                  Gerenciar preferências de e-mail
                </a>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
