import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';

export const metadata: Metadata = {
  title: 'Odisley | Matemática para Vestibular e ENEM',
  description: 'Plataforma completa de matemática com videoaulas objetivas, trilha de aprendizado e acompanhamento de progresso. Prepare-se para o ENEM e vestibulares.',
};

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('odisley_theme') || localStorage.getItem('theme');
    var theme;
    if (saved === 'dark' || saved === 'light') {
      theme = saved;
    } else {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    var docEl = document.documentElement;
    docEl.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      docEl.classList.add('dark');
    } else {
      docEl.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

