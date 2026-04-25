import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createClient } from '@supabase/supabase-js'
import { OBRAEASY_PRECOS, EASYREALSTATE_PRECOS } from '../src/data/company.js'

const strict = process.argv.includes('--strict')
const root = process.cwd()
const findings = []

const expectedPlans = {
  'obra-easy': {
    Gratuito: OBRAEASY_PRECOS.free.price,
    Pro: OBRAEASY_PRECOS.pro.price,
    Business: OBRAEASY_PRECOS.business.price,
  },
  'easy-real-state': {
    Solo: EASYREALSTATE_PRECOS.solo.price,
    Completo: EASYREALSTATE_PRECOS.completo.price,
  },
}

const criticalTables = [
  { table: 'saas_produtos', min: 1 },
  { table: 'saas_planos', min: 1 },
  { table: 'pricelist_itens', min: 1, activeColumn: 'ativo' },
  { table: 'pricelist_categorias', min: 1, activeColumn: 'ativo' },
  { table: 'sinapi_composicoes', min: 1 },
  { table: 'iccri_servicos', min: 1, activeColumn: 'ativo' },
  { table: 'iccri_indice', min: 1 },
  { table: 'evf_estudos', min: 1 },
  { table: 'evf_estudos_itens', min: 1 },
]

const stalePublicPricePatterns = [
  { label: 'EasyRealState Pro Corretor antigo', pattern: /R\$\s*49(?![,0-9])/g },
  { label: 'ObraEasy Pro inflado por drift de casa decimal', pattern: /R\$\s*297(?![,0-9])/g },
  { label: 'ObraEasy Business inflado por drift de casa decimal', pattern: /R\$\s*797(?![,0-9])/g },
]

const staleScanFiles = [
  'src/data/company.js',
  'src/pages/ObraEasyLanding.jsx',
  'src/pages/EasyRealStateLanding.jsx',
  'src/content/blog/evf-estudo-viabilidade-financeira.md',
]

function addFinding(severity, label, details) {
  findings.push({ severity, label, details })
}

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

function formatMoneyBRL(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return String(value)
  if (number === 0) return 'R$ 0'
  const cents = Math.round(number * 100) % 100
  return `R$ ${number.toLocaleString('pt-BR', {
    minimumFractionDigits: cents === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

function scanStalePublicPrices() {
  for (const relativeFile of staleScanFiles) {
    const filePath = path.join(root, relativeFile)
    if (!fs.existsSync(filePath)) {
      addFinding('error', 'Arquivo crítico ausente', relativeFile)
      continue
    }
    const content = fs.readFileSync(filePath, 'utf8')
    for (const stale of stalePublicPricePatterns) {
      stale.pattern.lastIndex = 0
      if (stale.pattern.test(content)) {
        addFinding('error', 'Preço público antigo encontrado', `${stale.label} em ${relativeFile}`)
      }
    }
  }
}

function getSupabaseCredentials() {
  return {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SERVICE_KEY
    || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    || process.env.VITE_SUPABASE_ANON_KEY
    || process.env.SUPABASE_ANON_KEY,
  }
}

function createSupabaseClient(url, key) {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function fetchActivePlans(supabase) {
  const { data: planRows, error: planError } = await supabase
    .from('saas_planos')
    .select('nome,valor_mensal,ativo,saas_produtos(slug,nome)')
    .eq('ativo', true)

  if (planError) {
    addFinding('error', 'Falha ao consultar saas_planos', planError.message)
    return null
  }

  const byProduct = new Map()
  for (const row of planRows || []) {
    const slug = row.saas_produtos?.slug
    if (!slug) continue
    if (!byProduct.has(slug)) byProduct.set(slug, new Map())
    byProduct.get(slug).set(row.nome, formatMoneyBRL(row.valor_mensal))
  }
  return byProduct
}

function compareExpectedPlans(byProduct) {
  if (!byProduct) return

  for (const [productSlug, plans] of Object.entries(expectedPlans)) {
    const activePlans = byProduct.get(productSlug)
    if (!activePlans) {
      addFinding('error', 'Produto SaaS sem planos ativos', productSlug)
      continue
    }
    compareProductPlans(productSlug, plans, activePlans)
  }
}

function compareProductPlans(productSlug, expectedProductPlans, activePlans) {
  for (const [planName, expectedPrice] of Object.entries(expectedProductPlans)) {
    const dbPrice = activePlans.get(planName)
    if (!dbPrice) {
      addFinding('error', 'Plano SaaS ativo ausente', `${productSlug} / ${planName}`)
      continue
    }
    if (dbPrice !== expectedPrice) {
      addFinding('error', 'Preço público divergente do WGEasy', `${productSlug} / ${planName}: site=${expectedPrice}; WGEasy=${dbPrice}`)
    }
  }
}

async function auditCriticalTable(supabase, item) {
  let query = supabase.from(item.table).select('*', { count: 'exact', head: true })
  if (item.activeColumn) query = query.eq(item.activeColumn, true)
  const { count, error } = await query
  if (error) {
    addFinding('error', `Falha ao consultar ${item.table}`, error.message)
    return
  }
  if (!Number.isFinite(count) || count < item.min) {
    addFinding('error', 'Tabela crítica sem dados suficientes', `${item.table}: ${count ?? 'sem contagem'}`)
  }
}

async function auditCriticalTables(supabase) {
  for (const item of criticalTables) {
    await auditCriticalTable(supabase, item)
  }
}

async function auditSupabase() {
  const { url, key } = getSupabaseCredentials()
  if (!url || !key) {
    addFinding(strict ? 'error' : 'warning', 'Supabase não validado', 'Defina SUPABASE_URL/VITE_SUPABASE_URL e uma chave Supabase para comparar com WGEasy.')
    return
  }

  const supabase = createSupabaseClient(url, key)
  const activePlans = await fetchActivePlans(supabase)
  compareExpectedPlans(activePlans)
  await auditCriticalTables(supabase)
}

function printResult() {
  const errors = findings.filter((finding) => finding.severity === 'error')
  const warnings = findings.filter((finding) => finding.severity === 'warning')

  if (findings.length === 0) {
    console.log('audit-wgeasy-site-sync: OK')
    console.log('Preços públicos e tabelas críticas conferidos contra WGEasy.')
    return
  }

  console.log(`audit-wgeasy-site-sync: ${errors.length} erro(s), ${warnings.length} aviso(s)`)
  for (const finding of findings) {
    console.log(`[${finding.severity}] ${finding.label}: ${finding.details}`)
  }
}

loadLocalEnv()
scanStalePublicPrices()
await auditSupabase()
printResult()

if (findings.some((finding) => finding.severity === 'error')) {
  process.exit(1)
}
