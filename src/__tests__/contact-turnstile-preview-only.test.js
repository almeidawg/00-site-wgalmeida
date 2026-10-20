import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const dummySecret = '1x0000000000000000000000000000000AA'
const makeReq = () => ({
  method: 'POST',
  headers: {
    origin: 'https://site-wgalmeida-qirlqks44-grupo-wg-almeida-vercel-projects.vercel.app',
    host: 'site-wgalmeida-qirlqks44-grupo-wg-almeida-vercel-projects.vercel.app',
    'x-forwarded-for': '198.51.100.55',
  },
  body: {
    name: 'Homologacao WG',
    email: 'homologacao@example.com',
    message: 'Validacao controlada de teste, sem envio real',
    context: 'contact',
    turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
  },
})
const makeRes = () => ({
  statusCode: 200,
  headers: {},
  body: '',
  setHeader(key, value) { this.headers[key] = value },
  end(value = '') { this.body = value; return this },
})

describe('Cloudflare dummy hostname is strictly gated to isolated preview', () => {
  beforeEach(() => {
    vi.resetModules()
    globalThis.__wgContactRateLimit = new Map()
    globalThis.__wgTurnstileTokenStore = new Map()
    globalThis.__wgContactIdempotency = new Map()
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'fixture-service-role')
    vi.stubEnv('TURNSTILE_SECRET_KEY', dummySecret)
    vi.stubEnv('CONTACT_TURNSTILE_REQUIRED', 'true')
    vi.stubEnv('CONTACT_AUTO_PROMOTE_WGEASY', 'false')
    vi.stubEnv('CONVERSION_TELEMETRY_ENABLED', 'false')
    vi.spyOn(console, 'info').mockImplementation(() => {})
    global.fetch = vi.fn(async url => {
      if (String(url).includes('/siteverify')) {
        return { ok: true, status: 200, json: async () => ({
          success: true, hostname: 'example.com', action: '',
        }) }
      }
      if (String(url).includes('/rpc/ingest_site_contact_idempotent')) {
        return { ok: true, status: 200, json: async () => ([{
          outcome: 'saved', promotion_outcome: 'promotion_skipped',
        }]) }
      }
      throw Error('Unexpected network request in isolated test')
    })
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('accepts the dummy hostname only with preview, test flag and official matching secret', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview')
    vi.stubEnv('TURNSTILE_TEST_MODE', 'true')
    const { default: handler } = await import('../../api/contact.js')
    const res = makeRes()
    await handler(makeReq(), res)
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toMatchObject({ ok: true, outcome: 'saved' })
    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(global.fetch.mock.calls[1][0]).toContain('ingest_site_contact_idempotent')
  })

  it.each([
    ['production with test flag', 'production', 'true', dummySecret],
    ['preview without flag', 'preview', 'false', dummySecret],
    ['preview with wrong secret', 'preview', 'true', 'fixture-unmatched-secret'],
  ])('rejects dummy hostname for %s', async (_name, env, flag, secret) => {
    vi.stubEnv('VERCEL_ENV', env)
    vi.stubEnv('TURNSTILE_TEST_MODE', flag)
    vi.stubEnv('TURNSTILE_SECRET_KEY', secret)
    const { default: handler } = await import('../../api/contact.js')
    const res = makeRes()
    const req = makeReq()
    if (env === 'production') {
      req.headers.origin = 'https://wgalmeida.com.br'
      req.headers.host = 'wgalmeida.com.br'
    }
    await handler(req, res)
    expect(res.statusCode).toBe(403)
    expect(JSON.parse(res.body).error).toContain('anti-spam')
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})
