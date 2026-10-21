import { ArrowUpRight } from 'lucide-react'
import { mentoriaLandingPath, mentoriaApproachesPath } from '@/lib/mentoriaDomain'
import './wg-campaign-identity.css'

/** A identidade visual da landing de mentoria é a referência canônica das páginas WG 360°. */
export default function WGCampaignHeader({variant='catalog',count=0,onSelectionClick}){
  const isCatalog=variant==='catalog'
  const host=typeof window==='undefined'?'':window.location.hostname
  const landingPath=mentoriaLandingPath(host)
  const approachesPath=mentoriaApproachesPath(host)
  const isApproaches=variant==='approaches'
  return <header className="wg-campaign-header">
    <div className="wg-campaign-header__inner">
      <a href={landingPath} className="wg-campaign-brand" aria-label="Grupo WG Almeida — apresentação da mentoria">
        <img src="/media/mentoria-construcao/logo-grupo-wg-almeida.png" alt="" width="48" height="48" decoding="async"/>
        <span><strong>GRUPO WG ALMEIDA</strong><small>CONSULTORIA &amp; TRANSFORMAÇÃO</small></span>
      </a>
      <nav className="wg-campaign-nav" aria-label="Navegação da mentoria">
        <a href={landingPath}>Programa de 8 semanas</a>
        <a href={approachesPath}>Temas para aprofundar</a>
        {variant==='proposal'&&<a href="/mentoria-construcao/proposta-modelo">Demonstração de proposta</a>}
      </nav>
      {isCatalog
        ? <button type="button" className="wg-campaign-cta" onClick={onSelectionClick}>Minha seleção <span className="wg-campaign-count">{count}</span></button>
        : <a href={isApproaches?landingPath:approachesPath} className="wg-campaign-cta">{isApproaches?'Ver as 8 semanas':'Explorar os temas'} <ArrowUpRight size={15}/></a>}
    </div>
  </header>
}
