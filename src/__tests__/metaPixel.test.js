import { describe, expect, it } from 'vitest'
import { META_PIXEL_ID } from '@/lib/metaPixelConfig'
import { MENTORIA_CONSENT_KEY, readMentoriaConsent, writeMentoriaConsent } from '@/lib/mentoriaConsent'
import { isMentoriaSurface, loadMetaPixel, trackMetaEvent } from '@/lib/metaPixel'

const PIXEL = '1234567890123456'

function fakeEnv({ hostname = 'mentoria.wgalmeida.com.br', pathname = '/', consent } = {}) {
  const store = new Map()
  if (consent) store.set(MENTORIA_CONSENT_KEY, consent)
  const scripts = []
  const win = {
    location: { hostname, pathname },
    localStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) },
    dispatchEvent: () => true,
  }
  const doc = { createElement: () => ({}), head: { appendChild: (el) => scripts.push(el) } }
  return { win, doc, scripts, store }
}
const queued = (win) => win.fbq.queue.map((args) => [...args])

describe('pixel da Meta da mentoria: nada carrega sem condicao', () => {
  it('config padrao e vazia ou um ID numerico valido', () => {
    expect(META_PIXEL_ID).toMatch(/^(|\d{10,20})$/)
  })

  it('sem ID, ID invalido, fora da mentoria, sem resposta ou recusado: nenhum script e nenhum fbq', () => {
    const cases = [
      { pixelId: '', env: fakeEnv({ consent: 'granted' }) },
      { pixelId: 'abc', env: fakeEnv({ consent: 'granted' }) },
      { pixelId: PIXEL, env: fakeEnv({ consent: 'granted', hostname: 'wgalmeida.com.br', pathname: '/sobre' }) },
      { pixelId: PIXEL, env: fakeEnv() },
      { pixelId: PIXEL, env: fakeEnv({ consent: 'denied' }) },
    ]
    for (const { pixelId, env } of cases) {
      expect(loadMetaPixel({ pixelId, win: env.win, doc: env.doc })).toBe(false)
      expect(env.scripts).toHaveLength(0)
      expect(env.win.fbq).toBeUndefined()
    }
  })

  it('reconhece o host dedicado e as rotas legadas, e rejeita rota parecida', () => {
    expect(isMentoriaSurface(fakeEnv().win)).toBe(true)
    expect(isMentoriaSurface(fakeEnv({ hostname: 'wgalmeida.com.br', pathname: '/mentoria-construcao' }).win)).toBe(true)
    expect(isMentoriaSurface(fakeEnv({ hostname: 'wgalmeida.com.br', pathname: '/mentoria-construcao/abordagens' }).win)).toBe(true)
    expect(isMentoriaSurface(fakeEnv({ hostname: 'wgalmeida.com.br', pathname: '/mentoria-construcao-evil' }).win)).toBe(false)
  })
})

describe('pixel da Meta da mentoria: com ID e consentimento', () => {
  it('carrega uma unica vez, inicia o pixel e envia PageView com eventID', () => {
    const { win, doc, scripts } = fakeEnv({ consent: 'granted' })
    expect(loadMetaPixel({ pixelId: PIXEL, win, doc })).toBe(true)
    expect(loadMetaPixel({ pixelId: PIXEL, win, doc })).toBe(true)
    expect(scripts).toHaveLength(1)
    expect(scripts[0].src).toBe('https://connect.facebook.net/en_US/fbevents.js')
    const calls = queued(win)
    expect(calls.filter((c) => c[0] === 'init')).toEqual([['init', PIXEL]])
    const pageView = calls.filter((c) => c[0] === 'track' && c[1] === 'PageView')
    expect(pageView).toHaveLength(1)
    expect(pageView[0][3].eventID).toBeTruthy()
  })

  it('envia so eventos permitidos e so parametros permitidos', () => {
    const { win, doc } = fakeEnv({ consent: 'granted' })
    loadMetaPixel({ pixelId: PIXEL, win, doc })
    const id = trackMetaEvent('Contact', { content_name: 'mentoria_whatsapp', content_category: 'hero', phone: '11999999999', email: 'a@b.c' }, { win })
    expect(id).toBeTruthy()
    const contact = queued(win).find((c) => c[1] === 'Contact')
    expect(contact[2]).toEqual({ content_name: 'mentoria_whatsapp', content_category: 'hero' })
    expect(contact[3].eventID).toBe(id)
    expect(trackMetaEvent('Purchase', {}, { win })).toBeNull()
    expect(trackMetaEvent('Contact', { content_name: '<script>' }, { win })).toBeTruthy()
    expect(queued(win).filter((c) => c[1] === 'Contact').pop()[2]).toEqual({})
  })

  it('gera eventID unico para cada evento, com ou sem crypto.randomUUID', () => {
    for (const withCrypto of [false, true]) {
      const { win, doc } = fakeEnv({ consent: 'granted' })
      if (withCrypto) { let n = 0; win.crypto = { randomUUID: () => 'uuid-' + (n += 1) } }
      loadMetaPixel({ pixelId: PIXEL, win, doc })
      const ids = [trackMetaEvent('Contact', {}, { win }), trackMetaEvent('Contact', {}, { win }), trackMetaEvent('ViewContent', {}, { win })]
      expect(new Set(ids).size).toBe(3)
      ids.forEach((id) => expect(id).toMatch(/^(ev_|uuid-)/))
    }
  })

  it('nao envia evento antes de carregar nem depois de o consentimento ser revogado', () => {
    const env = fakeEnv({ consent: 'granted' })
    expect(trackMetaEvent('Contact', {}, { win: env.win })).toBeNull()
    loadMetaPixel({ pixelId: PIXEL, win: env.win, doc: env.doc })
    writeMentoriaConsent('denied', env.win)
    expect(readMentoriaConsent(env.win)).toBe('denied')
    expect(trackMetaEvent('Contact', {}, { win: env.win })).toBeNull()
  })

  it('consentimento so aceita granted ou denied', () => {
    const { win } = fakeEnv()
    expect(writeMentoriaConsent('talvez', win)).toBe(false)
    expect(readMentoriaConsent(win)).toBeNull()
  })
})
