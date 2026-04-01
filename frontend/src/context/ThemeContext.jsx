/**
 * Theme Context Provider
 * Manages dark/light mode state and provides theme utilities
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return a safe default theme instead of crashing
    console.warn('useTheme called outside ThemeProvider - returning default theme');
    return {
      isDark: false,
      toggleTheme: () => {},
      colors: {
        bg: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#e2e8f0',
        },
        text: {
          primary: '#1e293b',
          secondary: '#64748b',
          tertiary: '#94a3b8',
        },
        border: '#e2e8f0',
        glass: 'rgba(255, 255, 255, 0.8)',
      },
    };
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    if (typeof window === 'undefined') return false;
    
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update localStorage and DOM
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const theme = {
    isDark,
    toggleTheme,
    colors: {
      bg: {
        primary: isDark ? '#0f172a' : '#ffffff',
        secondary: isDark ? '#1e293b' : '#f8fafc',
        tertiary: isDark ? '#334155' : '#e2e8f0',
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#1e293b',
        secondary: isDark ? '#cbd5e1' : '#64748b',
        tertiary: isDark ? '#94a3b8' : '#94a3b8',
      },
      border: isDark ? '#334155' : '#e2e8f0',
      glass: isDark
        ? 'rgba(30, 41, 59, 0.5)'
        : 'rgba(255, 255, 255, 0.8)',
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
