/**
 * Mentoria local read-only preview. Loopback only; no real API requests.
 * node tools/mentoria-local-server.mjs --port 3109 --dist dist
 * Stop only the PID reported by /__lab__/status.
 */
import { createServer } from 'node:http'
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { resolve, relative, extname, sep } from 'node:path'
import { validateMentoriaInterest } from '../src/lib/mentoriaInterestContract.js'
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:fallback}
const port=Number(arg('--port','3109'))
const root=resolve(arg('--dist','dist'))
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('INVALID_PORT')
if(!existsSync(resolve(root,'index.html')))throw Error('DIST_NOT_FOUND')
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2','.mp4':'video/mp4','.vtt':'text/vtt; charset=utf-8','.txt':'text/plain'}
const headers={'X-Robots-Tag':'noindex, nofollow','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self' data: blob:; connect-src 'self'; form-action 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' blob:; frame-src 'none'; object-src 'none'"}
const client = (()=>{
  window.__MENTORIA_LAB__ = true
  const show=(message)=>{
    let toast=document.getElementById('__mentoria_lab_toast')
    if(!toast){
      toast=document.createElement('div');toast.id='__mentoria_lab_toast';toast.setAttribute('role','status')
      toast.style.cssText='position:fixed;z-index:2147483647;right:12px;bottom:12px;max-width:min(90vw,440px);white-space:pre-wrap;background:#172338;color:#fff;padding:16px;border-radius:10px;box-shadow:0 8px 26px #0004;font:14px/1.5 Arial,sans-serif'
      document.body.appendChild(toast)
    }
    toast.textContent=message
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const flag=document.createElement('div')
    flag.textContent='LAB LOCAL · ENVIOS SIMULADOS'
    flag.style.cssText='position:fixed;right:8px;top:8px;z-index:2147483645;padding:6px 10px;background:#19263c;color:white;border:1px solid #f39262;border-radius:4px;font:700 10px Arial,sans-serif;opacity:.85;pointer-events:none'
    document.body.appendChild(flag)
  })
  document.addEventListener('click',(event)=>{
    const a=event.target.closest?.('a[href]');if(!a)return
    const u=new URL(a.href,location.href)
    if((['http:','https:','mailto:','tel:'].includes(u.protocol))&&u.origin!==location.origin){
      event.preventDefault()
      const wa=u.hostname==='wa.me'||u.hostname.endsWith('.whatsapp.com')
      const message=wa?u.searchParams.get('text'):null
      show((wa?'WhatsApp interceptado. Nenhuma mensagem enviada.':'Link externo bloqueado no laboratório.')+(message?'\n\nMensagem preparada:\n'+message:''))
    }
  },true)
}).toString()
const clientJs='('+client+')();'
const err=(res,code,message)=>{res.writeHead(code,{...headers,'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:message}))}
let mockPosts=0
let mentoriaMockPosts=0
const server=createServer((req,res)=>{
  let url;try{url=new URL(req.url,'http://127.0.0.1')}catch{return err(res,400,'BAD_URL')}
  const p=url.pathname
  if(p==='/__lab__/status'){
    res.writeHead(200,{...headers,'Content-Type':'application/json'})
    return res.end(JSON.stringify({ok:true,pid:process.pid,port,dist:root,mode:'local-only',externalLinks:'intercepted',api:'mock-only',mockPosts,mentoriaMockPosts}))
  }
  if(p==='/__lab__/client.js'){
    res.writeHead(200,{...headers,'Content-Type':'text/javascript; charset=utf-8'})
    return res.end(clientJs)
  }
  if(p==='/robots.txt'){
    res.writeHead(200,{...headers,'Content-Type':'text/plain'})
    return res.end('User-agent: *\nDisallow: /\n')
  }
  if(p.startsWith('/api/')){
    if(req.method!=='POST'||!['/api/contact','/api/mentoria-interest'].includes(p))return err(res,503,'LAB_API_DISABLED')
    let bytes=0;const chunks=[]
    req.on('data',chunk=>{bytes+=chunk.length;if(bytes>65536){req.destroy();return}chunks.push(chunk)})
    req.on('end',()=>{
      if(bytes>65536)return
      if(p==='/api/mentoria-interest'){
        let payload
        try{payload=JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{return err(res,400,'LAB_INVALID_JSON')}
        const validation=validateMentoriaInterest(payload)
        if(!validation.ok)return err(res,422,'LAB_MENTORIA_VALIDATION_FAILED')
        mentoriaMockPosts++
      }else{mockPosts++}
      // A entrada recebida é descartada imediatamente, sem qualquer persistência ou log.
      res.writeHead(200,{...headers,'Content-Type':'application/json'})
      res.end(JSON.stringify({ok:true,simulated:true,id:'lab-synthetic-not-persisted',message:'NO_REAL_LEAD_CREATED'}))
    })
    return
  }
  if(req.method!=='GET'&&req.method!=='HEAD')return err(res,405,'METHOD_NOT_ALLOWED')
  let relativePath;try{relativePath=decodeURIComponent(p).replace(/^\/+/,'')}catch{return err(res,400,'INVALID_PATH')}
  if(relativePath.includes('\0'))return err(res,400,'INVALID_PATH')
  let file=resolve(root,relativePath)
  const rel=relative(root,file)
  if(rel==='..'||rel.startsWith('..'+sep)||rel.startsWith('/')||rel.startsWith('\\'))return err(res,403,'PATH_DENIED')
  if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html')
  if(!existsSync(file)){
    if(/\.[a-z0-9]{1,6}$/i.test(p))return err(res,404,'ASSET_NOT_FOUND')
    file=resolve(root,'index.html')
  }
  if(!statSync(file).isFile())return err(res,404,'FILE_NOT_FOUND')
  const total=statSync(file).size,type=mime[extname(file).toLowerCase()]||'application/octet-stream'
  const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'')
  if(range){
    const from=Number(range[1]),to=range[2]?Math.min(Number(range[2]),total-1):total-1
    if(!Number.isSafeInteger(from)||from>=total||to<from)return err(res,416,'INVALID_RANGE')
    res.writeHead(206,{...headers,'Content-Type':type,'Accept-Ranges':'bytes','Content-Range':'bytes '+from+'-'+to+'/'+total,'Content-Length':to-from+1})
    return req.method==='HEAD'?res.end():createReadStream(file,{start:from,end:to}).pipe(res)
  }
  if(type.startsWith('text/html')){
    // Remove Google Fonts requests only in this local QA server; use already bundled local woff2 files.
    const fontCss="<style>@font-face{font-family:'Playfair Display';src:url('/fonts/playfair-400.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap;}@font-face{font-family:'Playfair Display';src:url('/fonts/playfair-500.woff2') format('woff2');font-weight:500;font-style:normal;font-display:swap;}@font-face{font-family:'Playfair Display';src:url('/fonts/playfair-400i.woff2') format('woff2');font-weight:400;font-style:italic;font-display:swap;}@font-face{font-family:'Playfair Display';src:url('/fonts/playfair-500i.woff2') format('woff2');font-weight:500;font-style:italic;font-display:swap;}@font-face{font-family:'Oswald';src:url('/fonts/oswald-500.woff2') format('woff2');font-weight:500;font-style:normal;font-display:swap;}@font-face{font-family:'Oswald';src:url('/fonts/oswald-600.woff2') format('woff2');font-weight:600;font-style:normal;font-display:swap;}@font-face{font-family:'Oswald';src:url('/fonts/oswald-700.woff2') format('woff2');font-weight:700;font-style:normal;font-display:swap;}@font-face{font-family:'Poppins';src:url('/fonts/poppins-400.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap;}@font-face{font-family:'Poppins';src:url('/fonts/poppins-500.woff2') format('woff2');font-weight:500;font-style:normal;font-display:swap;}@font-face{font-family:'Poppins';src:url('/fonts/poppins-600.woff2') format('woff2');font-weight:600;font-style:normal;font-display:swap;}@font-face{font-family:'Inter';src:url('/fonts/inter-300.woff2') format('woff2');font-weight:300;font-style:normal;font-display:swap;}@font-face{font-family:'Inter';src:url('/fonts/inter-400.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap;}@font-face{font-family:'Inter';src:url('/fonts/inter-500.woff2') format('woff2');font-weight:500;font-style:normal;font-display:swap;}@font-face{font-family:'Inter';src:url('/fonts/inter-600.woff2') format('woff2');font-weight:600;font-style:normal;font-display:swap;}@font-face{font-family:'Inter';src:url('/fonts/inter-700.woff2') format('woff2');font-weight:700;font-style:normal;font-display:swap;}</style>"
    const html=readFileSync(file,'utf8').replace(/<link[^>]+https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>/g,'').replace('</head>',fontCss+'</head>').replace('</body>','<script src="/__lab__/client.js" defer></script></body>')
    const body=Buffer.from(html)
    res.writeHead(200,{...headers,'Content-Type':type,'Content-Length':body.length})
    return res.end(req.method==='HEAD'?undefined:body)
  }
  res.writeHead(200,{...headers,'Content-Type':type,'Content-Length':total,'Accept-Ranges':'bytes'})
  return req.method==='HEAD'?res.end():createReadStream(file).pipe(res)
})
server.on('error',error=>{console.error('LOCAL_SERVER_ERROR',error.code||error.message);process.exitCode=1})
server.listen(port,'127.0.0.1',()=>console.log(JSON.stringify({ready:true,pid:process.pid,url:'http://127.0.0.1:'+port,root,api:'mock-only'})))
process.on('SIGTERM',()=>server.close(()=>process.exit(0)))
