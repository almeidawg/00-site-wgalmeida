import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import dotenv from 'dotenv'
import { google } from 'googleapis'
import {
  createInspectionError,
  createSkippedInspection,
  isAuthBlockingError,
  summarizeInspectionResults,
} from './google-indexing-policy.mjs'

dotenv.config({ path: '.env.local' })
dotenv.config()

const SEARCH_CONSOLE_READ_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const SEARCH_CONSOLE_WRITE_SCOPE = 'https://www.googleapis.com/auth/webmasters'
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

async function getAccessToken(scope = SEARCH_CONSOLE_READ_SCOPE) {
  const auth = new google.auth.GoogleAuth({
    scopes: [scope],
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
  const index = result.inspectionResult?.indexStatusResult
  if (!index) throw new Error('Search Console API response missing indexStatusResult')
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
  const attentionRows = report.needsAttention.map((item) => (
    `| ${item.url} | ${item.verdict} | ${item.coverageState} | ${item.pageFetchState} | ${strategyFor(item)} |`
  ))
  const errorRows = report.inspectionErrors.map((item) => (
    `| ${item.url} | ${item.inspectionError.code} | Falha de coleta, NAO evidência de nao-indexacao |`
  ))
  const markdown = [
    '# Google Indexing Audit',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Site property: ${report.siteUrl}`,
    `- Sitemap: ${report.sitemapUrl}`,
    `- Audit status: ${report.status}`,
    `- URLs in sitemap: ${report.totalUrls}`,
    `- Requested URLs: ${report.requestedUrls}`,
    `- Successfully inspected URLs: ${report.inspectedUrls}`,
    `- API failures: ${report.failedUrls}`,
    `- Skipped due to collection block: ${report.skippedUrls}`,
    `- SEO attention (valid inspections only): ${report.needsAttention.length}`,
    '',
    '## SEO attention from verified Search Console responses',
    '',
    ...(report.inspectedUrls === 0 ? ['SEM DADO: nenhuma URL foi inspecionada com sucesso.'] : []),
    ...(report.inspectedUrls > 0 && attentionRows.length === 0 ? ['Nenhum alerta de indexacao entre as URLs inspecionadas com sucesso.'] : []),
    ...(attentionRows.length ? ['| URL | Verdict | Coverage | Fetch | Strategy |', '|---|---|---|---|---|', ...attentionRows] : []),
    '',
    '## Search Console collection failures (not SEO findings)',
    '',
    ...(errorRows.length ? ['| URL | Error code | Meaning |', '|---|---|---|', ...errorRows] : ['Nenhum erro de API.']),
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
  if (command === 'submit-sitemap') {
    const token = await getAccessToken(SEARCH_CONSOLE_WRITE_SCOPE)
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

  // Report credential failures as collection failures instead of silently exiting.
  // Never request real authorization when there are no URLs to inspect.
  let token = null
  let preflightFailure = null
  if (selectedUrls.length) {
    try {
      token = await getAccessToken()
    } catch (error) {
      preflightFailure = createInspectionError(selectedUrls[0], error)
      console.error(`Search Console credential preflight error ${preflightFailure.inspectionError.code}`)
    }
  }

  let authorizationBlock = preflightFailure?.inspectionError.code || null
  const inspected = preflightFailure
    ? selectedUrls.map((url, index) => index === 0
      ? preflightFailure
      : createSkippedInspection(url, authorizationBlock))
    : await mapLimit(selectedUrls, concurrency, async (url) => {
      if (authorizationBlock) return createSkippedInspection(url, authorizationBlock)
      try {
        const result = await inspectUrl({ token, quotaProject, siteUrl, inspectionUrl: url })
        console.log(`ok: ${url}`)
        return pickIndexResult(url, result)
      } catch (error) {
        const failed = createInspectionError(url, error)
        if (isAuthBlockingError(failed.inspectionError.code)) authorizationBlock = failed.inspectionError.code
        // Do not log raw provider responses, tokens or private identifiers.
        console.error(`Search Console collection error ${failed.inspectionError.code}: ${url}`)
        return failed
      }
    })

  const stats = summarizeInspectionResults(inspected)
  const report = {
    generatedAt: new Date().toISOString(),
    quotaProject,
    siteUrl,
    sitemapUrl,
    sitemapPath: path.relative(root, sitemapPath),
    totalUrls: urls.length,
    requestedUrls: selectedUrls.length,
    ...stats,
    results: inspected,
  }

  await writeJson(path.join(outputDir, 'indexing-audit.json'), report)
  await writeMarkdown(path.join(outputDir, 'indexing-audit.md'), report)
  console.log(`Indexing audit written: ${outputDir}`)
  console.log(`Valid inspections: ${report.inspectedUrls}; SEO alerts: ${report.needsAttention.length}; API failures: ${report.failedUrls}; skipped: ${report.skippedUrls}`)
  if (report.status !== 'OK') process.exitCode = 1
}

main().catch((error) => {
  console.error(`Google indexing ops failed: ${error.message}`)
  process.exit(1)
})
