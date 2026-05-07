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
};
module.exports = nextConfig;
