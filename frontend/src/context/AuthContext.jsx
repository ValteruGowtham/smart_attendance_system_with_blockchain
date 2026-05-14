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
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          setToken(savedToken);
          // Fetch user info with the token
          const res = await getUserInfo();
          console.log('User info response:', res.data);
          // Backend returns user data directly
          setUser(res.data);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await apiLogin(username, password);
      console.log('Login response:', res.data);
      
      // Extract token and user data from response
      const { token: newToken, ...userData } = res.data;
      
      // Store in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setToken(newToken);
      setUser(userData);
      
      return res.data;
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err.message || 'Login failed';
      throw new Error(errorMsg);
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
