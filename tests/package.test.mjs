import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { DarkModeToggle, ThemeProvider } from 'jamstacks';
import { ThemeScript, getThemeScript } from 'jamstacks/server';

test('public exports render on the server without browser globals', () => {
  const html = renderToString(createElement(ThemeProvider, null, createElement(DarkModeToggle)));
  assert.match(html, /role="switch"/);
  assert.match(html, /aria-label="Dark mode"/);
  assert.match(html, /aria-checked="false"/);
  assert.match(html, /disabled=""/);
  assert.match(renderToString(createElement(ThemeScript, { nonce: 'example-nonce' })), /nonce="example-nonce"/);
});

test('inline settings cannot close a script element', () => {
  const script = getThemeScript({ storageKey: '</script><script>alert(1)</script>\u2028\u2029' });
  assert.ok(!script.includes('</script>'));
  assert.ok(!script.includes('\u2028'));
  assert.doesNotThrow(() => new Function(script));
});

test('published client modules retain their Next.js boundaries', () => {
  for (const file of ['index.js', 'components/DarkModeToggle.js', 'theme/ThemeProvider.js']) {
    assert.match(readFileSync(new URL(`../dist/${file}`, import.meta.url), 'utf8'), /^['"]use client['"]/);
  }
  assert.doesNotMatch(readFileSync(new URL('../dist/server.js', import.meta.url), 'utf8'), /use client/);
});
