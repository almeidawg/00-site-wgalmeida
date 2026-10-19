import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createMentoriaStaticHtml, MENTORIA_STATIC_ROUTES } from '../../tools/build-mentoria-static-head.mjs'

const template = readFileSync('index.html', 'utf8')
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'))

describe('Mentoria SEO no HTML inicial e headers Vercel', () => {
  it('documentos pré-hidratação são específicos e não indexáveis para cada rota', () => {
    expect(MENTORIA_STATIC_ROUTES).toHaveLength(3)
    for (const route of MENTORIA_STATIC_ROUTES) {
      const html = createMentoriaStaticHtml(template, route)
      const head = html.split('</head>')[0]
      expect(head).toContain('<title>' + route.title + '</title>')
      expect(head).toContain('<meta name="robots" content="noindex, nofollow" />')
      expect(head).toContain('<meta name="googlebot" content="noindex, nofollow" />')
      expect(head).toContain('href="https://wgalmeida.com.br' + route.route + '"')
      expect(head).toContain(route.description)
      expect(html).not.toContain('<!-- Google Tag Manager (noscript) -->')
      expect(html).not.toContain('<!-- Pinterest Tag (noscript) -->')
      expect(html).toContain('id="root"')
    }
  })

  it('substitui o fallback institucional pelo texto seguro da mentoria antes da hidratação', () => {
    const stale = template.replace('<div id="root"></div>', '<div id="root"><div id="wg-seo-fallback"><h1>Homepage institucional</h1></div></div>')
    expect(stale).not.toBe(template)
    const html = createMentoriaStaticHtml(stale, MENTORIA_STATIC_ROUTES[2])
    expect(html).not.toContain('Homepage institucional')
    expect(html).not.toContain('id="wg-seo-fallback"')
    expect(html).toContain('Ambiente de homologação. O recebimento de solicitações permanece desativado.')
    expect(html).toContain('<div id="root"><main')
  })
  it('não muda o HTML institucional e falha fechado em rotas não autorizadas', () => {
    expect(template).toContain('<meta name="robots" content="index, follow" />')
    expect(createMentoriaStaticHtml(template, MENTORIA_STATIC_ROUTES[2])).not.toEqual(template)
    expect(() => createMentoriaStaticHtml(template, { route: '/contato' })).toThrow()
    expect(() => createMentoriaStaticHtml('<html></html>', MENTORIA_STATIC_ROUTES[0])).toThrow()
  })

  it('inclui rewrites estáticos antes do SPA e X-Robots-Tag só na mentoria', () => {
    const sources = MENTORIA_STATIC_ROUTES.map((route) => route.route)
    for (const source of sources) {
      const rewrite = vercel.rewrites.find((r) => r.source === source)
      expect(rewrite?.destination).toBe(source + '/index.html')
    }
    const generalSpaIndex = vercel.rewrites.findIndex((r) => r.destination === '/index.html' && r.source.startsWith('/:path'))
    expect(generalSpaIndex).toBeGreaterThan(3)
    for (const r of vercel.rewrites.filter((r) => sources.includes(r.source))) {
      expect(vercel.rewrites.indexOf(r)).toBeLessThan(generalSpaIndex)
    }
    const noindexRules = vercel.headers.filter((h) => h.headers?.some((x) => x.key.toLowerCase() === 'x-robots-tag'))
    expect(noindexRules.map((r) => r.source).sort()).toEqual(['/mentoria-construcao','/mentoria-construcao/:path*'].sort())
    expect(noindexRules.every((r) => r.headers.some((x) => x.value === 'noindex, nofollow'))).toBe(true)
    expect(vercel.headers.find((h) => h.source === '/(.*)').headers.some((x) => x.key === 'X-Robots-Tag')).toBe(false)
  })
})
