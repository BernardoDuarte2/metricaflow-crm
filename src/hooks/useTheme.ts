import { useEffect, useState, useCallback } from 'react';
import { useUserSession } from './useUserSession';
import { getTheme, type ThemeName } from '@/lib/themes';

const THEME_CACHE_KEY = 'app-theme';
const COLOR_MODE_KEY = 'color-mode';

export const useTheme = () => {
  const { data: sessionData, isLoading } = useUserSession();
  const themeData = sessionData?.theme as ThemeName || 'futurista';

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(COLOR_MODE_KEY);
    return !saved || saved === 'dark';
  });

  // Initialize dark mode class on mount
  useEffect(() => {
    const saved = localStorage.getItem(COLOR_MODE_KEY);
    const shouldBeDark = !saved || saved === 'dark';
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setIsDark(shouldBeDark);
  }, []);

  const toggleDarkMode = useCallback(() => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem(COLOR_MODE_KEY, newIsDark ? 'dark' : 'light');
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Re-apply theme colors for the new mode
    applyTheme(themeData);
  }, [isDark, themeData]);

  // Apply theme
  useEffect(() => {
    if (isLoading && !sessionData) {
      const cached = localStorage.getItem(THEME_CACHE_KEY) as ThemeName;
      if (cached) applyTheme(cached);
      else applyTheme('futurista');
      return;
    }

    if (sessionData?.theme) {
      applyTheme(sessionData.theme as ThemeName);
      localStorage.setItem(THEME_CACHE_KEY, sessionData.theme);
    }
  }, [sessionData?.theme, isLoading]);

  return { theme: themeData, isLoading, isDark, toggleDarkMode };
};

export const applyTheme = (themeName: ThemeName) => {
  const theme = getTheme(themeName);
  const isDark = document.documentElement.classList.contains('dark');
  const colors = isDark ? theme.colors.dark : theme.colors.light;

  const root = document.documentElement;
  const body = document.body;
  root.style.transition = 'all 300ms ease-in-out';

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });

  body.classList.remove('theme-futurista');
  body.classList.add('theme-futurista');

  root.style.setProperty('--font-sans', 'Inter, Plus Jakarta Sans, sans-serif');

  setTimeout(() => {
    root.style.transition = '';
  }, 300);
};

// Listen for theme changes from other tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === THEME_CACHE_KEY && e.newValue) {
      applyTheme(e.newValue as ThemeName);
    }
    if (e.key === COLOR_MODE_KEY) {
      const shouldBeDark = !e.newValue || e.newValue === 'dark';
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      const cached = localStorage.getItem(THEME_CACHE_KEY) as ThemeName;
      applyTheme(cached || 'futurista');
    }
  });
}
