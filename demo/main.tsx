import { StrictMode, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { DarkModeToggle, ThemeProvider, useTheme } from '../src/index.js';
import type { Theme } from '../src/index.js';

const accentTokens = {
  '--jamstacks-toggle-background': '#e9ddff',
  '--jamstacks-toggle-dark-background': '#7152a3',
  '--jamstacks-toggle-color': '#51347a',
} as CSSProperties;

function Playground() {
  const { theme, resolvedTheme, mounted, setTheme } = useTheme();
  const [device, setDevice] = useState('Detecting…');
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setDevice(media.matches ? 'Dark' : 'Light');
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return (
    <div className="playground">
      <header className="demo-header">
        <a href="/" className="demo-brand">jamstacks<span> / components</span></a>
        <span className="demo-badge">Local playground</span>
      </header>

      <main>
        <div className="demo-intro">
          <p className="demo-eyebrow">React component library</p>
          <h1>A little toggle.<br />A shared preference.</h1>
          <p>Try the theme toggle, inspect the current theme, and see every instance stay in sync.</p>
        </div>

        <div className="demo-grid">
          <section className="demo-card" aria-labelledby="appearance-heading">
            <p className="demo-eyebrow">01 / Appearance</p>
            <h2 id="appearance-heading">Choose your theme</h2>
            <div className="demo-switch-row">
              <div><strong>Theme</strong><p>One button cycles System, the opposite of your device, then your device’s mode.</p></div>
              <DarkModeToggle ref={toggle} aria-label="Main theme" />
            </div>
            <div className="demo-preferences" role="group" aria-label="Theme preference">
              {(['light', 'dark', 'system'] as Theme[]).map(value => (
                <button key={value} type="button" aria-pressed={theme === value} disabled={!mounted} onClick={() => setTheme(value)}>
                  {value === 'system' ? 'System' : value === 'dark' ? 'Dark' : 'Light'}
                </button>
              ))}
            </div>
            <p className="demo-note">Your choice is saved in this browser. System follows the device, including live changes.</p>
          </section>

          <section className="demo-card" aria-labelledby="state-heading">
            <p className="demo-eyebrow">02 / Live state</p>
            <h2 id="state-heading">What’s happening</h2>
            <dl className="demo-state" aria-live="polite">
              <div><dt>Preference</dt><dd data-testid="preference">{theme}</dd></div>
              <div><dt>Applied appearance</dt><dd data-testid="appearance">{mounted ? resolvedTheme : 'Loading…'}</dd></div>
              <div><dt>Device preference</dt><dd data-testid="device">{device}</dd></div>
              <div><dt>Component ready</dt><dd>{mounted ? 'Yes' : 'Loading…'}</dd></div>
            </dl>
            <p className="demo-note">The provider updates the document’s theme classes and colour scheme. This page owns its palette; each toggle owns its styles.</p>
          </section>
        </div>

        <section className="demo-card demo-variants" aria-labelledby="variants-heading">
          <p className="demo-eyebrow">03 / Variants</p>
          <h2 id="variants-heading">Same component, different settings</h2>
          <div className="demo-variant-grid">
            <div className="demo-variant"><DarkModeToggle aria-label="Default variant" /><h3>Default</h3><p>No stylesheet import.</p></div>
            <div className="demo-variant" style={accentTokens}><DarkModeToggle aria-label="Accent variant" /><h3>CSS variables</h3><p>Local colour overrides.</p></div>
            <div className="demo-variant"><DarkModeToggle aria-label="Inline style variant" style={{ background: '#234b60', borderColor: '#6a9ab3' }} /><h3>Style prop</h3><p>Button-level overrides.</p></div>
            <div className="demo-variant"><DarkModeToggle aria-label="Disabled variant" disabled /><h3>Disabled</h3><p>No interaction.</p></div>
            <div className="demo-variant"><DarkModeToggle aria-label="Prevented variant" onClick={event => event.preventDefault()} /><h3>Prevented click</h3><p>The handler cancels changes.</p></div>
          </div>
        </section>

        <section className="demo-card demo-checks" aria-labelledby="checks-heading">
          <div>
            <p className="demo-eyebrow">04 / Try it</p>
            <h2 id="checks-heading">A few useful checks</h2>
            <ol>
              <li>Choose a mode and reload. Your choice should remain.</li>
              <li>Open a second tab. Switching in either tab should update the other.</li>
              <li>Choose System, then change the device’s appearance.</li>
              <li>Use Tab to focus a toggle, then Space or Enter to activate it.</li>
            </ol>
          </div>
          <div className="demo-actions">
            <a className="demo-button" href="/" target="_blank" rel="noreferrer">Open another tab <span aria-hidden="true">↗</span></a>
            <button className="demo-button demo-button-secondary" type="button" onClick={() => toggle.current?.focus()}>Focus main toggle</button>
          </div>
        </section>
      </main>
      <footer className="demo-footer"><span>jamstacks · React 18 + 19</span><span>Local demo · no external services</span></footer>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><ThemeProvider><Playground /></ThemeProvider></StrictMode>,
);
