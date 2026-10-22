// Metricas anonimas da pagina e do video da Mentoria (visita, play, 25/50/75/100% e clique no WhatsApp).
// Privacidade por desenho: nenhum cookie, nenhum identificador, nenhum IP ou user agent guardado, nenhum texto livre.
// Cada evento sai UMA vez por aba (marcador em sessionStorage, so um "ja enviei"), e o servidor so soma contadores por dia.
// Independe do consentimento do pixel da Meta (que continua dependendo): aqui nao ha dado pessoal.
export const SITE_METRICS_ENDPOINT = '/api/site-event'

export const EVENTOS_SITE = Object.freeze(['page_view', 'video_play', 'video_25', 'video_50', 'video_75', 'video_complete', 'whatsapp_click'])

const CHAVE_ENVIADOS = 'wg_site_metrics_v1'
const memoria = new Set()

/** utm so passa se casar com [a-z0-9_-]; ponto vira sublinhado. Nunca repassa texto livre. */
export function sanitizarUtm(valor) {
  const limpo = String(valor || '').toLowerCase().replace(/\./g, '_')
  return /^[a-z0-9_-]{1,60}$/.test(limpo) ? limpo : ''
}

const SOURCE_PARA_CANAL = Object.freeze({
  meta: 'meta_ads', facebook: 'facebook', fb: 'facebook', instagram: 'instagram', ig: 'instagram', google: 'google', whatsapp: 'whatsapp', wa: 'whatsapp',
})

function canalPeloReferrer(referrer) {
  let host = ''
  try { host = new URL(referrer).hostname.toLowerCase() } catch { return 'direto' }
  if (!host) return 'direto'
  if (host.includes('instagram.')) return 'instagram'
  if (host.includes('facebook.') || host === 'fb.com' || host === 'l.facebook.com') return 'facebook'
  if (host.includes('google.')) return 'google'
  if (host.includes('whatsapp.') || host === 'wa.me') return 'whatsapp'
  return 'outro'
}

/** Canal de origem: utm_source conhecido manda; senao o dominio de quem indicou (so a categoria); senao direto. */
export function canalDaOrigem({ search = '', referrer = '' } = {}) {
  const params = new URLSearchParams(search)
  const fonte = SOURCE_PARA_CANAL[sanitizarUtm(params.get('utm_source'))]
  if (fonte) return fonte
  return referrer ? canalPeloReferrer(referrer) : 'direto'
}

export function dispositivoDaTela(largura) {
  const w = Number(largura) || 0
  if (w > 0 && w < 768) return 'mobile'
  if (w < 1100 && w > 0) return 'tablet'
  return 'desktop'
}

export function montarMetrica(evento, { search = '', referrer = '', largura = 0 } = {}) {
  if (!EVENTOS_SITE.includes(evento)) return null
  const params = new URLSearchParams(search)
  return {
    pagina: 'landing',
    evento,
    canal: canalDaOrigem({ search, referrer }),
    utm_campaign: sanitizarUtm(params.get('utm_campaign')),
    utm_content: sanitizarUtm(params.get('utm_content')),
    dispositivo: dispositivoDaTela(largura),
  }
}

function jaEnviado(evento, storage) {
  if (memoria.has(evento)) return true
  try {
    const lista = JSON.parse(storage?.getItem(CHAVE_ENVIADOS) || '[]')
    return Array.isArray(lista) && lista.includes(evento)
  } catch {
    return false
  }
}

function marcarEnviado(evento, storage) {
  memoria.add(evento)
  try {
    const lista = JSON.parse(storage?.getItem(CHAVE_ENVIADOS) || '[]')
    const atual = Array.isArray(lista) ? lista : []
    storage?.setItem(CHAVE_ENVIADOS, JSON.stringify([...new Set([...atual, evento])]))
  } catch {
    // sem sessionStorage (modo privado): vale so a memoria da pagina
  }
}

/** Envia o evento uma unica vez por aba. Nunca lanca erro e nunca bloqueia a navegacao. Devolve true se tentou enviar. */
export function registrarMetricaSite(evento, ambiente = {}) {
  const win = ambiente.win ?? (typeof window === 'undefined' ? null : window)
  if (!win) return false
  const storage = ambiente.storage ?? (() => { try { return win.sessionStorage } catch { return null } })()
  if (jaEnviado(evento, storage)) return false
  const corpo = montarMetrica(evento, {
    search: win.location?.search || '',
    referrer: win.document?.referrer || '',
    largura: win.innerWidth || 0,
  })
  if (!corpo) return false
  marcarEnviado(evento, storage)
  try {
    const texto = JSON.stringify(corpo)
    const nav = ambiente.navigator ?? win.navigator
    if (nav?.sendBeacon && nav.sendBeacon(SITE_METRICS_ENDPOINT, new Blob([texto], { type: 'application/json' }))) return true
    const fetchImpl = ambiente.fetchImpl ?? win.fetch?.bind(win)
    fetchImpl?.(SITE_METRICS_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: texto, keepalive: true })?.catch?.(() => {})
    return true
  } catch {
    return false
  }
}

/** Marcos do video: devolve os eventos que acabaram de ser atingidos (25, 50, 75), na ordem, sem repetir os ja enviados. */
export function marcosAtingidos(atual, duracao, jaAtingidos = []) {
  const total = Number(duracao)
  const t = Number(atual)
  if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(t) || t < 0) return []
  const percentual = (t / total) * 100
  return [25, 50, 75].filter((m) => percentual >= m && !jaAtingidos.includes(m))
}

/** So para testes: limpa o que ficou na memoria da pagina. */
export function _reiniciarMemoriaDeMetricas() {
  memoria.clear()
}
