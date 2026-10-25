import { chromium } from 'playwright';

const base = process.env.WG_SITE_PREVIEW_URL || 'http://127.0.0.1:4397';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, locale: 'pt-BR', reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (err) => errors.push(err.message.slice(0, 160)));
const result = { status: 0, introVisible: false, skipped: false, navAfterSkip: false, aboutClicked: false, errors };
try {
  const resp = await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 25000 });
  result.status = resp?.status() || 0;
  const skip = page.locator('main button').filter({ hasText: 'Pular' }).first();
  result.introVisible = await skip.isVisible({ timeout: 5000 });
  if (result.introVisible) {
    await skip.click({ timeout: 10000 });
    await skip.waitFor({ state: 'detached', timeout: 6500 });
    result.skipped = true;
  }
  const about = page.locator('header nav a[href="/sobre"]').first();
  result.navAfterSkip = await about.isVisible({ timeout: 6000 });
  if (result.navAfterSkip) {
    await about.click({ timeout: 8000 });
    await page.waitForURL('**/sobre', { timeout: 10000 });
    result.aboutClicked = new URL(page.url()).pathname === '/sobre';
  }
} catch (err) {
  result.error = err.message.slice(0, 950);
} finally {
  await context.close();
  await browser.close();
}
result.passed = result.status === 200 && result.introVisible && result.skipped && result.navAfterSkip && result.aboutClicked && !result.error && result.errors.length === 0;
console.log(JSON.stringify(result, null, 2));
if (!result.passed) process.exitCode = 1;
