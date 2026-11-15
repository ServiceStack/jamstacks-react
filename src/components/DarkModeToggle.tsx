'use client';

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { useTheme } from '../theme/ThemeProvider.js';

export interface DarkModeToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'role' | 'aria-checked'> {}

const buttonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  boxSizing: 'border-box',
  width: '2.875rem',
  height: '1.625rem',
  padding: 2,
  border: '1px solid var(--jamstacks-toggle-border, #788579)',
  borderRadius: 999,
  outlineOffset: 3,
};

const thumbStyle: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: '50%',
  background: 'var(--jamstacks-toggle-thumb, #ffffff)',
  color: 'var(--jamstacks-toggle-color, #243c2d)',
  boxShadow: '0 1px 3px #0003',
};

/** A labelled switch with encapsulated inline styles; no stylesheet import is needed. */
export const DarkModeToggle = forwardRef<HTMLButtonElement, DarkModeToggleProps>(function DarkModeToggle(
  { className, style, onClick, disabled, 'aria-label': label = 'Dark mode', ...props }, ref,
) {
  const { resolvedTheme, setTheme, mounted } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const isDisabled = disabled || !mounted;
  return (
    <button
      {...props}
      ref={ref}
      type="button"
      className={['jamstacks-dark-mode-toggle', className].filter(Boolean).join(' ')}
      style={{
        ...buttonStyle,
        background: isDark ? 'var(--jamstacks-toggle-dark-background, #334a3c)' : 'var(--jamstacks-toggle-background, #e5e7eb)',
        color: isDark ? 'var(--jamstacks-toggle-dark-color, #f3f4f6)' : 'var(--jamstacks-toggle-color, #243c2d)',
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: isDisabled ? .55 : 1,
        ...style,
      }}
      role="switch"
      aria-label={label}
      aria-checked={isDark}
      disabled={isDisabled}
      onClick={event => {
        onClick?.(event);
        if (!event.defaultPrevented) setTheme(isDark ? 'light' : 'dark');
      }}
    >
      <span
        className="jamstacks-dark-mode-toggle__thumb"
        style={{ ...thumbStyle, transform: isDark ? 'translateX(1.25rem)' : 'translateX(0)' }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" focusable="false">
          {isDark ? <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" /> : <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
          </>}
        </svg>
      </span>
    </button>
  );
});
