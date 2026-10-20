import { chromium } from 'playwright';

const origin = process.env.WG_SITE_PREVIEW_URL || 'http://127.0.0.1:4397';
const profiles = [
  { name: 'desktop', width: 1366, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'compact-mobile', width: 320, height: 568 },
];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      locale: 'pt-BR',
      reducedMotion: 'reduce',
      serviceWorkers: 'block',
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200)); });
    page.on('pageerror', (err) => pageErrors.push(err.message.slice(0, 200)));
    let goto;
    try {
      const response = await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 25000 });
      goto = response?.status() || 0;
      await page.waitForTimeout(1500);
      const header = page.locator('header').first();
      const headerText = (await header.innerText()).toLowerCase();
      const hrefs = await header.locator('a').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
      const mobileToggle = header.locator('button[aria-expanded][aria-label$="menu"]');
      let mobile = {};
      if (profile.width < 1280 && await mobileToggle.count()) {
        const hitTarget = await mobileToggle.evaluate((el) => {
          const box = el.getBoundingClientRect();
          const x = box.left + box.width / 2;
          const y = box.top + box.height / 2;
          const hit = document.elementFromPoint(x, y);
          return {
            x, y, box: { x: box.x, y: box.y, width: box.width, height: box.height },
            hitTag: hit?.tagName || null, hitClass: String(hit?.getAttribute('class') || '').slice(0, 220),
            descendant: hit === el || el.contains(hit), 
            position: getComputedStyle(el).position,
          };
        });
        let physicalClick = 'ok';
        try {
          await mobileToggle.click({ timeout: 2200 });
        } catch (e) {
          physicalClick = e.message.slice(0, 1450);
          await mobileToggle.evaluate((el) => el.click());
        }
        await page.waitForTimeout(250);
        const expanded = await mobileToggle.getAttribute('aria-expanded');
        const visibleLinks = await header.locator('nav:visible a').evaluateAll((links) => links.map((a) => ({
          text: (a.textContent || '').trim(), href: a.getAttribute('href'),
        })));
        mobile = {
          expanded,
          physicalClick,
          hitTarget,
          links: visibleLinks,
          invalidHrefs: visibleLinks.filter((a) => !a.href || a.href === '/undefined').map((a) => a.text),
        };
      }
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        title: document.title,
      }));
      results.push({
        profile: profile.name, status: goto,
        menuSaasRemoved: !(/easy food|acessoos|eventos|eventos|easy real estate|wgeasy/i).test(headerText),
        adminShortcutRemoved: !hrefs.some((h) => h?.startsWith('/admin')),
        headerPresent: await header.count() === 1,
        mobile, dimensions,
        overflowPx: Math.max(0, dimensions.scrollWidth - dimensions.clientWidth),
        consoleErrors: consoleErrors.slice(0, 8),
        pageErrors: pageErrors.slice(0, 8),
      });
    } catch (error) {
      results.push({ profile: profile.name, status: goto || 0, error: error.message.slice(0, 500), consoleErrors, pageErrors });
    }
    await context.close();
  }
} finally {
  await browser.close();
}
const passed = results.every((item) =>
  item.status === 200 && item.menuSaasRemoved === true &&
  item.adminShortcutRemoved === true && item.headerPresent === true &&
  item.overflowPx === 0 && item.consoleErrors.length === 0 && item.pageErrors.length === 0 &&
  (item.profile === 'desktop' || (item.mobile.expanded === 'true' && item.mobile.physicalClick === 'ok' && item.mobile.invalidHrefs.length === 0))
);
console.log(JSON.stringify({ passed, results }, null, 2));
if (!passed) process.exitCode = 1;
