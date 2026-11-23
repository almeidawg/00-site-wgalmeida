import { afterEach, describe, expect, it, vi } from 'vitest'
import handler, { calculatePublicEstimate, assertCanonicalEstimateSourceUrl, validateCertifiedEstimateSnapshot, WG_ESTIMATE_CANONICAL_REF, ICCRI_PUBLIC_SNAPSHOT_VIEW } from '../../api/wgeasy-public-estimate.js'

const snapshotFixture = () => ({
  padrao: 'equilibrado',
  uf: 'SP',
  label: 'Equilibrado',
  region_label: 'São Paulo',
  publication_status: 'homologated',
  schema_version: 'iccri-public-estimate-v1',
  source_project_ref: WG_ESTIMATE_CANONICAL_REF,
  unit: 'BRL/m2',
  scope_id: 'reforma-civil-integral-sp',
  scope_version: 'v1',
  approval_ref: 'fixture-owner-approval',
  calibration_ref: 'fixture-calibration-approval',
  snapshot_hash: 'a'.repeat(64),
  sample_size: 6,
  approved_at: '2026-10-09T00:00:00Z',
  valid_until: '2099-01-01T00:00:00Z',
  reference_date: '2026-10-01',
  range_m2_min: 1800,
  range_m2_med: 2400,
  range_m2_max: 3000,
})

const fakeResponse = () => {
  let sent = null
  const res = {
    statusCode: null,
    headers: {},
    setHeader(k, v) { this.headers[k] = v },
    end(body) { sent = JSON.parse(body) },
  }
  return { res, get body() { return sent } }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('publicação do endpoint ICCRI — fail-closed no servidor', () => {
  const request = { method: 'GET', query: { area: '80', standard: 'equilibrado', uf: 'SP' } }

  it('recusa consulta direta sem snapshot homologado, não devolve faixa ou credenciais', async () => {
    vi.stubEnv('WGEASY_ESTIMATE_SUPABASE_URL', `https://${WG_ESTIMATE_CANONICAL_REF}.supabase.co/`)
    vi.stubEnv('WGEASY_ESTIMATE_SUPABASE_ANON_KEY', 'fixture-anon-public-only')
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 404 })
    vi.stubGlobal('fetch', fetchMock)
    const target = fakeResponse()
    await handler(request, target.res)
    expect(target.res.statusCode).toBe(503)
    expect(target.body).toEqual({
      ok: false,
      error: 'ESTIMATIVA_INDISPONIVEL',
      detail: 'PUBLICACAO_NAO_HOMOLOGADA',
    })
    expect(JSON.stringify(target.body)).not.toMatch(/range_m2|minimum|maximum|fixture-anon/)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toContain(ICCRI_PUBLIC_SNAPSHOT_VIEW)
    expect(fetchMock.mock.calls[0][0]).not.toContain('iccri_padroes_canonicos')
    expect(target.res.headers['Cache-Control']).toBe('no-store')
  })

  it('recusa snapshot sem cadeia documental de aprovação', () => {
    const invalid = snapshotFixture()
    invalid.approval_ref = ''
    expect(() => validateCertifiedEstimateSnapshot(invalid, { standard: 'equilibrado', uf: 'SP' }))
      .toThrow('PUBLICACAO_NAO_HOMOLOGADA')
    invalid.approval_ref = 'fixture-owner'
    invalid.sample_size = 0
    expect(() => validateCertifiedEstimateSnapshot(invalid, { standard: 'equilibrado', uf: 'SP' }))
      .toThrow('PUBLICACAO_NAO_HOMOLOGADA')
    invalid.sample_size = 6
    invalid.source_project_ref = 'ayhcldffqadlbfjhkrmg'
    expect(() => validateCertifiedEstimateSnapshot(invalid, { standard: 'equilibrado', uf: 'SP' }))
      .toThrow('PUBLICACAO_NAO_HOMOLOGADA')
  })

  it('só emite preço a partir de um snapshot completo homologado', async () => {
    vi.stubEnv('WGEASY_ESTIMATE_SUPABASE_URL', `https://${WG_ESTIMATE_CANONICAL_REF}.supabase.co/`)
    vi.stubEnv('WGEASY_ESTIMATE_SUPABASE_ANON_KEY', 'fixture-anon-public-only')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [snapshotFixture()],
    }))
    const target = fakeResponse()
    await handler(request, target.res)
    expect(target.res.statusCode).toBe(200)
    expect(target.body.total).toEqual({ minimum: 144000, likely: 192000, maximum: 240000 })
    expect(target.body.publication.status).toBe('homologated')
    expect(target.body.publication.scopeVersion).toBe('v1')
    expect(target.body.publication.sourceProjectRef).toBe(WG_ESTIMATE_CANONICAL_REF)
    expect(target.res.headers['Cache-Control']).toContain('s-maxage=300')
  })

  it('recusa parâmetros inválidos sem acesso ao banco', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const target = fakeResponse()
    await handler({ method: 'GET', query: { area: '0', standard: 'equilibrado', uf: 'SP' } }, target.res)
    expect(target.res.statusCode).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('WG Easy public estimate contract', () => {
  it('rejeita projeto staging ou origem divergente mesmo com credenciais presentes', () => {
    const canonical = `https://${WG_ESTIMATE_CANONICAL_REF}.supabase.co/`;
    expect(assertCanonicalEstimateSourceUrl(canonical)).toBe(`https://${WG_ESTIMATE_CANONICAL_REF}.supabase.co`);
    expect(() => assertCanonicalEstimateSourceUrl('https://ayhcldffqadlbfjhkrmg.supabase.co/')).toThrow('FONTE_SUPABASE_INCORRETA');
    expect(() => assertCanonicalEstimateSourceUrl('https://example.invalid/')).toThrow('FONTE_SUPABASE_INCORRETA');
    expect(() => assertCanonicalEstimateSourceUrl('not-a-url')).toThrow('FONTE_SUPABASE_INCORRETA');
  });

  it('calculates minimum, likely and maximum from the canonical range', () => {
    expect(calculatePublicEstimate({
      area: 80,
      standard: 'equilibrado',
      priceRange: { range_m2_min: 4800, range_m2_med: 6000, range_m2_max: 7200 },
      regionalFactor: 1,
    })).toEqual({
      perSquareMeter: { minimum: 4800, likely: 6000, maximum: 7200 },
      total: { minimum: 384000, likely: 480000, maximum: 576000 },
    })
  })

  it('blocks inverted or incoherent price ranges', () => {
    expect(() => calculatePublicEstimate({
      area: 80,
      standard: 'equilibrado',
      priceRange: { range_m2_min: 6000, range_m2_med: 4800, range_m2_max: 7200 },
    })).toThrow('FAIXA_INCOERENTE')
    expect(() => calculatePublicEstimate({
      area: 80,
      standard: 'equilibrado',
      priceRange: { range_m2_min: 4800, range_m2_med: 6000, range_m2_max: 5500 },
    })).toThrow('FAIXA_INCOERENTE')
  })

  it('rejects invalid areas instead of emitting a misleading price', () => {
    expect(() => calculatePublicEstimate({
      area: -1,
      standard: 'equilibrado',
      priceRange: { range_m2_min: 4800, range_m2_med: 6000, range_m2_max: 7200 },
    })).toThrow('AREA_INVALIDA')
  })
})
