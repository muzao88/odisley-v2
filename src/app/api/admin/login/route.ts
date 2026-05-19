export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const ADMIN_USER  = process.env.ADMIN_USER  || 'admin';
const ADMIN_PASS  = process.env.ADMIN_PASS  || '';
const JWT_SECRET  = process.env.JWT_SECRET  || 'dev-secret';

export async function POST(req: NextRequest) {
  try {
    const { usuario, senha } = await req.json();

    if (!ADMIN_PASS) {
      return NextResponse.json(
        { error: 'ADMIN_PASS não configurado no servidor.' },
        { status: 503 },
      );
    }

    if (usuario !== ADMIN_USER || senha !== ADMIN_PASS) {
      // Delay artificial para dificultar brute-force
      await new Promise(r => setTimeout(r, 800));
      return NextResponse.json(
        { error: 'Usuário ou senha incorretos.' },
        { status: 401 },
      );
    }

    const token = jwt.sign(
      { role: 'admin', usuario },
      JWT_SECRET,
      { expiresIn: '4h' },
    );

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
