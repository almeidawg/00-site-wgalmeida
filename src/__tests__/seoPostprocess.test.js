import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildCanonicalRouteSet,
  isDirectExecution,
  removeRejectedRouteArtifacts,
  resolveCommercialTokensInHtml,
  rewriteSitemapXml,
} from '../../tools/seo-postprocess.mjs'

describe('seo postprocess', () => {
  it('runs SEO postprocess as part of verify:full', () => {
    const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'))

    expect(pkg.scripts['verify:full']).toContain('node ./tools/seo-postprocess.mjs dist')
  })
  it('detects direct CLI execution from a filesystem path and module URL', () => {
    const argvPath = path.resolve('tools/seo-postprocess.mjs')
    const moduleUrl = pathToFileURL(argvPath).href

    expect(isDirectExecution(argvPath, moduleUrl)).toBe(true)
  })
  it('resolves commercial governance tokens in generated HTML', () => {
    const html = '<p>{{COMMERCIAL_RANGE:iccri-reforma-civil-sp:essencial}}</p>'
    const resolved = resolveCommercialTokensInHtml(html)

    expect(resolved).toMatch(/R\$\s[\d.]+/)
    expect(resolved).not.toContain('{{COMMERCIAL_RANGE:')
  })

  it('drops stale sitemap URLs that are not implemented routes or content routes', () => {
    const routes = buildCanonicalRouteSet({
      appSource: '<Route path="/" /><Route path="/sobre" /><Route\n path="/arquitetura" /><Route path="/blog/:slug" />',
      blogSlugs: ['custo-reforma-m2-sao-paulo'],
      styleSlugs: [],
    })

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://wgalmeida.com.br/sobre</loc></url>\n  <url><loc>https://wgalmeida.com.br/arquitetura</loc></url>\n  <url><loc>https://wgalmeida.com.br/blog/custo-reforma-m2-sao-paulo</loc></url>\n  <url><loc>https://wgalmeida.com.br/url-antiga-sem-rota</loc></url>\n</urlset>`

    const rewritten = rewriteSitemapXml(sitemap, routes, '2026-09-08')

    expect(rewritten).toContain('https://wgalmeida.com.br/sobre')
    expect(rewritten).toContain('https://wgalmeida.com.br/arquitetura')
    expect(rewritten).toContain('https://wgalmeida.com.br/blog/custo-reforma-m2-sao-paulo')
    expect(rewritten).not.toContain('url-antiga-sem-rota')
  })

  it('excludes redirect-only React routes from canonical sitemap routes', () => {
    const routes = buildCanonicalRouteSet({
      appSource: `
        <Route path="/moodboard" element={<MoodboardStudio />} />
        <Route path="/moodboard-generator" element={<Navigate to="/moodboard" replace />} />
      `,
      blogSlugs: [],
      styleSlugs: [],
    })

    expect(routes.has('/moodboard')).toBe(true)
    expect(routes.has('/moodboard-generator')).toBe(false)
  })

  it('removes generated 200 HTML artifacts for rejected sitemap routes', () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wg-seo-postprocess-'))
    const staleDir = path.join(outDir, 'url-antiga-sem-rota')
    fs.mkdirSync(staleDir, { recursive: true })
    fs.writeFileSync(path.join(staleDir, 'index.html'), '<html>stale</html>')
    fs.writeFileSync(path.join(outDir, 'url-antiga-sem-rota.html'), '<html>stale alias</html>')

    const removed = removeRejectedRouteArtifacts(outDir, ['/url-antiga-sem-rota'])

    expect(removed).toBe(2)
    expect(fs.existsSync(path.join(staleDir, 'index.html'))).toBe(false)
    expect(fs.existsSync(path.join(outDir, 'url-antiga-sem-rota.html'))).toBe(false)
  })
})
