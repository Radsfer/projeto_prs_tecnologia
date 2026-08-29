import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { api, setSession, clearSession, getSessionUser, SessionUser } from './api';

interface AuthContextValue {
  user: SessionUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(getSessionUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      async login(email: string, password: string) {
        const data = await api<{ token: string; user: SessionUser }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setSession(data.token, data.user);
        setUser(data.user);
      },
      logout() {
        clearSession();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
