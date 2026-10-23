import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Regressao: o /api/contact gravava no projeto Supabase ahlqzzkxuutwoepirpzr (errado) enquanto o banco
// canonico do WGEasy e xkvuhixxpfonfcwrvknm. Nenhum contato do site chegava ao WGEasy.
const CANONICAL = 'https://xkvuhixxpfonfcwrvknm.supabase.co'
const LEGACY_REF = 'ahlqzzkxuutwoepirpzr'

const rpcRow = { outcome: 'saved', promotion_outcome: 'promotion_skipped' }

describe('/api/contact usa o Supabase canonico do WGEasy', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.spyOn(console, 'info').mockImplementation(() => {})
    globalThis.__wgContactRateLimit = new Map()
    globalThis.__wgTurnstileTokenStore = new Map()
    globalThis.__wgContactIdempotency = new Map()
    vi.stubEnv('TURNSTILE_SECRET_KEY', '')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-test-key')
    vi.stubEnv('CONTACT_TURNSTILE_REQUIRED', 'false')
    vi.stubEnv('CONVERSION_TELEMETRY_ENABLED', 'true')
    // mesmo com SUPABASE_URL de ambiente apontando para o projeto antigo, o destino nao pode mudar
    vi.stubEnv('SUPABASE_URL', `https://${LEGACY_REF}.supabase.co`)
    vi.stubEnv('VITE_SUPABASE_URL', `https://${LEGACY_REF}.supabase.co`)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('grava o contato e a telemetria no projeto canonico', async () => {
    const calls = []
    global.fetch = vi.fn(async (url) => {
      calls.push(String(url))
      return { ok: true, status: 200, json: async () => [rpcRow] }
    })
    const { default: handler } = await import('../../api/contact.js')
    const res = {
      statusCode: 0,
      headers: {},
      setHeader(k, v) { this.headers[k.toLowerCase()] = v },
      end(body) { this.body = body },
    }
    await handler({
      method: 'POST',
      headers: { origin: 'https://wgalmeida.com.br', host: 'wgalmeida.com.br', 'x-forwarded-for': '198.51.100.77' },
      body: { name: 'Teste', email: 'teste@example.com', message: 'Mensagem de teste' },
    }, res)

    expect(res.statusCode, res.body).toBe(200)
    expect(calls.length).toBeGreaterThanOrEqual(1)
    for (const url of calls) {
      expect(url.startsWith(CANONICAL)).toBe(true)
      expect(url).not.toContain(LEGACY_REF)
    }
    expect(calls[0]).toContain('/rest/v1/rpc/ingest_site_contact_idempotent')
  })

  it('o ref antigo nao esta fixo nos arquivos de captura de contato', () => {
    for (const file of ['api/contact.js', 'api/_conversionObservability.js']) {
      expect(readFileSync(file, 'utf8')).not.toContain(LEGACY_REF)
    }
  })
})
