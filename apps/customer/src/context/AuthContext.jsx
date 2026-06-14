import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      authApi
        .getMe()
        .then((me) => setUser(me))
        .catch(() => {
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    const me = await authApi.getMe();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (formData) => {
    return await authApi.register(formData);
  }, []);

  const logout = useCallback(async () => {
    try {
      const rt = localStorage.getItem('refreshToken');
      if (rt) await authApi.logout(rt);
    } catch {
      // Silently ignore logout API errors
    }
    localStorage.clear();
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  }, []);

  const updateUser = useCallback(async (data) => {
    const updated = await authApi.updateMe(data);
    setUser(updated);
    return updated;
  }, []);

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
