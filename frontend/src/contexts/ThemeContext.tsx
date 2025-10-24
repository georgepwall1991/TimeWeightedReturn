import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetUserPreferencesQuery, useUpdateUserPreferencesMutation } from '../services/api';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Get auth state to check if user is authenticated
  const accessToken = useSelector((state: any) => state.auth?.accessToken);
  const isAuthenticated = !!accessToken;

  // Fetch user preferences from backend only if authenticated
  const { data: preferences } = useGetUserPreferencesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [updatePreferences] = useUpdateUserPreferencesMutation();

  // Sync theme from backend when loaded
  useEffect(() => {
    if (preferences?.theme && preferences.theme !== theme) {
      const backendTheme = preferences.theme as Theme;
      setThemeState(backendTheme);
      localStorage.setItem('theme', backendTheme);
    }
  }, [preferences]);

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate effective theme
  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [effectiveTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    // Update backend preferences only if authenticated
    if (isAuthenticated) {
      updatePreferences({ theme: newTheme }).catch((error) => {
        console.error('Failed to update theme preference:', error);
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
