import { chromium } from 'playwright'
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']})
const url='http://127.0.0.1:3109/mentoria-construcao'
const checks=[]
for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
 const page=await browser.newPage({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500})
 const errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 await page.goto(url,{waitUntil:'domcontentloaded'})
 const cover=page.getByRole('button',{name:'Reproduzir apresentação de William Almeida'})
 await cover.waitFor({timeout:20000})
 const notInitiallyLoaded=await page.locator('video.mcl-nonexistent').count()===0 && await page.locator('.mcl-film video').count()===0
 await cover.click()
 const video=page.locator('.mcl-film video')
 await video.waitFor({timeout:12000})
 const media=await video.evaluate(async v=>{
  await new Promise(resolve=>{
   if(v.readyState>=1){resolve();return}
   v.addEventListener('loadedmetadata',resolve,{once:true})
   v.addEventListener('error',resolve,{once:true})
   setTimeout(resolve,12000)
  })
  return {src:v.currentSrc,readyState:v.readyState,networkState:v.networkState,duration:v.duration,error:v.error?.message||null,paused:v.paused}
 })
 checks.push({viewport:viewport.width,notInitiallyLoaded,media,errors,pass:notInitiallyLoaded&&media.src.endsWith('/media/mentoria-construcao/apresentacao-720p.mp4')&&media.duration>145&&media.duration<148&&!media.error&&!errors.length})
 await page.close()
}
await browser.close()
console.log(JSON.stringify({pass:checks.every(x=>x.pass),checks}))
if(!checks.every(x=>x.pass))process.exitCode=1
