import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { session } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (session.getToken() ? session.getUser() : null));
  const [ready, setReady] = useState(!session.getToken());

  const logout = useCallback(() => {
    session.clear();
    setUser(null);
  }, []);

  // Verify a stored token once on startup.
  useEffect(() => {
    if (!session.getToken()) return;
    api
      .get('/auth/me')
      .then((res) => {
        session.saveUser(res.data.user);
        setUser(res.data.user);
      })
      .catch((err) => {
        if (err.response?.status === 401) logout();
      })
      .finally(() => setReady(true));
  }, [logout]);

  useEffect(() => {
    window.addEventListener('ff:unauthorized', logout);
    return () => window.removeEventListener('ff:unauthorized', logout);
  }, [logout]);

  const accept = useCallback((data) => {
    session.save(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      logout,
      login: async (email, password) => accept((await api.post('/auth/login', { email, password })).data),
      register: async (username, email, password) => accept((await api.post('/auth/register', { username, email, password })).data),
      updateProfile: async (changes) => accept((await api.put('/users/me', changes)).data),
    }),
    [user, ready, logout, accept]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
