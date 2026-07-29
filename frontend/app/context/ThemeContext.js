'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({
  darkMode: false,
  toggleTheme: () => {},
  setDarkMode: () => {},
});

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('omsSettings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setDarkMode(Boolean(parsed.darkMode));
      }
    } catch (error) {
      console.error('Unable to load theme settings', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    root.classList.toggle('dark', darkMode);
    root.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const value = useMemo(
    () => ({
      darkMode,
      toggleTheme: () => {
        setDarkMode((prev) => {
          const next = !prev;
          if (typeof window !== 'undefined') {
            try {
              const stored = localStorage.getItem('omsSettings');
              const parsed = stored ? JSON.parse(stored) : {};
              localStorage.setItem('omsSettings', JSON.stringify({ ...parsed, darkMode: next }));
            } catch (error) {
              console.error('Unable to persist theme settings', error);
            }
          }
          return next;
        });
      },
      setDarkMode: (value) => {
        const next = Boolean(value);
        setDarkMode(next);
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('omsSettings');
            const parsed = stored ? JSON.parse(stored) : {};
            localStorage.setItem('omsSettings', JSON.stringify({ ...parsed, darkMode: next }));
          } catch (error) {
            console.error('Unable to persist theme settings', error);
          }
        }
      },
    }),
    [darkMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
