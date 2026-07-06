import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Odisley",
  robots: { index: false, follow: false },
};

/**
 * Layout exclusivo para /admin.
 * Apenas constrange a altura para 100vh e esconde overflow.
 * O Painel em page.tsx gerencia todo o layout flex interno (sidebar + conteúdo).
 * NÃO usa flex aqui para não interferir com o Painel.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
