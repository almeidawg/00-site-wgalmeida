const SUPABASE_ORIGIN = 'https://ahlqzzkxuutwoepirpzr.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY

const json = (res, status, payload) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
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

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
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
  return response.ok && result.success === true
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
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
    const remoteip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()

    if (!name || !isValidEmail(email) || !message) {
      return json(res, 400, { error: 'Nome, e-mail valido e mensagem sao obrigatorios.' })
    }

    const turnstileOk = await verifyTurnstile(body.turnstileToken, remoteip)
    if (!turnstileOk) {
      return json(res, 403, { error: 'Falha na verificacao anti-spam.' })
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
    return json(res, 500, { error: 'Erro inesperado ao processar contato.' })
  }
}
