'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import type { User } from '@/types';

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoggedIn: boolean;
  isPremium: boolean;
  isInitialized: boolean;
}

const Ctx = createContext<AuthCtx>({
  user: null, token: null,
  login: () => {}, logout: () => {}, refreshUser: async () => {},
  isLoggedIn: false, isPremium: false, isInitialized: false,
});

/** Intervalo de revalidação automática do plano (ms). */
const REFRESH_INTERVAL_MS = 60_000; // 60 segundos

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Restaura sessão do localStorage
    try {
      const t = localStorage.getItem('odisley_token');
      const u = localStorage.getItem('odisley_user');
      if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    } catch {}
    setIsInitialized(true);
  }, []);

  const login = (u: User, t: string) => {
    setUser(u); setToken(t);
    localStorage.setItem('odisley_token', t);
    localStorage.setItem('odisley_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('odisley_token');
    localStorage.removeItem('odisley_user');
  };

  /**
   * Busca o perfil atualizado do usuário DIRETO do banco de dados.
   * O /api/auth/me lê do MongoDB (não do payload do JWT), portanto
   * reflete imediatamente qualquer alteração feita pelo admin.
   */
  const refreshUser = useCallback(async () => {
    try {
      const t = localStorage.getItem('odisley_token');
      if (!t) return;

      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('odisley_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('[AuthContext] Erro ao atualizar usuário:', err);
    }
  }, []);

  /**
   * Polling automático: enquanto o usuário estiver logado,
   * revalida o perfil a cada REFRESH_INTERVAL_MS.
   * Garante que mudanças de plano feitas pelo admin
   * apareçam sem necessidade de logout.
   */
  useEffect(() => {
    if (!token) {
      // Sem sessão ativa — limpa o intervalo se existir
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Inicia o polling
    intervalRef.current = setInterval(refreshUser, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [token, refreshUser]);

  /**
   * Revalidação ao recuperar foco da aba:
   * Se o usuário deixou a aba em segundo plano e o admin alterou o plano,
   * a mudança aparece assim que ele retornar.
   */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && token) {
        refreshUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [token, refreshUser]);

  return (
    <Ctx.Provider value={{
      user, token, login, logout, refreshUser,
      isLoggedIn: !!user,
      isPremium: user?.plano === 'premium',
      isInitialized,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
