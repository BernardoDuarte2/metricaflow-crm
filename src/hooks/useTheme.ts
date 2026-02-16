import { useEffect } from 'react';
import { useUserSession } from './useUserSession'; // New hook import
import { getTheme, type ThemeName } from '@/lib/themes';

const THEME_CACHE_KEY = 'app-theme';

export const useTheme = () => {
  // Use unified session hook which provides theme
  const { data: sessionData, isLoading } = useUserSession();
  
  const themeData = sessionData?.theme as ThemeName || 'futurista';

  // Apply theme
  useEffect(() => {
    if (isLoading && !sessionData) {
      // Possibly apply optimistic theme from localStorage or default
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

  return { theme: themeData, isLoading };
};

export const applyTheme = (themeName: ThemeName) => {
  const theme = getTheme(themeName);
  const isDark = document.documentElement.classList.contains('dark');
  const colors = isDark ? theme.colors.dark : theme.colors.light;

  // Apply CSS variables with smooth transition
  const root = document.documentElement;
  const body = document.body;
  root.style.transition = 'all 300ms ease-in-out';

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });

  // Remove all theme classes first
  body.classList.remove('theme-futurista');
  
  // Add specific theme class
  body.classList.add('theme-futurista');

  // Apply theme-specific font family (futurista)
  root.style.setProperty('--font-sans', 'Plus Jakarta Sans, Inter, sans-serif');

  // Remove transition after applying
  setTimeout(() => {
    root.style.transition = '';
  }, 300);
};

// Listen for theme changes from other tabs/windows
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === THEME_CACHE_KEY && e.newValue) {
      applyTheme(e.newValue as ThemeName);
    }
  });
}
