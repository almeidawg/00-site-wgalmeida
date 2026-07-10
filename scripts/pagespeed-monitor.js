/**
 * pagespeed-monitor.js
 * Coleta Core Web Vitals via PageSpeed Insights API (mobile + desktop).
 * Salva relatório em reports/seo/latest/pagespeed-YYYY-MM-DD.json
 * Uso: node scripts/pagespeed-monitor.js [--url https://wgalmeida.com.br]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT, 'reports', 'seo', 'latest');

const TARGET_URL = process.argv.find(a => a.startsWith('--url='))?.split('=')[1]
  ?? 'https://wgalmeida.com.br';
const API_KEY = process.env.PAGESPEED_API_KEY ?? '';

const THRESHOLDS = { LCP: 2500, CLS: 0.1, INP: 200, FCP: 1800, TTFB: 800 };

async function fetchPageSpeed(url, strategy) {
  const params = new URLSearchParams({ url, strategy, locale: 'pt_BR' });
  if (API_KEY) params.set('key', API_KEY);
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`;

  const res = await fetch(endpoint);
  if (res.status === 429) {
    throw new Error(
      `Rate limit (429). Configure PAGESPEED_API_KEY= no .env para remover limite.\n` +
      `  Obtenha em: https://console.cloud.google.com/apis/library/pagespeedonline.googleapis.com`
    );
  }
  if (!res.ok) throw new Error(`PageSpeed API ${strategy}: HTTP ${res.status}`);
  return res.json();
}

function extractMetric(category, id) {
  const audits = category?.audits ?? {};
  const item = audits[id];
  if (!item) return null;
  return {
    displayValue: item.displayValue ?? null,
    numericValue: item.numericValue ?? null,
    score: item.score ?? null,
  };
}

function parseResult(data, strategy) {
  const lhr = data.lighthouseResult ?? {};
  const audits = lhr.audits ?? {};
  const cats = lhr.categories ?? {};

  const get = (id) => {
    const a = audits[id];
    if (!a) return null;
    return { display: a.displayValue, value: a.numericValue, score: a.score };
  };

  const lcp = get('largest-contentful-paint');
  const cls = get('cumulative-layout-shift');
  const inp = get('interaction-to-next-paint') ?? get('total-blocking-time');
  const fcp = get('first-contentful-paint');
  const ttfb = get('server-response-time');

  const perfScore = Math.round((cats.performance?.score ?? 0) * 100);
  const seoScore  = Math.round((cats.seo?.score ?? 0) * 100);
  const a11yScore = Math.round((cats.accessibility?.score ?? 0) * 100);

  const alerts = [];
  if (lcp && lcp.value > THRESHOLDS.LCP)
    alerts.push({ level: 'ALTA', msg: `LCP ${(lcp.value/1000).toFixed(2)}s excede limite de ${THRESHOLDS.LCP/1000}s` });
  if (cls && cls.value > THRESHOLDS.CLS)
    alerts.push({ level: 'ALTA', msg: `CLS ${cls.value.toFixed(3)} excede limite de ${THRESHOLDS.CLS}` });
  if (inp && inp.value > THRESHOLDS.INP)
    alerts.push({ level: 'MEDIA', msg: `INP/TBT ${(inp.value).toFixed(0)}ms excede limite de ${THRESHOLDS.INP}ms` });
  if (perfScore < 90)
    alerts.push({ level: perfScore < 50 ? 'CRITICA' : 'ALTA', msg: `Performance score ${perfScore} abaixo de 90` });

  return {
    strategy,
    scores: { performance: perfScore, seo: seoScore, accessibility: a11yScore },
    vitals: {
      LCP: lcp,
      CLS: cls,
      INP: inp,
      FCP: fcp,
      TTFB: ttfb,
    },
    alerts,
  };
}

function printTable(results) {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║         TABELA DE SAÚDE SEO — CORE WEB VITALS           ║');
  console.log('╠══════════════════╦══════════════════╦════════════════════╣');
  console.log('║ Métrica          ║ Mobile           ║ Desktop            ║');
  console.log('╠══════════════════╬══════════════════╬════════════════════╣');

  const mob = results.find(r => r.strategy === 'mobile');
  const desk = results.find(r => r.strategy === 'desktop');

  const row = (label, mVal, dVal) => {
    const lp = label.padEnd(16);
    const mp = (mVal ?? '—').toString().padEnd(16);
    const dp = (dVal ?? '—').toString().padEnd(18);
    console.log(`║ ${lp} ║ ${mp} ║ ${dp} ║`);
  };

  row('Performance',  mob?.scores?.performance,  desk?.scores?.performance);
  row('SEO',          mob?.scores?.seo,           desk?.scores?.seo);
  row('Accessibility',mob?.scores?.accessibility, desk?.scores?.accessibility);
  console.log('╠══════════════════╬══════════════════╬════════════════════╣');
  row('LCP',    mob?.vitals?.LCP?.display,  desk?.vitals?.LCP?.display);
  row('CLS',    mob?.vitals?.CLS?.display,  desk?.vitals?.CLS?.display);
  row('INP/TBT',mob?.vitals?.INP?.display,  desk?.vitals?.INP?.display);
  row('FCP',    mob?.vitals?.FCP?.display,  desk?.vitals?.FCP?.display);
  row('TTFB',   mob?.vitals?.TTFB?.display, desk?.vitals?.TTFB?.display);
  console.log('╚══════════════════╩══════════════════╩════════════════════╝\n');

  const allAlerts = results.flatMap(r => r.alerts.map(a => ({ ...a, strategy: r.strategy })));
  if (allAlerts.length === 0) {
    console.log('✅ Nenhum alerta. Todos os Core Web Vitals dentro dos limites.\n');
  } else {
    console.log('⚠️  ALERTAS:');
    allAlerts.forEach(a => console.log(`   [${a.level}][${a.strategy}] ${a.msg}`));
    console.log('');
  }
}

async function run() {
  console.log(`\n🔍 Auditando PageSpeed: ${TARGET_URL}\n`);
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const strategies = ['mobile', 'desktop'];
  const results = [];

  for (const strategy of strategies) {
    process.stdout.write(`  Consultando ${strategy}... `);
    try {
      const data = await fetchPageSpeed(TARGET_URL, strategy);
      const parsed = parseResult(data, strategy);
      results.push(parsed);
      console.log(`✓ Performance: ${parsed.scores.performance}`);
    } catch (err) {
      console.log(`✗ Erro: ${err.message}`);
      results.push({ strategy, error: err.message, alerts: [] });
    }
    // Evitar rate-limit da API sem chave (25 req/100s no tier gratuito)
    if (!API_KEY) await new Promise(r => setTimeout(r, 5000));
  }

  printTable(results);

  const date = new Date().toISOString().slice(0, 10);
  const report = { date, url: TARGET_URL, results };
  const outFile = path.join(REPORT_DIR, `pagespeed-${date}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`📄 Relatório salvo: ${outFile}\n`);

  const hasAlerts = results.some(r => (r.alerts ?? []).length > 0);
  process.exit(hasAlerts ? 1 : 0);
}

run().catch(err => { console.error(err); process.exit(2); });
