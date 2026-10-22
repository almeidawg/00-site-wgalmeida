import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import handler, { normalizarEvento } from '../../api/site-event.js'

const corpoValido = { pagina: 'landing', evento: 'video_play', canal: 'meta_ads', dispositivo: 'mobile', utm_campaign: 'wg_mentoria_2026q4', utm_content: 'criativo01_operacao_v1' }

let contador = 0
const req = (corpo, over = {}) => ({
  method: 'POST',
  headers: { origin: 'https://mentoria.wgalmeida.com.br', host: 'mentoria.wgalmeida.com.br', 'x-forwarded-proto': 'https', 'x-forwarded-for': `203.0.113.${(contador += 1) % 250}` },
  body: corpo,
  ...over,
})
const res = () => {
  const r = { statusCode: 0, headers: {}, ended: false, setHeader(k, v) { this.headers[k] = v }, end() { this.ended = true } }
  return r
}

describe('api/site-event: validacao', () => {
  it('aceita so campos de lista fechada e normaliza utm', () => {
    expect(normalizarEvento(corpoValido)).toEqual(corpoValido)
    expect(normalizarEvento({ ...corpoValido, utm_campaign: 'Meta Ads!', utm_content: 'ABC_1' })).toMatchObject({ utm_campaign: '', utm_content: 'abc_1' })
  })

  it('recusa o que esta fora da lista', () => {
    for (const ruim of [
      { ...corpoValido, evento: 'inventado' }, { ...corpoValido, canal: 'tiktok' }, { ...corpoValido, dispositivo: 'tv' }, { ...corpoValido, pagina: 'admin' },
      null, 'texto', 42, {},
    ]) expect(normalizarEvento(ruim)).toBeNull()
  })

  it('ignora campos extras (nada de IP, user agent ou texto livre passa adiante)', () => {
    const out = normalizarEvento({ ...corpoValido, ip: '1.2.3.4', ua: 'Mozilla', email: 'a@b.com', url: 'https://x.com/?token=1' })
    expect(Object.keys(out).sort()).toEqual(['canal', 'dispositivo', 'evento', 'pagina', 'utm_campaign', 'utm_content'])
  })
})

describe('api/site-event: handler', () => {
  const ambienteOriginal = { ...process.env }
  beforeEach(() => {
    process.env.WGEASY_METRICS_URL = 'https://exemplo.supabase.co'
    process.env.WGEASY_METRICS_ANON_KEY = 'chave-publica-de-teste'
    process.env.WGEASY_METRICS_PRODUTO_ID = '11111111-2222-4333-8444-555555555555'
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })))
  })
  afterEach(() => {
    process.env = { ...ambienteOriginal }
    vi.unstubAllGlobals()
  })

  it('evento valido vai para a funcao publica do banco e a resposta e sempre 204', async () => {
    const r = res()
    await handler(req(corpoValido), r)
    expect(r.statusCode).toBe(204)
    expect(fetch).toHaveBeenCalledTimes(1)
    const [url, init] = fetch.mock.calls[0]
    expect(url).toBe('https://exemplo.supabase.co/rest/v1/rpc/mkt_site_evento')
    expect(init.headers.apikey).toBe('chave-publica-de-teste')
    expect(JSON.parse(init.body)).toEqual({
      p_produto: '11111111-2222-4333-8444-555555555555', p_pagina: 'landing', p_evento: 'video_play', p_canal: 'meta_ads',
      p_utm_campaign: 'wg_mentoria_2026q4', p_utm_content: 'criativo01_operacao_v1', p_dispositivo: 'mobile',
    })
  })

  it('o que sai para o banco nunca leva IP, user agent nem cabecalhos do visitante', async () => {
    const r = res()
    await handler(req(corpoValido, { headers: { origin: 'https://mentoria.wgalmeida.com.br', host: 'mentoria.wgalmeida.com.br', 'x-forwarded-for': '198.51.100.77', 'user-agent': 'Mozilla/5.0 segredo' } }), r)
    const [, init] = fetch.mock.calls[0]
    expect(init.body).not.toMatch(/198\.51\.100\.77|Mozilla|segredo/)
    expect(JSON.stringify(init.headers)).not.toMatch(/198\.51\.100\.77|Mozilla|segredo/)
  })

  it('evento invalido, metodo errado e origem nao permitida nao chamam o banco e nao vazam motivo', async () => {
    const a = res(); await handler(req({ ...corpoValido, evento: 'inventado' }), a)
    const b = res(); await handler(req(corpoValido, { method: 'GET' }), b)
    const c = res(); await handler(req(corpoValido, { headers: { origin: 'https://site-malicioso.com', host: 'mentoria.wgalmeida.com.br' } }), c)
    expect(a.statusCode).toBe(204)
    expect(b.statusCode).toBe(405)
    expect(c.statusCode).toBe(204)
    expect(c.headers['Access-Control-Allow-Origin']).toBeUndefined()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('sem configuracao de ambiente nao faz nada e nao falha', async () => {
    delete process.env.WGEASY_METRICS_ANON_KEY
    const r = res()
    await handler(req(corpoValido), r)
    expect(r.statusCode).toBe(204)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('falha do banco nunca derruba a pagina (204)', async () => {
    fetch.mockRejectedValueOnce(new Error('rede'))
    const r = res()
    await handler(req(corpoValido), r)
    expect(r.statusCode).toBe(204)
  })

  it('corpo invalido ou grande demais e ignorado com 204', async () => {
    const a = res(); await handler(req('{nao e json'), a)
    const b = res(); await handler(req(undefined, { body: undefined, headers: { origin: 'https://mentoria.wgalmeida.com.br', host: 'mentoria.wgalmeida.com.br', 'content-length': '999999' }, [Symbol.asyncIterator]: async function* () { yield Buffer.alloc(10) } }), b)
    expect(a.statusCode).toBe(204)
    expect(b.statusCode).toBe(204)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('limite por minuto: excedente do mesmo IP e descartado sem chamar o banco', async () => {
    const ip = '192.0.2.200'
    const chamar = () => handler(req(corpoValido, { headers: { origin: 'https://mentoria.wgalmeida.com.br', host: 'mentoria.wgalmeida.com.br', 'x-forwarded-for': ip } }), res())
    for (let i = 0; i < 45; i++) await chamar()
    expect(fetch.mock.calls.length).toBe(40)
  })

  it('preflight CORS responde 204 sem tocar no banco', async () => {
    const r = res()
    await handler(req(undefined, { method: 'OPTIONS' }), r)
    expect(r.statusCode).toBe(204)
    expect(fetch).not.toHaveBeenCalled()
  })
})
