import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  return new NextResponse(
    `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Autenticando...</title>
  <style>
    body {
      font-family: sans-serif;
      background: #0a0e1a;
      color: #8fa4c8;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      flex-direction: column;
      gap: 1rem;
    }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid rgba(79,142,247,.2);
      border-top-color: #4f8ef7;
      border-radius: 50%;
      animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <div>Autenticando com Google...</div>
  <script>
    (function() {
      // O Google coloca o token no HASH da URL (#id_token=xxx)
      var hash = window.location.hash;

      if (!hash || hash.length < 2) {
        // Sem hash — tenta pegar da query string como fallback
        var search = window.location.search;
        var qParams = new URLSearchParams(search);
        var qToken = qParams.get('id_token');
        if (qToken) {
          window.location.replace('${origin}/?google_token=' + encodeURIComponent(qToken));
          return;
        }
        window.location.replace('${origin}/?google_error=1');
        return;
      }

      // Remove o # e parseia
      var params = new URLSearchParams(hash.substring(1));
      var id_token = params.get('id_token');

      if (id_token && id_token.length > 10) {
        // Sucesso — redireciona para home com o token
        window.location.replace('${origin}/?google_token=' + encodeURIComponent(id_token));
      } else {
        // Sem token válido
        window.location.replace('${origin}/?google_error=1');
      }
    })();
  </script>
</body>
</html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
