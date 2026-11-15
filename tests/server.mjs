import { createServer } from 'node:http';
import { build } from 'esbuild';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { getThemeScript } from '../dist/server.js';
import { Demo } from './fixture.mjs';

const bundle = await build({ entryPoints: ['tests/fixture.mjs'], bundle: true, write: false, format: 'esm', define: { 'process.env.NODE_ENV': '"development"' } });
const palette = ':root{--bg:#fff;--text:#18211b} @media(prefers-color-scheme:dark){:root:not(.light){--bg:#18211b;--text:#fff}} :root.dark{--bg:#18211b;--text:#fff}body{background:var(--bg);color:var(--text);font:16px system-ui} main{display:grid;gap:1rem;justify-items:start;padding:2rem}';

createServer((req, res) => {
  if (req.url === '/client.js') { res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(bundle.outputFiles[0].text); return; }
  const url = new URL(req.url, 'http://127.0.0.1');
  const options = url.searchParams.has('custom') ? { defaultTheme: 'dark', storageKey: 'custom-theme' } : {};
  const client = !url.searchParams.has('no-client');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${palette}</style><script>${getThemeScript(options)}</script></head><body><div id="root">${renderToString(createElement(Demo, options))}</div><script>window.__JAMSTACKS_FIXTURE__=${JSON.stringify(options)}</script>${client ? '<script type="module" src="/client.js"></script>' : ''}</body></html>`);
}).listen(4178, '127.0.0.1');
