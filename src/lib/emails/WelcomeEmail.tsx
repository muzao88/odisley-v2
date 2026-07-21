import React from 'react';

interface WelcomeEmailProps {
  nome: string;
}

export function WelcomeEmail({ nome }: WelcomeEmailProps) {
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
                background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #2563eb 100%)',
                padding: '32px 24px',
                textAlign: 'center',
              }}
            >
              <h1
                style={{
                  color: '#ffffff',
                  fontSize: '26px',
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
                Sua jornada rumo à aprovação no ENEM e Vestibulares! 🚀
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
                Olá, {nome}! 👋
              </h2>

              <p
                style={{
                  color: '#8fa4c8',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                }}
              >
                Seja muito bem-vindo(a) à plataforma <strong style={{ color: '#7c3aed' }}>Odisley</strong>! Estamos empolgados em acompanhar você nessa conquista.
              </p>

              <div
                style={{
                  backgroundColor: '#111124',
                  borderRadius: '12px',
                  padding: '20px',
                  borderLeft: '4px solid #7c3aed',
                  marginBottom: '24px',
                }}
              >
                <h3
                  style={{
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: '600',
                    margin: '0 0 10px 0',
                  }}
                >
                  O que você encontra na plataforma:
                </h3>
                <ul
                  style={{
                    color: '#8fa4c8',
                    fontSize: '14px',
                    lineHeight: '1.7',
                    margin: 0,
                    paddingLeft: '20px',
                  }}
                >
                  <li><strong>Videoaulas objetivas:</strong> Direto ao ponto para acelerar seu aprendizado.</li>
                  <li><strong>Exercícios práticos:</strong> Treine com questões no formato do ENEM.</li>
                  <li><strong>Acompanhamento de Streak:</strong> Mantenha a constância diária de estudos.</li>
                </ul>
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
                  Acessar Plataforma Agora
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
                Se tiver qualquer dúvida, basta responder a este e-mail ou entrar em contato com nosso suporte.
                <br />
                Bons estudos! 🎯
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
                Você recebeu este e-mail por se cadastrar na Odisley. |{' '}
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
