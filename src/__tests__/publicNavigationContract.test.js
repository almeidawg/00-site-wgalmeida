import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const headerSource = readFileSync(resolve(process.cwd(), 'src/components/layout/Header.jsx'), 'utf8')
const appSource = readFileSync(resolve(process.cwd(), 'src/App.jsx'), 'utf8')

describe('Site WG Almeida - public navigation governance', () => {
  it('does not expose the SaaS product selector on desktop or mobile', () => {
    expect(headerSource).not.toMatch(/saasItems|isSaaSMenuOpen|saasMenuRef|setSaaSMenuOpen/)
    expect(headerSource).not.toMatch(/'SaaS'|Abrir menu de produtos SaaS/)
    expect(headerSource).not.toMatch(/Easy Food|AcessooS|EventOS|Easy Real Estate/)
  })

  it('does not advertise the legacy administrative control from the public header', () => {
    expect(headerSource).not.toMatch(/MANAGEMENT_URL|Acessar área de gestão/)
    expect(headerSource).not.toContain('to="/admin"')
  })

  it('retains institutional navigation while preserving existing product and admin routes for migration', () => {
    expect(headerSource).toContain('unitsItems')
    expect(headerSource).toContain("path: '/sobre'")
    expect(headerSource).toContain("path: '/projetos'")
    expect(headerSource).toContain('to="/contato"')
    expect(appSource).toContain('path="/admin/*"')
    expect(appSource).toContain('path="/wgeasy"')
  })
})
