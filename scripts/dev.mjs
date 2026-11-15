import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { context } from 'esbuild';
import { getThemeScript } from '../dist/server.js';

const { values } = parseArgs({ options: { port: { type: 'string', default: '4173' } } });
const port = Number(values.port);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('--port must be between 1 and 65535.');
const root = new URL('../', import.meta.url);
const bundle = await context({
  absWorkingDir: fileURLToPath(root),
  entryPoints: ['demo/main.tsx'],
  bundle: true,
  write: false,
  format: 'esm',
  jsx: 'automatic',
  target: 'es2020',
  sourcemap: 'inline',
  define: { 'process.env.NODE_ENV': '"development"' },
});

const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, 'http://localhost').pathname;
    if (path === '/') {
      const html = await readFile(new URL('demo/index.html', root), 'utf8');
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(html.replace('<!-- theme-script -->', `<script>${getThemeScript()}</script>`));
    } else if (path === '/demo.js') {
      // Rebuild on each refresh so edits to the demo and component source appear immediately.
      const result = await bundle.rebuild();
      response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(result.outputFiles[0].text);
    } else if (path === '/demo.css') {
      const css = await readFile(new URL('demo/demo.css', root));
      response.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(css);
    } else { response.writeHead(404).end('Not found'); }
  } catch (error) {
    console.error(error);
    response.writeHead(500).end('Demo build failed. Check the terminal for details.');
  }
});

server.on('error', async error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is in use. Try npm run dev -- --port ${port + 1}.` : error);
  await bundle.dispose();
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`\nJamstacks playground: http://localhost:${port}\nRefresh the page after editing demo/ or src/.\n`);
});

async function shutdown() {
  server.close();
  await bundle.dispose();
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
