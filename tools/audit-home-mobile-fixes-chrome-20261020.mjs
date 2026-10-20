import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const origin = process.env.WG_SITE_PREVIEW_URL || 'http://127.0.0.1:4398'
const screenshotRoot = process.env.WG_SCREENSHOT_DIR || resolve(process.cwd(), '../../90_Governanca/LAB_NAV_WGEASY_20261020/QA_3_FUNDAMENTAIS_20261020/screenshots')
mkdirSync(screenshotRoot, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const profiles = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'compact-320', width: 320, height: 568 },
  { name: 'desktop-1366', width: 1366, height: 768 },
]
const report = []

try {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      locale: 'pt-BR',
      reducedMotion: 'reduce',
      serviceWorkers: 'block',
    })
    const page = await context.newPage()
    const pageErrors = []
    const consoleErrors = []
    page.on('pageerror', error => pageErrors.push(error.message.slice(0, 240)))
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text().slice(0, 240))
    })
    const result = { profile: profile.name, viewport: profile.width, pageErrors, consoleErrors }
    try {
      const response = await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 28000 })
      result.httpStatus = response?.status()
      if (profile.width < 768) {
        await page.waitForTimeout(11500)
        result.autoPromptAbsentAfter11s = await page.getByText('Posso te ajudar a estimar o custo', { exact: false }).count() === 0
        await page.screenshot({ path: screenshotRoot + '/initial-' + profile.name + '.png' })
      }

      if (profile.width >= 768) {
        const skipIntro = page.locator('main button').filter({ hasText: /Pular|Skip/i }).first()
        await skipIntro.waitFor({ state: 'visible', timeout: 10000 })
        await skipIntro.click({ timeout: 6500 })
        await skipIntro.waitFor({ state: 'detached', timeout: 6500 })
      }

      const liz = page.locator('button[aria-controls="liz-assistant-panel"]').first()
      await liz.waitFor({ timeout: 10000 })
      result.lizStartsClosed = (await liz.getAttribute('aria-expanded')) === 'false'
      await liz.click({ timeout: 5000 })
      result.lizOpensOnTap = (await liz.getAttribute('aria-expanded')) === 'true'
      result.lizPanelVisible = await page.locator('#liz-assistant-panel').isVisible()
      await liz.click({ timeout: 5000 })
      result.lizClosesOnTap = (await liz.getAttribute('aria-expanded')) === 'false'

      const gallery = page.locator('section[aria-label="Galeria de projetos"]')
      const duplicate = page.locator('section[aria-label="Galeria Instagram"]')
      result.galleryCount = await gallery.count()
      result.duplicateGalleryCount = await duplicate.count()
      await gallery.scrollIntoViewIfNeeded({ timeout: 12000 })
      await gallery.getByText('@grupowgalmeida').waitFor({ timeout: 14000 })
      result.preferredGalleryVisible = await gallery.getByText('@grupowgalmeida').isVisible()
      await gallery.screenshot({ path: screenshotRoot + '/gallery-' + profile.name + '.png' })

      const slider = page.locator('[data-testid="home-color-comparison"]')
      await slider.scrollIntoViewIfNeeded({ timeout: 12000 })
      result.initialSlider = Number(await slider.getAttribute('aria-valuenow'))
      const originalFilter = await slider.locator('img').first().evaluate(img => getComputedStyle(img).filter)
      const paletteButtons = page.locator('button[aria-pressed]').filter({ has: page.locator('div.flex.gap-1') })
      result.paletteCandidates = await paletteButtons.count()
      const button = paletteButtons.nth(1)
      await button.click({ timeout: 9000 })
      result.secondPalettePressed = (await button.getAttribute('aria-pressed')) === 'true'
      const currentFilter = await slider.locator('img').first().evaluate(img => getComputedStyle(img).filter)
      result.previewFilterChanges = originalFilter !== currentFilter
      result.demoLabelVisible = await page.getByText('Prévia ilustrativa').isVisible()

      await slider.focus()
      await page.keyboard.press('ArrowRight')
      result.sliderKeyboardWorks = Number(await slider.getAttribute('aria-valuenow')) > result.initialSlider
      const box = await slider.boundingBox()
      if (box) {
        await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.3)
        await page.mouse.down()
        await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.3, { steps: 6 })
        await page.mouse.up()
      }
      result.sliderDragWorks = Number(await slider.getAttribute('aria-valuenow')) > 65
      result.horizontalOverflowPx = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth))
      if (screenshotRoot) {
        await page.screenshot({ path: screenshotRoot + '/home-' + profile.name + '.png' })
      }
    } catch (error) {
      result.error = String(error.message).slice(0, 1800)
    }
    result.passed = result.httpStatus === 200
      && result.lizStartsClosed === true && result.lizOpensOnTap === true
      && result.lizPanelVisible === true && result.lizClosesOnTap === true
      && (profile.width >= 768 || result.autoPromptAbsentAfter11s === true)
      && result.galleryCount === 1 && result.duplicateGalleryCount === 0
      && result.preferredGalleryVisible === true
      && result.secondPalettePressed === true && result.previewFilterChanges === true
      && result.demoLabelVisible === true
      && result.sliderKeyboardWorks === true && result.sliderDragWorks === true
      && result.horizontalOverflowPx === 0 && pageErrors.length === 0
    report.push(result)
    await context.close()
  }
} finally {
  await browser.close()
}
const passed = report.every(result => result.passed)
console.log(JSON.stringify({ passed, report }, null, 2))
if (!passed) process.exitCode = 1
