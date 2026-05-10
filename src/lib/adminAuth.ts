import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error(
    "[adminAuth] JWT_SECRET não definido nas variáveis de ambiente. Defina JWT_SECRET no .env.local e no painel de deploy."
  );
}
const JWT_SECRET = SECRET as string;

export function verifyAdmin(req: NextRequest): true | NextResponse {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { role?: string };
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }
    return true;
  } catch {
    return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 401 });
  }
}
