#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const errors = []

function fail(message) {
  errors.push(message)
}

function read(relativePath) {
  const absolutePath = path.join(rootDir, relativePath)
  if (!fs.existsSync(absolutePath)) {
    fail(`Arquivo obrigatorio ausente: ${relativePath}`)
    return ''
  }
  return fs.readFileSync(absolutePath, 'utf8')
}

function assertIncludes(content, needle, label) {
  if (!content.includes(needle)) fail(`${label}: esperado conter "${needle}"`)
}

function assertNotIncludes(content, needle, label) {
  if (content.includes(needle)) fail(`${label}: nao deve conter "${needle}"`)
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return []
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolutePath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkFiles(absolutePath))
    } else if (entry.isFile()) {
      files.push(absolutePath)
    }
  }
  return files
}

function auditGitInternals() {
  const gitDir = path.join(rootDir, '.git')
  const refsRoot = path.join(gitDir, 'refs')
  const objectsRoot = path.join(gitDir, 'objects')
  const badRefs = walkFiles(refsRoot).filter((file) => {
    const name = path.basename(file)
    return /[()\s]/.test(name) || /refs[\\/].*(codex|quarantine)/i.test(file)
  })
  const badObjects = walkFiles(objectsRoot).filter((file) => {
    if (/objects[\\/]pack[\\/]/i.test(file)) return false
    const name = path.basename(file)
    return /[()\s]/.test(name) || /objects[\\/].*(codex|quarantine)/i.test(file)
  })
  if (badRefs.length) fail(`Refs contaminadas em .git/refs: ${badRefs.join(', ')}`)
  if (badObjects.length) fail(`Objetos contaminados em .git/objects: ${badObjects.join(', ')}`)
}

auditGitInternals()

const packageJson = read('package.json')
assertIncludes(packageJson, '"audit:structural"', 'package.json')
assertIncludes(packageJson, 'audit:structural', 'scripts de verificacao')

const company = read('src/data/company.js')
assertIncludes(company, 'https://wgalmeida.com.br', 'SSoT site')
assertIncludes(company, 'https://easy.wgalmeida.com.br', 'SSoT WGEasy')
assertIncludes(company, 'https://obraeasy.wgalmeida.com.br', 'SSoT ObraEasy')
assertIncludes(company, 'https://easyrealstate.wgalmeida.com.br', 'SSoT EasyRealState')
assertNotIncludes(company, 'app.obraeasy.com.br', 'SSoT dominio legado')

const cloudinary = read('src/utils/cloudinaryMedia.js')
assertIncludes(cloudinary, 'buildCloudinaryVideoUrl', 'Hero Cloudinary')
assertIncludes(cloudinary, 'https://res.cloudinary.com', 'Hero Cloudinary URL')
assertIncludes(cloudinary, 'phonePortrait', 'Hero perfil phone portrait')
assertIncludes(cloudinary, 'tabletLandscape', 'Hero perfil tablet landscape')
assertIncludes(cloudinary, 'desktopLandscape', 'Hero perfil desktop landscape')
assertNotIncludes(cloudinary, '/videos/hero/', 'Hero video local legado')

const localHeroDir = path.join(rootDir, 'public', 'videos', 'hero')
const localHeroVideos = walkFiles(localHeroDir).filter((file) => /\.mp4$/i.test(file))
if (localHeroVideos.length) {
  fail(`Hero nao pode depender de MP4 local: ${localHeroVideos.map((file) => path.relative(rootDir, file)).join(', ')}`)
}

const vercel = read('vercel.json')
assertIncludes(vercel, '"Content-Security-Policy"', 'CSP ativa')
assertIncludes(vercel, '"Content-Security-Policy-Report-Only"', 'CSP report-only')
assertIncludes(vercel, "media-src 'self' blob: data: https://res.cloudinary.com", 'CSP media Cloudinary')
assertIncludes(vercel, "frame-src 'self' https://ct.pinterest.com", 'CSP frame Pinterest')
assertNotIncludes(vercel, 'report-uri /csp-report', 'CSP sem endpoint inexistente')

const publicCatalog = read('src/data/publicPageImageCatalog.js')
assertIncludes(publicCatalog, 'PUBLIC_PAGE_IMAGE_OVERRIDES', 'Catalogo overrides versionados')
assertIncludes(publicCatalog, 'readLocalStorageJson', 'Catalogo estado Admin')
assertIncludes(publicCatalog, 'PUBLISHED_UPLOADS_KEY', 'Catalogo upload publicado')
assertIncludes(publicCatalog, 'PUBLISHED_UNSPLASH_KEY', 'Catalogo Unsplash publicado')
assertIncludes(publicCatalog, '?.[pageKey]?.hero', 'Catalogo slot hero')
assertIncludes(publicCatalog, 'buildCloudinaryEditorialUrl(resolved.publicId, \'hero\')', 'Catalogo Cloudinary hero')

const tests = [
  'src/__tests__/cloudinaryMedia.test.js',
  'src/__tests__/publicPageImageCatalog.test.js',
  'src/__tests__/publicPageOverrides.test.js',
]
for (const test of tests) {
  if (!fs.existsSync(path.join(rootDir, test))) fail(`Teste regressivo ausente: ${test}`)
}

if (errors.length) {
  console.error('\nAudit estrutural site-wgalmeida falhou:\n')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('Audit estrutural site-wgalmeida OK')
