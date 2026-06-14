import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.js';

const AuthContext = createContext(null);

const ALLOWED_ROLES = ['SUPER_ADMIN', 'PROPERTY_MANAGER', 'HOST', 'SUPPORT_AGENT'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    if (token) {
      authApi
        .getMe()
        .then((data) => {
          if (ALLOWED_ROLES.includes(data.role)) {
            setUser(data);
          } else {
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminRefreshToken');
          }
        })
        .catch(() => {
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('adminRefreshToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    const role = data.user?.role || data.role;
    if (!ALLOWED_ROLES.includes(role)) {
      throw new Error('Access denied. Guest accounts cannot access the admin portal.');
    }
    localStorage.setItem('adminAccessToken', data.accessToken);
    localStorage.setItem('adminRefreshToken', data.refreshToken);
    const me = await authApi.getMe();
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('adminRefreshToken');
      if (refreshToken) await authApi.logout(refreshToken);
    } catch (_) {
      // ignore errors on logout
    }
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles) => user != null && roles.includes(user.role),
    [user]
  );

  const isAdmin = useCallback(
    () => hasRole('SUPER_ADMIN', 'PROPERTY_MANAGER', 'SUPPORT_AGENT'),
    [hasRole]
  );

  const isSuperAdmin = useCallback(() => hasRole('SUPER_ADMIN'), [hasRole]);

  const isHost = useCallback(() => hasRole('HOST'), [hasRole]);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, hasRole, isAdmin, isSuperAdmin, isHost, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
