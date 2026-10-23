import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Decisao do owner (2026-10-22, opcao B): o admin do site fica inativo em producao ate a migracao para o WGEasy.
// Motivo: login e usuarios do site vivem no Supabase ahlqzz, mas a chave de servico da Vercel agora e a do banco
// canonico xkvuhix, entao o admin respondia 503/401 sem explicacao. Reativar: SITE_ADMIN_ENABLED=true.
const makeRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader: vi.fn((k, v) => { res.headers[k] = v }),
    status: vi.fn((c) => { res.statusCode = c; return res }),
    json: vi.fn((b) => { res.body = b; return res }),
  }
  return res
}

describe('admin do site em producao', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-test-key')
    global.fetch = vi.fn()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('responde 503 explicito e nao consulta o Supabase quando esta desativado em producao', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('SITE_ADMIN_ENABLED', '')
    const { requireAdmin } = await import('../../api/_adminAuth.js')
    const res = makeRes()
    const out = await requireAdmin({ headers: { authorization: 'Bearer qualquer-token' } }, res)

    expect(out.ok).toBe(false)
    expect(res.statusCode).toBe(503)
    expect(res.body).toMatchObject({ code: 'site_admin_disabled' })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('SITE_ADMIN_ENABLED=true reativa o fluxo normal em producao', async () => {
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('SITE_ADMIN_ENABLED', 'true')
    const { requireAdmin } = await import('../../api/_adminAuth.js')
    const res = makeRes()
    const out = await requireAdmin({ headers: {} }, res)

    expect(out.ok).toBe(false)
    expect(res.statusCode).toBe(401) // sem token: fluxo normal de autenticacao
    expect(res.body?.code).not.toBe('site_admin_disabled')
  })

  it('fora de producao (dev local e preview) o admin segue ativo', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview')
    const { requireAdmin } = await import('../../api/_adminAuth.js')
    const res = makeRes()
    await requireAdmin({ headers: {} }, res)
    expect(res.statusCode).toBe(401)
    expect(res.body?.code).not.toBe('site_admin_disabled')
  })
})
