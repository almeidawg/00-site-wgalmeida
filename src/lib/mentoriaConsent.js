/**
 * Consentimento de medicao da Mentoria (LGPD). Padrao: sem resposta = nada carrega.
 * So "granted" libera o pixel; "denied" e lembrado para nao perguntar de novo.
 */
export const MENTORIA_CONSENT_KEY = 'wg_mentoria_consent_v1'
export const MENTORIA_CONSENT_EVENT = 'wg-mentoria-consent'

export function readMentoriaConsent(win = typeof window === 'undefined' ? undefined : window) {
  try {
    const value = win?.localStorage?.getItem(MENTORIA_CONSENT_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

export function writeMentoriaConsent(value, win = typeof window === 'undefined' ? undefined : window) {
  if (value !== 'granted' && value !== 'denied') return false
  try {
    win?.localStorage?.setItem(MENTORIA_CONSENT_KEY, value)
  } catch {
    // Sem armazenamento a escolha vale so na sessao: o evento abaixo ainda avisa a pagina.
  }
  win?.dispatchEvent?.(new CustomEvent(MENTORIA_CONSENT_EVENT, { detail: value }))
  return true
}
