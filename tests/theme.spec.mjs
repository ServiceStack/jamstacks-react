import { test, expect } from '@playwright/test';

async function ready(page, path = '/') {
  await page.goto(path);
  await expect(page.getByTestId('state')).toContainText(':true');
}

test('system preference, explicit overrides, persistence and shared switches', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await ready(page);
  const toggle = page.getByTestId('toggle');
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  await toggle.click();
  await expect(page.getByRole('switch', { name: 'Second dark mode switch', exact: true })).toHaveAttribute('aria-checked', 'true');
  expect(await page.evaluate(() => localStorage.getItem('color-scheme'))).toBe('dark');
  await page.reload();
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
  await page.emulateMedia({ colorScheme: 'dark' });
  await toggle.click();
  await expect(page.locator('html')).toHaveClass('light');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.getByRole('button', { name: 'Use system' }).click();
  await expect(page.getByTestId('state')).toHaveText('system:dark:true');
});

test('keyboard operation, disabled controls and preventDefault', async ({ page }) => {
  await ready(page);
  const toggle = page.getByTestId('toggle');
  await page.keyboard.press('Tab');
  await expect(toggle).toBeFocused();
  expect(await toggle.evaluate(button => getComputedStyle(button).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByRole('switch', { name: 'Disabled switch', exact: true })).toBeDisabled();
  await page.getByRole('switch', { name: 'Cancelled switch', exact: true }).click();
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
});

test('storage synchronizes across tabs and resets to system when cleared', async ({ context, page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await ready(page);
  const second = await context.newPage();
  await second.emulateMedia({ colorScheme: 'light' });
  await ready(second);
  await page.getByTestId('toggle').click();
  await expect(second.getByTestId('state')).toHaveText('dark:dark:true');
  await page.evaluate(() => localStorage.removeItem('color-scheme'));
  await expect(second.getByTestId('state')).toHaveText('system:light:true');
});

test('blocked storage does not break the script or toggle', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage denied'); } });
  });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await ready(page);
  await page.getByTestId('toggle').click();
  await expect(page.getByTestId('state')).toHaveText('dark:dark:true');
  expect(errors).toEqual([]);
});

test('saved theme is applied before hydration without a mismatch', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => localStorage.setItem('color-scheme', 'light'));
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/?no-client');
  await expect(page.locator('html')).toHaveClass('light');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.getByTestId('state')).toHaveText('system:light:false');
  await ready(page);
  await expect(page.getByTestId('state')).toHaveText('light:light:true');
  expect(errors).toEqual([]);
});

test('custom storage keys and defaults, invalid saved values and reduced motion', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('custom-theme', 'invalid'));
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await ready(page, '/?custom');
  await expect(page.getByTestId('state')).toHaveText('dark:dark:true');
  await expect(page.locator('.jamstacks-dark-mode-toggle__thumb').first()).toHaveCSS('transition-duration', '0s');
  await page.getByTestId('toggle').click();
  expect(await page.evaluate(() => localStorage.getItem('custom-theme'))).toBe('light');
  expect(await page.evaluate(() => localStorage.getItem('color-scheme'))).toBeNull();
});


test('component styling needs no stylesheet and accepts template customizations', async ({ page }) => {
  await ready(page);
  const toggle = page.getByTestId('toggle');
  await page.evaluate(() => document.documentElement.style.setProperty('--jamstacks-toggle-background', 'rgb(255, 0, 0)'));
  await expect(toggle).toHaveCSS('background-color', 'rgb(255, 0, 0)');
  const custom = page.getByRole('switch', { name: 'Custom styled switch', exact: true });
  await expect(custom).toHaveCSS('background-color', 'rgb(128, 0, 128)');
  await custom.click();
  await expect(custom).toHaveCSS('background-color', 'rgb(128, 0, 128)');
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
  expect(await page.locator('link[rel="stylesheet"]').count()).toBe(0);
});
