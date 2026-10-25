import { afterEach, describe, expect, it, vi } from 'vitest'

const makeResponse = () => ({
  statusCode: 200,
  headers: {},
  setHeader(name, value) { this.headers[name.toLowerCase()] = value },
  end(body) { this.body = body },
})

const runContact = async (key, { previewKey = '', vercelEnv = 'preview', expectedStatus = 200 } = {}) => {
  vi.resetModules()
  vi.stubEnv('SUPABASE_URL', 'https://ayhcldffqadlbfjhkrmg.supabase.co')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', key)
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY_2', previewKey)
  vi.stubEnv('VERCEL_ENV', vercelEnv)
  vi.stubEnv('CONTACT_TURNSTILE_REQUIRED', 'false')
  vi.stubEnv('CONTACT_AUTO_PROMOTE_WGEASY', 'false')
  vi.stubEnv('CONVERSION_TELEMETRY_ENABLED', 'false')
  vi.stubEnv('TURNSTILE_SECRET_KEY', '')
  const mockFetch = vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => [{ outcome: 'saved', promotion_outcome: 'promotion_skipped' }],
  }))
  vi.stubGlobal('fetch', mockFetch)
  const { default: handler } = await import('../../api/contact.js')
  const req = {
    method: 'POST',
    headers: { host: 'localhost:3000', origin: 'http://localhost:3000', 'x-forwarded-for': '192.0.2.100' },
    body: {
      name: 'QA WG Almeida',
      email: `qa-${crypto.randomUUID()}@example.invalid`,
      message: 'Mensagem sintética para teste de contrato',
    },
  }
  const res = makeResponse()
  await handler(req, res)
  expect(res.statusCode).toBe(expectedStatus)
  if (expectedStatus !== 200) {
    expect(mockFetch).not.toHaveBeenCalled()
    return {}
  }
  expect(mockFetch).toHaveBeenCalledTimes(1)
  return mockFetch.mock.calls[0][1].headers
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('/api/contact Supabase admin API key headers', () => {
  it('uses sb_secret only in apikey, without an invalid JWT Bearer', async () => {
    const headers = await runContact('sb_secret_synthetic_test_only')
    expect(headers.apikey).toBe('sb_secret_synthetic_test_only')
    expect(headers.Authorization).toBeUndefined()
  })

  it('uses the preview-scoped _2 alias without an invalid JWT Bearer', async () => {
    const headers = await runContact('', { previewKey: 'sb_secret_preview_alias_synthetic' })
    expect(headers.apikey).toBe('sb_secret_preview_alias_synthetic')
    expect(headers.Authorization).toBeUndefined()
    expect(headers['User-Agent']).toBe('wg-almeida-preview-backend/1.0')
  })

  it('does not alter outgoing User-Agent in Production', async () => {
    const headers = await runContact('sb_secret_synthetic_test_only', { vercelEnv: 'production' })
    expect(headers['User-Agent']).toBeUndefined()
  })

  it('never uses the preview alias in Production', async () => {
    await runContact('', { previewKey: 'sb_secret_preview_alias_synthetic', vercelEnv: 'production', expectedStatus: 500 })
  })

  it('preserves legacy service_role Bearer compatibility', async () => {
    const headers = await runContact('legacy-service-role-synthetic-test')
    expect(headers.apikey).toBe('legacy-service-role-synthetic-test')
    expect(headers.Authorization).toBe('Bearer legacy-service-role-synthetic-test')
  })
})
