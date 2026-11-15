import { DEFAULT_STORAGE_KEY } from './types.js';
import type { Theme } from './types.js';

export interface ThemeScriptProps {
  defaultTheme?: Theme;
  storageKey?: string;
  /** Use the same nonce as your Content-Security-Policy. */
  nonce?: string;
}

// Self-contained so its compiled JavaScript can run before React hydrates.
function initializeTheme(storageKey: string, defaultTheme: Theme) {
  let theme = defaultTheme;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark' || saved === 'system') theme = saved;
  } catch { /* Storage is optional. */ }
  const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  const root = document.documentElement;
  root.classList.toggle('dark', dark);
  root.classList.toggle('light', !dark);
  root.dataset.theme = dark ? 'dark' : 'light';
  root.style.colorScheme = dark ? 'dark' : 'light';
}

/** Inline in the document head to apply the preference before the first paint. */
export function getThemeScript({ storageKey = DEFAULT_STORAGE_KEY, defaultTheme = 'system' }: Omit<ThemeScriptProps, 'nonce'> = {}): string {
  const args = JSON.stringify([storageKey, defaultTheme]).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return `(${initializeTheme.toString()})(...${args});`;
}

/** Server-safe entry point. Match its settings to ThemeProvider. */
export function ThemeScript({ nonce, ...options }: ThemeScriptProps) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: getThemeScript(options) }} />;
}
