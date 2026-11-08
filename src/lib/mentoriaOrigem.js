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

// Cidade do anuncio. So o sufixo _cwb (imagens e videos de Curitiba) afirma cidade; a falta de
// sufixo NAO significa Sao Paulo, porque anuncios antigos de Curitiba nao tinham sufixo.
export const MENTORIA_CITY_LABELS = Object.freeze([
  [/_cwb$/, 'Curitiba'],
])
const UNKNOWN_CITY = 'não identificada'

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
  // Cidade so entra junto de um criativo conhecido: valor desconhecido nunca vaza para o lead.
  const city = label ? MENTORIA_CITY_LABELS.find(([pattern]) => pattern.test(content))?.[1] : undefined
  const detail = [label, city].filter(Boolean).join(', ')
  return 'Cheguei por um anúncio no ' + source + (detail ? ' (' + detail + ')' : '') + '.'
}

// Leitura inversa: a mesma tabela que escreve a frase a le de volta, para nao haver segunda
// fonte de verdade. Texto de lead fora dos rotulos conhecidos nunca entra na contagem.
const CHANNELS = new Set(Object.values(SOURCES))
const KNOWN_LABELS = new Set(MENTORIA_CONTENT_LABELS.map(([, label]) => label))
const KNOWN_CITIES = new Set(MENTORIA_CITY_LABELS.map(([, city]) => city))
const PHRASE = /Cheguei por um anúncio no (Facebook ou Instagram|Facebook|Instagram)(?: \(([^()]{1,120})\))?\./

export function lerOrigemDaMensagem(text) {
  const match = PHRASE.exec(String(text ?? ''))
  if (!match || !CHANNELS.has(match[1])) return null
  const parts = (match[2] || '').split(', ')
  const criativo = KNOWN_LABELS.has(parts[0]) ? parts[0] : null
  const cidade = criativo && KNOWN_CITIES.has(parts[1]) ? parts[1] : null
  return { canal: match[1], criativo, cidade }
}

const bump = (bucket, key) => { bucket[key] = (bucket[key] || 0) + 1 }

/** Cada item de `conversas` e uma conversa (lista de mensagens). Conta a primeira origem de cada uma. */
export function contarOrigens(conversas = []) {
  const result = { total: 0, comOrigem: 0, porCanal: {}, porCriativo: {}, porCidade: {} }
  for (const conversa of conversas) {
    result.total += 1
    const origem = (Array.isArray(conversa) ? conversa : [conversa])
      .map(lerOrigemDaMensagem).find(Boolean)
    if (!origem) continue
    result.comOrigem += 1
    bump(result.porCanal, origem.canal)
    bump(result.porCriativo, origem.criativo || 'não identificado')
    bump(result.porCidade, origem.cidade || UNKNOWN_CITY)
  }
  return result
}
