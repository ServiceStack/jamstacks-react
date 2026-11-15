import { rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
// Compile modules individually: keep React external and preserve Next.js client boundaries.
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'], { stdio: 'inherit' });
