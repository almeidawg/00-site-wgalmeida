const ALLOWED_STANDARDS = new Set(['basico', 'essencial', 'equilibrado', 'superior'])
const ALLOWED_UF = /^[A-Z]{2}$/

const json = (res, status, body) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', status === 200 ? 'public, s-maxage=300' : 'no-store')
  res.end(JSON.stringify(body))
}

export function calculatePublicEstimate({ area, standard, priceRange, regionalFactor = 1 }) {
  const parsedArea = Number(area)
  const factor = Number(regionalFactor)
  const values = [
    Number(priceRange?.range_m2_min),
    Number(priceRange?.range_m2_med),
    Number(priceRange?.range_m2_max),
  ]

  if (!Number.isFinite(parsedArea) || parsedArea < 1 || parsedArea > 100000) {
    throw new Error('AREA_INVALIDA')
  }
  if (!ALLOWED_STANDARDS.has(standard) || values.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error('FAIXA_INVALIDA')
  }
  if (!(values[0] <= values[1] && values[1] <= values[2])) {
    throw new Error('FAIXA_INCOERENTE')
  }
  if (!Number.isFinite(factor) || factor <= 0) throw new Error('FATOR_REGIONAL_INVALIDO')

  const [minimum, likely, maximum] = values.map((value) => Math.round(value * factor))
  return {
    perSquareMeter: { minimum, likely, maximum },
    total: {
      minimum: Math.round(minimum * parsedArea),
      likely: Math.round(likely * parsedArea),
      maximum: Math.round(maximum * parsedArea),
    },
  }
}

// O indice e as faixas de estimativa devem vir do projeto canonico WGEasy,
// nunca de um banco de leads/staging configurado para outras APIs do site.
export const WG_ESTIMATE_CANONICAL_REF = 'xkvuhixxpfonfcwrvknm'

export function assertCanonicalEstimateSourceUrl(baseUrl, expectedRef = WG_ESTIMATE_CANONICAL_REF) {
  let source
  try {
    source = new URL(baseUrl)
  } catch {
    throw new Error('FONTE_SUPABASE_INCORRETA')
  }
  if (source.origin !== `https://${expectedRef}.supabase.co` || source.pathname !== '/') {
    throw new Error('FONTE_SUPABASE_INCORRETA')
  }
  return source.origin
}

async function supabaseGet(path) {
  const baseUrl = process.env.WGEASY_ESTIMATE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anonKey = process.env.WGEASY_ESTIMATE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!baseUrl || !anonKey) throw new Error('CONFIGURACAO_AUSENTE')
  const canonicalBaseUrl = assertCanonicalEstimateSourceUrl(baseUrl)

  const response = await fetch(`${canonicalBaseUrl}/rest/v1/${path}`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  })
  if (!response.ok) throw new Error(`FONTE_INDISPONIVEL_${response.status}`)
  return response.json()
}

// Somente um snapshot técnico-comercial homologado pode emitir preços pela API pública.
// Esta view ainda não está publicada: a ausência dela força 503, sem fallback a tabelas antigas.
export const ICCRI_PUBLIC_SNAPSHOT_VIEW = 'iccri_public_estimate_v1'

export function validateCertifiedEstimateSnapshot(snapshot, expected, now = new Date()) {
  const text = (v) => typeof v === 'string' && v.trim().length > 0
  const validDate = (v) => text(v) && Number.isFinite(Date.parse(v))
  const at = new Date(now).getTime()
  const approvedAt = Date.parse(snapshot?.approved_at || '')
  const expiry = Date.parse(snapshot?.valid_until || '')
  const reference = Date.parse(snapshot?.reference_date || '')
  if (!snapshot ||
    snapshot.publication_status !== 'homologated' ||
    snapshot.schema_version !== 'iccri-public-estimate-v1' ||
    snapshot.source_project_ref !== WG_ESTIMATE_CANONICAL_REF ||
    snapshot.padrao !== expected.standard ||
    snapshot.uf !== expected.uf ||
    snapshot.unit !== 'BRL/m2' ||
    !text(snapshot.approval_ref) ||
    !text(snapshot.calibration_ref) ||
    !text(snapshot.scope_id) ||
    !text(snapshot.scope_version) ||
    !/^[a-f0-9]{64}$/i.test(snapshot.snapshot_hash || '') ||
    !Number.isInteger(snapshot.sample_size) || snapshot.sample_size < 5 ||
    !validDate(snapshot.approved_at) ||
    !validDate(snapshot.valid_until) ||
    !validDate(snapshot.reference_date) ||
    !Number.isFinite(at) ||
    approvedAt > at || reference > at ||
    expiry < at
  ) throw new Error('PUBLICACAO_NAO_HOMOLOGADA')

  return snapshot
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'METODO_NAO_PERMITIDO' })

  const area = Number(req.query?.area)
  const standard = String(req.query?.standard || '').toLowerCase()
  const uf = String(req.query?.uf || 'SP').toUpperCase()
  if (!Number.isFinite(area) || area < 1 || area > 100000 || !ALLOWED_STANDARDS.has(standard) || !ALLOWED_UF.test(uf)) {
    return json(res, 400, { ok: false, error: 'PARAMETROS_INVALIDOS' })
  }

  try {
    // ÚNICA fonte pública permitida: snapshot aprovado, regionalizado e versionado.
    // A view ainda não existe no banco canônico e, até a homologação, responde 503.
    const projection = [
      'padrao', 'uf', 'label', 'region_label', 'publication_status',
      'schema_version', 'source_project_ref', 'unit', 'scope_id', 'scope_version',
      'approval_ref', 'calibration_ref', 'snapshot_hash', 'sample_size',
      'approved_at', 'valid_until', 'reference_date',
      'range_m2_min', 'range_m2_med', 'range_m2_max',
    ].join(',')
    const path = `${ICCRI_PUBLIC_SNAPSHOT_VIEW}?select=${projection}&padrao=eq.${encodeURIComponent(standard)}&uf=eq.${encodeURIComponent(uf)}&order=approved_at.desc&limit=1`
    const rows = await supabaseGet(path)
    const snapshot = validateCertifiedEstimateSnapshot(rows?.[0], { standard, uf })
    const estimate = calculatePublicEstimate({
      area, standard, priceRange: snapshot, regionalFactor: 1,
    })
    return json(res, 200, {
      ok: true, area,
      standard: { id: standard, label: snapshot.label || standard },
      region: { uf, label: snapshot.region_label || uf },
      ...estimate,
      referenceDate: snapshot.reference_date,
      source: 'ICCRI - snapshot homologado com base e escopo versionados',
      engineVersion: 'wgeasy-public-estimate-v2',
      publication: {
        status: 'homologated',
        approvalReference: snapshot.approval_ref,
        calibrationReference: snapshot.calibration_ref,
        scopeVersion: snapshot.scope_version,
        unit: snapshot.unit,
        sourceProjectRef: snapshot.source_project_ref,
        approvedAt: snapshot.approved_at,
        validUntil: snapshot.valid_until,
        snapshotHash: snapshot.snapshot_hash,
      },
      disclaimer: 'Faixa sujeita a escopo, quantitativos, projeto, tributos, riscos e condições de execução.',
    })
  } catch {
    // Não expor estrutura do banco nem diagnóstico de credenciais na API pública.
    return json(res, 503, { ok: false, error: 'ESTIMATIVA_INDISPONIVEL', detail: 'PUBLICACAO_NAO_HOMOLOGADA' })
  }
}
