import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  SITE_METRICS_ENDPOINT,
  _reiniciarMemoriaDeMetricas,
  canalDaOrigem,
  dispositivoDaTela,
  marcosAtingidos,
  montarMetrica,
  registrarMetricaSite,
  sanitizarUtm,
} from '@/lib/siteMetrics'

const storageFalso = () => {
  const dados = new Map()
  return { getItem: (k) => dados.get(k) ?? null, setItem: (k, v) => dados.set(k, v), _dados: dados }
}
const janela = (over = {}) => ({
  location: { search: '?utm_source=meta&utm_campaign=WG_Mentoria_2026Q4&utm_content=criativo01_operacao_v1' },
  document: { referrer: '' },
  innerWidth: 390,
  navigator: {},
  ...over,
})

// O Blob do jsdom nao tem .text(): le pelo FileReader.
const lerBlob = (blob) => new Promise((resolve, reject) => {
  const leitor = new FileReader()
  leitor.onload = () => resolve(String(leitor.result))
  leitor.onerror = reject
  leitor.readAsText(blob)
})

beforeEach(() => _reiniciarMemoriaDeMetricas())

describe('siteMetrics: sanitizacao e canal', () => {
  it('utm so passa em lista segura; ponto vira sublinhado e texto livre some', () => {
    expect(sanitizarUtm('WG_Mentoria_2026Q4')).toBe('wg_mentoria_2026q4')
    expect(sanitizarUtm('criativo.01')).toBe('criativo_01')
    expect(sanitizarUtm('Meta Ads!')).toBe('')
    expect(sanitizarUtm('<script>')).toBe('')
    expect(sanitizarUtm('a'.repeat(61))).toBe('')
    expect(sanitizarUtm(null)).toBe('')
  })

  it('utm_source conhecido manda; senao so a categoria do referrer; senao direto', () => {
    expect(canalDaOrigem({ search: '?utm_source=meta' })).toBe('meta_ads')
    expect(canalDaOrigem({ search: '?utm_source=ig' })).toBe('instagram')
    expect(canalDaOrigem({ search: '', referrer: 'https://l.facebook.com/l.php?u=x' })).toBe('facebook')
    expect(canalDaOrigem({ search: '', referrer: 'https://www.instagram.com/' })).toBe('instagram')
    expect(canalDaOrigem({ search: '', referrer: 'https://www.google.com/search?q=privado' })).toBe('google')
    expect(canalDaOrigem({ search: '', referrer: 'https://blog-qualquer.com/post' })).toBe('outro')
    expect(canalDaOrigem({ search: '', referrer: '' })).toBe('direto')
    expect(canalDaOrigem({ search: '?utm_source=tiktok_qualquer', referrer: '' })).toBe('direto')
  })

  it('dispositivo pela largura da tela', () => {
    expect(dispositivoDaTela(390)).toBe('mobile')
    expect(dispositivoDaTela(820)).toBe('tablet')
    expect(dispositivoDaTela(1440)).toBe('desktop')
    expect(dispositivoDaTela(0)).toBe('desktop')
  })

  it('o corpo enviado so tem campos de lista fechada e utm sanitizado (nunca a URL, o referrer ou texto livre)', () => {
    const corpo = montarMetrica('page_view', { search: '?utm_source=meta&utm_campaign=Meta%20Ads!&utm_content=criativo01_operacao_v1&fbclid=ABC123&email=a@b.com', referrer: 'https://l.facebook.com/?token=segredo', largura: 390 })
    expect(corpo).toEqual({ pagina: 'landing', evento: 'page_view', canal: 'meta_ads', utm_campaign: '', utm_content: 'criativo01_operacao_v1', dispositivo: 'mobile' })
    expect(JSON.stringify(corpo)).not.toMatch(/ABC123|a@b\.com|segredo|facebook\.com/)
    expect(montarMetrica('evento_inventado')).toBeNull()
  })
})

