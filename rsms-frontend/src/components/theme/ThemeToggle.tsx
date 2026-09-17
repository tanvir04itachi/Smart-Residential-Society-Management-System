'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to day mode' : 'Switch to night mode'}
      aria-label={isDark ? 'Switch to day mode' : 'Switch to night mode'}
      className={`flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-[#f2efff] dark:text-slate-300 dark:hover:bg-[#2a2443] ${className}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
