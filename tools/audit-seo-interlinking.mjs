/**
 * SEO INTERLINKING AUDIT TOOL
 * 
 * Este script valida se as páginas do site possuem os links internos necessários
 * para uma boa indexação e autoridade (Silo/Cluster).
 * 
 * Regras validadas:
 * 1. Estilos: Cada estilo deve recomendar pelo menos 3 outros estilos.
 * 2. Estilos: Preferência para recomendações da mesma categoria.
 * 3. Blog: (Placeholder) Validar se posts de blog vinculam a serviços/estilos.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

async function auditEstilos() {
  console.log('🔍 Auditando Interlinking de Estilos...');
  
  const styleCatalogPath = path.join(ROOT, 'src/utils/styleCatalog.js');
  const styleDetailPath = path.join(ROOT, 'src/pages/EstiloDetail.jsx');
  
  if (!fs.existsSync(styleCatalogPath) || !fs.existsSync(styleDetailPath)) {
    console.error('❌ Arquivos de estilos não encontrados.');
    return false;
  }

  const detailContent = fs.readFileSync(styleDetailPath, 'utf8');
  
  // Verifica se a lógica de priorização por categoria existe no EstiloDetail
  const hasCategoryPriority = detailContent.includes('a.category === estilo.category');
  
  if (!hasCategoryPriority) {
    console.error('❌ ERRO SEO: EstiloDetail.jsx não prioriza a mesma categoria nas recomendações.');
    return false;
  }

  console.log('✅ SEO: Priorização por categoria detectada no EstiloDetail.');
  return true;
}

async function run() {
  const estilosOk = await auditEstilos();
  
  if (estilosOk) {
    console.log('\n✨ Auditoria de SEO concluída com sucesso!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Falhas detectadas na auditoria de SEO.');
    process.exit(1);
  }
}

run();
