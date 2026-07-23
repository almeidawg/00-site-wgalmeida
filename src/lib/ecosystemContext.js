export const WG_JOURNEY_KEY = 'wg_journey'
export const WG_PARTNER_KEY = 'wg_partner'

const PRODUCT_HOSTS = new Set([
  'obraeasy.wgalmeida.com.br',
  'easyrealstate.wgalmeida.com.br',
  'easy.wgalmeida.com.br',
])

const clean = (value, max = 160) => {
  const normalized = String(value || '').trim()
  return normalized ? normalized.slice(0, max) : null
}

export function ensureEcosystemContext(search = window.location.search, storage = window.localStorage) {
  const params = new URLSearchParams(search)
  const incomingJourney = clean(params.get('wg_journey'), 80)
  const incomingPartner = clean(params.get('wg_partner') || params.get('ref'))

  const journey =
    incomingJourney ||
    clean(storage.getItem(WG_JOURNEY_KEY), 80) ||
    crypto.randomUUID()
  const partner = incomingPartner || clean(storage.getItem(WG_PARTNER_KEY))

  storage.setItem(WG_JOURNEY_KEY, journey)
  if (partner) storage.setItem(WG_PARTNER_KEY, partner)

  return {
    journey,
    partner,
    campaign: clean(params.get('wg_campaign')),
  }
}

export function decorateProductUrl(href, context, baseUrl = window.location.origin) {
  const url = new URL(href, baseUrl)
  if (!PRODUCT_HOSTS.has(url.hostname)) return href

  url.searchParams.set('wg_journey', context.journey)
  url.searchParams.set('wg_source', 'site-wg')
  if (context.partner) {
    url.searchParams.set('wg_partner', context.partner)
    url.searchParams.set('ref', context.partner)
  }
  if (context.campaign) url.searchParams.set('wg_campaign', context.campaign)
  return url.toString()
}

