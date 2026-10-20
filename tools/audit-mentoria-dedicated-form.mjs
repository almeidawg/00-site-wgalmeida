/**
 * Chrome E2E do formulario dedicado. Somente servidor em 127.0.0.1 com API fake.
 * node tools/audit-mentoria-dedicated-form.mjs http://127.0.0.1:3111
 * Nunca passa dados reais nem abre conexões externas para testes de submissão.
 */
import { chromium } from 'playwright'
const origin=process.argv[2]||'http://127.0.0.1:3109'
const u=new URL(origin)
if(!['127.0.0.1','localhost'].includes(u.hostname)||u.protocol!=='http:')throw Error('LOOPBACK_ONLY')
const status=await (await fetch(origin+'/__lab__/status')).json()
if(status.mode!=='local-only'||status.api!=='mock-only')throw Error('NOT_LAB_SERVER')
const log=[]
let browser
try{
  browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--no-sandbox']})
  for(const width of [375,768,1366]){
    const page=await browser.newPage({viewport:{width,height:900},serviceWorkers:'block'})
    const errors=[]
    page.on('pageerror',e=>errors.push(e.message))
    const response=await page.goto(origin+'/mentoria-construcao',{waitUntil:'domcontentloaded',timeout:16000})
    await page.locator('.mcl-hero h1').waitFor({timeout:11000})
    await page.locator('.mcl-hero a[href*="/mentoria-construcao/contato"]').click({timeout:8000})
    await page.waitForURL(/\/mentoria-construcao\/contato\?prioridade=entender$/, {timeout:12000})
    await page.locator('.mcf-form').waitFor({timeout:11000})
    const form=await page.evaluate(()=>({
      lab:window.__MENTORIA_LAB__===true,
      name:document.querySelectorAll('#mcf-name').length,
      company:document.querySelectorAll('#mcf-company').length,
      prior:document.querySelector('#mcf-priority')?.value,
      consent:document.querySelector('#mcf-consent')?.required,
      canonical:document.querySelector('link[rel=canonical]')?.href,
      robots:document.querySelector('meta[name=robots]')?.content,
      overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
    }))
    const ok=response.status()===200&&form.lab&&form.name===1&&form.company===1&&form.prior==='entender'&&form.consent&&form.robots.includes('noindex')&&form.canonical==='https://wgalmeida.com.br/mentoria-construcao/contato'&&form.overflow<=2&&errors.length===0
    log.push({scenario:'hero-to-dedicated-form',width,ok,form,errors})
    await page.close()
  }
  const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'})
  const errors=[]
  const submits=[]
  page.on('pageerror',e=>errors.push(e.message))
  page.on('request',req=>{if(req.method()==='POST')submits.push(new URL(req.url()).pathname)})
  await page.goto(origin+'/mentoria-construcao',{waitUntil:'domcontentloaded'})
  await page.locator('.mcl-convert__choice').filter({hasText:'Aplicar IA na operação e gestão'}).click()
  await page.locator('.mcl-convert__form-link').click()
  await page.locator('.mcf-form').waitFor()
  const priority=await page.locator('#mcf-priority').inputValue()
  await page.locator('.mcf-submit').click()
  const emptyBlocked=submits.length===0
  await page.locator('#mcf-name').fill('Pessoa Sintética QA')
  await page.locator('#mcf-company').fill('Empresa Exemplo de Obras')
  await page.locator('#mcf-email').fill('qa@example.test')
  await page.locator('#mcf-phone').fill('1234')
  await page.locator('#mcf-segment').selectOption({label:'Reformas e manutenção'})
  await page.locator('#mcf-challenge').fill('Quero organizar a operação, os atendimentos, equipe e obras.')
  await page.locator('#mcf-consent').check()
  await page.locator('.mcf-submit').click()
  const phoneAlert=await page.getByRole('alert').innerText()
  const phoneBlocked=submits.length===0 && phoneAlert.includes('WhatsApp válido')
  await page.locator('#mcf-phone').fill('11999990000')
  await page.locator('.mcf-submit').click()
  await page.getByText('Validação concluída').waitFor({timeout:9000})
  const successText=await page.locator('.mcf-success').innerText()
  const after=await (await fetch(origin+'/__lab__/status')).json()
  const completed=priority==='ia'&&emptyBlocked&&phoneBlocked&&submits.length===1&&submits[0]==='/api/mentoria-interest'&&successText.includes('Nenhum dado real foi registrado')&&after.mentoriaMockPosts>=1&&!errors.length
  log.push({scenario:'full-form-journey',ok:completed,priority,emptyBlocked,phoneBlocked,phoneAlert,submits,mentoriaMockPosts:after.mentoriaMockPosts,errors})
  const response=await page.request.post(origin+'/api/mentoria-interest',{data:{context:'mentoria_construcao',privacyConsent:false}})
  const denied= response.status()===422
  log.push({scenario:'api-denies-without-consent',ok:denied,status:response.status()})
  await page.goto(origin+'/contato',{waitUntil:'domcontentloaded'})
  await page.locator('input#contact-name').waitFor({timeout:9000})
  const institutionalNotMentoria=await page.locator('.mcf-form').count()===0
  log.push({scenario:'institutional-contact-separate',ok:institutionalNotMentoria})
  await page.close()
} catch(e){log.push({scenario:'unhandled',ok:false,error:String(e).slice(0,800)})}
finally{if(browser)await browser.close()}
const ok=log.every(x=>x.ok)
console.log(JSON.stringify({audit:'mentoria-dedicated-form',ok,log},null,2))
if(!ok)process.exitCode=1
