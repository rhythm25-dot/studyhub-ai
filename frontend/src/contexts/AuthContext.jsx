import { createContext, useContext, useEffect, useState } from 'react';

import { authService } from '@/services/authService';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('studyhub_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Re-validate the token on refresh instead of trusting stale localStorage data.
    authService
      .getMe()
      .then((fetchedUser) => {
        setUser(fetchedUser);
        localStorage.setItem('studyhub_user', JSON.stringify(fetchedUser));
      })
      .catch(() => {
        localStorage.removeItem('studyhub_token');
        localStorage.removeItem('studyhub_user');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    const { user: loggedInUser, token } = await authService.login({ email, password });
    localStorage.setItem('studyhub_token', token);
    localStorage.setItem('studyhub_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    authService.logout().catch(() => {});
    localStorage.removeItem('studyhub_token');
    localStorage.removeItem('studyhub_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
