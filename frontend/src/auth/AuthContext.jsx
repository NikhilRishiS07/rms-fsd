import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function normalizeUser(u) {
  if (!u) return null;
  // ensure an `id` property exists (use Mongo `_id` if present)
  return { ...u, id: u.id || (u._id ? String(u._id) : undefined) };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('rms_user');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed ? normalizeUser(parsed) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('rms_token'));

  useEffect(() => {
    if (user) localStorage.setItem('rms_user', JSON.stringify(user));
    else localStorage.removeItem('rms_user');
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem('rms_token', token);
    else localStorage.removeItem('rms_token');
  }, [token]);

  const login = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(normalizeUser(nextUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}