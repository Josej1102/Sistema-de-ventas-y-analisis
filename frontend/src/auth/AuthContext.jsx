import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { get, post } from '../api/http';

const AuthContext = createContext(null);

const USER_KEY = 'ventas_user';
const TOKEN_KEY = 'ventas_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(
    Boolean(sessionStorage.getItem(TOKEN_KEY))
  );

  useEffect(() => {
    const handleExpiredSession = () => {
      setUser(null);
      setLoading(false);
    };

    window.addEventListener('auth:expired', handleExpiredSession);

    return () => {
      window.removeEventListener('auth:expired', handleExpiredSession);
    };
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }

    get('/auth/me')
      .then((data) => {
        if (data?.usuario) {
          setUser(data.usuario);
        }
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function login(email, password) {
    const data = await post('/auth/login', {
      email: email.trim(),
      password,
    });

    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.empleado));
    setUser(data.empleado);

    return data.empleado;
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      isAdmin: user?.rol === 'admin',
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
