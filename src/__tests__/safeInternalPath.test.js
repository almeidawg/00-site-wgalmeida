import { describe, expect, it } from 'vitest'
import { safeInternalPath } from '@/lib/safeInternalPath'

describe('safeInternalPath', () => {
  it.each([
    ['/contato', '/contato'],
    ['/admin/painel', '/admin/painel'],
    ['/blog/artigo?x=1', '/blog/artigo?x=1'],
    [undefined, '/'],
    [null, '/'],
    ['https://evil.example/login', '/'],
    ['javascript:alert(1)', '/'],
    ['//evil.example', '/'],
    ['/\\\\evil.example', '/'],
    ['/%2Fevil.example', '/'],
    ['/%5cevil.example', '/'],
    ['/legit%0aevil.example', '/'],
    [' /contato', '/'],
  ])('allows only canonical internal destinations: %s', (input, expected) => {
    expect(safeInternalPath(input)).toBe(expected)
  })
  it('permits an explicit safe fallback', () => {
    expect(safeInternalPath('//evil.example', '/contato')).toBe('/contato')
  })
})
