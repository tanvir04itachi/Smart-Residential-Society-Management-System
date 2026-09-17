'use client';

import { createContext, ReactNode, useContext, useEffect, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener('rsms-theme-change', onStoreChange);
      return () => window.removeEventListener('rsms-theme-change', onStoreChange);
    },
    () => document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    () => 'light',
  ) as Theme;

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('rsms-theme') as Theme | null;
    const preferredTheme: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const nextTheme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : preferredTheme;
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem('rsms-theme', nextTheme);
    window.dispatchEvent(new Event('rsms-theme-change'));
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem('rsms-theme', nextTheme);
    window.dispatchEvent(new Event('rsms-theme-change'));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
