/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Liste aqui o(s) domínio(s) reais do projeto em produção.
      // Em desenvolvimento o Next.js já permite localhost automaticamente.
      allowedOrigins: [
        "odisley.com.br",
        "www.odisley.com.br",
      ],
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
  // Garante que o webhook do Stripe receba o body bruto (raw body),
  // necessário para stripe.webhooks.constructEvent() verificar a assinatura.
  // No Next.js 14 App Router, req.text() já faz isso, mas este flag reforça.
  async rewrites() {
    return [];
  },
};
module.exports = nextConfig;

