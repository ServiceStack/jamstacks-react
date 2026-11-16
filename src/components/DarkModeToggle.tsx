'use client';

import { forwardRef, useState } from 'react';
import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { useTheme } from '../theme/ThemeProvider.js';
import type { ResolvedTheme, Theme } from '../theme/types.js';

export interface DarkModeToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'role' | 'aria-checked' | 'aria-pressed'> {}

const names: Record<Theme, string> = { light: 'Light', dark: 'Dark', system: 'System' };

const buttonStyle: CSSProperties = {
  display: 'inline-grid',
  placeItems: 'center',
  flexShrink: 0,
  boxSizing: 'border-box',
  width: '2rem',
  height: '2rem',
  padding: 0,
  borderWidth: 1,
  borderStyle: 'solid',
  borderRadius: 999,
  outlineOffset: 3,
};

const iconStyle: CSSProperties = { display: 'block', width: '1rem', height: '1rem' };

function deviceTheme(): ResolvedTheme {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch { return 'light'; }
}

/**
 * Cycles through the three preferences so that the first click always changes the appearance:
 * system → opposite of the device → same as the device → system.
 */
function nextTheme(theme: Theme, device: ResolvedTheme): Theme {
  const opposite: ResolvedTheme = device === 'dark' ? 'light' : 'dark';
  if (theme === 'system') return opposite;
  return theme === opposite ? device : 'system';
}

/** A single tri-state light / dark / system button with encapsulated inline styles; no stylesheet import is needed. */
export const DarkModeToggle = forwardRef<HTMLButtonElement, DarkModeToggleProps>(function DarkModeToggle(
  { className, style, onClick, onPointerEnter, onPointerLeave, disabled, title, 'aria-label': label = 'Theme', ...props }, ref,
) {
  const { theme, resolvedTheme, setTheme, mounted } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const isDisabled = disabled || !mounted;
  const name = `${label}: ${names[theme]}`;
  // Inline styles cannot target :hover, so track it. Touch is ignored to avoid a hover state that sticks after a tap.
  const [hovered, setHovered] = useState(false);
  const showChrome = hovered && !isDisabled;
  return (
    <button
      {...props}
      ref={ref}
      type="button"
      className={['jamstacks-dark-mode-toggle', className].filter(Boolean).join(' ')}
      style={{
        ...buttonStyle,
        background: !showChrome ? 'transparent'
          : isDark ? 'var(--jamstacks-toggle-dark-background, #334a3c)' : 'var(--jamstacks-toggle-background, #e5e7eb)',
        borderColor: showChrome ? 'var(--jamstacks-toggle-border, #788579)' : 'transparent',
        color: isDark ? 'var(--jamstacks-toggle-dark-color, #f3f4f6)' : 'var(--jamstacks-toggle-color, #243c2d)',
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: isDisabled ? .55 : 1,
        ...style,
      }}
      aria-label={name}
      title={title ?? name}
      data-theme-preference={theme}
      disabled={isDisabled}
      onPointerEnter={event => { onPointerEnter?.(event); if (event.pointerType !== 'touch') setHovered(true); }}
      onPointerLeave={event => { onPointerLeave?.(event); setHovered(false); }}
      onClick={event => {
        onClick?.(event);
        if (!event.defaultPrevented) setTheme(nextTheme(theme, theme === 'system' ? resolvedTheme : deviceTheme()));
      }}
    >
      <svg className="jamstacks-dark-mode-toggle__icon" style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        {theme === 'dark' ? <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" />
          : theme === 'light' ? <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
          </> : <>
            <rect x="3" y="4" width="18" height="12" rx="2" />
            <path d="M8 20h8m-4-4v4" />
          </>}
      </svg>
    </button>
  );
});
