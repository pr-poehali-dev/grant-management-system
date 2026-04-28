import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

const API_AUTH = 'https://functions.poehali.dev/f25bf775-a0f9-4d9c-8dea-ba003ffeed1b';
const TOKEN_KEY = 'agrogrant_token';

export interface AppUser {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  org_name: string | null;
  inn: string | null;
  role: 'producer' | 'officer' | 'admin';
  producer_id: number | null;
}

export interface LoginResult {
  ok: boolean;
  error?: string;
  needCaptcha?: boolean;
  twoFactorRequired?: boolean;
  locked?: boolean;
  devCode?: string;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  token: string | null;
  login: (
    email: string,
    password: string,
    opts?: { captchaToken?: string; captchaAnswer?: string; twoFactorCode?: string }
  ) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string; needCaptcha?: boolean }>;
  fetchCaptcha: () => Promise<{ question: string; token: string } | null>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  org_name?: string;
  inn?: string;
  role?: 'producer' | 'officer' | 'admin';
  captchaToken?: string;
  captchaAnswer?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) { setUser(null); setLoading(false); return; }
    try {
      const r = await fetch(API_AUTH, {
        headers: { 'X-Auth-Token': t },
      });
      if (r.ok) {
        const d = await r.json();
        setUser(d.user);
        setToken(t);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const fetchCaptcha = async () => {
    try {
      const r = await fetch(`${API_AUTH}?action=captcha`);
      if (!r.ok) return null;
      return await r.json();
    } catch {
      return null;
    }
  };

  const login = async (
    email: string,
    password: string,
    opts?: { captchaToken?: string; captchaAnswer?: string; twoFactorCode?: string }
  ): Promise<LoginResult> => {
    try {
      const r = await fetch(`${API_AUTH}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...opts }),
      });
      const d = await r.json();

      if (r.status === 202 && d.twoFactorRequired) {
        return { ok: false, twoFactorRequired: true, error: d.message, devCode: d.devCode };
      }

      if (!r.ok) {
        return {
          ok: false,
          error: d.error || 'Ошибка входа',
          needCaptcha: !!d.needCaptcha,
          twoFactorRequired: !!d.twoFactorRequired,
          locked: !!d.locked,
        };
      }

      localStorage.setItem(TOKEN_KEY, d.token);
      setToken(d.token);
      setUser(d.user);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Сервер временно недоступен' };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const r = await fetch(`${API_AUTH}?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const d = await r.json();
      if (!r.ok) return { ok: false, error: d.error || 'Ошибка регистрации', needCaptcha: !!d.needCaptcha };
      localStorage.setItem(TOKEN_KEY, d.token);
      setToken(d.token);
      setUser(d.user);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Сервер временно недоступен' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, fetchCaptcha, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}