"use client";

/**
 * Shared admin API client.
 * Reads the token from sessionStorage and attaches it to every request.
 * On 401/403 it clears the token and reloads (redirects to /admin login).
 */
export function makeAdminApi(token: string) {
  const handleResponse = async (r: Response) => {
    if (!r.ok) {
      if (r.status === 401 || r.status === 403) {
        sessionStorage.removeItem('admin_token');
        window.location.replace('/admin');
      }
      const data = await r.json().catch(() => ({}));
      throw new Error((data as any).error || 'Erro na requisição');
    }
    return r.json();
  };

  const headers = (extra?: Record<string, string>) => ({
    Authorization: `Bearer ${token}`,
    ...extra,
  });

  return {
    get:   (url: string) =>
      fetch(url, { headers: headers() }).then(handleResponse).catch(() => ({})),

    post:  (url: string, body: object) =>
      fetch(url, {
        method: 'POST',
        headers: headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      }).then(handleResponse),

    patch: (url: string, body: object) =>
      fetch(url, {
        method: 'PATCH',
        headers: headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      }).then(handleResponse),

    del:   (url: string, body: object) =>
      fetch(url, {
        method: 'DELETE',
        headers: headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      }).then(handleResponse),
  };
}
