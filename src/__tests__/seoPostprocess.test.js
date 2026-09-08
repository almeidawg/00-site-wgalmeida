import { describe, expect, it } from 'vitest'
import {
  buildCanonicalRouteSet,
  resolveCommercialTokensInHtml,
  rewriteSitemapXml,
} from '../../tools/seo-postprocess.mjs'

describe('seo postprocess', () => {
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
})
