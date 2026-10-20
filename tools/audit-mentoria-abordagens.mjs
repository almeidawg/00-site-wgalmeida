import { createServer } from 'vite'
import { createServer as createTcpServer } from 'node:net'
import { chromium } from 'playwright'

// Reservamos um porto efemero livre para nao interferir em outros agentes;
 // o servidor Vite vive apenas durante esta auditoria.
const port = await new Promise((resolve, reject) => {
  const locator = createTcpServer()
  locator.once('error', reject)
  locator.listen(0, '127.0.0.1', () => {
    const selected = locator.address().port
    locator.close(() => resolve(selected))
  })
})
const server = await createServer({
  server: { host: '127.0.0.1', port, strictPort: true },
  clearScreen: false,
})
let browser
const results = []
try {
  await server.listen()
  const address = server.httpServer.address()
  const origin = 'http://127.0.0.1:' + address.port
  browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
  for (const width of [375, 768, 1366]) {
    const page = await browser.newPage({ viewport: { width, height: 950 } })
    const runtimeErrors = []
    page.on('pageerror', (error) => runtimeErrors.push(error.message))
    const response = await page.goto(origin + '/mentoria-construcao/abordagens', {
      waitUntil: 'domcontentloaded', timeout: 40000,
    })
    await page.locator('.mab-area').first().waitFor({ timeout: 22000 })
    const before = await page.locator('.mab-area__example').count()
    const b = page.locator('.mab-area__expand').first()
    await b.click()
    const after = await page.locator('.mab-area__example').count()
    const stats = await page.evaluate(() => ({
      cards: document.querySelectorAll('.mab-area').length,
      topics: document.querySelectorAll('.mab-area__details li').length,
      horizontalOverflow: Math.max(0,document.documentElement.scrollWidth - window.innerWidth),
      indexAnchors: document.querySelectorAll('.mab-index a').length,
      inputs: document.querySelectorAll('.mab input,.mab select,.mab textarea').length,
      noindex: Array.from(document.querySelectorAll('meta[name=robots]')).some((node) => node.content.includes('noindex')),
      title: document.querySelector('.mab h1')?.textContent || '',
      firstCardWidth: Math.round(document.querySelector('.mab-area')?.getBoundingClientRect().width || 0),
    }))
    const ok = response?.status() === 200 && stats.cards === 10 &&
      stats.topics === 30 && stats.indexAnchors === 10 && stats.inputs === 0 &&
      stats.noindex && stats.horizontalOverflow <= 1 &&
      before === 0 && after === 1 && runtimeErrors.length === 0 &&
      stats.firstCardWidth > 260
    results.push({ viewport: width, http: response?.status(), ...stats,
      accordion: before === 0 && after === 1, runtimeErrors, ok })
    await page.close()
  }
  const legacyPage = await browser.newPage()
  const legacy = await legacyPage.goto(origin + '/mentoria-construcao/proposta-360', { waitUntil: 'domcontentloaded' })
  await legacyPage.locator('.mab-area').first().waitFor({ timeout: 22000 })
  results.push({ route: 'legacy proposal-360 now editorial', http: legacy?.status(),
    cardCount: await legacyPage.locator('.mab-area').count(),
    ok: legacy?.status() === 200 && await legacyPage.locator('.mab-area').count() === 10 })
  await legacyPage.close()
} finally {
  if (browser) await browser.close()
  await server.close()
}
console.log(JSON.stringify({ status: results.every((r) => r.ok) ? 'OK' : 'FAIL', results }, null, 2))
if (!results.every((r) => r.ok)) process.exitCode = 1
