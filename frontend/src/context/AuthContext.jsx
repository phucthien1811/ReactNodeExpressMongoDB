import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from '../services/api';

const AuthContext = createContext(null);
const LS_KEY = 'rf_auth_v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(auth.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed.user);
      }
    } catch {}
  }, []);

  const login = async ({ email, password }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await auth.login(email, password);
      setUser(data.user);
      localStorage.setItem(LS_KEY, JSON.stringify({
        user: data.user,
        token: data.token,
        accessToken: data.token 
      }));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(LS_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    error
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  return ctx;
}
