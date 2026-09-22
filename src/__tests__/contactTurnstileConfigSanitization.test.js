import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const loadHandler = async () => {
  const module = await import('../../api/contact.js')
  return module.default
}

const makeReq = (body) => ({
  method: 'POST',
  headers: {
    origin: 'https://wgalmeida.com.br',
    'x-forwarded-for': '198.51.100.240',
  },
  body,
})

const makeRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader: vi.fn((key, value) => { res.headers[key] = value }),
    end: vi.fn((payload = '') => { res.body = payload; return res }),
  }
  return res
}

describe('/api/contact Turnstile config sanitization', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-test')
    vi.stubEnv('TURNSTILE_SECRET_KEY', '\uFEFF\uFEFF turnstile-secret-test \r\n')
    vi.stubEnv('CONTACT_TURNSTILE_REQUIRED', 'true')
    vi.stubEnv('CONVERSION_TELEMETRY_ENABLED', 'false')
    globalThis.__wgContactRateLimit = new Map()
    globalThis.__wgTurnstileTokenStore = new Map()
    globalThis.__wgContactIdempotency = new Map()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('remove BOM/espacos antes de enviar a secret para o Cloudflare', async () => {
    let verifiedSecret = null
    global.fetch = vi.fn(async (url, options = {}) => {
      if (String(url).includes('challenges.cloudflare.com')) {
        verifiedSecret = new URLSearchParams(options.body).get('secret')
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, action: 'contact_form', hostname: 'wgalmeida.com.br' }),
        }
      }
      if (String(url).includes('/rest/v1/rpc/ingest_site_contact_idempotent')) {
        return {
          ok: true,
          status: 200,
          json: async () => ([{ outcome: 'saved', promotion_outcome: 'promotion_skipped' }]),
        }
      }
      throw new Error('unexpected fetch')
    })

    const handler = await loadHandler()
    const res = makeRes()
    await handler(makeReq({
      name: 'WG Test',
      email: 'turnstile-bom@example.com',
      message: 'Teste',
      context: 'contact',
      turnstileToken: 'token-bom-test',
    }), res)

    expect(res.statusCode).toBe(200)
    expect(verifiedSecret).toBe('turnstile-secret-test')
  })
})
