/**
 * ai-readiness-audit.js
 * Valida prontidão do site para consumo por LLMs/IAs (Gemini, GPT, Perplexity).
 * Score 0-100. Salva relatório em reports/seo/latest/ai-readiness-YYYY-MM-DD.json
 * Uso: node scripts/ai-readiness-audit.js [--url https://wgalmeida.com.br]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT, 'reports', 'seo', 'latest');

const BASE_URL = process.argv.find(a => a.startsWith('--url='))?.split('=')[1]
  ?? 'https://wgalmeida.com.br';

const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;
const ROBOTS_URL  = `${BASE_URL}/robots.txt`;
const EXPECTED_ROUTES = 161;

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchText(url, timeout = 12000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function extractJsonLd(html) {
  const schemas = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try { schemas.push(JSON.parse(m[1])); } catch { /* ignore malformed */ }
  }
  return schemas;
}

function countSitemapUrls(xml) {
  return (xml.match(/<loc>/g) ?? []).length;
}

// ── Checks ───────────────────────────────────────────────────────────────────

async function checkSitemap() {
  try {
    const xml = await fetchText(SITEMAP_URL);
    const count = countSitemapUrls(xml);
    const ok = count >= EXPECTED_ROUTES * 0.9; // tolera 10% de variação
    return {
      name: 'Sitemap XML',
      pass: ok,
      detail: `${count} rotas (esperado ≥${Math.round(EXPECTED_ROUTES * 0.9)})`,
      weight: 15,
    };
  } catch (e) {
    return { name: 'Sitemap XML', pass: false, detail: `Erro: ${e.message}`, weight: 15 };
  }
}

async function checkRobots() {
  try {
    const txt = await fetchText(ROBOTS_URL);
    const hasSitemap = /sitemap:/i.test(txt);
    const allowsGooglebot = /user-agent:\s*\*/i.test(txt) || /user-agent:\s*googlebot/i.test(txt);
    const pass = hasSitemap && allowsGooglebot;
    return {
      name: 'robots.txt',
      pass,
      detail: `sitemap declarado: ${hasSitemap} | permite Googlebot: ${allowsGooglebot}`,
      weight: 10,
    };
  } catch (e) {
    return { name: 'robots.txt', pass: false, detail: `Erro: ${e.message}`, weight: 10 };
  }
}

async function checkJsonLdSchemas(html) {
  const schemas = extractJsonLd(html);
  const types = schemas.map(s => s['@type']).flat();
  const checks = {
    Organization:    types.some(t => t === 'Organization'),
    Person:          types.some(t => t === 'Person'),
    FAQPage:         types.some(t => t === 'FAQPage'),
    ProfessionalService: types.some(t => t === 'ProfessionalService' || t === 'LocalBusiness'),
    BreadcrumbList:  types.some(t => t === 'BreadcrumbList'),
  };
  const found = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  return {
    name: 'Schemas JSON-LD',
    pass: found >= 3,
    detail: `${found}/${total}: ${Object.entries(checks).map(([k,v]) => `${k}:${v?'✓':'✗'}`).join(' | ')}`,
    weight: 25,
    schemas: checks,
  };
}

function checkEEAT(html) {
  const signals = {
    authorName:     /William Almeida/i.test(html),
    authorTitle:    /CEO|Founder|arquitet|engenhei/i.test(html),
    contactInfo:    /\+55|whatsapp|email|contato/i.test(html),
    casesMentioned: /projeto|case|portfolio|entregue/i.test(html),
    trustSignals:   /anos de experiência|certificad|premiado|aprovad/i.test(html),
  };
  const found = Object.values(signals).filter(Boolean).length;
  return {
    name: 'E-E-A-T (autoridade/autoria)',
    pass: found >= 3,
    detail: Object.entries(signals).map(([k,v]) => `${k}:${v?'✓':'✗'}`).join(' | '),
    weight: 20,
  };
}

