import { useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, Compass, Lightbulb, MessageCircle, MoveUpRight, ShieldCheck } from 'lucide-react'
import Seo from '@/components/SEO'
import WGCampaignHeader from '@/components/WGCampaignHeader'
import { MENTORIA_ABORDAGENS, MENTORIA_ABORDAGENS_TOTAL, MENTORIA_ABORDAGENS_JORNADAS } from '@/data/mentoriaAbordagens'
import { mentoriaApproachesCanonical, mentoriaLandingPath } from '@/lib/mentoriaDomain'
import useNoindexBaseMeta from '@/hooks/useNoindexBaseMeta'
import './mentoria-abordagens.css'

/**
 * Conteúdo editorial de orientação. Não é catálogo de serviços, checkout,
 * proposta, seletor de módulos ou promessa de 30 entregas em oito semanas.
 */
export default function MentoriaAbordagens() {
  const [opened, setOpened] = useState([])
  const host = typeof window !== 'undefined' ? window.location.hostname : ''
  const landingPath = mentoriaLandingPath(host)
  const expanded = new Set(opened)
  const toggle = (id) => setOpened((ids) => ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id])
  useNoindexBaseMeta()

  return (
    <>
      <Seo
        pathname="/mentoria-construcao/abordagens"
        canonical={mentoriaApproachesCanonical(host)}
        title="Temas que podemos aprofundar na mentoria | Grupo WG Almeida"
        description="Possíveis frentes de conversa para empresas de obras e reformas: processos, comercial, gestão, obras, custos, marketing e inteligência artificial. O programa segue com oito encontros individuais."
        robots="noindex, nofollow"
        noindex
        og={{ image: 'https://wgalmeida.com.br/media/mentoria-construcao/apresentacao-capa.webp' }}
      />
      <div className="mab" id="inicio">
        <a className="mab-skip" href="#temas">Ir para os temas</a>
        <WGCampaignHeader variant="approaches" />
        <main>
          <section className="mab-hero" aria-labelledby="mab-title">
            <div className="mab-shell mab-hero__layout">
              <div className="mab-hero__content">
                <p className="mab-eyebrow"><span className="mab-dot"/> MENTORIA INDIVIDUAL · VISÃO DE POSSIBILIDADES</p>
                <h1 id="mab-title">Cada empresa tem um desafio. <em>A conversa começa pelo seu.</em></h1>
                <p className="mab-hero__lead">A experiência da mentoria não está em empilhar ferramentas. Está em enxergar a operação com clareza, discutir escolhas e encontrar o próximo passo que faz sentido para a realidade da empresa.</p>
                <div className="mab-hero__actions">
                  <a href="#temas" className="mab-button mab-button--solid">Explore as abordagens <ArrowRight size={18} aria-hidden="true"/></a>
                  <a href={landingPath + '#programa'} className="mab-button mab-button--light">Rever as oito semanas <MoveUpRight size={17} aria-hidden="true"/></a>
                </div>
                <p className="mab-hero__note"><ShieldCheck size={17} aria-hidden="true"/> Estes temas são possibilidades de aprofundamento, não uma lista de serviços contratados nem mudanças na carga horária do programa.</p>
              </div>
              <div className="mab-hero__aside" aria-label="Como conduzimos a conversa">
                <span className="mab-hero__aside-kicker">A PERGUNTA CERTA MUDA A PRIORIDADE</span>
                <div className="mab-hero__question">O que hoje impede a sua empresa de operar com mais clareza e autonomia?</div>
                <div className="mab-hero__aside-rule"/>
                <p><Compass size={20} aria-hidden="true"/> Escutar a realidade antes de recomendar uma solução.</p>
                <p><Lightbulb size={20} aria-hidden="true"/> Traduzir desafios em decisões que podem ser testadas.</p>
                <p><CheckCircle2 size={20} aria-hidden="true"/> Distinguir aprendizado, melhoria de rotina e possível projeto adicional.</p>
              </div>
            </div>
          </section>

          <section className="mab-intro" aria-label="Como funcionam as abordagens">
            <div className="mab-shell mab-intro__grid">
              <div>
                <span className="mab-mini">A BASE NÃO MUDA</span>
                <strong>8 semanas · 8 encontros individuais · 12 horas ao vivo</strong>
                <p>A sequência semanal apresentada na página principal permanece igual.</p>
              </div>
              <div>
                <span className="mab-mini">O APROFUNDAMENTO É CONTEXTUAL</span>
                <strong>Temas conectados à sua realidade</strong>
                <p>As prioridades e os exercícios são definidos conforme o diagnóstico e o tempo disponível.</p>
              </div>
              <div>
                <span className="mab-mini">SEM PROMESSA DE IMPLANTAÇÃO</span>
                <strong>Orientar não é vender uma ferramenta</strong>
                <p>Execução técnica, novas integrações e serviços dependem de escopo e contratação específicos.</p>
              </div>
            </div>
          </section>

          <section className="mab-topics" id="temas" aria-labelledby="mab-topics-title">
            <div className="mab-shell">
              <div className="mab-heading">
                <div>
                  <span className="mab-section-label">UMA VISÃO MAIS AMPLA DA EMPRESA</span>
                  <h2 id="mab-topics-title">Frentes que podemos <em>explorar juntos.</em></h2>
                  <p>{MENTORIA_ABORDAGENS.length} áreas de reflexão, com {MENTORIA_ABORDAGENS_TOTAL} pontos de conversa ilustrativos. Não há seleção de módulos, tabela de preços ou obrigação de percorrer todos eles.</p>
                </div>
                <div className="mab-heading__aside"><BookOpen size={24} aria-hidden="true"/><span>Uma boa mentoria começa com perguntas específicas, não respostas prontas.</span></div>
              </div>

              <nav className="mab-index" aria-label="Navegar pelas áreas de abordagem">
                {MENTORIA_ABORDAGENS.map((area) => (
                  <a key={area.id} href={'#area-' + area.id}>
                    <span>{area.numero}</span>{area.titulo}<ArrowUpRight size={15} aria-hidden="true"/>
                  </a>
                ))}
              </nav>

              <div className="mab-areas">
                {MENTORIA_ABORDAGENS.map((area) => {
                  const isExpanded = expanded.has(area.id)
                  return (
                    <article className="mab-area" id={'area-' + area.id} key={area.id}>
                      <div className="mab-area__top">
                        <span className="mab-area__number">{area.numero}</span>
                        <span className="mab-area__category">{area.area}</span>
                      </div>
                      <div className="mab-area__body">
                        <div className="mab-area__main">
                          <h3>{area.titulo}</h3>
                          <p>{area.resumo}</p>
                          <div className="mab-area__question"><span>PARA COMEÇAR A CONVERSA</span><strong>{area.pergunta}</strong></div>
                        </div>
                        <div className="mab-area__details">
                          <span className="mab-area__label">ASSUNTOS POSSÍVEIS</span>
                          <ul>{area.possibilidades.map(([titulo, descricao]) => (
                            <li key={titulo}><CheckCircle2 size={17} aria-hidden="true"/><span><strong>{titulo}</strong><small>{descricao}</small></span></li>
                          ))}</ul>
                          <button type="button" className="mab-area__expand" aria-expanded={isExpanded} aria-controls={isExpanded ? 'detalhe-' + area.id : undefined} onClick={() => toggle(area.id)}>
                            {isExpanded ? 'Ocultar exemplo' : 'Ver um exemplo prático'} <ArrowRight size={16} aria-hidden="true"/>
                          </button>
                          {isExpanded && <div className="mab-area__example" id={'detalhe-' + area.id}>
                            <span>SITUAÇÃO ILUSTRATIVA, NÃO CASE REAL</span>
                            <p>{area.exemplo}</p>
                            <strong>Na conversa, podemos: {area.aplicacao}</strong>
                          </div>}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="mab-paths" aria-labelledby="mab-paths-title">
            <div className="mab-shell">
              <span className="mab-section-label">DA VISÃO GERAL À PRIORIDADE</span>
              <h2 id="mab-paths-title">Os temas fazem mais sentido <em>quando se conectam.</em></h2>
              <p className="mab-paths__lead">Estas são conexões ilustrativas para orientar o diagnóstico. Não são trilhas extras obrigatórias nem entregas prometidas no programa.</p>
              <div className="mab-paths__grid">
                {MENTORIA_ABORDAGENS_JORNADAS.map((jornada, index) => (
                  <article key={jornada.titulo}>
                    <span className="mab-paths__num">CENÁRIO {String(index + 1).padStart(2, '0')}</span>
                    <h3>{jornada.titulo}</h3>
                    <p>{jornada.contexto}</p>
                    <div className="mab-paths__steps">{jornada.etapas.map((etapa, i) => (
                      <span key={etapa}>{etapa}{i < jornada.etapas.length - 1 && <ArrowRight size={13} aria-hidden="true"/>}</span>
                    ))}</div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="mab-end" aria-labelledby="mab-end-title">
            <div className="mab-shell mab-end__layout">
              <div>
                <span className="mab-section-label">O MAIS IMPORTANTE</span>
                <h2 id="mab-end-title">O próximo passo não precisa ser maior. <em>Precisa ser mais claro.</em></h2>
                <p>Voltamos sempre ao mesmo princípio: partir da realidade da empresa, aprender a analisar e aplicar o que for viável. O programa base continua o mesmo; qualquer implementação adicional será avaliada em proposta própria.</p>
              </div>
              <div className="mab-end__links">
                <a className="mab-button mab-button--solid" href={landingPath + '#conversar'}><MessageCircle size={18} aria-hidden="true"/> Conversar sobre a mentoria</a>
                <a className="mab-button mab-button--outline" href={landingPath + '#programa'}><ArrowLeft size={16} aria-hidden="true"/> Voltar ao programa de 8 semanas</a>
                <small>Nenhuma escolha ou mensagem é enviada por esta página.</small>
              </div>
            </div>
          </section>
        </main>
        <footer className="mab-footer"><div className="mab-shell"><strong>GRUPO WG ALMEIDA</strong><span>Mentoria estratégica para empresas de obras e reformas · Orientação com responsabilidade.</span><a href={landingPath}>Apresentação da mentoria <ArrowUpRight size={15} aria-hidden="true"/></a></div></footer>
      </div>
    </>
  )
}
