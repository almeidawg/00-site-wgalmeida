import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { buildMentoriaHostHtml, MENTORIA_OG_IMAGE, MENTORIA_HERO } from '../../tools/build-mentoria-host-html.mjs'

const root = process.cwd()
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8')

describe('HTML estatico do host da mentoria', () => {
  const html = buildMentoriaHostHtml(indexHtml)

  it('troca titulo, canonical e cartao de compartilhamento para a mentoria', () => {
    expect(html).toContain('<title>Mentoria Estratégica Individual | Grupo WG Almeida</title>')
    expect(html).toContain('<link rel="canonical" id="dynamic-canonical" href="https://mentoria.wgalmeida.com.br/" />')
    expect(html).toContain(`<meta property="og:image" content="${MENTORIA_OG_IMAGE}" />`)
    expect(html).not.toContain('og-home-1200x630.jpg')
    expect(html).not.toMatch(/og:title" content="Grupo WG Almeida \|/)
  })

  it('mantem noindex e pre-carrega a foto principal', () => {
    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />')
    expect(html).toContain(`<link rel="preload" as="image" href="${MENTORIA_HERO}" fetchpriority="high" type="image/webp" />`)
  })

  it('falha alto se o modelo perder uma tag esperada', () => {
    expect(() => buildMentoriaHostHtml('<html><head></head></html>')).toThrow(/tag nao encontrada/)
  })
})

describe('vercel.json da mentoria', () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'))
  it('reescreve a raiz do host da mentoria para mentoria.html antes do catch-all', () => {
    const idx = cfg.rewrites.findIndex((r) => r.destination === '/mentoria.html')
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(cfg.rewrites[idx].source).toBe('/')
    expect(cfg.rewrites[idx].has[0].value).toBe('mentoria.wgalmeida.com.br')
    expect(idx).toBeLessThan(cfg.rewrites.findIndex((r) => r.destination === '/index.html'))
  })
  it('imagens e midias revalidam so depois de 1 dia, sem immutable', () => {
    for (const src of ['/images/(.*)', '/media/(.*)']) {
      const h = cfg.headers.find((x) => x.source === src)
      expect(h.headers[0].value).toMatch(/max-age=86400/)
      expect(h.headers[0].value).not.toMatch(/immutable/)
    }
  })
})
