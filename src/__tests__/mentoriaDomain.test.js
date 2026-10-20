import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import {
  MENTORIA_HOST, MENTORIA_ORIGIN, isMentoriaHost,
  isMentoriaLandingPath, mentoriaLandingCanonical, canonicalForSiteHost,
} from '../lib/mentoriaDomain.js'

describe('dominio dedicado para a Mentoria Construção (release future)', () => {
  it('aceita somente o host exato, sem confundir spoofing ou hostname parecido', () => {
    expect(MENTORIA_HOST).toBe('mentoria.wgalmeida.com.br')
    for (const host of [MENTORIA_HOST,'MENTORIA.WGALMEIDA.COM.BR','mentoria.wgalmeida.com.br.']) {
      expect(isMentoriaHost(host)).toBe(true)
    }
    for (const host of ['wgalmeida.com.br', 'www.wgalmeida.com.br',
      'mentoria.wgalmeida.com.br.evil.example','prementoria.wgalmeida.com.br',
      'mentoria-wgalmeida.com.br','localhost','']) {
      expect(isMentoriaHost(host)).toBe(false)
    }
  })
  it('abre o programa diretamente em / no subdomínio e preserva a rota legada', () => {
    expect(isMentoriaLandingPath('/')).toBe(true)
    expect(isMentoriaLandingPath('/mentoria-construcao')).toBe(true)
    expect(isMentoriaLandingPath('/mentoria-construcao/proposta-360')).toBe(false)
    expect(mentoriaLandingCanonical(MENTORIA_HOST)).toBe(MENTORIA_ORIGIN + '/')
    expect(mentoriaLandingCanonical('wgalmeida.com.br')).toBe('https://wgalmeida.com.br/mentoria-construcao')
  })
  it('não altera os canonicals das outras páginas corporativas', () => {
    expect(canonicalForSiteHost('wgalmeida.com.br','/sobre/')).toBe('https://wgalmeida.com.br/sobre')
    expect(canonicalForSiteHost('www.wgalmeida.com.br','/')).toBe('https://wgalmeida.com.br/')
    expect(canonicalForSiteHost(MENTORIA_HOST,'/')).toBe(MENTORIA_ORIGIN + '/')
    expect(canonicalForSiteHost(MENTORIA_HOST,'/mentoria-construcao')).toBe(MENTORIA_ORIGIN + '/')
    expect(canonicalForSiteHost(MENTORIA_HOST,'/mentoria-construcao/proposta-360')).toBe(MENTORIA_ORIGIN + '/abordagens')
  })
  it('metadados HTML antes do React ficam noindex e canonicos somente no novo host', () => {
    const html = readFileSync('index.html', 'utf8')
    const inline = html.split('id="dynamic-canonical"')[1]?.split('<script>')[1]?.split('</script>')[0]
    expect(inline).toBeTruthy()
    const simulate = (hostname, pathname) => {
      const canonical = { href: 'https://wgalmeida.com.br/' }
      const robots = { content: 'index, follow' }
      const googlebot = { content: 'index, follow' }
      const document = {
        title: 'Grupo WG Almeida',
        getElementById: () => canonical,
        querySelector: (selector) => selector === 'meta[name="robots"]' ? robots : googlebot,
      }
      runInNewContext(inline, {
        document,
        globalThis: { location: { hostname, pathname } },
      })
      return { canonical: canonical.href, robots: robots.content, googlebot: googlebot.content }
    }
    expect(simulate(MENTORIA_HOST, '/')).toEqual({
      canonical: MENTORIA_ORIGIN + '/', robots: 'noindex, nofollow', googlebot: 'noindex, nofollow',
    })
    expect(simulate('wgalmeida.com.br', '/')).toEqual({
      canonical: 'https://wgalmeida.com.br/', robots: 'index, follow', googlebot: 'index, follow',
    })
    expect(simulate('wgalmeida.com.br', '/sobre')).toEqual({
      canonical: 'https://wgalmeida.com.br/sobre', robots: 'index, follow', googlebot: 'index, follow',
    })
    expect(simulate('wgalmeida.com.br', '/mentoria-construcao')).toEqual({
      canonical: 'https://wgalmeida.com.br/mentoria-construcao', robots: 'noindex, nofollow', googlebot: 'noindex, nofollow',
    })
    expect(simulate('wgalmeida.com.br', '/mentoria-construcao/proposta-360')).toEqual({
      canonical: 'https://wgalmeida.com.br/mentoria-construcao/abordagens', robots: 'noindex, nofollow', googlebot: 'noindex, nofollow',
    })
    expect(simulate(MENTORIA_HOST, '/abordagens')).toEqual({
      canonical: MENTORIA_ORIGIN + '/abordagens', robots: 'noindex, nofollow', googlebot: 'noindex, nofollow',
    })
    expect(simulate(MENTORIA_HOST, '/contato')).toEqual({
      canonical: MENTORIA_ORIGIN + '/contato', robots: 'noindex, nofollow', googlebot: 'noindex, nofollow',
    })
    expect(simulate('wgalmeida.com.br', '/mentoria-construcao/contato')).toEqual({
      canonical: 'https://wgalmeida.com.br/mentoria-construcao/contato', robots: 'noindex, nofollow', googlebot: 'noindex, nofollow',
    })
  })
  it('roteia na entrada React sem condicionar páginas institucionais ou autenticação', () => {
    const app = readFileSync('src/App.jsx', 'utf8')
    expect(app).toContain("isMentoriaHost(window.location.hostname)")
    expect(app).toContain("isMentoriaLandingPath(location.pathname)")
    expect(app).toContain("MentoriaConstrucaoLanding")
    expect(app).toContain("canonicalForSiteHost")
    const landing = readFileSync('src/pages/MentoriaConstrucaoLanding.jsx', 'utf8')
    expect(landing).toContain('mentoriaLandingCanonical')
    expect(landing).toContain('noindex')
    expect(landing).toContain('noindex, nofollow')
  })
})
