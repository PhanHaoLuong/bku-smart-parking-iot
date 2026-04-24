import { useState, createContext, useContext } from 'react';

const AuthContext = createContext();

function getTokenData() {
  const token = localStorage.getItem('token');

  if (!token) {
    return { token: null, role: null, userId: null };
  }

  const [userId = null, role = null] = token.split('-');

  return { token, role, userId };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getTokenData().token);

  const isAuthenticated = !!token;
  const [userId = null, role = null] = token ? token.split('-') : [null, null];

  const handleLogin = () => {
    setToken(localStorage.getItem('token'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, userId, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}