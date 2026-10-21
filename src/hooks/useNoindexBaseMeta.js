import { useEffect } from 'react'

/**
 * A entrada HTML institucional declara robots e googlebot como index. Em pré-lançamento,
 * as rotas da mentoria sobrescrevem as duas tags base para noindex e restauram o valor
 * anterior ao sair, sem alterar o SEO das demais rotas.
 */
export default function useNoindexBaseMeta() {
  useEffect(() => {
    const bases = ['robots', 'googlebot']
      .map((name) => document.querySelector('meta[name="' + name + '"]:not([data-rh])'))
      .filter(Boolean)
    if (!bases.length) return undefined
    const previous = bases.map((meta) => meta.getAttribute('content'))
    bases.forEach((meta) => meta.setAttribute('content', 'noindex, nofollow'))
    return () => bases.forEach((meta, i) => meta.setAttribute('content', previous[i] || 'index, follow'))
  }, [])
}
