import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function capture() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });

  await page.goto('http://127.0.0.1:5173');
  await page.waitForTimeout(800);

  // 1. Light Mode Landing
  await page.screenshot({ path: join(__dirname, '../public/screenshot-home-light.png'), fullPage: false });

  // 2. Dark Mode Landing
  const themeBtn = page.locator('#theme-toggle');
  await themeBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(__dirname, '../public/screenshot-home-dark.png'), fullPage: false });

  // 3. Web Studio
  await page.goto('http://127.0.0.1:5173/studio.html');
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(__dirname, '../public/screenshot-studio.png'), fullPage: false });

  await browser.close();
  console.log('✓ Captured visual screenshots');
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
