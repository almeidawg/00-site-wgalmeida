import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import dotenv from 'dotenv'
import { google } from 'googleapis'

dotenv.config({ path: '.env.local' })
dotenv.config()

const SEARCH_CONSOLE_SCOPE = 'https://www.googleapis.com/auth/webmasters'
const DEFAULT_SITE = 'sc-domain:wgalmeida.com.br'
const DEFAULT_SITEMAP = 'https://wgalmeida.com.br/sitemap.xml'
const DEFAULT_QUOTA_PROJECT = 'grupo-wg-284118'

function parseArgs(argv) {
  const args = { _: [] }
  for (const arg of argv) {
    if (!arg.startsWith('--')) {
      args._.push(arg)
      continue
    }
    const [key, ...valueParts] = arg.slice(2).split('=')
    args[key] = valueParts.length ? valueParts.join('=') : true
  }
  return args
}

function isoDate(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'))
  } catch {
    return null
  }
}

async function resolveQuotaProject(explicitQuotaProject) {
  if (explicitQuotaProject) return explicitQuotaProject
  if (process.env.GOOGLE_CLOUD_QUOTA_PROJECT) return process.env.GOOGLE_CLOUD_QUOTA_PROJECT
  if (process.env.GCLOUD_PROJECT) return process.env.GCLOUD_PROJECT
  if (process.env.GOOGLE_CLOUD_PROJECT) return process.env.GOOGLE_CLOUD_PROJECT

  const adcPath = path.join(
    process.env.APPDATA || path.join(os.homedir(), '.config'),
    'gcloud',
    'application_default_credentials.json',
  )
  const adc = await readJsonIfExists(adcPath)
  return adc?.quota_project_id || DEFAULT_QUOTA_PROJECT
}

async function getAccessToken() {
  const auth = new google.auth.GoogleAuth({
    scopes: [SEARCH_CONSOLE_SCOPE],
  })
  const client = await auth.getClient()
  const token = await client.getAccessToken()
  const accessToken = typeof token === 'string' ? token : token?.token
  if (!accessToken) throw new Error('Could not resolve a Google access token. Run gcloud auth application-default login with the Search Console scope.')
  return accessToken
}

async function googleJson(url, { token, quotaProject, method = 'GET', body } = {}) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-goog-user-project': quotaProject,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : {}
  if (!response.ok) {
    throw new Error(data?.error?.message || `Google API returned HTTP ${response.status}`)
  }
  return data
}

async function parseSitemapUrls(sitemapPath) {
  const xml = await fs.readFile(sitemapPath, 'utf8')
  return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gim)]
    .map((match) => match[1].trim())
    .filter((url) => url.startsWith('https://wgalmeida.com.br'))
}

async function inspectUrl({ token, quotaProject, siteUrl, inspectionUrl }) {
  return googleJson('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    token,
    quotaProject,
    method: 'POST',
    body: {
      inspectionUrl,
      siteUrl,
    },
  })
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length)
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await mapper(items[index], index)
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, limit) }, worker))
  return results
}

function pickIndexResult(url, result) {
  const index = result.inspectionResult?.indexStatusResult || {}
  return {
    url,
    verdict: index.verdict || 'UNKNOWN',
    coverageState: index.coverageState || 'UNKNOWN',
    indexingState: index.indexingState || 'UNKNOWN',
    pageFetchState: index.pageFetchState || 'UNKNOWN',
    robotsTxtState: index.robotsTxtState || 'UNKNOWN',
    lastCrawlTime: index.lastCrawlTime || null,
    userCanonical: index.userCanonical || null,
    googleCanonical: index.googleCanonical || null,
  }
}

function isNeedsAttention(item) {
  const state = item.coverageState.toLowerCase()
  if (state === 'submitted and indexed' || state === 'indexed, not submitted in sitemap') return false
  if (state.includes('currently not indexed')) return true
  if (state.includes('unknown')) return true
  if (state.includes('duplicate')) return true
  if (state.includes('not found') || state.includes('blocked') || state.includes('error')) return true
  if (item.verdict === 'PASS' && item.coverageState === 'Submitted and indexed') return false
  return item.verdict !== 'PASS'
}

