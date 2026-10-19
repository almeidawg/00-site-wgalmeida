/**
 * Laboratório browser OFFLINE sobre bundle local de produção (read-only).
 * Isola rede externa e intercepta APIs; usa apenas dados sintéticos.
 * Exemplo: node tools/mentoria-lab-browser.mjs nav
 *          node tools/mentoria-lab-browser.mjs form
 */
import { createServer } from 'node:http'
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs'
import { resolve, extname, sep } from 'node:path'
import { chromium } from 'playwright'

const root = resolve(process.env.MENTORIA_LAB_DIST || 'dist')
const mode = process.argv[2] || 'nav'
const results = []
const screens = resolve('.codex/tmp/mentoria-lab-qa')
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.json':'application/json', '.svg':'image/svg+xml', '.webp':'image/webp','.png':'image/png',
  '.jpg':'image/jpeg','.mp4':'video/mp4','.vtt':'text/vtt', '.woff2':'font/woff2'}
if (!existsSync(resolve(root,'index.html'))) throw Error('LAB_BUILD_MISSING')
const server = createServer((req,res) => {
  const pathname = new URL(req.url, 'http://127.0.0.1').pathname
  if (pathname.startsWith('/api/')) {
    res.writeHead(503,{'Content-Type':'application/json'})
    res.end(JSON.stringify({error:'LAB_API_DENIED_BY_DEFAULT'}))
    return
  }
  let candidate
  try { candidate = resolve(root, decodeURIComponent(pathname).replace(/^\/+/,'')) }
  catch { res.writeHead(400);res.end();return }
  if (!candidate.startsWith(root+sep) && candidate!==root) {
    res.writeHead(403);res.end();return
  }
  if (existsSync(candidate) && statSync(candidate).isDirectory()) candidate=resolve(candidate,'index.html')
  if (!existsSync(candidate) || candidate===root) candidate = resolve(root,'index.html')
  const type=mime[extname(candidate)]||'application/octet-stream'
  const data=readFileSync(candidate)
  const match=(req.headers.range||'').match(/^bytes=(\d+)-(\d*)$/)
  if(match){
    const start=Number(match[1])
    const end=match[2]?Math.min(Number(match[2]),data.length-1):data.length-1
    if(start>data.length-1 || end<start){res.writeHead(416);res.end();return}
    res.writeHead(206,{'Content-Type':type,'Accept-Ranges':'bytes',
      'Content-Range':'bytes '+start+'-'+end+'/'+data.length,'Content-Length':end-start+1,'Cache-Control':'no-store'})
    res.end(data.subarray(start,end+1));return
  }
  res.writeHead(200,{'Content-Type':type,'Content-Length':data.length,'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'})
  res.end(data)
})
let browser
try {
  await new Promise((resolve,reject) => {
    server.once('error',reject);server.listen(0,'127.0.0.1',resolve)
  })
  const origin='http://127.0.0.1:'+server.address().port
  browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--no-first-run']})
  mkdirSync(screens,{recursive:true})

  const createPage=async (width,height=900,apiStatus=200) => {
    const page=await browser.newPage({viewport:{width,height},serviceWorkers:'block'})
    const blocked=[]
    const jsErrors=[]
    const requests=[]
    page.on('pageerror',error=>jsErrors.push(String(error).slice(0,180)))
    await page.route('**/*',async route=>{
      const url=route.request().url()
      if(url.startsWith(origin+'/')) {
        if(url.includes('/api/contact')) {
          requests.push({path:'/api/contact',method:route.request().method(),body:route.request().postDataJSON?.()||null})
          await route.fulfill({status:apiStatus,contentType:'application/json',body:JSON.stringify(apiStatus===200?{ok:true,id:'synthetic-local-only'}:{error:'Erro sintético, nenhum registro foi criado'})})
          return
        }
        return route.continue()
      }
      blocked.push(new URL(url).hostname||'opaque')
      return route.abort('blockedbyclient')
    })
    // Bloqueia a abertura do WhatsApp e mantém handlers React de clique ativos.
    await page.addInitScript(() => {
      document.addEventListener('click',(ev)=>{
        const link=ev.target.closest?.('a[href*="wa.me/"]')
        if(link) {ev.preventDefault();window.__labWhatsappClicks=(window.__labWhatsappClicks||0)+1}
      },true)
    })
    return {page,blocked,jsErrors,requests}
  }
  if(mode==='nav'){
    for(const width of [375,768,1366]){
      const {page,blocked,jsErrors}=await createPage(width)
      const resp=await page.goto(origin+'/mentoria-construcao', {waitUntil:'domcontentloaded',timeout:20000})
      await page.locator('.mcl-hero h1').waitFor({timeout:12000})
      const landing=await page.evaluate(()=>({
        h1:document.querySelectorAll('.mcl h1').length,
        weeks:document.querySelectorAll('#programa .mcl-pilot__week').length,
        overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
        videoBeforeClick:document.querySelectorAll('.mcl-film video').length,
        whatsappLinks:document.querySelectorAll('.mcl a[href*="wa.me/"]').length,
        editorialHref:document.querySelector('.mcl-offer__preview-link')?.getAttribute('href'),
        robots:[...document.querySelectorAll('meta[name=robots]')].map(x=>x.content),
      }))
      const priority=page.locator('button.mcl-convert__choice').filter({hasText:'Sistema de gestão completo'})
      await priority.click({timeout:5000})
      const link=await page.locator('.mcl-convert__submit').getAttribute('href')
      const wa=new URL(link)
      const pref=wa.searchParams.get('text')||''
      await page.locator('.mcl-convert__submit').click({timeout:5000})
      const clickCount=await page.evaluate(()=>window.__labWhatsappClicks||0)
      await page.locator('.mcl-offer__preview-link').click({timeout:8000})
      await page.waitForURL(/\/mentoria-construcao\/abordagens$/, {timeout:12000})
      const navigatedTopics=page.url().endsWith('/mentoria-construcao/abordagens')
      await page.locator('.mab-area').first().waitFor({timeout:12000})
      const before=await page.locator('.mab-area__example').count()
      await page.locator('.mab-area__expand').first().click({timeout:5000})
      const after=await page.locator('.mab-area__example').count()
      const topics=await page.evaluate(()=>({
        cards:document.querySelectorAll('.mab-area').length,
        topics:document.querySelectorAll('.mab-area__details li').length,
        overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
        anchors:document.querySelectorAll('.mab-index a').length,
        inputCount:document.querySelectorAll('.mab input,.mab select,.mab textarea').length,
      }))
      await page.locator('a.mab-button--light').click({timeout:8000})
      await page.waitForURL(/\/mentoria-construcao#programa$/, {timeout:12000})
      await page.locator('#programa .mcl-pilot__week').first().waitFor({timeout:12000})
      const returnedToProgram=await page.locator('#programa .mcl-pilot__week').count()===8
      const ok=resp.status()===200 && navigatedTopics && returnedToProgram && landing.h1===1 && landing.weeks===8 &&
        landing.overflow<=2 && landing.videoBeforeClick===0 && landing.whatsappLinks>=2 &&
        landing.editorialHref?.endsWith('/abordagens') && wa.hostname==='wa.me' &&
        pref.includes('em um sistema') && clickCount===1 &&
        topics.cards===10 && topics.topics===30 && topics.anchors===10 &&
        topics.inputCount===0 && topics.overflow<=2 && before===0 && after===1 && !jsErrors.length
      if(width===375 || width===1366)
        await page.screenshot({path:resolve(screens,'lab-'+width+'.png'),fullPage:false,timeout:12000})
      results.push({mode,width,ok,landing,topics,navigatedTopics,returnedToProgram,clickCount,waHost:wa.hostname,
        externalBlocked:[...new Set(blocked)],jsErrors})
      await page.close()
    }
  } else if(mode==='form'){
    const {page,blocked,jsErrors,requests}=await createPage(390)
    const resp=await page.goto(origin+'/contato?context=mentoria-lab&utm_source=qa_mentoria',
      {waitUntil:'domcontentloaded',timeout:20000})
    await page.locator('input#contact-name').waitFor({timeout:15000})
    await page.locator('#contact-name').fill('Pessoa Sintética QA')
    await page.locator('#contact-email').fill('mentoria.lab@example.test')
    await page.locator('#contact-phone').fill('11999990000')
    await page.locator('#contact-subject').fill('Cadastro simulado Mentoria')
    await page.locator('#contact-message').fill('Solicitação fictícia para teste de navegação e envio de formulário.')
    await page.locator('form button[type=submit]').click({timeout:5000})
    await page.waitForTimeout(1200)
    const result={mode,http:resp.status(),intercepted:requests.length,
      payload:requests.map(r=>({
        method:r.method,context:r.body?.context,utm_source:r.body?.utm_source,
        testEmail:r.body?.email==='mentoria.lab@example.test',
        syntheticName:r.body?.name==='Pessoa Sintética QA'
      })),errors:jsErrors,externalBlocked:[...new Set(blocked)]}
    result.ok=resp.status()===200 && requests.length===1 &&
      requests[0].body?.context==='mentoria-lab' &&
      requests[0].body?.email==='mentoria.lab@example.test' &&
      jsErrors.length===0
    results.push(result)
    await page.close()
  } else if(mode==='form-negative'){
    for(const scenario of ['invalid-email','api-unavailable']){
      const {page,blocked,jsErrors,requests}=await createPage(390,844,scenario==='api-unavailable'?503:200)
      const resp=await page.goto(origin+'/contato?context=mentoria-lab-negativo',{waitUntil:'domcontentloaded',timeout:20000})
      await page.locator('#contact-name').waitFor({timeout:14000})
      await page.locator('#contact-name').fill('Registro Sintético QA')
      await page.locator('#contact-email').fill(scenario==='invalid-email'?'email-invalido':'erro.lab@example.test')
      await page.locator('#contact-subject').fill('Teste sintético de falha')
      await page.locator('#contact-message').fill('Nenhum registro real pode ser criado por este cenário de laboratório.')
      await page.locator('form button[type=submit]').click({timeout:5500})
      await page.waitForTimeout(800)
      const invalid=await page.locator('#contact-email').evaluate(e=>!e.validity.valid)
      const afterName=await page.locator('#contact-name').inputValue()
      const afterMessage=await page.locator('#contact-message').inputValue()
      const toastVisible=scenario==='api-unavailable'?
        await page.getByText('Erro sintético, nenhum registro foi criado').count():0
      const ok=resp.status()===200 && !jsErrors.length &&
        (scenario==='invalid-email'? invalid && requests.length===0:
          requests.length===1 && toastVisible>0 && afterName==='Registro Sintético QA' &&
          afterMessage.includes('Nenhum registro real'))
      results.push({mode,scenario,ok,http:resp.status(),invalid,apiPosts:requests.length,
        keptDraft:afterName==='Registro Sintético QA',toastVisible,blocked:[...new Set(blocked)],jsErrors})
      await page.close()
    }
  } else if(mode==='video'){
    const {page,blocked,jsErrors}=await createPage(390,844)
    const resp=await page.goto(origin+'/mentoria-construcao',{waitUntil:'domcontentloaded',timeout:20000})
    await page.getByRole('button',{name:'Reproduzir apresentação de William Almeida'}).waitFor({timeout:14000})
    const before=await page.locator('.mcl-film video').count()
    await page.getByRole('button',{name:'Reproduzir apresentação de William Almeida'}).click({timeout:5500})
    const video=page.locator('.mcl-film video')
    await video.waitFor({timeout:10000})
    await page.waitForFunction(()=>{const v=document.querySelector('.mcl-film video');return Boolean(v && (v.readyState>=1||v.error))},{timeout:17000})
    const media=await video.evaluate(v=>({
      src:new URL(v.currentSrc).pathname,duration:v.duration,
      readyState:v.readyState,error:v.error?.code||null,
      tracks:[...v.querySelectorAll('track')].map(t=>({kind:t.kind,src:t.getAttribute('src')})),
    }))
    const ok=resp.status()===200 && before===0 && media.readyState>=1 &&
      media.duration>=145 && media.duration<=148 && !media.error &&
      media.src.endsWith('/media/mentoria-construcao/apresentacao-720p.mp4') &&
      media.tracks.some(t=>t.kind==='captions' && t.src?.endsWith('.vtt')) &&
      !jsErrors.length
    results.push({mode,ok,before,media,blocked:[...new Set(blocked)],jsErrors})
    await page.close()
  } else if(mode==='host'){
    const {page,blocked,jsErrors}=await createPage(375,844)
    let mocked=0
    const missingFiles=[]
    const consoleErrors=[]
    page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text().slice(0,250))})
    await page.route('https://mentoria.wgalmeida.com.br/**',async route=>{
      mocked++
      const url=new URL(route.request().url())
      let filename=resolve(root,decodeURIComponent(url.pathname).replace(/^\/+/,''))
      if(!filename.startsWith(root+sep) || !existsSync(filename) ||filename===root) {
        if (/\.(js|css|svg|png|webp|woff2|vtt|mp4)$/.test(url.pathname)) {
          missingFiles.push(url.pathname)
          await route.fulfill({status:404,contentType:'text/plain',body:'LAB_MISSING_ASSET'});return
        }
        filename=resolve(root,'index.html')
      }
      if(existsSync(filename) && statSync(filename).isDirectory()) filename=resolve(filename,'index.html')
      await route.fulfill({status:200,contentType:mime[extname(filename)]||'application/octet-stream',
        body:readFileSync(filename),headers:{'X-Robots-Tag':'noindex, nofollow'}})
    })
    const r=await page.goto('https://mentoria.wgalmeida.com.br/',{waitUntil:'domcontentloaded',timeout:20000})
    await page.locator('.mcl-hero h1').waitFor({timeout:12000})
    const landing=await page.evaluate(()=>({
      host:location.hostname, weeks:document.querySelectorAll('#programa .mcl-pilot__week').length,
      canonical:document.querySelector('link[rel=canonical]')?.href,
      robots:[...document.querySelectorAll('meta[name=robots]')].map(m=>m.content),
    }))
    const r2=await page.goto('https://mentoria.wgalmeida.com.br/abordagens',
      {waitUntil:'domcontentloaded',timeout:16000})
    await page.locator('.mab-area').first().waitFor({timeout:10000})
    const editorial=await page.evaluate(()=>({
      host:location.hostname, cards:document.querySelectorAll('.mab-area').length,
      canonical:document.querySelector('link[rel=canonical]')?.href,
    }))
    await page.waitForTimeout(1200)
    const ok=r.status()===200 && r2.status()===200 &&
      landing.host==='mentoria.wgalmeida.com.br' && landing.weeks===8 &&
      landing.canonical==='https://mentoria.wgalmeida.com.br/' &&
      landing.robots.every(x=>x.includes('noindex')) && editorial.cards===10 &&
      editorial.canonical==='https://mentoria.wgalmeida.com.br/abordagens' &&
      mocked>1 && !jsErrors.length && missingFiles.length===0
    results.push({mode,ok,mocked,landing,editorial,missingFiles,consoleErrors,blocked:[...new Set(blocked)],jsErrors,
      warning:'HOST INTERCEPTADO NO CHROME, SEM DNS REAL, VERCEL OU CERTIFICADO'})
    await page.close()
  } else throw Error('INVALID_LAB_MODE')
} catch(e){
  results.push({mode,ok:false,error:String(e).slice(0,700)})
} finally {
  if(browser) await browser.close()
  await new Promise(resolve=>server.close(resolve))
}
const report={lab:'mentoria-offline-browser',mode,status:results.every(r=>r.ok)?'PASS':'FAIL',results}
writeFileSync(resolve(screens,'report-'+mode+'.json'),JSON.stringify(report,null,2),'utf8')
console.log(JSON.stringify(report,null,2))
if(report.status!=='PASS')process.exitCode=1
