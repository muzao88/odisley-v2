/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Liste aqui o(s) domínio(s) reais do projeto em produção.
      // Em desenvolvimento o Next.js já permite localhost automaticamente.
      allowedOrigins: [
        "odisley.com.br",
        "www.odisley.com.br",
        // Se usar Vercel preview URLs, adicione também:
        // 'odisley-v2.vercel.app',
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
};
module.exports = nextConfig;
