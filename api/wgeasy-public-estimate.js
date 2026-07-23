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

async function supabaseGet(path) {
  const baseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!baseUrl || !anonKey) throw new Error('CONFIGURACAO_AUSENTE')

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/rest/v1/${path}`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  })
  if (!response.ok) throw new Error(`FONTE_INDISPONIVEL_${response.status}`)
  return response.json()
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
    const today = new Date().toISOString().slice(0, 10)
    const [ranges, regions, indices] = await Promise.all([
      supabaseGet(`iccri_padroes_canonicos?select=id,label,range_m2_min,range_m2_med,range_m2_max&id=eq.${encodeURIComponent(standard)}&limit=1`),
      supabaseGet(`iccri_precos_regionais?select=estado,nome_estado,multiplicador_sinapi,vigencia_inicio,vigencia_fim&estado=eq.${encodeURIComponent(uf)}&vigencia_inicio=lte.${today}&or=(vigencia_fim.is.null,vigencia_fim.gte.${today})&order=vigencia_inicio.desc&limit=1`),
      supabaseGet('iccri_indice?select=competencia,valor_indice,publicado_em&order=competencia.desc&limit=1'),
    ])
    if (!ranges[0]) throw new Error('FAIXA_NAO_ENCONTRADA')

    const estimate = calculatePublicEstimate({
      area,
      standard,
      priceRange: ranges[0],
      regionalFactor: regions[0]?.multiplicador_sinapi || 1,
    })
    return json(res, 200, {
      ok: true,
      area,
      standard: { id: ranges[0].id, label: ranges[0].label },
      region: { uf, label: regions[0]?.nome_estado || uf },
      ...estimate,
      referenceDate: indices[0]?.competencia || ranges[0].updated_at || today,
      source: 'ICCRI e WG Easy, base pública versionada',
      engineVersion: 'wgeasy-public-estimate-v1',
      disclaimer: 'Estimativa de referência, sujeita a vistoria, escopo, projeto, materiais, impostos e condições locais.',
    })
  } catch (error) {
    return json(res, 503, { ok: false, error: 'ESTIMATIVA_INDISPONIVEL', detail: error.message })
  }
}
