export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

// Limite: 5MB em Base64 (~6.7MB de texto, mas validamos o original no frontend)
const MAX_BODY_BYTES = 7.5 * 1024 * 1024; // 7.5MB (margem para overhead Base64)

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const payload = verifyToken(auth.slice(7));
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }

    // Valida o tamanho do body no servidor
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: 'Imagem muito grande. Limite: 5MB.' },
        { status: 413 }
      );
    }

    const body = await req.json();
    const { avatar } = body;

    if (!avatar || typeof avatar !== 'string') {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    // Valida que é uma imagem Base64 válida (jpg, png ou webp)
    const isValidFormat = /^data:image\/(jpeg|png|webp);base64,/.test(avatar);
    if (!isValidFormat) {
      return NextResponse.json(
        { error: 'Formato inválido. Use JPG, PNG ou WEBP.' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await UserModel.findByIdAndUpdate(
      payload.id,
      { avatar },
      { new: true }
    ).select('_id nome email plano progresso_total avatar provider planActive planExpiresAt assinaturaStatus assinaturaExpira createdAt');

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, avatar: user.avatar, user });
  } catch (err) {
    console.error('[POST /auth/upload-avatar]', err);
    return NextResponse.json({ error: 'Erro ao salvar avatar.' }, { status: 500 });
  }
}
