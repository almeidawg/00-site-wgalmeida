import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createClient } from '@supabase/supabase-js'

const root = process.cwd()
const outputPath = path.join(root, 'src/data/commercialGovernance.generated.js')

function stripWrappingQuotes(value) {
  const startsQuoted = value.startsWith('"') || value.startsWith("'")
  const endsQuoted = value.endsWith('"') || value.endsWith("'")
  return startsQuoted && endsQuoted ? value.slice(1, -1) : value
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    const key = trimmed.slice(0, separator).trim()
    const rawValue = trimmed.slice(separator + 1).trim()
    if (!key || process.env[key]) continue
    process.env[key] = stripWrappingQuotes(rawValue)
  }
}

function loadLocalEnv() {
  for (const file of ['.env.local', '.env']) {
    loadEnvFile(path.join(root, file))
  }
}

function createSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL e chave Supabase nao configurados para gerar o snapshot comercial.')
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function toBrl(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return ''
  return `R$ ${number.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

function formatRangeLabel(minValue, maxValue, suffix = '') {
  const tail = suffix ? ` ${suffix}` : ''
  if (Number.isFinite(minValue) && Number.isFinite(maxValue)) {
    return `${toBrl(minValue)} a ${toBrl(maxValue)}${tail}`
  }
  if (Number.isFinite(minValue)) {
    return `${toBrl(minValue)}+${tail}`
  }
  return ''
}

function uniqueNumbers(values = []) {
  return Array.from(
    new Set(
      values
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
        .map((value) => Number(value.toFixed(2)))
    )
  ).sort((a, b) => a - b)
}

function percentile(sortedValues = [], ratio = 0.5) {
  if (!sortedValues.length) return null
  if (sortedValues.length === 1) return sortedValues[0]
  const index = Math.min(sortedValues.length - 1, Math.max(0, (sortedValues.length - 1) * ratio))
  const lowerIndex = Math.floor(index)
  const upperIndex = Math.ceil(index)
  const lower = sortedValues[lowerIndex]
  const upper = sortedValues[upperIndex]
  if (lowerIndex === upperIndex) return lower
  return lower + (upper - lower) * (index - lowerIndex)
}

function floorHundreds(value) {
  if (!Number.isFinite(value)) return null
  return Math.max(0, Math.floor(value / 100) * 100)
}

function ceilHundreds(value) {
  if (!Number.isFinite(value)) return null
  return Math.ceil(value / 100) * 100
}

function clampRange(minValue, maxValue, minSpread = 300) {
  if (!Number.isFinite(minValue)) return { minValue: null, maxValue: null }
  if (!Number.isFinite(maxValue) || maxValue <= minValue) {
    return {
      minValue,
      maxValue: minValue + minSpread,
    }
  }
  if (maxValue - minValue < minSpread) {
    return {
      minValue,
      maxValue: minValue + minSpread,
    }
  }
  return { minValue, maxValue }
}

function buildQuantilePackages(values = [], suffix = '') {
  const dataset = uniqueNumbers(values)
  if (!dataset.length) return null

  const p15 = percentile(dataset, 0.15)
  const p40 = percentile(dataset, 0.4)
  const p65 = percentile(dataset, 0.65)
  const p85 = percentile(dataset, 0.85)

  const essencial = clampRange(floorHundreds(p15), ceilHundreds(p40))
  const equilibrado = clampRange(
    Math.max(essencial.maxValue || 0, floorHundreds(p40)),
    ceilHundreds(p65)
  )
  const superior = clampRange(
    Math.max(equilibrado.maxValue || 0, floorHundreds(p65)),
    ceilHundreds(p85)
  )
  const exclusivoMin = ceilHundreds(percentile(dataset, 0.9) || superior.maxValue)

  return {
    essencial: {
      minValue: essencial.minValue,
      maxValue: essencial.maxValue,
      rangeLabel: formatRangeLabel(essencial.minValue, essencial.maxValue, suffix),
    },
    equilibrado: {
      minValue: equilibrado.minValue,
      maxValue: equilibrado.maxValue,
      rangeLabel: formatRangeLabel(equilibrado.minValue, equilibrado.maxValue, suffix),
    },
    superior: {
      minValue: superior.minValue,
      maxValue: superior.maxValue,
      rangeLabel: formatRangeLabel(superior.minValue, superior.maxValue, suffix),
    },
    exclusivo: {
      minValue: exclusivoMin,
      maxValue: null,
      rangeLabel: formatRangeLabel(exclusivoMin, null, suffix),
    },
  }
}

function collectPriceCandidatesFromPricelist(row = {}) {
  return uniqueNumbers([
    row.preco,
    row.preco_minimo,
    row.preco_medio,
    row.preco_maximo,
    row.preco_venda,
    row.preco_final,
    row.preco_com_desconto,
    row.custo_iccri,
  ])
}

function collectPriceCandidatesFromIccri(row = {}) {
  return uniqueNumbers([
    row.custo_total_min,
    row.custo_total_med,
    row.custo_total_max,
    row.custo_material_med,
    row.custo_mao_obra_med,
  ])
}

function includeByUnit(row = {}, acceptedUnits = []) {
  if (!acceptedUnits.length) return true
  const unit = String(row.unidade_normalizada || row.unidade_canonica || row.unidade || '')
    .trim()
    .toLowerCase()
  return acceptedUnits.includes(unit)
}

function includeByKeywords(row = {}, keywords = []) {
  if (!keywords.length) return true
  const haystack = String(row.nome_normalizado || row.nome_canonico || row.nome || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  return keywords.some((keyword) => haystack.includes(keyword))
}

function sanitizeCandidates(values = [], { min = 0, max = Number.POSITIVE_INFINITY } = {}) {
  return uniqueNumbers(values).filter((value) => value >= min && value <= max)
}

async function fetchRows(supabase, table, queryBuilder) {
  const { data, error } = await queryBuilder(supabase.from(table).select('*').eq('ativo', true).limit(500))
  if (error) throw error
  return data || []
}

function buildSnapshotSource({ table, filters, count }) {
  return `${table} (${filters}) · ${count} registro(s) validado(s)`
}

async function buildMarcenariaSnapshot(supabase) {
  const pricelistRows = await fetchRows(supabase, 'pricelist_itens', (query) => query.ilike('nome', '%marcenaria%'))
  const iccriRows = await fetchRows(supabase, 'iccri_servicos', (query) => query.ilike('nome', '%marcen%'))

  const pricelistCandidates = pricelistRows
    .filter((row) => includeByUnit(row, ['m2']))
    .flatMap((row) => collectPriceCandidatesFromPricelist(row))
  const iccriCandidates = iccriRows
    .filter((row) => includeByUnit(row, ['m2']))
    .flatMap((row) => collectPriceCandidatesFromIccri(row))

  const candidates = sanitizeCandidates([...pricelistCandidates, ...iccriCandidates], { min: 600, max: 8000 })
  const packages = buildQuantilePackages(candidates, 'por m2')
  if (!packages) return null

  return {
    sourceOfTruth: `Supabase · pricelist_itens + iccri_servicos · snapshot ${new Date().toISOString().slice(0, 10)}`,
    sourceBreakdown: [
      buildSnapshotSource({
        table: 'pricelist_itens',
        filters: 'nome~marcenaria, unidade=m2',
        count: sanitizeCandidates(pricelistCandidates, { min: 600, max: 8000 }).length,
      }),
      buildSnapshotSource({
        table: 'iccri_servicos',
        filters: 'nome~marcen, unidade=m2',
        count: sanitizeCandidates(iccriCandidates, { min: 600, max: 8000 }).length,
      }),
    ],
    packages,
  }
}

async function buildCacambaSnapshot(supabase) {
  const pricelistRows = await fetchRows(supabase, 'pricelist_itens', (query) =>
    query.or('nome.ilike.%cacamba%,nome.ilike.%entulho%,nome.ilike.%remocao%,nome.ilike.%ensacar%')
  )

  const bucketCandidates = sanitizeCandidates(
    pricelistRows
      .filter((row) => includeByKeywords(row, ['cacamba', 'cacamba de entulho']))
      .flatMap((row) => collectPriceCandidatesFromPricelist(row)),
    { min: 250, max: 900 }
  )
  const operationCandidates = sanitizeCandidates(
    pricelistRows
      .filter((row) => includeByKeywords(row, ['remocao', 'entulho', 'ensacar', 'transportar']))
      .flatMap((row) => collectPriceCandidatesFromPricelist(row)),
    { min: 300, max: 2000 }
  )

  if (bucketCandidates.length === 0 && operationCandidates.length === 0) {
    return null;
  }

  const bucketBase = percentile(bucketCandidates, 0.5) || 350
  const operationBase = percentile(operationCandidates, 0.5) || 850

  const essencialMin = floorHundreds(bucketBase)
  const essencialMax = ceilHundreds((bucketBase || 0) * 1.25)
  const equilibradoMin = floorHundreds(bucketBase + operationBase * 0.55)
  const equilibradoMax = ceilHundreds(bucketBase + operationBase * 0.9)
  const superiorMin = floorHundreds(bucketBase + operationBase)
  const superiorMax = ceilHundreds(bucketBase + operationBase * 1.35)
  const exclusivoMin = ceilHundreds(bucketBase * 2 + operationBase * 1.2)

  return {
    status: 'active',
    sourceOfTruth: `Supabase · pricelist_itens residuos/logistica · snapshot ${new Date().toISOString().slice(0, 10)}`,
    sourceBreakdown: [
      buildSnapshotSource({
        table: 'pricelist_itens',
        filters: 'nome~cacamba|entulho|remocao|ensacar',
        count: operationCandidates.length + bucketCandidates.length,
      }),
    ],
    packages: {
      essencial: {
        minValue: essencialMin,
        maxValue: essencialMax,
        rangeLabel: formatRangeLabel(essencialMin, essencialMax, 'por retirada'),
      },
      equilibrado: {
        minValue: equilibradoMin,
        maxValue: equilibradoMax,
        rangeLabel: formatRangeLabel(equilibradoMin, equilibradoMax, 'por retirada'),
      },
      superior: {
        minValue: superiorMin,
        maxValue: superiorMax,
        rangeLabel: formatRangeLabel(superiorMin, superiorMax, 'por retirada'),
      },
      exclusivo: {
        minValue: exclusivoMin,
        maxValue: null,
        rangeLabel: formatRangeLabel(exclusivoMin, null, 'por operacao dedicada'),
      },
    },
  }
}

async function buildIccriSnapshot(supabase) {
  const { data, error } = await supabase
    .from('iccri_indice')
    .select('*')
    .order('competencia', { ascending: false })
    .limit(1)

  if (error) throw error

  const latest = data?.[0]
  const indexValue = Number(latest?.valor_indice)
  const officialBands = {
    essencial: { minValue: 1500, maxValue: 2500 },
    equilibrado: { minValue: 2500, maxValue: 4500 },
    superior: { minValue: 4500, maxValue: 6500 },
    exclusivo: { minValue: 6500, maxValue: null },
  }

  return {
    sourceOfTruth: `ICCRI editorial/comercial homologado · competencia ${latest?.competencia || latest?.publicado_em || 'n/d'}`,
    sourceBreakdown: [
      Number.isFinite(indexValue) && indexValue > 0
        ? `iccri_indice.valor_indice=${toBrl(indexValue)} como indice de referencia operacional`
        : 'iccri_indice sem valor numerico utilizavel como faixa final de m2 nesta exportacao',
      'faixas publicas homologadas da regua ICCRI 2026 para reforma em Sao Paulo',
    ],
    latestIndexValue: indexValue,
    latestIndexCompetencia: latest.competencia || latest.publicado_em || null,
    packages: {
      essencial: {
        ...officialBands.essencial,
        rangeLabel: formatRangeLabel(officialBands.essencial.minValue, officialBands.essencial.maxValue, 'por m2'),
      },
      equilibrado: {
        ...officialBands.equilibrado,
        rangeLabel: formatRangeLabel(officialBands.equilibrado.minValue, officialBands.equilibrado.maxValue, 'por m2'),
      },
      superior: {
        ...officialBands.superior,
        rangeLabel: formatRangeLabel(officialBands.superior.minValue, officialBands.superior.maxValue, 'por m2'),
      },
      exclusivo: {
        ...officialBands.exclusivo,
        rangeLabel: formatRangeLabel(officialBands.exclusivo.minValue, null, 'por m2'),
      },
    },
  }
}

async function main() {
  loadLocalEnv()
  const supabase = createSupabase()

  const [marcenaria, cacamba, iccri] = await Promise.all([
    buildMarcenariaSnapshot(supabase),
    buildCacambaSnapshot(supabase),
    buildIccriSnapshot(supabase),
  ])

  const payload = {
    generatedAt: new Date().toISOString(),
    services: {
      ...(iccri ? { 'iccri-reforma-civil-sp': iccri } : {}),
      ...(marcenaria ? { 'marcenaria-sob-medida': marcenaria } : {}),
      ...(cacamba ? { 'cacamba-residuos-sp': cacamba } : {}),
    },
  }

  const fileContent = `const COMMERCIAL_GOVERNANCE_GENERATED = ${JSON.stringify(payload, null, 2)};\n\nexport default COMMERCIAL_GOVERNANCE_GENERATED;\n`
  fs.writeFileSync(outputPath, fileContent, 'utf8')

  console.log(`commercial-governance snapshot gerado em ${path.relative(root, outputPath)}`)
  console.log(JSON.stringify(payload, null, 2))
}

await main()
