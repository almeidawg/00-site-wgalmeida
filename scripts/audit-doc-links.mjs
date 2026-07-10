#!/usr/bin/env node
// audit-doc-links.mjs â€” Detecta links quebrados em .md e refs de pastas renomeadas
// Uso: node scripts/audit-doc-links.mjs [--fix] [--strict]
// WG BuildTech | 2026-06-04

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, resolve, dirname, relative, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const STRICT = process.argv.includes('--strict');
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));

const CANONICAL_FOLDERS = [
  '00_Governanca', '01_Auditoria_Origem', '02_Arquitetura_Nova',
  '03_Modulos', '04_Liz_Integrada', '05_Ferramentas_Custos_Limites',
  '06_Juridico_Contratos', '07_Supabase_Dados', '08_Git_Vercel_Deploy',
  '09_Backlog_Reescrita', '10_Sprint_Roadmap', '11_Dashboard_Sistema', '99_Arquivo'
];

const REQUIRED_ROOT_FILES = ['AGENTS.md', 'README.md', 'RETURN-POINT.md'];

let errors = 0;
let warnings = 0;

function log(level, msg, file = '') {
  const prefix = { ERROR: 'âŒ', WARN: 'âš ï¸ ', INFO: 'âœ…', FIX: 'ðŸ”§' }[level] || '  ';
  const loc = file ? ` [${relative(ROOT, file)}]` : '';
  console.log(`  ${prefix} ${msg}${loc}`);
  if (level === 'ERROR') errors++;
  if (level === 'WARN') warnings++;
}

// Coletar todos os arquivos .md recursivamente
function collectMdFiles(dir, files = []) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'dist') continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) collectMdFiles(full, files);
      else if (extname(e.name) === '.md') files.push(full);
    }
  } catch {}
  return files;
}

// Extrair links internos de um .md
function extractLinks(content) {
  const links = [];
  // [texto](caminho) â€” apenas links locais (sem http)
  const re = /\[([^\]]*)\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const href = m[2].split('#')[0].trim(); // remove Ã¢ncoras
    if (!href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('/') && !href.startsWith('#') && href.length > 0) {
      links.push(href);
    }
  }
  return links;
}

// 1. Auditoria de links quebrados em .md
console.log('\nðŸ” AUDITORIA DE LINKS EM DOCUMENTAÃ‡ÃƒO (.md)\n');
const mdFiles = collectMdFiles(ROOT);
console.log(`  Arquivos .md encontrados: ${mdFiles.length}\n`);

let brokenLinks = 0;
for (const file of mdFiles) {
  const content = readFileSync(file, 'utf-8');
  const links = extractLinks(content);
  for (const link of links) {
    const abs = resolve(dirname(file), link);
    if (!existsSync(abs)) {
      log('ERROR', `Link quebrado: "${link}"`, file);
      brokenLinks++;
    }
  }
}
if (brokenLinks === 0) log('INFO', 'Nenhum link quebrado encontrado em .md');

// 2. Verificar RETURN-POINT.md â€” data de atualizaÃ§Ã£o
console.log('\nðŸ“… RETURN-POINT.md â€” VerificaÃ§Ã£o de AtualizaÃ§Ã£o\n');
const rpFile = join(ROOT, 'RETURN-POINT.md');
if (existsSync(rpFile)) {
  const rpContent = readFileSync(rpFile, 'utf-8');
  const dateMatch = rpContent.match(/(?:Atualizado|Updated|Data).*?(\d{4}-\d{2}-\d{2})/i);
  if (dateMatch) {
    const lastUpdate = new Date(dateMatch[1]);
    const daysSince = Math.floor((Date.now() - lastUpdate) / 86400000);
    if (daysSince > 7) {
      log('WARN', `RETURN-POINT.md nÃ£o atualizado hÃ¡ ${daysSince} dias (Ãºltima: ${dateMatch[1]})`);
    } else {
      log('INFO', `RETURN-POINT.md atualizado em ${dateMatch[1]} (${daysSince} dias atrÃ¡s)`);
    }
  } else {
    log('WARN', 'RETURN-POINT.md nÃ£o tem data de atualizaÃ§Ã£o detectÃ¡vel');
  }
} else {
  log('ERROR', 'RETURN-POINT.md nÃ£o encontrado na raiz');
}

// 3. Verificar arquivos obrigatÃ³rios na raiz
console.log('\nðŸ“‹ ARQUIVOS OBRIGATÃ“RIOS NA RAIZ\n');
for (const f of REQUIRED_ROOT_FILES) {
  if (existsSync(join(ROOT, f))) {
    log('INFO', `${f} presente`);
  } else {
    log('ERROR', `${f} AUSENTE â€” obrigatÃ³rio em todo produto WG`);
  }
}

// 4. Verificar estrutura canÃ´nica de 13 pastas
console.log('\nðŸ“ ESTRUTURA CANÃ”NICA (13 pastas)\n');
let missingFolders = 0;
for (const folder of CANONICAL_FOLDERS) {
  if (existsSync(join(ROOT, folder))) {
    log('INFO', `${folder}/`);
  } else {
    log('WARN', `${folder}/ â€” AUSENTE (criar conforme padrÃ£o canÃ´nico WG)`);
    missingFolders++;
  }
}

// 5. Verificar referÃªncias a pastas renomeadas comuns (padrÃ£o antigo vs novo)
console.log('\nðŸ”„ REFERÃŠNCIAS A ESTRUTURA ANTIGA\n');
const OLD_PATTERNS = [
  { old: '_auditoria_historico', new: '99_Arquivo', type: 'pasta' },
  { old: 'docs/INSTRUCOES-DEPLOY', new: '08_Git_Vercel_Deploy/', type: 'arquivo' },
  { old: 'docs/GOVERNANCA', new: '00_Governanca/', type: 'arquivo' },
  { old: 'docs/PROJECT_GOVERNANCE', new: '00_Governanca/', type: 'arquivo' },
  { old: 'docs/MANUAL-SEO', new: '08_Git_Vercel_Deploy/', type: 'arquivo' },
];

let staleRefs = 0;
for (const file of mdFiles) {
  const content = readFileSync(file, 'utf-8');
  for (const pat of OLD_PATTERNS) {
    if (content.includes(pat.old)) {
      log('WARN', `ReferÃªncia antiga "${pat.old}" â†’ deve ser "${pat.new}"`, file);
      staleRefs++;
    }
  }
}
if (staleRefs === 0) log('INFO', 'Nenhuma referÃªncia a estrutura antiga detectada');

// SumÃ¡rio
console.log('\n' + 'â”€'.repeat(60));
console.log('ðŸ“Š SUMÃRIO\n');
console.log(`  âŒ Erros crÃ­ticos : ${errors}`);
console.log(`  âš ï¸  Avisos         : ${warnings}`);
console.log(`  ðŸ“ Pastas faltando: ${missingFolders}/13`);
console.log(`  ðŸ”— Links quebrados: ${brokenLinks}`);
console.log(`  ðŸ“ .md auditados  : ${mdFiles.length}`);
console.log('');

if (errors > 0) {
  console.log('  Status: âŒ FALHOU â€” corrigir erros antes de continuar');
  if (STRICT) process.exit(1);
} else if (warnings > 0) {
  console.log('  Status: âš ï¸  ATENÃ‡ÃƒO â€” verificar avisos');
} else {
  console.log('  Status: âœ… APROVADO â€” documentaÃ§Ã£o consistente');
}
console.log('');

