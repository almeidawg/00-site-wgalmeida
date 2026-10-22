/**
 * Frase de origem da mensagem de WhatsApp da Mentoria, em linguagem natural.
 * Traduz so UTMs conhecidas; valor desconhecido nunca e repetido (sem codigos para o lead ver).
 * Quem recebe a mensagem (William, CRM, Liz) reconhece o anuncio pela frase fixa abaixo.
 *
 * Esquema de UTM da campanha: utm_source=meta, utm_medium=paid_social,
 * utm_content=<criativo>, com sufixo _cwb nas imagens de Curitiba.
 */
const SOURCES = Object.freeze({
  meta: 'Facebook ou Instagram',
  facebook: 'Facebook',
  fb: 'Facebook',
  instagram: 'Instagram',
  ig: 'Instagram',
})

// Cada item: [padrao do utm_content, rotulo mostrado]. O rotulo e a chave de leitura inversa.
export const MENTORIA_CONTENT_LABELS = Object.freeze([
  [/^criativo01_operacao_v\d+(?:_cwb)?$/, 'vídeo sobre organizar a operação'],
  [/^criativo02_briefing_v\d+(?:_cwb)?$/, 'vídeo do WhatsApp ao briefing'],
  [/^estatico_feed_v\d+(?:_cwb)?$/, 'imagem do feed'],
  [/^estatico_stories_v\d+(?:_cwb)?$/, 'imagem dos stories'],
])

const SAFE_VALUE = /^[a-z0-9_.-]{1,80}$/i

function readParam(params, name) {
  const raw = params.get(name) || ''
  return SAFE_VALUE.test(raw) ? raw.toLowerCase() : ''
}

export function describeMentoriaOrigem(search = '') {
  const params = new URLSearchParams(search)
  const source = SOURCES[readParam(params, 'utm_source')]
  if (!source) return ''
  const content = readParam(params, 'utm_content')
  const label = MENTORIA_CONTENT_LABELS.find(([pattern]) => pattern.test(content))?.[1]
  return 'Cheguei por um anúncio no ' + source + (label ? ' (' + label + ')' : '') + '.'
}
