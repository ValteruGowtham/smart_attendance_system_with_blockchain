import { createContext, useContext, useState, useEffect } from 'react';
import { getUserInfo, loginUser as apiLogin, logoutUser as apiLogout } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth from localStorage on app mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        
        if (savedToken) setToken(savedToken);
        
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setLoading(false); // Optimistic: assume session is valid
        }
        
        // Background verify with backend
        const res = await getUserInfo();
        if (res.data.authenticated) {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } else {
          // If not authenticated, clear state
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        // Only clear if it's a 401
        if (error.response?.status === 401) {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const res = await apiLogin(username, password);
      
      if (res.data.success) {
        const userData = res.data;
        // Store user in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userData));
        // Some backends might still provide a token
        if (userData.token) {
          localStorage.setItem('token', userData.token);
          setToken(userData.token);
        }
        
        setUser(userData);
        return userData;
      } else {
        throw new Error(res.data.error || 'Login failed');
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err.message || 'Login failed';
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state and storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
