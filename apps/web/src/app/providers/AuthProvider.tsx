/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import type { UserRole } from '@dossiertracker/shared';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  fetchCandidatures,
  fetchMe,
  getGoogleAuthUrl,
  login,
  signup,
  type ApiCandidature,
} from '../../lib/api';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole | string;
  createdAt?: string;
};

type AuthContextValue = {
  token: string | null;
  user: User | null;
  isAuthLoading: boolean;
  candidatures: ApiCandidature[];
  refreshSession: () => Promise<void>;
  loginWithEmail: (email: string, password: string, redirectTo?: string) => Promise<void>;
  signupWithEmail: (
    payload: { email: string; password: string; firstName: string; lastName: string },
    redirectTo?: string,
  ) => Promise<void>;
  logout: () => void;
  fetchGoogleUrl: () => Promise<string>;
};

const TOKEN_KEY = 'dossiertracker_token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [candidatures, setCandidatures] = useState<ApiCandidature[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const persistToken = useCallback((value: string | null) => {
    setToken(value);
    if (typeof window !== 'undefined') {
      if (value) {
        window.localStorage.setItem(TOKEN_KEY, value);
      } else {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, []);

  const refreshSession = useCallback(async () => {
    if (!token) {
      setUser(null);
      setCandidatures([]);
      return;
    }
    setIsAuthLoading(true);
    try {
      const [profile, cands] = await Promise.all([fetchMe(token), fetchCandidatures(token)]);
      setUser(profile);
      setCandidatures(cands);
    } finally {
      setIsAuthLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
    if (stored) {
      setToken(stored);
    } else {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }
    void refreshSession();
  }, [token, refreshSession]);

  const loginWithEmail = useCallback(
    async (email: string, password: string, redirectTo = '/dashboard') => {
      const res = await login({ email, password });
      persistToken(res.accessToken);
      await refreshSession();
      router.push(redirectTo as '/dashboard');
    },
    [persistToken, refreshSession, router],
  );

  const signupWithEmail = useCallback(
    async (payload: { email: string; password: string; firstName: string; lastName: string }, redirectTo = '/dashboard') => {
      const res = await signup(payload);
      persistToken(res.accessToken);
      await refreshSession();
      router.push(redirectTo as '/dashboard');
    },
    [persistToken, refreshSession, router],
  );

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
    setCandidatures([]);
    router.push('/auth/login');
  }, [persistToken, router]);

  const fetchGoogleUrl = useCallback(async () => {
    if (!token) {
      throw new Error('Authentification requise pour connecter Google.');
    }
    const { url } = await getGoogleAuthUrl(token);
    return url;
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthLoading,
      candidatures,
      refreshSession,
      loginWithEmail,
      signupWithEmail,
      logout,
      fetchGoogleUrl,
    }),
    [candidatures, fetchGoogleUrl, isAuthLoading, loginWithEmail, logout, refreshSession, signupWithEmail, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return ctx;
}

