import { useEffect, useState } from 'react'
import './MentoriaConsentBanner.css'
import { META_PIXEL_ID } from '@/lib/metaPixelConfig'
import { MENTORIA_CONSENT_EVENT, readMentoriaConsent, writeMentoriaConsent } from '@/lib/mentoriaConsent'
import { isMentoriaSurface, loadMetaPixel } from '@/lib/metaPixel'

/**
 * Aviso de medicao da Mentoria. So aparece com pixel configurado, na superficie da mentoria
 * e sem resposta previa. Recusar e tao facil quanto aceitar; sem resposta nada e carregado.
 */
export default function MentoriaConsentBanner() {
  const [choice, setChoice] = useState(() => (typeof window === 'undefined' ? 'denied' : readMentoriaConsent()))

  useEffect(() => {
    loadMetaPixel()
    const sync = () => { setChoice(readMentoriaConsent()); loadMetaPixel() }
    window.addEventListener(MENTORIA_CONSENT_EVENT, sync)
    return () => window.removeEventListener(MENTORIA_CONSENT_EVENT, sync)
  }, [])

  if (!META_PIXEL_ID || choice || typeof window === 'undefined' || !isMentoriaSurface()) return null
  return (
    <aside className="mcl-consent" role="dialog" aria-live="polite" aria-label="Aviso de medição de anúncios">
      <p>
        Usamos o pixel da Meta, só com a sua autorização, para medir se os anúncios desta apresentação funcionam.
        Nenhum dado digitado por você é enviado. <a href="/privacidade">Política de privacidade</a>.
      </p>
      <div className="mcl-consent__actions">
        <button type="button" className="mcl-button mcl-button--outline" onClick={() => writeMentoriaConsent('denied')}>Recusar</button>
        <button type="button" className="mcl-button mcl-button--orange" onClick={() => writeMentoriaConsent('granted')}>Aceitar</button>
      </div>
    </aside>
  )
}
