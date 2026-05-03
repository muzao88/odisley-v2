import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Odisley | Matemática para Vestibular e ENEM',
  description: 'Plataforma completa de matemática com videoaulas objetivas, trilha de aprendizado e acompanhamento de progresso. Prepare-se para o ENEM e vestibulares.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
