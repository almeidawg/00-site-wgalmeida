/**
 * Endereco publico reservado para a mentoria.
 * A ativacao de DNS/Vercel depende do release gate separado.
 * Sem side effects, sem leitura de env e sem roteamento externo.
 */
import { PRODUCT_URLS } from '../data/companyPublic.js'

export const MENTORIA_ORIGIN = PRODUCT_URLS.mentoria
export const MENTORIA_HOST = new URL(MENTORIA_ORIGIN).hostname
export const MENTORIA_LEGACY_PATH = '/mentoria-construcao'
export const MENTORIA_ABORDAGENS_LEGACY_PATH = '/mentoria-construcao/abordagens'
export const MENTORIA_CONTACT_LEGACY_PATH = '/mentoria-construcao/contato'
export const SITE_ORIGIN = PRODUCT_URLS.site

export function isMentoriaHost(hostname) {
  return typeof hostname === 'string'
    && hostname.replace(/\.$/, '').toLowerCase() === MENTORIA_HOST
}

export function isMentoriaLandingPath(pathname) {
  return pathname === '/' || pathname === MENTORIA_LEGACY_PATH
}

export function mentoriaLandingPath(hostname) {
  return isMentoriaHost(hostname) ? '/' : MENTORIA_LEGACY_PATH
}

export function mentoriaContactPath(hostname) {
  return isMentoriaHost(hostname) ? '/contato' : MENTORIA_CONTACT_LEGACY_PATH
}

export function mentoriaContactCanonical(hostname) {
  return isMentoriaHost(hostname)
    ? MENTORIA_ORIGIN + '/contato'
    : SITE_ORIGIN + MENTORIA_CONTACT_LEGACY_PATH
}

export function mentoriaApproachesPath(hostname) {
  return isMentoriaHost(hostname) ? '/abordagens' : MENTORIA_ABORDAGENS_LEGACY_PATH
}

export function mentoriaApproachesCanonical(hostname) {
  return isMentoriaHost(hostname)
    ? MENTORIA_ORIGIN + '/abordagens'
    : SITE_ORIGIN + MENTORIA_ABORDAGENS_LEGACY_PATH
}

export function mentoriaLandingCanonical(hostname) {
  return isMentoriaHost(hostname)
    ? MENTORIA_ORIGIN + '/'
    : SITE_ORIGIN + MENTORIA_LEGACY_PATH
}

export function canonicalForSiteHost(hostname, pathname = '/') {
  let normalized = typeof pathname === 'string' && pathname.startsWith('/') ? pathname : '/'
  normalized = normalized.replace(/\/{2,}/g, '/')
  if (normalized.length > 1 && normalized.endsWith('/')) normalized = normalized.slice(0, -1)
  if (isMentoriaHost(hostname) && isMentoriaLandingPath(normalized)) return MENTORIA_ORIGIN + '/'
  if (normalized === MENTORIA_CONTACT_LEGACY_PATH || (isMentoriaHost(hostname) && normalized === '/contato')) return mentoriaContactCanonical(hostname)
  if (normalized === '/mentoria-construcao/proposta-360') return mentoriaApproachesCanonical(hostname)
  if (isMentoriaHost(hostname) && (normalized === '/abordagens' || normalized === MENTORIA_ABORDAGENS_LEGACY_PATH)) return MENTORIA_ORIGIN + '/abordagens'
  return SITE_ORIGIN + normalized
}
