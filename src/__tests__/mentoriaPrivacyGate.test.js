import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { isMentoriaPrelaunchTrackingBlocked, isMentoriaPrelaunchRoute, pushDataLayerEvent, trackEvent } from '@/lib/analytics'
import { track } from '@vercel/analytics'

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }))
afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

function executeInitialTrackerScript(hostname, pathname = '/') {
  const html = readFileSync('index.html', 'utf8')
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1]
  expect(script).toBeTruthy()
  const listeners = []
  runInNewContext(script, {
    globalThis: {
      location: { hostname, pathname, protocol: 'https:' },
      addEventListener: (name) => listeners.push(name),
      removeEventListener: () => {},
    },
    document: {},
  })
  return listeners
}
describe('mentoria analytics: trava LGPD antes da aprovação', () => {
  it('bloqueia GTM e Pinterest do HTML no host dedicado antes de interação', () => {
    expect(executeInitialTrackerScript('mentoria.wgalmeida.com.br')).toEqual([])
    expect(executeInitialTrackerScript('mentoria.wgalmeida.com.br.')).toEqual([])
  })
  it('bloqueia também rastreadores das rotas legadas da mentoria no site institucional', () => {
    for (const pathname of ['/mentoria-construcao', '/mentoria-construcao/abordagens', '/mentoria-construcao/proposta-modelo']) {
      expect(executeInitialTrackerScript('wgalmeida.com.br', pathname)).toEqual([])
      expect(isMentoriaPrelaunchRoute(pathname)).toBe(true)
    }
    expect(isMentoriaPrelaunchRoute('/mentoria-construcao-evil')).toBe(false)
  })
  it('mantém dataLayer e Vercel Analytics bloqueados no legado da mentoria', () => {
    vi.stubGlobal('window', { location: {hostname:'wgalmeida.com.br', pathname:'/mentoria-construcao'}, dataLayer: [] })
    trackEvent('whatsapp_click', { target:'fundador' })
    expect(window.dataLayer).toHaveLength(0)
    expect(track).not.toHaveBeenCalled()
  })
  it('não altera a inicialização atual do domínio institucional', () => {
    expect(executeInitialTrackerScript('wgalmeida.com.br')).toContain('click')
    expect(executeInitialTrackerScript('www.wgalmeida.com.br')).toContain('scroll')
    expect(executeInitialTrackerScript('localhost')).toEqual([])
  })
  it('identifica somente host exato e rejeita domínios com sufixo malicioso', () => {
    expect(isMentoriaPrelaunchTrackingBlocked('MENTORIA.WGALMEIDA.COM.BR')).toBe(true)
    expect(isMentoriaPrelaunchTrackingBlocked('mentoria.wgalmeida.com.br.evil.example')).toBe(false)
    expect(isMentoriaPrelaunchTrackingBlocked('wgalmeida.com.br')).toBe(false)
  })
  it('não envia eventos para dataLayer nem Vercel Analytics no subdomínio', () => {
    vi.stubGlobal('window', { location: { hostname:'mentoria.wgalmeida.com.br', pathname:'/' }, dataLayer: [] })
    trackEvent('whatsapp_click', { target:'fundador' })
    pushDataLayerEvent('cta_click', { context:'mentoria' })
    expect(window.dataLayer).toHaveLength(0)
    expect(track).not.toHaveBeenCalled()
  })
  it('preserva medição institucional existente fora do host dedicado', () => {
    vi.stubGlobal('window', { location: { hostname:'wgalmeida.com.br', pathname:'/sobre' }, dataLayer: [] })
    trackEvent('cta_click', { source:'cta' })
    expect(window.dataLayer).toHaveLength(1)
    expect(track).toHaveBeenCalledTimes(1)
  })
})
