import crypto from 'node:crypto'
import { applyRateLimitHeaders, getClientIp } from './_requestGuard.js'

const SUPABASE_ORIGIN = 'https://ahlqzzkxuutwoepirpzr.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY
const CONTACT_TURNSTILE_REQUIRED = process.env.CONTACT_TURNSTILE_REQUIRED === 'true'
const ALLOWED_EXTRA_ORIGINS = String(process.env.CONTACT_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const MAX_BODY_BYTES = 16 * 1024
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 8
const TOKEN_REPLAY_TTL_MS = 10 * 60 * 1000
const rateLimitStore = globalThis.__wgContactRateLimit || new Map()
const turnstileTokenStore = globalThis.__wgTurnstileTokenStore || new Map()
globalThis.__wgContactRateLimit = rateLimitStore
globalThis.__wgTurnstileTokenStore = turnstileTokenStore

const ALLOWED_ORIGINS = new Set([
  'https://wgalmeida.com.br',
  'https://www.wgalmeida.com.br',
  'http://localhost:3000',
  'http://localhost:3108',
  'http://localhost:3109',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3108',
  'http://127.0.0.1:3109',
  'http://127.0.0.1:4173',
])

const json = (res, status, payload) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(JSON.stringify(payload))
}

const clean = (value, max = 500) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)

const isValidEmail = (email) => {
  const value = String(email || '').trim()
  const atIndex = value.indexOf('@')
  const dotIndex = value.lastIndexOf('.')
  return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < value.length - 2
}

const parseBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}')

  const declaredLength = Number(req.headers['content-length'] || 0)
  if (declaredLength > MAX_BODY_BYTES) {
    const error = new Error('payload_too_large')
    error.statusCode = 413
    throw error
  }

  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > MAX_BODY_BYTES) {
      const error = new Error('payload_too_large')
      error.statusCode = 413
      throw error
    }
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

const isAllowedOrigin = (req) => {
  const origin = req.headers.origin
  if (!origin) return true
  if (ALLOWED_ORIGINS.has(origin)) return true
  if (ALLOWED_EXTRA_ORIGINS.includes(origin)) return true
  return process.env.VERCEL_ENV !== 'production' && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)
}

const pruneMap = (store, now) => {
  for (const [key, value] of store.entries()) {
    if ((value.expiresAt || value.resetAt || 0) <= now) store.delete(key)
  }
}

const checkRateLimit = (key) => {
  const now = Date.now()
  pruneMap(rateLimitStore, now)
  const current = rateLimitStore.get(key)

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { ok: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS }
  }

  current.count += 1
  rateLimitStore.set(key, current)
  return {
    ok: current.count <= RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - current.count),
    resetAt: current.resetAt,
  }
}

const tokenAlreadyUsed = (token) => {
  const now = Date.now()
  pruneMap(turnstileTokenStore, now)
  if (!token) return false
  const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex')
  if (turnstileTokenStore.has(tokenHash)) return true
  turnstileTokenStore.set(tokenHash, { expiresAt: now + TOKEN_REPLAY_TTL_MS })
  return false
}

const verifyTurnstile = async (token, remoteip) => {
  if (!TURNSTILE_SECRET_KEY) {
    throw new Error('TURNSTILE_SECRET_KEY not configured')
  }

  const formData = new URLSearchParams()
  formData.set('secret', TURNSTILE_SECRET_KEY)
  formData.set('response', token || '')
  if (remoteip) formData.set('remoteip', remoteip)

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  })

  const result = await response.json().catch(() => ({}))
  if (!response.ok || result.success !== true) return false
  if (result.action && result.action !== 'contact_form') return false

  const expectedHostnames = new Set(['wgalmeida.com.br', 'www.wgalmeida.com.br'])
  if (process.env.VERCEL_ENV !== 'production' && typeof result.hostname === 'string') {
    return expectedHostnames.has(result.hostname) || result.hostname.endsWith('.vercel.app') || result.hostname === 'localhost'
  }
  return !result.hostname || expectedHostnames.has(result.hostname)
}

export default async function handler(req, res) {
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.headers.origin && isAllowedOrigin(req)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  if (!isAllowedOrigin(req)) {
    return json(res, 403, { error: 'Origem nao autorizada.' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
    return json(res, 405, { error: 'Method not allowed' })
  }

  if (!SUPABASE_SERVICE_KEY) {
    return json(res, 500, { error: 'SUPABASE_SERVICE_ROLE_KEY not configured' })
  }

  try {
    const body = await parseBody(req)
    const name = clean(body.name, 120)
    const email = clean(body.email, 180).toLowerCase()
    const phone = clean(body.phone, 40)
    const subject = clean(body.subject, 160)
    const message = clean(body.message, 1800)
    const remoteip = getClientIp(req)
    const rateKey = `${remoteip || 'unknown'}:${email || 'no-email'}`

    if (clean(body.website, 120)) {
      return json(res, 200, { ok: true })
    }

    if (!name || !isValidEmail(email) || !message) {
      return json(res, 400, { error: 'Nome, e-mail valido e mensagem sao obrigatorios.' })
    }

    const rate = checkRateLimit(rateKey)
    applyRateLimitHeaders(res, rate)
    if (!rate.ok) {
      return json(res, 429, { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' })
    }

    if (CONTACT_TURNSTILE_REQUIRED && !TURNSTILE_SECRET_KEY) {
      return json(res, 500, { error: 'TURNSTILE_SECRET_KEY not configured' })
    }

    if (TURNSTILE_SECRET_KEY) {
      if (!body.turnstileToken) {
        return json(res, 403, { error: 'Verificacao anti-spam obrigatoria.' })
      }

      if (tokenAlreadyUsed(body.turnstileToken)) {
        return json(res, 403, { error: 'Verificacao anti-spam expirada. Atualize e tente novamente.' })
      }

      const turnstileOk = await verifyTurnstile(body.turnstileToken, remoteip)
      if (!turnstileOk) {
        return json(res, 403, { error: 'Falha na verificacao anti-spam.' })
      }
    }

    const payload = {
      name,
      email,
      phone,
      subject,
      message,
      utm_source: clean(body.utm_source, 120) || null,
      utm_medium: clean(body.utm_medium, 120) || null,
      utm_campaign: clean(body.utm_campaign, 180) || null,
      origem: body.context === 'buildtech' ? 'site-buildtech' : 'site',
      status: 'nova',
    }

    const response = await fetch(`${SUPABASE_ORIGIN}/rest/v1/contacts`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('contact api supabase error:', response.status)
      return json(res, 502, { error: 'Falha ao registrar contato.' })
    }

    return json(res, 200, { ok: true })
  } catch (error) {
    console.error('contact api error:', error)
    if (error.statusCode === 413) {
      return json(res, 413, { error: 'Mensagem muito grande.' })
    }
    return json(res, 500, { error: 'Erro inesperado ao processar contato.' })
  }
}
