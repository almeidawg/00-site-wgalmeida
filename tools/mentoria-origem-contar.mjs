#!/usr/bin/env node
/**
 * Conta de qual anuncio vieram as conversas de WhatsApp da Mentoria, lendo a frase de origem
 * que a landing escreve na mensagem ("Cheguei por um anuncio no ... (criativo, cidade).").
 * Usa a mesma tabela de rotulos de src/lib/mentoriaOrigem.js: nao ha segunda fonte de verdade.
 *
 * Uso:
 *   node tools/mentoria-origem-contar.mjs conversa1.txt conversa2.txt   (um arquivo por conversa)
 *   node tools/mentoria-origem-contar.mjs --linhas lista.txt            (uma conversa por linha)
 *   node tools/mentoria-origem-contar.mjs --json ...                    (saida em JSON)
 *
 * So le arquivos locais que voce indicar. Nada e enviado, gravado ou impresso alem das contagens.
 */
import { readFileSync } from 'node:fs'
import { contarOrigens } from '../src/lib/mentoriaOrigem.js'

const args = process.argv.slice(2)
const flags = new Set(args.filter((a) => a.startsWith('--')))
const files = args.filter((a) => !a.startsWith('--'))

if (files.length === 0 || flags.has('--ajuda')) {
  console.error('Uso: node tools/mentoria-origem-contar.mjs [--linhas] [--json] arquivo.txt [outro.txt ...]')
  process.exit(files.length === 0 && !flags.has('--ajuda') ? 2 : 0)
}

const conversas = []
for (const file of files) {
  const text = readFileSync(file, 'utf8')
  if (flags.has('--linhas')) {
    for (const line of text.split(/\r?\n/)) if (line.trim()) conversas.push([line])
  } else {
    conversas.push(text.split(/\r?\n/))
  }
}

const resultado = contarOrigens(conversas)

if (flags.has('--json')) {
  console.log(JSON.stringify(resultado, null, 2))
} else {
  const secao = (titulo, bucket) => {
    const linhas = Object.entries(bucket).sort((a, b) => b[1] - a[1])
    console.log('\n' + titulo)
    if (linhas.length === 0) console.log('  (nenhuma)')
    for (const [chave, n] of linhas) console.log('  ' + String(n).padStart(4) + '  ' + chave)
  }
  console.log('Conversas lidas: ' + resultado.total)
  console.log('Com origem de anuncio: ' + resultado.comOrigem + ' (' + (resultado.total ? Math.round((resultado.comOrigem / resultado.total) * 100) : 0) + '%)')
  secao('Por canal', resultado.porCanal)
  secao('Por criativo', resultado.porCriativo)
  secao('Por cidade', resultado.porCidade)
}