function strategyFor(item) {
  const state = item.coverageState.toLowerCase()
  const fetch = item.pageFetchState.toLowerCase()
  const robots = item.robotsTxtState.toLowerCase()

  if (robots.includes('blocked')) return 'Remover bloqueio em robots/noindex e ressubmeter sitemap.'
  if (fetch.includes('soft_404') || state.includes('soft 404')) return 'Reforcar conteudo unico, status HTTP correto e links internos; evitar pagina fina.'
  if (fetch.includes('not_found') || state.includes('not found') || state.includes('404')) return 'Remover do sitemap ou restaurar rota com HTTP 200 e canonical valido.'
  if (state.includes('duplicate')) return 'Alinhar canonical, links internos e sitemap para uma unica URL canonica.'
  if (state.includes('crawled') && state.includes('not indexed')) return 'Melhorar utilidade/conteudo unico, interlinking e sinais canonicos; nao repetir pedido de crawl em massa.'
  if (state.includes('discovered') && state.includes('not indexed')) return 'Melhorar links internos, sitemap atualizado e reduzir URLs fracas para priorizar crawl.'
  return 'Validar canonical, HTTP 200, conteudo renderizado, links internos e relevancia antes de pedir recrawl.'
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`)
}

async function writeMarkdown(filePath, report) {
  const rows = report.needsAttention.map((item) => (
    `| ${item.url} | ${item.verdict} | ${item.coverageState} | ${item.pageFetchState} | ${strategyFor(item)} |`
  ))
  const markdown = [
    '# Google Indexing Audit',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Site property: ${report.siteUrl}`,
    `- Sitemap: ${report.sitemapUrl}`,
    `- URLs in sitemap: ${report.totalUrls}`,
    `- URLs inspected: ${report.inspectedUrls}`,
    `- Needs attention: ${report.needsAttention.length}`,
    '',
    '## Needs Attention',
    '',
    '| URL | Verdict | Coverage | Fetch | Strategy |',
    '|---|---|---|---|---|',
    ...(rows.length ? rows : ['| none | PASS | Submitted and indexed | OK | Monitorar |']),
    '',
  ].join('\n')
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, markdown)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const command = args._[0] || 'audit'
  const root = process.cwd()
  const quotaProject = await resolveQuotaProject(args['quota-project'])
  const siteUrl = args.site || process.env.GSC_SITE_URL || DEFAULT_SITE
  const sitemapUrl = args.sitemap || process.env.GSC_SITEMAP_URL || DEFAULT_SITEMAP
  const sitemapPath = path.resolve(args['sitemap-file'] || 'public/sitemap.xml')
  const outputDir = path.resolve(args.output || `.codex/tmp/indexing-audit-${isoDate()}`)
  const token = await getAccessToken()

  if (command === 'submit-sitemap') {
    const submitUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`
    await googleJson(submitUrl, { token, quotaProject, method: 'PUT' })
    console.log(`Sitemap submitted: ${sitemapUrl}`)
    console.log(`Search Console property: ${siteUrl}`)
    return
  }

  const urls = await parseSitemapUrls(sitemapPath)
  const limit = args.limit ? Number(args.limit) : urls.length
  const concurrency = Number(args.concurrency || 5)
  const selectedUrls = urls.slice(0, limit)

  const inspected = await mapLimit(selectedUrls, concurrency, async (url) => {
    try {
      const result = await inspectUrl({ token, quotaProject, siteUrl, inspectionUrl: url })
      console.log(`ok: ${url}`)
      return pickIndexResult(url, result)
    } catch (error) {
      console.log(`error: ${url} -> ${error.message}`)
      return {
        url,
        verdict: 'ERROR',
        coverageState: error.message,
        indexingState: 'UNKNOWN',
        pageFetchState: 'UNKNOWN',
        robotsTxtState: 'UNKNOWN',
        lastCrawlTime: null,
        userCanonical: null,
        googleCanonical: null,
      }
    }
  })

  const report = {
    generatedAt: new Date().toISOString(),
    quotaProject,
    siteUrl,
    sitemapUrl,
    sitemapPath: path.relative(root, sitemapPath),
    totalUrls: urls.length,
    inspectedUrls: inspected.length,
    results: inspected,
    needsAttention: inspected.filter(isNeedsAttention),
  }

  await writeJson(path.join(outputDir, 'indexing-audit.json'), report)
  await writeMarkdown(path.join(outputDir, 'indexing-audit.md'), report)
  console.log(`Indexing audit written: ${outputDir}`)
  console.log(`Needs attention: ${report.needsAttention.length}/${report.inspectedUrls}`)
}

main().catch((error) => {
  console.error(`Google indexing ops failed: ${error.message}`)
  process.exit(1)
})
