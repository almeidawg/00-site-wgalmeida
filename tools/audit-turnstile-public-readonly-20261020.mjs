import { chromium } from 'playwright';

const cases = [
  { label: 'production-contact', url: 'https://wgalmeida.com.br/contato' },
  { label: 'production-proposal', url: 'https://wgalmeida.com.br/solicite-proposta' },
  { label: 'preview-proposal', url: 'https://site-wgalmeida-qirlqks44-grupo-wg-almeida-vercel-projects.vercel.app/solicite-proposta' },
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const target of cases) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }, locale: 'pt-BR',
      serviceWorkers: 'block', reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errorCodes = new Set();
    const failures = [];
    page.on('console', msg => {
      const t = msg.text();
      if (/\[WG Turnstile\].*challenge error/i.test(t)) {
        const code = t.match(/\b\d{6}\b/);
        errorCodes.add(code?.[0] || 'unknown');
      }
    });
    page.on('requestfailed', req => {
      const url = new URL(req.url());
      if (url.hostname === 'challenges.cloudflare.com') {
        failures.push({ host: url.hostname, error: req.failure()?.errorText?.slice(0, 140) });
      }
    });
    const result = { label: target.label, expectedHost: new URL(target.url).host };
    try {
      const response = await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 35000 });
      result.httpStatus = response?.status();
      await page.waitForTimeout(1600);
      const form = page.locator('form').first();
      if (await form.count()) {
        await form.scrollIntoViewIfNeeded({ timeout: 6000 });
        await page.waitForTimeout(5000);
      }
      result.finalHost = new URL(page.url()).host;
      result.isVercelLogin = page.url().startsWith('https://vercel.com/login');
      result.turnstileScript = await page.locator('script[src*="challenges.cloudflare.com/turnstile"]').count();
      result.challengeIframes = await page.locator('iframe[src*="challenges.cloudflare.com"]').count();
      result.widgetErrorCodes = [...errorCodes];
      result.challengeNetworkFailures = failures;
      result.turnstileErrorText = (await page.locator('body').innerText()).includes('Não foi possível conectar ao site');
      result.forms = await page.locator('form').count();
      result.hasCaptchaNotice = (await page.locator('body').innerText()).includes('Conclua a verificação anti-spam');
      result.formSubmitRequests = 'NOT ATTEMPTED (read-only)';
    } catch (error) {
      result.error = error.message.slice(0, 700);
    }
    results.push(result);
    await context.close();
  }
} finally { await browser.close(); }
console.log(JSON.stringify({ results }, null, 2));
