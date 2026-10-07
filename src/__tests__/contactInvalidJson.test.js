import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const makeReq = (body) => ({
  method: 'POST',
  headers: {
    origin: 'https://wgalmeida.com.br',
    host: 'wgalmeida.com.br',
    'x-forwarded-for': '198.51.100.245',
  },
  body,
})

const makeRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader: vi.fn((key, value) => {
      res.headers[key] = value
    }),
    end: vi.fn((payload = '') => {
      res.body = payload
      return res
    }),
  }
  return res
}

describe('/api/contact malformed JSON', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-test')
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')
    vi.stubEnv('CONTACT_TURNSTILE_REQUIRED', 'false')
    vi.stubEnv('CONVERSION_TELEMETRY_ENABLED', 'false')
    globalThis.__wgContactRateLimit = new Map()
    globalThis.__wgContactIdempotency = new Map()
    globalThis.__wgTurnstileTokenStore = new Map()
    global.fetch = vi.fn(() => {
      throw new Error('malformed JSON must not reach external services')
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('returns HTTP 400 with invalid_json telemetry instead of generic 500', async () => {
    const { default: handler } = await import('../../api/contact.js')
    const res = makeRes()

    await handler(makeReq('{"name":"broken"'), res)

    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body)).toEqual({ error: 'Payload JSON invalido.' })
    expect(res.headers['X-WG-Outcome']).toBe('rejected')
    expect(global.fetch).not.toHaveBeenCalled()

    const metricCall = console.info.mock.calls.find(([prefix]) => prefix === '[wg-conversion]')
    expect(metricCall).toBeDefined()
    expect(JSON.parse(metricCall[1])).toMatchObject({
      outcome: 'rejected',
      reason: 'invalid_json',
      statusCode: 400,
      context: 'other',
    })
  })
})
