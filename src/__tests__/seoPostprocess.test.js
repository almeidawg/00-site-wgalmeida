import { describe, expect, it } from 'vitest'
import {
  buildCanonicalRouteSet,
  resolveCommercialTokensInHtml,
  rewriteSitemapXml,
} from '../../tools/seo-postprocess.mjs'

describe('seo postprocess', () => {
  it('resolves commercial governance tokens in generated HTML', () => {
    const html = '<p>{{COMMERCIAL_RANGE:iccri-reforma-civil-sp:essencial}}</p>'

    expect(resolveCommercialTokensInHtml(html)).toContain('R$ 900 a R$ 1.400 por m2')
    expect(resolveCommercialTokensInHtml(html)).not.toContain('{{COMMERCIAL_RANGE:')
  })

  it('drops stale sitemap URLs that are not canonical application or content routes', () => {
    const routes = buildCanonicalRouteSet({
      appSource: '<Route path="/" /><Route path="/sobre" /><Route path="/blog/:slug" />',
      blogSlugs: ['custo-reforma-m2-sao-paulo'],
      styleSlugs: [],
      seoRoutes: ['/arquitetura'],
    })

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://wgalmeida.com.br/sobre</loc></url>\n  <url><loc>https://wgalmeida.com.br/blog/custo-reforma-m2-sao-paulo</loc></url>\n  <url><loc>https://wgalmeida.com.br/url-antiga-sem-rota</loc></url>\n</urlset>`

    const rewritten = rewriteSitemapXml(sitemap, routes, '2026-09-08')

    expect(rewritten).toContain('https://wgalmeida.com.br/sobre')
    expect(rewritten).toContain('https://wgalmeida.com.br/blog/custo-reforma-m2-sao-paulo')
    expect(rewritten).not.toContain('url-antiga-sem-rota')
  })
})
