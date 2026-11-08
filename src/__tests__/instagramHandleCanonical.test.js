import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Guard: o handle antigo/errado do Instagram (wgalmeida.arq) nao pode voltar ao site.
// Fonte canonica: FATOS_PUBLICOS_CANONICOS.json -> instagram.com/grupowgalmeida.
const ROOT = process.cwd()
const SCAN = ['index.html', 'src', 'public', 'scripts', 'api', 'build-seo-routes.mjs', 'build-seo-og.mjs']
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '__tests__'])
const TEXT_EXT = /\.(html|js|jsx|mjs|cjs|json|md|xml|txt|ts|tsx)$/i
const FORBIDDEN = 'wgalmeida.arq'

function walk(path, out = []) {
  let st
  try { st = statSync(path) } catch { return out }
  if (st.isDirectory()) {
    for (const name of readdirSync(path)) {
      if (!SKIP_DIRS.has(name)) walk(join(path, name), out)
    }
  } else if (TEXT_EXT.test(path)) {
    out.push(path)
  }
  return out
}

describe('handle do Instagram canonico', () => {
  it('nao reintroduz wgalmeida.arq', () => {
    const hits = SCAN.flatMap((p) => walk(join(ROOT, p))).filter((f) =>
      readFileSync(f, 'utf8').includes(FORBIDDEN)
    )
    expect(hits).toEqual([])
  })

  it('JSON-LD do index.html aponta para grupowgalmeida', () => {
    const html = readFileSync(join(ROOT, 'index.html'), 'utf8')
    expect(html).toContain('https://www.instagram.com/grupowgalmeida')
  })
})
