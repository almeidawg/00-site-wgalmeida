import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import useNoindexBaseMeta from '@/hooks/useNoindexBaseMeta'

function Probe() {
  useNoindexBaseMeta()
  return null
}

const content = (name) => document.querySelector('meta[name="' + name + '"]').getAttribute('content')

describe('useNoindexBaseMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = '<meta name="robots" content="index, follow"><meta name="googlebot" content="index, follow">'
  })
  afterEach(() => {
    document.head.innerHTML = ''
  })

  it('força noindex nas duas tags base enquanto a rota está montada e restaura ao sair', () => {
    const { unmount } = render(<Probe />)
    expect(content('robots')).toBe('noindex, nofollow')
    expect(content('googlebot')).toBe('noindex, nofollow')
    unmount()
    expect(content('robots')).toBe('index, follow')
    expect(content('googlebot')).toBe('index, follow')
  })

  it('não falha quando a página não tem as tags base', () => {
    document.head.innerHTML = ''
    expect(() => render(<Probe />).unmount()).not.toThrow()
  })
})