describe('siteMetrics: marcos do video', () => {
  it('devolve so os marcos novos, na ordem, sem repetir', () => {
    expect(marcosAtingidos(10, 100)).toEqual([])
    expect(marcosAtingidos(26, 100)).toEqual([25])
    expect(marcosAtingidos(80, 100)).toEqual([25, 50, 75])
    expect(marcosAtingidos(80, 100, [25, 50])).toEqual([75])
    expect(marcosAtingidos(80, 100, [25, 50, 75])).toEqual([])
  })

  it('duracao invalida ou tempo invalido nao gera marco', () => {
    expect(marcosAtingidos(10, 0)).toEqual([])
    expect(marcosAtingidos(10, NaN)).toEqual([])
    expect(marcosAtingidos(-1, 100)).toEqual([])
    expect(marcosAtingidos(10, Infinity)).toEqual([])
  })
})

describe('siteMetrics: envio', () => {
  it('envia por sendBeacon para o endpoint do proprio site, com JSON de lista fechada', async () => {
    const sendBeacon = vi.fn(() => true)
    const ok = registrarMetricaSite('video_play', { win: janela({ navigator: { sendBeacon } }), storage: storageFalso() })
    expect(ok).toBe(true)
    expect(sendBeacon).toHaveBeenCalledTimes(1)
    const [url, blob] = sendBeacon.mock.calls[0]
    expect(url).toBe(SITE_METRICS_ENDPOINT)
    expect(JSON.parse(await lerBlob(blob))).toMatchObject({ evento: 'video_play', canal: 'meta_ads', dispositivo: 'mobile', utm_campaign: 'wg_mentoria_2026q4' })
  })

  it('cai para fetch keepalive quando nao ha sendBeacon', () => {
    const fetchImpl = vi.fn(() => Promise.resolve({}))
    registrarMetricaSite('page_view', { win: janela({ navigator: {} }), storage: storageFalso(), fetchImpl })
    expect(fetchImpl).toHaveBeenCalledWith(SITE_METRICS_ENDPOINT, expect.objectContaining({ method: 'POST', keepalive: true }))
  })

  it('cada evento sai uma unica vez por aba, mesmo recarregando o modulo (marcador no sessionStorage)', () => {
    const sendBeacon = vi.fn(() => true)
    const storage = storageFalso()
    expect(registrarMetricaSite('page_view', { win: janela({ navigator: { sendBeacon } }), storage })).toBe(true)
    expect(registrarMetricaSite('page_view', { win: janela({ navigator: { sendBeacon } }), storage })).toBe(false)
    _reiniciarMemoriaDeMetricas()
    expect(registrarMetricaSite('page_view', { win: janela({ navigator: { sendBeacon } }), storage })).toBe(false)
    expect(registrarMetricaSite('video_play', { win: janela({ navigator: { sendBeacon } }), storage })).toBe(true)
    expect(sendBeacon).toHaveBeenCalledTimes(2)
  })

  it('o unico dado guardado no navegador e a lista de nomes de evento ja enviados (nenhum identificador)', () => {
    const storage = storageFalso()
    registrarMetricaSite('page_view', { win: janela({ navigator: { sendBeacon: () => true } }), storage })
    const guardado = [...storage._dados.entries()]
    expect(guardado).toEqual([['wg_site_metrics_v1', '["page_view"]']])
  })

  it('sem sessionStorage (modo privado) ainda conta uma vez por pagina; erros nunca sobem', () => {
    const storage = { getItem: () => { throw new Error('bloqueado') }, setItem: () => { throw new Error('bloqueado') } }
    const sendBeacon = vi.fn(() => true)
    expect(registrarMetricaSite('whatsapp_click', { win: janela({ navigator: { sendBeacon } }), storage })).toBe(true)
    expect(registrarMetricaSite('whatsapp_click', { win: janela({ navigator: { sendBeacon } }), storage })).toBe(false)
    expect(() => registrarMetricaSite('page_view', { win: janela({ navigator: { sendBeacon: () => { throw new Error('x') } }, document: null }), storage: storageFalso() })).not.toThrow()
  })

  it('evento fora da lista nao sai', () => {
    const sendBeacon = vi.fn(() => true)
    expect(registrarMetricaSite('clique_qualquer', { win: janela({ navigator: { sendBeacon } }), storage: storageFalso() })).toBe(false)
    expect(sendBeacon).not.toHaveBeenCalled()
  })
})
