import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function verifyAdmin(req: NextRequest): true | NextResponse {
  const SECRET = process.env.JWT_SECRET;
  if (!SECRET) {
    return NextResponse.json(
      { error: 'Configuração do servidor incompleta (JWT_SECRET não definido).' },
      { status: 500 }
    );
  }

  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const payload = jwt.verify(auth.slice(7), SECRET) as { role?: string };
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }
    return true;
  } catch {
    return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 401 });
  }
}
