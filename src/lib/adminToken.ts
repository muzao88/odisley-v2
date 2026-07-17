/**
 * Utilitários de token admin para uso no cliente.
 * Centraliza leitura/escrita do sessionStorage para evitar duplicação.
 */

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('admin_token');
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem('admin_token', token);
}

export function clearAdminToken(): void {
  sessionStorage.removeItem('admin_token');
}
