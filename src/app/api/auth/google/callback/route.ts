import { NextRequest, NextResponse } from 'next/server';

// Esta rota recebe o redirect do Google após o login
// O Google redireciona para: /api/auth/google/callback#id_token=xxx
// O popup monitora o hash e captura o id_token automaticamente
// Esta página serve apenas como destino do redirect — não precisa fazer nada
export async function GET(req: NextRequest) {
  return new NextResponse(
    `<!DOCTYPE html>
<html>
<head><title>Autenticando...</title></head>
<body>
  <p style="font-family:sans-serif;text-align:center;margin-top:40px;color:#888">
    Autenticando com Google...
  </p>
  <script>
    // A janela pai (AuthModal) monitora window.location.hash deste popup
    // e captura o id_token automaticamente via setInterval
    // Esta página pode fechar sozinha se o token já foi capturado
    setTimeout(() => {
      if (window.opener) {
        // Fallback: tenta enviar o token via postMessage
        const hash = window.location.hash;
        if (hash && hash.includes('id_token')) {
          const params = new URLSearchParams(hash.slice(1));
          const id_token = params.get('id_token');
          if (id_token) {
            window.opener.postMessage({ type: 'google-credential', credential: id_token }, window.location.origin);
            window.close();
          }
        }
      }
    }, 500);
  </script>
</body>
</html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    }
  );
}
