import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Pre-render only the pre-hydration <head>. React still owns the actual page.
export const MENTORIA_STATIC_ROUTES = Object.freeze([
  { route: '/mentoria-construcao', title: 'Mentoria Estratégica Individual | Grupo WG Almeida', description: 'Mentoria individual de oito semanas para empresas da construção: operação, comercial, gestão e aplicação prática de IA.' },
  { route: '/mentoria-construcao/abordagens', title: 'Temas para aprofundar na mentoria | Grupo WG Almeida', description: 'Explore prioridades de operação, comercial, processos e tecnologia para sua empresa de obras ou reformas.' },
  { route: '/mentoria-construcao/contato', title: 'Converse sobre a Mentoria Construção | Grupo WG Almeida', description: 'Conte o cenário da sua empresa de obras e reformas. O formulário de interesse está em homologação e não recebe cadastros reais.' },
])

const replaceExactlyOnce = (html, matcher, replacement, label) => {
  const matches = [...html.matchAll(new RegExp(matcher.source, 'gi'))]
  if (matches.length !== 1) throw new Error(`mentoria-static-head: ${label}: expected 1, found ${matches.length}`)
  return html.replace(matcher, replacement)
}
const escapeHtml = (s) => String(s).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

export const createMentoriaStaticHtml = (template, route) => {
  if (!MENTORIA_STATIC_ROUTES.some((item) => item.route === route?.route)) throw new Error('Unknown mentoria static route')
  if (!template.includes('<!doctype html>') || !template.includes('<div id="root">')) throw new Error('Invalid Vite HTML template')
  let html = template
  const canonical = `https://wgalmeida.com.br${route.route}`
  html = replaceExactlyOnce(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`, 'title')
  html = replaceExactlyOnce(html, /<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(route.description)}" />`, 'description')
  html = replaceExactlyOnce(html, /<meta\s+name="robots"[^>]*>/i, '<meta name="robots" content="noindex, nofollow" />', 'robots')
  html = replaceExactlyOnce(html, /<meta\s+name="googlebot"[^>]*>/i, '<meta name="googlebot" content="noindex, nofollow" />', 'googlebot')
  html = replaceExactlyOnce(html, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" id="dynamic-canonical" href="${canonical}" />`, 'canonical')
  // The shared SPA template has noscript tracking for the institutional site.
  // Remove that markup ONLY from these prelaunch mentorship documents.
  html = html.replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/i, '')
  html = html.replace(/<!-- Pinterest Tag \(noscript\) -->[\s\S]*?<!-- End Pinterest Tag \(noscript\) -->/i, '')
  // The canonical root index includes an institutional SEO fallback. Do not
  // copy that homepage text into a prelaunch mentorship page before React mounts.
  const rootStart = html.indexOf('<div id="root">')
  const fallbackStart = html.indexOf('<div id="wg-seo-fallback"', rootStart)
  if (fallbackStart > rootStart) {
    const fallbackEnd = html.indexOf('</div></div>', fallbackStart)
    if (fallbackEnd < 0) throw new Error('Invalid static root fallback boundaries')
    const prelaunchFallback = `<div id="root"><main style="max-width:780px;margin:56px auto;padding:0 24px;font-family:system-ui,sans-serif"><h1>${escapeHtml(route.title)}</h1><p>${escapeHtml(route.description)}</p><p>Ambiente de homologação. O recebimento de solicitações permanece desativado.</p></main></div>`
    html = html.slice(0, rootStart) + prelaunchFallback + html.slice(fallbackEnd + '</div></div>'.length)
  }
  return html
}

export const generateMentoriaStaticHeads = (outDir = 'dist', root = process.cwd()) => {
  const base = path.resolve(root, outDir)
  const source = path.join(base, 'index.html')
  if (!fs.existsSync(source)) throw new Error('Vite index.html missing')
  const template = fs.readFileSync(source, 'utf8')
  for (const route of MENTORIA_STATIC_ROUTES) {
    const destination = path.join(base, route.route.slice(1), 'index.html')
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    fs.writeFileSync(destination, createMentoriaStaticHtml(template, route))
    console.log(`Mentoria static pre-hydration head: ${route.route}`)
  }
  return MENTORIA_STATIC_ROUTES.length
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateMentoriaStaticHeads(process.argv[2] || 'dist')
}
