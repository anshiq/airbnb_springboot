import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from '@/api/client';
import type { UserSummary, AuthResponse } from '@/types';

interface AuthContextType {
  user: UserSummary | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  updateUser: (partial: Partial<UserSummary>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = 'rental_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          const stored = localStorage.getItem(USER_KEY);
          if (stored) setUser(JSON.parse(stored));
        } else {
          clearTokens();
        }
      } catch {
        clearTokens();
      }
    }
    setIsLoading(false);

    const onExpired = () => {
      clearTokens();
      setUser(null);
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback((data: AuthResponse) => {
    setTokens(data.accessToken, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    const refresh = getRefreshToken();
    if (refresh) {
      fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      }).catch(() => {/* best effort */});
    }
    clearTokens();
    setUser(null);
  }, []);

  const updateUser = useCallback((partial: Partial<UserSummary>) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return React.createElement(AuthContext.Provider, {
    value: { user, isAuthenticated: !!user, isLoading, login, logout, updateUser },
    children,
  });
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
