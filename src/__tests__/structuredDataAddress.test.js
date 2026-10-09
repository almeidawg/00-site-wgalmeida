import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = path.resolve(process.cwd())
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')

const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)]
  .map((match) => JSON.parse(match[1]))

const findByType = (type) => jsonLd.find((entry) => entry?.['@type'] === type)

describe('public structured-data address', () => {
  it('uses the canonical WG address without stale postal or geo data', () => {
    const organization = findByType('Organization')
    const professionalService = findByType('ProfessionalService')

    expect(organization?.address).toMatchObject({
      '@type': 'PostalAddress',
      streetAddress: 'Rua Guararapes, 305',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR',
    })

    expect(professionalService?.address).toMatchObject({
      '@type': 'PostalAddress',
      streetAddress: 'Rua Guararapes, 305',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR',
    })

    expect(organization?.address?.postalCode).toBe('04561-000')
    expect(professionalService?.address?.postalCode).toBe('04561-000')
    expect(professionalService?.geo).toBeUndefined()
    expect(professionalService?.name).toBe('Grupo WG Almeida')
    expect(professionalService?.alternateName).toBe('WG Almeida Arquitetura')

    expect(html).not.toContain('Arquitetura Premium SP')
    expect(html).not.toContain('Escritório Arquitetura Jardins')

    expect(html).not.toContain('Brooklin Novo')
    expect(html).not.toContain('04571-000')
    expect(html).not.toContain('-23.6167')
    expect(html).not.toContain('-46.6945')
  })
})
