import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (!process.env.CI && existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);

export default defineConfig({
  testDir: './tests',
  testMatch: '*.spec.mjs',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:4178', browserName: 'chromium', launchOptions: { executablePath } },
  webServer: { command: 'node tests/server.mjs', url: 'http://127.0.0.1:4178', reuseExistingServer: false },
});
