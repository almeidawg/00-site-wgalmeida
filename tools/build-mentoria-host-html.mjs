// Gera dist/mentoria.html: copia do index.html com metadados proprios do host
// mentoria.wgalmeida.com.br. Rastreadores de cartao (WhatsApp, LinkedIn) nao
// executam JavaScript; sem isto o link mostra o cartao do site institucional.
// Tambem pre-carrega a foto principal (LCP) e gera o JPG 1200x630 do cartao.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const MENTORIA_ORIGIN = 'https://mentoria.wgalmeida.com.br'
export const MENTORIA_OG_IMAGE = `${MENTORIA_ORIGIN}/og-mentoria-1200x630.jpg`
export const MENTORIA_HERO = '/images/about/william-almeida-1200.webp'
const TITLE = 'Mentoria Estratégica Individual | Grupo WG Almeida'
const DESCRIPTION = 'Mentoria estratégica individual para obras e reformas: 8 encontros semanais de 90 minutos (12h ao vivo). Processos, gestão e IA aplicada.'

const replaceTag = (html, pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`mentoria-host-html: tag nao encontrada ${pattern}`)
  return html.replace(pattern, replacement)
}

export function buildMentoriaHostHtml(indexHtml) {
  let html = String(indexHtml)
  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${TITLE}</title>`)
  html = replaceTag(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${DESCRIPTION}" />`)
  html = replaceTag(html, /<meta name="robots" content="[^"]*"\s*\/?>/, '<meta name="robots" content="noindex, nofollow" />')
  html = replaceTag(html, /<meta name="googlebot" content="[^"]*"\s*\/?>/, '<meta name="googlebot" content="noindex, nofollow" />')
  html = replaceTag(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" id="dynamic-canonical" href="${MENTORIA_ORIGIN}/" />`)
  html = replaceTag(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${MENTORIA_ORIGIN}/" />`)
  html = replaceTag(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${TITLE}" />`)
  html = replaceTag(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${DESCRIPTION}" />`)
  html = replaceTag(html, /<meta property="og:image" content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${MENTORIA_OG_IMAGE}" />`)
  html = replaceTag(html, /<meta name="twitter:url" content="[^"]*"\s*\/?>/, `<meta name="twitter:url" content="${MENTORIA_ORIGIN}/" />`)
  html = replaceTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${TITLE}" />`)
  html = replaceTag(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${DESCRIPTION}" />`)
  // twitter:image pode nao existir no modelo; so troca quando existe.
  html = html.replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${MENTORIA_OG_IMAGE}" />`)
  const preload = `<link rel="preload" as="image" href="${MENTORIA_HERO}" fetchpriority="high" type="image/webp" />`
  return replaceTag(html, /<meta charset="UTF-8"\s*\/?>/, (m) => `${m}\n\t\t${preload}`)
}

export async function buildMentoriaOgJpg(rootDir, distDir) {
  const source = path.join(rootDir, 'public/media/mentoria-construcao/apresentacao-capa.webp')
  if (!fs.existsSync(source)) throw new Error('mentoria-host-html: capa da apresentacao ausente')
  const { default: sharp } = await import('sharp')
  await sharp(source).resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(distDir, 'og-mentoria-1200x630.jpg'))
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  // Lista fechada: o destino nunca vem livre da linha de comando (path traversal).
  const ALLOWED_DIST = { dist: 'dist', 'dist-local': 'dist-local' }
  const distName = ALLOWED_DIST[process.argv[2] || 'dist']
  if (!distName) throw new Error('mentoria-host-html: pasta de saida deve ser dist ou dist-local')
  const distDir = path.join(rootDir, distName)
  const indexPath = path.join(distDir, 'index.html')
  fs.writeFileSync(path.join(distDir, 'mentoria.html'), buildMentoriaHostHtml(fs.readFileSync(indexPath, 'utf8')))
  await buildMentoriaOgJpg(rootDir, distDir)
  console.log('[mentoria-host-html] dist/mentoria.html e og-mentoria-1200x630.jpg gerados')
}
