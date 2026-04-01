/**
 * ThemeContext.jsx
 * Global theme provider with design tokens
 */

import React, { createContext, useContext } from 'react';
import designTokens from './designTokens';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const theme = {
    ...designTokens,
    isDarkMode,
    toggleDarkMode: () => setIsDarkMode(!isDarkMode),

    // Helper functions for common styling
    getContrastColor: (bgColor) => {
      // Simple luminance-based contrast
      const rgb = parseInt(bgColor.slice(1), 16);
      const luminance = (0.299 * (rgb >> 16) + 0.587 * ((rgb >> 8) & 0xff) + 0.114 * (rgb & 0xff)) / 255;
      return luminance > 0.5 ? '#000000' : '#FFFFFF';
    },

    // Get semantic color based on variant
    getSemanticColor: (variant) => {
      const colorMap = {
        success: designTokens.colors.success,
        error: designTokens.colors.error,
        warning: designTokens.colors.warning,
        info: designTokens.colors.info,
        primary: designTokens.colors.primary,
      };
      return colorMap[variant] || designTokens.colors.primary;
    },

    // Get responsive breakpoint media query
    media: {
      xs: `@media (min-width: ${designTokens.breakpoints.xs})`,
      sm: `@media (min-width: ${designTokens.breakpoints.sm})`,
      md: `@media (min-width: ${designTokens.breakpoints.md})`,
      lg: `@media (min-width: ${designTokens.breakpoints.lg})`,
      xl: `@media (min-width: ${designTokens.breakpoints.xl})`,
      '2xl': `@media (min-width: ${designTokens.breakpoints['2xl']})`,
    },
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

// Hook to access theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Hook for responsive values
export const useResponsive = () => {
  const [screenSize, setScreenSize] = React.useState('lg');

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('xs');
      else if (width < 768) setScreenSize('sm');
      else if (width < 1024) setScreenSize('md');
      else if (width < 1280) setScreenSize('lg');
      else if (width < 1536) setScreenSize('xl');
      else setScreenSize('2xl');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};
