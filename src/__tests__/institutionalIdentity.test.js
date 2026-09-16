import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC_ROOT = path.resolve(process.cwd(), 'src')

function read(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

function collectPublicSourceFiles(dir = SRC_ROOT) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') return []
      return collectPublicSourceFiles(absolute)
    }
    if (!/\.(?:js|jsx|json|md)$/i.test(entry.name)) return []
    return [absolute]
  })
}

describe('identidade institucional publica', () => {
  it('usa WG/Build.tech como nome publico canonico, sem grafias legadas', () => {
    const offenders = collectPublicSourceFiles()
      .filter((file) => {
        const content = fs.readFileSync(file, 'utf8')
        return content.includes('WG_Build.tech') || content.includes('WG Build.tech')
      })
      .map((file) => path.relative(process.cwd(), file).replaceAll('\\', '/'))

    expect(offenders).toEqual([])
  }, 15000)

  it('representa os quatro nucleos ativos na Home e no Sobre', () => {
    const home = read('src/pages/Home.jsx')
    const about = read('src/pages/About.jsx')

    expect(home).toContain('/Logos/logo-wg-buildtech-nucleo.webp')
    expect(home).toContain("href: '/buildtech'")
    expect(about).toContain("number: '4'")
    expect(about).not.toContain("number: '3'")
  })

  it('nao publica pisos artificiais de clientes ou projetos', () => {
    const statsHook = read('src/hooks/useEstatisticasWG.js')
    const about = read('src/pages/About.jsx')

    expect(statsHook).not.toContain('clientesAtendidos: 400')
    expect(statsHook).not.toContain('Math.max(clientesAtendidos, 400)')
    expect(about).not.toContain("number: '400+'");
  })

  it('ancora a narrativa publica em 2011, quatro nucleos e tecnologia', () => {
    const pt = JSON.parse(read('src/i18n/locales/pt-BR.json'))
    const serialized = JSON.stringify(pt)

    expect(serialized).toContain('Desde 2011')
    expect(serialized).toContain('WG/Build.tech')
    expect(serialized).not.toContain('TrÃªs disciplinas')
    expect(pt.home.hero.title).toContain('Tecnologia')
  })

  it('faz o auditor de claims bloquear identidade e pisos numericos legados', () => {
    const auditor = read('tools/audit-public-claims.mjs')

    expect(auditor).toContain("label: 'identidade-legada'")
    expect(auditor).toContain("label: 'piso-artificial'")
    expect(auditor).toContain('480')
    expect(auditor).toContain('1\\.000')
  })

  it('mantem a documentacao operacional alinhada ao nome publico canonico', () => {
    const agents = read('AGENTS.md')
    const releaseRules = read('REGRAS-COMMIT-PUSH-DEPLOY.md')

    expect(agents).toContain('Nome publico oficial: `WG/Build.tech`.')
    expect(releaseRules).toContain('Nome publico oficial: `WG/Build.tech`.')
    expect(agents).not.toContain('Nome publico oficial: `WG_Build.tech`.')
    expect(releaseRules).not.toContain('Nome publico oficial: `WG_Build.tech`.')
  })

  it('publica William Almeida em rota propria com posicionamento aprovado e sem claims bloqueados', () => {
    const app = read('src/App.jsx')
    const william = read('src/pages/WilliamAlmeida.jsx')

    expect(app).toContain('path="/william-almeida"')
    expect(william).toContain('Founder, Operator & Builder')
    expect(william).toContain('Advisor Estratégico')
    expect(william).toContain('Desde 2011')
    expect(william).toContain('WG/Build.tech')
    expect(william).toContain('2025')
    expect(william).not.toContain('480+')
    expect(william).not.toContain('1.000+')
    expect(william).not.toContain('R$10M')
  })

  it('define William como Person/ProfilePage canonico e conecta autoria ao mesmo id', () => {
    const schema = read('src/data/schemaConfig.js')
    const seo = read('src/data/seoConfig.js')

    expect(schema).toContain('/william-almeida#person')
    expect(schema).toContain('ProfilePage')
    expect(schema).toContain('Advisor Estratégico')
    expect(schema).toContain('https://www.linkedin.com/in/wgalmeida/')
    expect(schema).not.toContain('CEO e Diretor de Arquitetura')
    expect(schema).not.toContain('WG_Build.tech')
    expect(seo).toContain('"/william-almeida"')
  })

  it('elimina o schema institucional legado de 2010 e idade dinamica do HTML base', () => {
    const indexHtml = read('index.html')

    expect(indexHtml).not.toContain('"foundingDate": "2010"')
    expect(indexHtml).not.toContain('há 15 anos')
    expect(indexHtml).toContain('"foundingDate": "2011"')
    expect(indexHtml).toContain('WG/Build.tech')
  })
})
