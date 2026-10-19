import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const url = new URL(process.argv[2] || '')
if (url.protocol !== 'https:' || !/^site-wgalmeida-[a-z0-9]+-grupo-wg-almeida-vercel-projects\.vercel\.app$/.test(url.hostname)) {
  throw new Error('Refusing to audit a noncanonical preview origin')
}
const token = process.env.VERCEL_OIDC_TOKEN
if (!token) throw new Error('No short-lived development OIDC token; run via vercel.cmd env run -- node ...')
// Do not print, write or persist the token. Origin-scoped interception prevents its
// propagation to other services (including fonts, analytics and image hosts).
const routes = ['/mentoria-construcao', '/mentoria-construcao/abordagens', '/mentoria-construcao/contato']
const widths = [375, 768, 1366]
const outcome = { preview: url.origin, routes: [], status: 'PASS', generatedAt: new Date().toISOString() }
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.MENTORIA_CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--disable-gpu'],
})
try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 860 }, deviceScaleFactor: 1 })
    await context.route('**/*', async (route) => {
      const request = route.request()
      if (new URL(request.url()).origin === url.origin) {
        await route.continue({ headers: { ...request.headers(), 'x-vercel-trusted-oidc-idp-token': token } })
      } else {
        await route.continue()
      }
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 240)))
    for (const route of routes) {
      const response = await page.goto(url.origin + route, { waitUntil: 'domcontentloaded', timeout: 30000 })
      if (!response) throw new Error('No navigation response: ' + route)
      const html = await response.text()
      await page.locator('h1').first().waitFor({ state: 'visible', timeout: 18000 })
      const data = await page.evaluate(() => ({
        title: document.title,
        robots: document.querySelector('meta[name="robots"]')?.content || '',
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        h1: document.querySelector('h1')?.textContent?.trim().slice(0, 120) || '',
        overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        isLab: window.__MENTORIA_LAB__ === true,
        hasForm: Boolean(document.querySelector('form.mcf-form')),
        unavailable: document.body.innerText.includes('recebimento desativado'),
      }))
      const item = {
        width, route, http: response.status(),
        xRobotsTag: response.headers()['x-robots-tag'] || '',
        preHydrationNoindex: /<meta\s+name="robots"\s+content="noindex, nofollow"/i.test(html),
        preHydrationCanonical: html.includes('href="https://wgalmeida.com.br' + route + '"'),
        preHydrationRouteTitle: route.endsWith('/contato') ? html.includes('Converse sobre a Mentoria Construção') : route.endsWith('/abordagens') ? html.includes('Temas para aprofundar') : html.includes('Mentoria Estratégica Individual'),
        preHydrationNoInstitutionalFallback: !html.includes('id="wg-seo-fallback"'),
        ...data,
        pageErrors: errors.splice(0).length,
      }
      item.ok = item.http === 200 &&
        item.xRobotsTag.includes('noindex') &&
        item.preHydrationNoindex &&
        item.preHydrationCanonical &&
        item.preHydrationRouteTitle &&
        item.preHydrationNoInstitutionalFallback &&
        item.robots.includes('noindex') &&
        item.canonical.endsWith(route) &&
        item.overflow <= 2 &&
        !item.isLab &&
        item.pageErrors === 0 &&
        (route !== '/mentoria-construcao/contato' || (item.hasForm && item.unavailable))
      outcome.routes.push(item)
      if (!item.ok) outcome.status = 'FAIL'
      console.log(JSON.stringify({ width, route, ok: item.ok, http: item.http, noindex: item.xRobotsTag, overflow: item.overflow, pageErrors: item.pageErrors }))
    }
    await context.close()
  }
} finally {
  await browser.close()
}
if (process.argv[3]) {
  const file = path.resolve(process.argv[3])
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(outcome, null, 2))
}
console.log('PREVIEW_HTTPS_QA', outcome.status, outcome.routes.filter(x => x.ok).length + '/' + outcome.routes.length)
if (outcome.status !== 'PASS') process.exitCode = 1
