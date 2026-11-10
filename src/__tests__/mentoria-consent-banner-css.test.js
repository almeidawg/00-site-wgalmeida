import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// O aviso de medicao e renderizado FORA do wrapper .mcl. Se as variaveis da marca ficarem
// declaradas so em ".mcl", o aviso perde fundo e cor (aparecia transparente, texto dourado,
// contraste 3,03) e quase ninguem aceita o pixel. Este teste trava essa regressao.
const css = fs.readFileSync(path.join(process.cwd(), 'src/pages/mentoria-construcao.css'), 'utf8')

function bloco(seletor) {
  const inicio = css.indexOf(seletor + ' {')
  if (inicio < 0) return ''
  return css.slice(inicio, css.indexOf('}', inicio))
}

describe('aviso de medicao da Mentoria: escopo das variaveis de marca', () => {
  it('declara as variaveis tambem em .mcl-consent, nao so em .mcl', () => {
    const cabecalho = css.match(/^\.mcl,\s*\.mcl-consent\s*\{/m)
    expect(cabecalho).not.toBeNull()
    const corpo = css.slice(cabecalho.index, css.indexOf('}', cabecalho.index))
    for (const v of ['--mcl-ink', '--mcl-offwhite', '--mcl-line', '--mcl-orange-text-bg']) expect(corpo).toContain(v)
  })

  it('usa laranja de texto com contraste AA em texto sobre fundo claro', () => {
    expect(css).toMatch(/--mcl-orange-text:\s*#B8420F/i)
    expect(bloco('.mcl-convert__direct a')).toContain('var(--mcl-orange-text)')
    expect(bloco('.mcl-method__step-number')).toContain('var(--mcl-orange-text)')
  })

  it('oferece alvo de toque com pelo menos 44px no link de privacidade do banner mobile', () => {
    const mobileCss = fs.readFileSync(path.join(process.cwd(), 'src/components/MentoriaConsentBanner.css'), 'utf8')
    expect(mobileCss).toMatch(/body \.mcl-consent p a\s*\{[^}]*min-height:\s*44px/s)
    expect(mobileCss).toMatch(/body \.mcl-consent p a\s*\{[^}]*display:\s*inline-flex/s)
  })

  it('preserva alvo de 44px também no tablet entre 681 e 900px', () => {
    const cssFile = fs.readFileSync(path.join(process.cwd(), 'src/components/MentoriaConsentBanner.css'), 'utf8')
    expect(cssFile).toMatch(/@media \(min-width: 681px\) and \(max-width: 900px\)\s*\{[^}]*body \.mcl-consent p a\s*\{[^}]*min-height:\s*44px/s)
  })
})