function checkMetaTags(html) {
  const hasTitle       = /<title[^>]*>[^<]{10,}/i.test(html);
  const hasDescription = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{50,}/i.test(html);
  const hasCanonical   = /<link[^>]+rel=["']canonical["']/i.test(html);
  const hasOgTitle     = /<meta[^>]+property=["']og:title["']/i.test(html);
  const hasOgImage     = /<meta[^>]+property=["']og:image["']/i.test(html);
  const found = [hasTitle, hasDescription, hasCanonical, hasOgTitle, hasOgImage].filter(Boolean).length;
  return {
    name: 'Meta Tags (SEO/OG)',
    pass: found >= 4,
    detail: `title:${hasTitle?'✓':'✗'} | desc:${hasDescription?'✓':'✗'} | canonical:${hasCanonical?'✓':'✗'} | og:title:${hasOgTitle?'✓':'✗'} | og:image:${hasOgImage?'✓':'✗'}`,
    weight: 15,
  };
}

function checkStructure(html) {
  const hasH1      = /<h1[^>]*>/i.test(html);
  const hasFaq     = /faq|perguntas frequentes|dúvidas/i.test(html);
  const hasLangPt  = /lang=["']pt/i.test(html);
  const noKeywords = !/<meta[^>]+name=["']keywords["']/i.test(html);
  const found = [hasH1, hasFaq, hasLangPt, noKeywords].filter(Boolean).length;
  return {
    name: 'Estrutura Escaneável (LLM)',
    pass: found >= 3,
    detail: `h1:${hasH1?'✓':'✗'} | faq:${hasFaq?'✓':'✗'} | lang=pt:${hasLangPt?'✓':'✗'} | sem keywords:${noKeywords?'✓':'✗'}`,
    weight: 15,
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n🤖 Auditoria AI Readiness: ${BASE_URL}\n`);
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  let html = '';
  let fetchError = null;
  try {
    process.stdout.write('  Buscando página principal... ');
    html = await fetchText(BASE_URL);
    console.log('✓');
  } catch (e) {
    console.log(`✗ ${e.message}`);
    fetchError = e.message;
  }

  const checks = await Promise.all([
    checkSitemap(),
    checkRobots(),
    ...(html ? [
      checkJsonLdSchemas(html),
      Promise.resolve(checkEEAT(html)),
      Promise.resolve(checkMetaTags(html)),
      Promise.resolve(checkStructure(html)),
    ] : []),
  ]);

  // Score ponderado
  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const earnedWeight = checks.filter(c => c.pass).reduce((s, c) => s + c.weight, 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);

  // Alertas
  const alerts = checks
    .filter(c => !c.pass)
    .map(c => ({
      level: c.weight >= 20 ? 'CRITICA' : c.weight >= 15 ? 'ALTA' : 'MEDIA',
      check: c.name,
      detail: c.detail,
    }));

  // Print
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log(`║  AI READINESS SCORE: ${String(score).padStart(3)}/100                           ║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  checks.forEach(c => {
    const icon = c.pass ? '✓' : '✗';
    const label = `${icon} ${c.name}`.padEnd(40);
    const wt = `(${c.weight}pts)`.padStart(8);
    console.log(`║ ${label}${wt}       ║`);
  });
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  if (alerts.length === 0) {
    console.log('✅ Site totalmente pronto para indexação por IA.\n');
  } else {
    console.log('⚠️  ALERTAS:');
    alerts.forEach(a => console.log(`   [${a.level}] ${a.check}: ${a.detail}`));
    console.log('');
  }

  // Plano de ação
  if (alerts.length > 0) {
    console.log('📋 PLANO DE AÇÃO (próximos 5 dias):');
    alerts
      .sort((a, b) => (a.level === 'CRITICA' ? -1 : b.level === 'CRITICA' ? 1 : 0))
      .forEach((a, i) => console.log(`   ${i+1}. [${a.level}] Corrigir: ${a.check}`));
    console.log('');
  }

  const date = new Date().toISOString().slice(0, 10);
  const report = { date, url: BASE_URL, score, checks, alerts, fetchError };
  const outFile = path.join(REPORT_DIR, `ai-readiness-${date}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`📄 Relatório salvo: ${outFile}\n`);

  process.exit(score >= 60 ? 0 : 1);
}

run().catch(err => { console.error(err); process.exit(2); });
