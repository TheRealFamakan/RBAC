// AuthContext — Gestion globale de l'état d'authentification
import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, getProfile } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('finsolve_token'));
  const [loading, setLoading] = useState(true);

  // Restaurer la session au démarrage
  useEffect(() => {
    if (token) {
      getProfile(token)
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('finsolve_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await loginUser(username, password);
    localStorage.setItem('finsolve_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('finsolve_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
