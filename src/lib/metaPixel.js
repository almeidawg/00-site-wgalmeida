/**
 * Pixel da Meta so para a Mentoria, so com consentimento explicito.
 * Canal separado de analytics.js, que continua bloqueado na rota da mentoria.
 * Sem ID configurado, sem consentimento ou fora da mentoria: nada e carregado.
 */
import { META_PIXEL_ID } from './metaPixelConfig.js'
import { readMentoriaConsent } from './mentoriaConsent.js'
import { isMentoriaHost, MENTORIA_LEGACY_PATH } from './mentoriaDomain.js'

const FBEVENTS_SRC = 'https://connect.facebook.net/en_US/fbevents.js'
const PIXEL_ID_FORMAT = /^\d{10,20}$/
const ALLOWED_EVENTS = new Set(['PageView', 'ViewContent', 'Contact'])
const ALLOWED_PARAMS = new Set(['content_name', 'content_category'])
const PARAM_VALUE = /^[A-Za-z0-9_. :-]{1,100}$/

export function isMentoriaSurface(win = window) {
  const { hostname = '', pathname = '' } = win.location || {}
  return isMentoriaHost(hostname)
    || pathname === MENTORIA_LEGACY_PATH
    || pathname.startsWith(MENTORIA_LEGACY_PATH + '/')
}

// eventID so serve para deduplicar com o CAPI: basta ser unico, nao imprevisivel.
let eventCounter = 0
function newEventId(win) {
  const cryptoApi = win.crypto
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID()
  eventCounter += 1
  return 'ev_' + Date.now().toString(36) + '_' + eventCounter
}

function installFbq(win, doc) {
  if (win.fbq) return
  const fbq = function () {
    if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments)
    else fbq.queue.push(arguments)
  }
  win.fbq = fbq
  if (!win._fbq) win._fbq = fbq
  fbq.push = fbq
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.queue = []
  const script = doc.createElement('script')
  script.async = true
  script.src = FBEVENTS_SRC
  doc.head.appendChild(script)
}

/** Carrega o pixel uma unica vez. Retorna true so quando esta ativo. */
export function loadMetaPixel({ pixelId = META_PIXEL_ID, win = window, doc = document } = {}) {
  if (!PIXEL_ID_FORMAT.test(pixelId)) return false
  if (!isMentoriaSurface(win)) return false
  if (readMentoriaConsent(win) !== 'granted') return false
  if (win.__wgMentoriaPixelId === pixelId) return true
  installFbq(win, doc)
  win.fbq('init', pixelId)
  win.__wgMentoriaPixelId = pixelId
  win.fbq('track', 'PageView', {}, { eventID: newEventId(win) })
  return true
}

function cleanParams(params) {
  const out = {}
  for (const [key, value] of Object.entries(params || {})) {
    if (ALLOWED_PARAMS.has(key) && typeof value === 'string' && PARAM_VALUE.test(value)) out[key] = value
  }
  return out
}

/** Envia evento padrao so se o pixel estiver ativo. Retorna o eventID (para dedupe com CAPI) ou null. */
export function trackMetaEvent(name, params = {}, { win = window } = {}) {
  if (!ALLOWED_EVENTS.has(name)) return null
  if (!win.__wgMentoriaPixelId || readMentoriaConsent(win) !== 'granted') return null
  const eventID = newEventId(win)
  win.fbq('track', name, cleanParams(params), { eventID })
  return eventID
}
