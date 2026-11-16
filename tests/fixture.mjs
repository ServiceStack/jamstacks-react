import { createElement as h, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { ThemeProvider, DarkModeToggle, useTheme } from '../dist/index.js';

function Controls() {
  const { theme, resolvedTheme, mounted, setTheme } = useTheme();
  return h('main', null,
    h('h1', null, 'Jamstacks theme fixture'),
    h(DarkModeToggle, { 'data-testid': 'toggle' }),
    h(DarkModeToggle, { 'aria-label': 'Second toggle' }),
    h(DarkModeToggle, { 'aria-label': 'Custom toggle', style: { width: 64, background: 'rgb(128, 0, 128)' } }),
    h(DarkModeToggle, { disabled: true, 'aria-label': 'Disabled toggle' }),
    h(DarkModeToggle, { onClick: e => e.preventDefault(), 'aria-label': 'Cancelled toggle' }),
    h('button', { onClick: () => setTheme('system') }, 'Use system'),
    h('output', { 'data-testid': 'state' }, `${theme}:${resolvedTheme}:${mounted}`),
  );
}

export function Demo(options = {}) {
  return h(StrictMode, null, h(ThemeProvider, options, h(Controls)));
}

if (typeof document !== 'undefined') {
  hydrateRoot(document.getElementById('root'), h(Demo, window.__JAMSTACKS_FIXTURE__));
}
