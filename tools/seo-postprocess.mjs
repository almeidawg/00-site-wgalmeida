import fs from 'node:fs'
import path from 'node:path'
import { resolveCommercialTokens } from '../src/data/commercialGovernance.js'

const BASE_URL = 'https://wgalmeida.com.br'

const MANGLED_COMMERCIAL_TOKENS = new Map([
  ['COMMERCIALRANGE', 'COMMERCIAL_RANGE'],
  ['COMMERCIALTIMELINE', 'COMMERCIAL_TIMELINE'],
  ['COMMERCIALTIMELINEBASE', 'COMMERCIAL_TIMELINE_BASE'],
  ['COMMERCIALSUMMARY', 'COMMERCIAL_SUMMARY'],
  ['COMMERCIALIDEALFOR', 'COMMERCIAL_IDEAL_FOR'],
  ['COMMERCIALLABEL', 'COMMERCIAL_LABEL'],
  ['COMMERCIALSOURCE', 'COMMERCIAL_SOURCE'],
  ['COMMERCIALMATERIALRANGE', 'COMMERCIAL_MATERIAL_RANGE'],
])

const normalizeMangledCommercialTokens = (text = '') =>
  String(text).replace(/\{\{(COMMERCIAL[A-Z]+):/g, (match, token) => {
    const canonicalToken = MANGLED_COMMERCIAL_TOKENS.get(token)
    return canonicalToken ? `{{${canonicalToken}:` : match
  })

export const resolveCommercialTokensInHtml = (html = '') =>
  resolveCommercialTokens(normalizeMangledCommercialTokens(html))

const literalRouteMatches = (appSource = '') =>
  [...String(appSource).matchAll(/<Route\b[^>]*\bpath="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((route) => route && !route.includes(':') && !route.includes('*'))

export const buildCanonicalRouteSet = ({
  appSource = '',
  blogSlugs = [],
  styleSlugs = [],
} = {}) => {
  const routes = new Set(['/'])

  for (const route of literalRouteMatches(appSource)) {
    const normalized = route === '/' ? '/' : `/${String(route).replace(/^\/+|\/+$/g, '')}`
    routes.add(normalized)
  }

  for (const slug of blogSlugs) {
    if (slug) routes.add(`/blog/${slug}`)
  }

  for (const slug of styleSlugs) {
    if (slug) routes.add(`/estilos/${slug}`)
  }

  return routes
}

const routeFromLoc = (loc) => {
  try {
    const url = new URL(loc)
    let pathname = url.pathname || '/'
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1)
    return pathname
  } catch {
    return null
  }
}

export const rewriteSitemapXml = (xml = '', canonicalRoutes = new Set(), lastmod = new Date().toISOString().slice(0, 10)) => {
  const blocks = [...String(xml).matchAll(/<url>\s*[\s\S]*?<\/url>/gim)]
    .map((match) => match[0])
    .filter((block) => {
      const loc = block.match(/<loc>(.*?)<\/loc>/i)?.[1]?.trim()
      const route = loc ? routeFromLoc(loc) : null
      return route && canonicalRoutes.has(route)
    })
    .map((block) => {
      if (/<lastmod>.*?<\/lastmod>/i.test(block)) {
        return block.replace(/<lastmod>.*?<\/lastmod>/i, `<lastmod>${lastmod}</lastmod>`)
      }
      return block.replace(/<loc>(.*?)<\/loc>/i, `<loc>$1</loc>\n    <lastmod>${lastmod}</lastmod>`)
    })

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${blocks.map((block) => `  ${block.trim()}`).join('\n')}\n</urlset>\n`
}

const listSlugs = (dir) => {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name.replace(/\.md$/, ''))
}

const walkHtmlFiles = (dir, files = []) => {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) walkHtmlFiles(fullPath, files)
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(fullPath)
  }
  return files
}

export const postprocessSeoBuild = ({ root = process.cwd(), outDir = 'dist' } = {}) => {
  const outputRoot = path.resolve(root, outDir)
  const appSource = fs.readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8')
  const blogSlugs = listSlugs(path.join(root, 'src', 'content', 'blog'))
  const styleSlugs = listSlugs(path.join(root, 'src', 'content', 'estilos'))
  const canonicalRoutes = buildCanonicalRouteSet({ appSource, blogSlugs, styleSlugs })

  let htmlFilesChanged = 0
  for (const htmlPath of walkHtmlFiles(outputRoot)) {
    const before = fs.readFileSync(htmlPath, 'utf8')
    const after = resolveCommercialTokensInHtml(before)
    if (after !== before) {
      fs.writeFileSync(htmlPath, after)
      htmlFilesChanged += 1
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const sitemapCandidates = [
    path.join(outputRoot, 'sitemap.xml'),
    path.join(root, 'public', 'sitemap.xml'),
  ]

  let sitemapRoutes = 0
  for (const sitemapPath of sitemapCandidates) {
    if (!fs.existsSync(sitemapPath)) continue
    const before = fs.readFileSync(sitemapPath, 'utf8')
    const after = rewriteSitemapXml(before, canonicalRoutes, today)
    sitemapRoutes = [...after.matchAll(/<loc>/g)].length
    fs.writeFileSync(sitemapPath, after)
  }

  const unresolved = []
  for (const htmlPath of walkHtmlFiles(outputRoot)) {
    const html = fs.readFileSync(htmlPath, 'utf8')
    if (/\{\{COMMERCIAL[A-Z_]*:/.test(html)) unresolved.push(path.relative(root, htmlPath))
  }

  if (unresolved.length) {
    throw new Error(`Unresolved commercial tokens remain in generated HTML: ${unresolved.join(', ')}`)
  }

  console.log(`SEO postprocess: ${htmlFilesChanged} HTML files normalized; ${sitemapRoutes} sitemap routes retained.`)
  return { htmlFilesChanged, sitemapRoutes, canonicalRoutes, baseUrl: BASE_URL }
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)
if (invokedDirectly) {
  postprocessSeoBuild({ outDir: process.argv[2] || process.env.BUILD_OUT_DIR || 'dist' })
}
