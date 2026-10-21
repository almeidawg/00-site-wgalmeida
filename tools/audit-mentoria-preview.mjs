import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const out = resolve('.codex/tmp/mentoria-audit')
mkdirSync(out, { recursive: true })
const url = process.env.MENTORIA_URL || 'http://127.0.0.1:3109/mentoria-construcao'
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-first-run'],
})
const checks = []
const sizes = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'mobile-small', width: 360, height: 780 },
  { name: 'mobile-min', width: 320, height: 700 },
]
for (const size of sizes) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1, isMobile: size.width <= 390, hasTouch: size.width <= 390 })
  const errors = []
  const badResponses = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push('console:'+m.text().slice(0,200)) })
  page.on('response', r => { if (r.status() >= 400 && ['127.0.0.1', '192.168.0.56'].includes(new URL(r.url()).hostname)) badResponses.push({ code: r.status(), url: r.url().slice(0,200) }) })
  let error = null
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 })
    await page.locator('.mcl-hero h1').waitFor({ timeout: 35000 })
    await page.waitForTimeout(900)
    const allImages = page.locator('.mcl img')
    const imageCount = await allImages.count()
    for (let i = 0; i < imageCount; i++) {
      try { await allImages.nth(i).scrollIntoViewIfNeeded({ timeout: 5000 }); await page.waitForTimeout(100) } catch {}
    }
    await page.evaluate(() => { window.scrollTo(0, 0) })
    await page.waitForTimeout(350)
    const audit = await page.evaluate(() => {
      const body = document.body, de = document.documentElement, docW = Math.max(de.scrollWidth, body.scrollWidth), docHeight = Math.max(de.scrollHeight, body.scrollHeight)
      const overflowElements = [...document.querySelectorAll('.mcl *')].filter(el => {
        const r = el.getBoundingClientRect()
        const isVisible = r.width > 1 && getComputedStyle(el).visibility !== 'hidden'
        return isVisible && (r.right > innerWidth + 3 || r.left < -3)
      }).slice(0, 8).map(el=>({tag:el.tagName,cl:String(el.className).slice(0,80),right:Math.round(el.getBoundingClientRect().right)}))
      const imgs = [...document.querySelectorAll('.mcl img')].map(img=>({src:img.getAttribute('src'),naturalWidth:img.naturalWidth,complete:img.complete}))
      const video = document.querySelector('.mcl-film video')
      return { docWidth:docW, docHeight, innerWidth, overflow:docW > innerWidth + 2,
        offenders:overflowElements, images:imgs, h1Count:document.querySelectorAll('.mcl h1').length,
        videoLoadedBeforeClick:Boolean(video), navigationHeight:Math.round(document.querySelector('.mcl-header')?.getBoundingClientRect().height ?? -1),
        footerHeight:Math.round(document.querySelector('.mcl-footer')?.getBoundingClientRect().height ?? -1),
        ctaCount:document.querySelectorAll('.mcl a[href*="wa.me"]').length,
        noindex:[...document.querySelectorAll('meta[name="robots"]')].every(e => (e.getAttribute('content') || '').includes('noindex')),
      }
    })
    if (size.name === 'desktop' || size.name === 'mobile') await page.screenshot({path: join(out,size.name+'.png'),fullPage:true,animations:'disabled',timeout:30000})
    const system = page.getByRole('button', { name: 'Sistema de gestão completo' })
    await system.click()
    const href = await page.locator('a.mcl-convert__submit').getAttribute('href')
    const whatsappUrl = new URL(href)
    const whatsappPrefillGood = whatsappUrl.hostname === 'wa.me' && whatsappUrl.pathname.length >= 9 && (whatsappUrl.searchParams.get('text') || '').includes('em um sistema')
    const imageFailures = audit.images.filter(i => i.complete && !i.naturalWidth)
    checks.push({viewport:size.name,w:size.width,h:size.height,http:response?.status(),...audit,
      whatsappPrefillGood,imageFailures,errors,badResponses,
      pass:response?.status()===200 && !audit.overflow && !audit.videoLoadedBeforeClick &&
      audit.h1Count===1 && audit.noindex && audit.ctaCount>=2 && whatsappPrefillGood && imageFailures.length===0 && errors.length===0 && badResponses.length===0,
    })
  } catch (e) { error=String(e);checks.push({viewport:size.name,error,pass:false}) }
  await page.close()
}
const r={url,screenshots:[join(out,'desktop.png'),join(out,'mobile.png')],checks,pass:checks.every(x=>x.pass)}
writeFileSync(join(out,'report.json'),JSON.stringify(r,null,2),'utf8')
console.log(JSON.stringify(r))
await browser.close()
if(!r.pass)process.exitCode=1
