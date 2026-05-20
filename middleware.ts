import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./src/lib/auth";

// Lista de rotas que exigem proteção
const protectedRoutes = [
  "/api/progresso",
  "/api/conteudos",
  "/admin",
  "/perfil",
];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // Verifica se a rota atual precisa de proteção
  const isProtected = protectedRoutes.some((route) => url.startsWith(route));

  if (isProtected) {
    const authHeader = req.headers.get("authorization");

    // Se for uma rota de API
    if (url.startsWith("/api")) {
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }

      // O JWT não pode ser verificado no middleware Edge do Next.js se usar jsonwebtoken (Node.js).
      // Porém, como este é um exemplo básico de segurança, o ideal é usar jose no middleware
      // ou deixar a validação final nos handlers da API (como já era feito).
      // Para evitar quebrar a aplicação que usa jsonwebtoken (que depende do Node),
      // passamos a requisição adiante e garantimos que o header exista.

      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// Configura o matcher para onde o middleware deve rodar
// Middleware foi movido do src/ para o root conforme novo padrão do Next.js 16
export const config = {
  matcher: ["/api/:path*", "/admin/:path*", "/perfil/:path*"],
};
