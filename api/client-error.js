import { applyRateLimitHeaders, checkRateLimit, getClientIp, isOriginAllowed } from './_requestGuard.js'

const MAX_BODY_BYTES = 8 * 1024
const RATE_LIMIT = {
  bucket: 'client-error',
  limit: 20,
  windowMs: 10 * 60 * 1000,
}

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

const parseBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}')

  const declaredLength = Number(req.headers?.['content-length'] || 0)
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

export default async function handler(req, res) {
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.headers?.origin && isOriginAllowed(req)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  if (!isOriginAllowed(req)) {
    return json(res, 403, { error: 'Origem nao autorizada.' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS')
    return json(res, 405, { error: 'Method not allowed' })
  }

  try {
    const rate = checkRateLimit({
      ...RATE_LIMIT,
      key: getClientIp(req),
    })
    applyRateLimitHeaders(res, rate)
    if (!rate.ok) {
      return json(res, 202, { ok: true })
    }

    const body = await parseBody(req)
    console.error('client_error', {
      message: clean(body.message, 300),
      source: clean(body.source, 120),
      path: clean(body.path, 180),
      stackPreview: clean(body.componentStack ? String(body.componentStack).slice(0, 1200) : '', 120),
    })
    return json(res, 202, { ok: true })
  } catch {
    return json(res, 202, { ok: true })
  }
}
