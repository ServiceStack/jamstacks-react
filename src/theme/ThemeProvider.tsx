'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_STORAGE_KEY, isTheme } from './types.js';
import type { ResolvedTheme, Theme } from './types.js';

export interface ThemeContextValue {
  /** Saved preference; system follows the device until the user chooses a mode. */
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  /** False during server rendering and the first hydration render. */
  mounted: boolean;
  setTheme: (theme: Theme) => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Use one provider per document. React rendering stays identical on the server and during hydration. */
export function ThemeProvider({ children, defaultTheme = 'system', storageKey = DEFAULT_STORAGE_KEY }: ThemeProviderProps) {
  const [theme, setPreference] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);
  const preference = useRef<Theme>(defaultTheme);

  const apply = useCallback((next: Theme) => {
    const resolved = next === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : next;
    preference.current = next;
    const root = document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
    root.classList.toggle('light', resolved === 'light');
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
    setPreference(next);
    setResolvedTheme(resolved);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    if (!isTheme(next)) return;
    apply(next);
    // Browsers may deny storage. The toggle must still work for this visit.
    try { window.localStorage.setItem(storageKey, next); } catch { /* Storage is optional. */ }
  }, [apply, storageKey]);

  useEffect(() => {
    let initial = defaultTheme;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (isTheme(saved)) initial = saved;
    } catch { /* Use the default when storage is unavailable. */ }
    apply(initial);
    setMounted(true);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onMediaChange = () => { if (preference.current === 'system') apply('system'); };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      try { if (event.storageArea !== window.localStorage) return; } catch { return; }
      apply(isTheme(event.newValue) ? event.newValue : defaultTheme);
    };
    media.addEventListener('change', onMediaChange);
    window.addEventListener('storage', onStorage);
    return () => {
      media.removeEventListener('change', onMediaChange);
      window.removeEventListener('storage', onStorage);
    };
  }, [apply, defaultTheme, storageKey]);

  const value = useMemo(() => ({ theme, resolvedTheme, mounted, setTheme }), [theme, resolvedTheme, mounted, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme and DarkModeToggle must be used inside a ThemeProvider.');
  return value;
}
