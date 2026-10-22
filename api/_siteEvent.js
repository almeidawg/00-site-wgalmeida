// Coletor anonimo de metricas da pagina e do video da Mentoria.
// NAO e uma funcao propria: a Vercel Hobby aceita 12 funcoes e o site ja usa as 12. Este modulo (prefixo _) e despachado por api/client-error.js
// quando a chamada chega em /api/site-event (rewrite em vercel.json para /api/client-error?kind=site-event).
// Recebe um evento de lista fechada, valida de novo no servidor e repassa para a funcao publica do banco (mkt_site_evento), que so soma
// contadores por dia. O IP existe apenas na memoria para o limite por minuto; nada de IP, user agent ou corpo e guardado ou registrado em log.
// Resposta sempre 204: quem mede nunca fica sabendo se o evento contou (nao ha o que explorar) e a pagina nunca falha por causa da medicao.
// Env (somente no projeto Vercel do site): WGEASY_METRICS_URL, WGEASY_METRICS_ANON_KEY (chave publica) e WGEASY_METRICS_PRODUTO_ID.
import { applyRateLimitHeaders, checkRateLimit, getClientIp, isOriginAllowed } from './_requestGuard.js'

const MAX_BODY_BYTES = 2 * 1024
const RATE_LIMIT = { bucket: 'site-event', limit: 40, windowMs: 60 * 1000 }

const EVENTOS = new Set(['page_view', 'video_play', 'video_25', 'video_50', 'video_75', 'video_complete', 'whatsapp_click'])
const CANAIS = new Set(['meta_ads', 'instagram', 'facebook', 'google', 'whatsapp', 'direto', 'outro'])
const DISPOSITIVOS = new Set(['mobile', 'tablet', 'desktop'])
const UTM = /^[a-z0-9_-]{1,60}$/

const fim = (res, status = 204) => {
  res.statusCode = status
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end()
}

const lerCorpo = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}')
  const declarado = Number(req.headers?.['content-length'] || 0)
  if (declarado > MAX_BODY_BYTES) throw new Error('payload_too_large')
  const partes = []
  let total = 0
  for await (const parte of req) {
    total += parte.length
    if (total > MAX_BODY_BYTES) throw new Error('payload_too_large')
    partes.push(parte)
  }
  return JSON.parse(Buffer.concat(partes).toString('utf8') || '{}')
}

/** Valida e normaliza. Devolve null se qualquer campo fixo estiver fora da lista; utm invalido vira vazio (nao derruba o evento). */
export function normalizarEvento(corpo) {
  if (!corpo || typeof corpo !== 'object') return null
  const { pagina, evento, canal, dispositivo } = corpo
  if (pagina !== 'landing' || !EVENTOS.has(evento) || !CANAIS.has(canal) || !DISPOSITIVOS.has(dispositivo)) return null
  const utm = (v) => (typeof v === 'string' && UTM.test(v.toLowerCase()) ? v.toLowerCase() : '')
  return { pagina, evento, canal, dispositivo, utm_campaign: utm(corpo.utm_campaign), utm_content: utm(corpo.utm_content) }
}

/** True quando a chamada e do coletor de metricas (rewrite /api/site-event). */
export function ehEventoDeSite(req) {
  const direto = req.query?.kind
  if (direto) return direto === 'site-event'
  const consulta = String(req.url || '').split('?')[1] || ''
  return new URLSearchParams(consulta).get('kind') === 'site-event'
}

export default async function handleSiteEvent(req, res) {
  // Chamado da mesma origem da pagina: sem cabecalhos CORS. Origem de outro site e ignorada abaixo.
  if (req.method === 'OPTIONS') return fim(res)
  if (req.method !== 'POST') return fim(res, 405)
  if (req.headers?.origin && !isOriginAllowed(req)) return fim(res)

  const taxa = checkRateLimit({ ...RATE_LIMIT, key: getClientIp(req) })
  applyRateLimitHeaders(res, taxa)
  if (!taxa.ok) return fim(res)

  const url = process.env.WGEASY_METRICS_URL || ''
  const chave = process.env.WGEASY_METRICS_ANON_KEY || ''
  const produto = process.env.WGEASY_METRICS_PRODUTO_ID || ''
  if (!url || !chave || !produto) return fim(res)

  let evento = null
  try {
    evento = normalizarEvento(await lerCorpo(req))
  } catch {
    return fim(res)
  }
  if (!evento) return fim(res)

  try {
    await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/mkt_site_evento`, {
      method: 'POST',
      headers: { apikey: chave, Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_produto: produto, p_pagina: evento.pagina, p_evento: evento.evento, p_canal: evento.canal,
        p_utm_campaign: evento.utm_campaign, p_utm_content: evento.utm_content, p_dispositivo: evento.dispositivo,
      }),
    })
  } catch {
    // medicao nunca derruba a pagina
  }
  return fim(res)
}
