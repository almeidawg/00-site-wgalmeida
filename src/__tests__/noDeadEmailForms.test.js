import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Regressao: a newsletter do Blog ficou meses com onSubmit={(e) => e.preventDefault()},
// aceitando cliques sem gravar nada. Formulario de e-mail publico precisa de handler real.
const PUBLIC_EMAIL_FORMS = ['src/pages/Blog.jsx']

describe('formularios publicos de e-mail', () => {
  it.each(PUBLIC_EMAIL_FORMS)('%s nao tem formulario que so chama preventDefault', (file) => {
    const source = readFileSync(file, 'utf8')
    expect(source).not.toMatch(/onSubmit=\{\(?\s*e\s*\)?\s*=>\s*e\.preventDefault\(\)\s*\}/)
  })

  it('Blog usa o componente NewsletterSignup', () => {
    expect(readFileSync('src/pages/Blog.jsx', 'utf8')).toContain('<NewsletterSignup />')
  })
})
