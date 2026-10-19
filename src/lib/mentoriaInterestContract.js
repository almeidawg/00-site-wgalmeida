/**
 * Contrato neutro e puro da solicitação inicial da Mentoria Construção.
 * Não cria cadastro, não publica eventos e não autoriza persistência.
 * Uso em laboratório sintético e validações do futuro adapter governado.
 */
export const MENTORIA_INTEREST_CONTEXT = 'mentoria_construcao'
export const MENTORIA_INTEREST_PROGRAM = 'individual_8_weeks_8x90_minutes'
export const MENTORIA_INTEREST_PRIORITIES = Object.freeze(['operacao','comercial','sistema','ia','mentoria','entender'])
export const MENTORIA_INTEREST_SEGMENTS = Object.freeze([
  'Construtora / execução de obras',
  'Reformas e manutenção',
  'Arquitetura / engenharia',
  'Marcenaria',
  'Instalações / serviços técnicos',
  'Outro segmento da construção',
])
const KEYS = new Set([
  'context', 'program', 'name', 'company', 'email', 'phone',
  'role', 'segment', 'priority', 'challenge', 'privacyConsent', 'website',
  'utm_source', 'utm_medium', 'utm_campaign',
])
const text = (v, max) => typeof v === 'string' && v.trim().length <= max ? v.trim() : null
const validEmail = (v) => /^[^\s@]{1,64}@[^\s@]{1,180}\.[^\s@]{2,20}$/.test(v) && v.length <= 180
const validUTM = (v) => v === '' || /^[A-Za-z0-9_.:-]{1,80}$/.test(v)
export function validateMentoriaInterest(input) {
  // Nunca retorna dados do usuário em mensagens de erro.
  if (!input || typeof input !== 'object' || Array.isArray(input)) return Object.freeze({ok:false,reason:'OBJECT_REQUIRED'})
  if (Object.keys(input).some(key => !KEYS.has(key))) return Object.freeze({ok:false,reason:'EXTRA_FIELDS'})
  if (input.context !== MENTORIA_INTEREST_CONTEXT || input.program !== MENTORIA_INTEREST_PROGRAM) return Object.freeze({ok:false,reason:'WRONG_CONTEXT'})
  if (input.privacyConsent !== true) return Object.freeze({ok:false,reason:'CONSENT_REQUIRED'})
  if (input.website !== '') return Object.freeze({ok:false,reason:'HONEYPOT'})
  const name=text(input.name,120),company=text(input.company,120),email=text(input.email,180)
  const phone=text(input.phone,13),role=text(input.role ?? '',90),segment=text(input.segment,80)
  const priority=text(input.priority,30),challenge=text(input.challenge,1200)
  if (!name || name.length < 2 || !company || company.length < 2) return Object.freeze({ok:false,reason:'IDENTITY_REQUIRED'})
  if (!email || !validEmail(email)) return Object.freeze({ok:false,reason:'INVALID_EMAIL'})
  if (!phone || !/^\d{10,13}$/.test(phone)) return Object.freeze({ok:false,reason:'INVALID_PHONE'})
  if (role === null || !segment || !MENTORIA_INTEREST_SEGMENTS.includes(segment)) return Object.freeze({ok:false,reason:'INVALID_SEGMENT'})
  if (!priority || !MENTORIA_INTEREST_PRIORITIES.includes(priority)) return Object.freeze({ok:false,reason:'INVALID_PRIORITY'})
  if (!challenge || challenge.length < 15) return Object.freeze({ok:false,reason:'CHALLENGE_REQUIRED'})
  const attribution = {}
  for (const key of ['utm_source','utm_medium','utm_campaign']) {
    const value=text(input[key] ?? '',80)
    if (value === null || !validUTM(value)) return Object.freeze({ok:false,reason:'INVALID_ATTRIBUTION'})
    if (value) attribution[key]=value
  }
  // Dados validados permanecem apenas no processo consumidor. Não logar nem ecoar.
  return Object.freeze({ok:true, data:Object.freeze({
    context:MENTORIA_INTEREST_CONTEXT,program:MENTORIA_INTEREST_PROGRAM,
    name,company,email:email.toLowerCase(),phone,role,segment,priority,challenge,privacyConsent:true,
    attribution:Object.freeze(attribution),
  })})
}
