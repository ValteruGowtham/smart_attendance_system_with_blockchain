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
      isDark: false, // Default to light for beach/cream vibe
      toggleTheme: () => {},
      colors: {
        bg: {
          primary: '#FEFEFE',
          secondary: '#F5F5F5',
          tertiary: '#EEEEEE',
        },
        text: {
          primary: '#212121',
          secondary: '#757575',
          tertiary: '#9E9E9E',
        },
        border: '#E0E0E0',
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
        primary: isDark ? '#0f172a' : '#FEFEFE',
        secondary: isDark ? '#1e293b' : '#F5F5F5',
        tertiary: isDark ? '#334155' : '#EEEEEE',
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#212121',
        secondary: isDark ? '#cbd5e1' : '#757575',
        tertiary: isDark ? '#94a3b8' : '#9E9E9E',
      },
      border: isDark ? '#334155' : '#E0E0E0',
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
