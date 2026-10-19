import { chromium } from 'playwright'

const url = process.env.MENTORIA_URL || 'http://127.0.0.1:3111/mentoria-construcao'
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const report = []
function ratio(foreground, background) {
  const c = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map((v) => {
    const n = Number(v) / 255
    return n <= 0.04045 ? n/12.92 : ((n+0.055)/1.055)**2.4
  })
  const L = a => a[0]*.2126+a[1]*.7152+a[2]*.0722
  const a=L(c(foreground)), b=L(c(background))
  return Number(((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toFixed(2))
}
try {
for (const width of [390,1366]) {
 const page = await browser.newPage({viewport:{width,height:width===390?844:900}})
 const response = await page.goto(url+'?utm_source=instagram&utm_medium=paid_social&utm_campaign=pre_lancamento&utm_content=ia_01_contexto',{waitUntil:'domcontentloaded',timeout:30000})
 await page.locator('#ia-na-operacao .mcl-ai__bottom a').click()
 const active = await page.locator('.mcl-convert__choice--active').innerText()
 const href = await page.locator('.mcl-convert__submit').getAttribute('href')
 const wa = new URL(href)
 const message = wa.searchParams.get('text')||''
 const styles = await page.evaluate(() => {
   const ids=['.mcl-intro','.mcl-convert','.mcl-button--orange']
   return ids.map(s=>{const el=document.querySelector(s);const c=getComputedStyle(el);return {selector:s,fg:c.color,bg:c.backgroundColor}})
 })
 const contrasts = styles.map(s=>({...s,ratio:ratio(s.fg,s.bg)}))
 const gallery = await page.locator('.mcl-gallery figure img').evaluateAll(imgs=>imgs.map(i=>({src:i.getAttribute('src'),w:i.getAttribute('width'),h:i.getAttribute('height')})))
 const robots = await page.locator('meta[name="robots"]').evaluateAll(els=>els.map(e=>e.content))
 const weeks = await page.locator('#programa .mcl-pilot__week').count()
 const weeklyHeading = await page.locator('#programa #mcl-pilot-heading').innerText()
 await page.locator('#programa .mcl-pilot__bottom a').click()
 const programChoice = await page.locator('.mcl-convert__choice--active').innerText()
 const programHref = new URL(await page.locator('.mcl-convert__submit').getAttribute('href'))
 const programMessage = programHref.searchParams.get('text') || ''
 const checks = {
  http200:response?.status()===200,
  choiceAI:active.includes('IA na operação'),
  correctWhatsapp:wa.hostname==='wa.me' && message.includes('inteligência artificial'),
  campaignAttribution:['source=instagram','medium=paid_social','campaign=pre_lancamento','content=ia_01_contexto'].every(x=>message.includes(x)),
  individualProgram:weeks===8 && weeklyHeading.includes('Oito semanas') && programChoice.includes('programa individual') && (await page.locator('#programa .mcl-pilot__summary strong').innerText()).includes('90 MIN'),
  individualWhatsapp:programHref.hostname==='wa.me' && programMessage.includes('oito semanas') && programMessage.includes('Mentoria Estratégica Individual') && programMessage.includes('90 minutos') && programMessage.includes('12 horas'),
  campaignAttributionProgram:['source=instagram','medium=paid_social','campaign=pre_lancamento','content=ia_01_contexto'].every(x=>programMessage.includes(x)),
  galleryThree:gallery.length===3 && gallery.every(g=>g.w==='900' && g.h==='1600' && g.src?.endsWith('.webp')),
  noindexPrelaunch:robots.every(x=>x.includes('noindex')),
  contrastAA:contrasts.every(x=>x.ratio>=4.5),
 }
 report.push({width,status:Object.values(checks).every(Boolean)?'OK':'CORRIGIR',checks,contrasts:contrasts.map(x=>({selector:x.selector,ratio:x.ratio})),galleryCount:gallery.length})
 await page.close()
}
} finally { await browser.close() }
console.log(JSON.stringify({status:report.every(x=>x.status==='OK')?'OK':'CORRIGIR',report},null,2))
if(report.some(x=>x.status!=='OK'))process.exitCode=1
