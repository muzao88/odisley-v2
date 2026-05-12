'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

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
   * Busca o perfil atualizado do usuário no banco de dados.
   * Usado após retorno de pagamento para refletir o plano premium
   * sem necessidade de logout/login.
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
