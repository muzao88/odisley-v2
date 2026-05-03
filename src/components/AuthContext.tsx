'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/types';

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
  isPremium: boolean;
}

const Ctx = createContext<AuthCtx>({
  user: null, token: null,
  login: () => {}, logout: () => {},
  isLoggedIn: false, isPremium: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Restore session from localStorage
    try {
      const t = localStorage.getItem('odisley_token');
      const u = localStorage.getItem('odisley_user');
      if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    } catch {}
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

  return (
    <Ctx.Provider value={{
      user, token, login, logout,
      isLoggedIn: !!user,
      isPremium: user?.plano === 'premium',
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
