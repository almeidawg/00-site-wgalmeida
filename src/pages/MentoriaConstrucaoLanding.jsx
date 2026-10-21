import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, PlayCircle, MessageCircle, Pause, Play } from 'lucide-react'
import Seo from '@/components/SEO'
import { mentoriaLandingCanonical, mentoriaApproachesPath } from '@/lib/mentoriaDomain'
import { COMPANY } from '@/data/company'
import useNoindexBaseMeta from '@/hooks/useNoindexBaseMeta'
import { trackCtaClick, trackEvent, trackWhatsappClick } from '@/lib/analytics'
import './mentoria-construcao.css'

const ROOT = '/media/mentoria-construcao'
const FILM = ROOT + '/apresentacao-720p.mp4'
const POSTER = ROOT + '/apresentacao-capa.webp'
const LOGO = ROOT + '/logo-grupo-wg-almeida.png'

const pilotWeeks = [
  { week: '01', title: 'Diagnóstico da empresa', text: 'Mapear atendimento, equipe, obras, controles e os gargalos prioritários.' },
  { week: '02', title: 'Processos e prioridades', text: 'Organizar responsabilidades, rotinas, fluxo de trabalho e indicadores iniciais.' },
  { week: '03', title: 'Comercial e propostas', text: 'Estruturar o caminho do primeiro contato ao escopo e à proposta.' },
  { week: '04', title: 'IA no dia a dia', text: 'Aprender a orientar e revisar a IA em atividades reais, usando exemplos seguros.' },
  { week: '05', title: 'Assistentes e conhecimento', text: 'Configurar instruções, documentos autorizados e um caso de uso controlado.' },
  { week: '06', title: 'IA e sistema de gestão', text: 'Avaliar dados, permissões e viabilidade de conexão com a operação.' },
  { week: '07', title: 'Piloto supervisionado', text: 'Testar o caso de uso, registrar falhas e medir valor sem automação irrestrita.' },
  { week: '08', title: 'Plano de evolução', text: 'Consolidar aprendizados, responsáveis, prioridades e próximos passos.' },
]

const paths = [
  { number: '01', label: 'Entendimento', title: 'Primeiro, a sua realidade.', text: 'Uma conversa para conhecer a empresa, seus serviços, como chegam os clientes e onde a operação perde tempo e previsibilidade.' },
  { number: '02', label: 'Diagnóstico', title: 'Clareza antes de investir.', text: 'Aprofundamos o levantamento de processos, materiais, presença digital e gestão dentro do escopo de diagnóstico acordado.' },
  { number: '03', label: 'Plano e proposta', title: 'Prioridade, não receita pronta.', text: 'Definimos o que faz sentido executar, em qual sequência, com responsabilidades, entregas, prazos e investimento.' },
  { number: '04', label: 'Execução acompanhada', title: 'Do planejamento à prática.', text: 'Com o escopo contratado, combinamos mentoria ao vivo com implantação, capacitação e suporte às soluções escolhidas.' },
]

const areas = [
  { number: '01', eyebrow: 'ESTRATÉGIA E OPERAÇÃO', title: 'Uma empresa organizada começa por decisões melhores.', text: 'Rotinas, fluxo de atendimento, orçamentos, propostas, contratação, equipes, materiais e acompanhamento das obras. Encontramos o que precisa de processo e controle antes de acrescentar ferramentas.', details: ['Diagnóstico de materiais físicos e digitais', 'Revisão de fluxos e prioridades', 'Mentoria individual e acompanhamento'] },
  { number: '02', eyebrow: 'PRESENÇA E CAPTAÇÃO', title: 'Seu trabalho precisa ser percebido com o valor certo.', text: 'Posicionamento, apresentação comercial, site profissional, portfólio, redes sociais e campanhas planejadas para alcançar as oportunidades certas, sem promessas artificiais de resultado.', details: ['Site e portfólio profissional', 'Posicionamento e redes sociais', 'Campanhas e jornada comercial'] },
  { number: '03', eyebrow: 'TECNOLOGIA E GESTÃO', title: 'Tecnologia que acompanha a realidade da empresa.', text: 'Na mentoria, avaliamos como organizar informações, usar IA com segurança e identificar oportunidades de integração. Pela WG/Build.tech, implementações podem ser orçadas separadamente.', details: ['Mapeamento de sistemas e fontes de dados', 'Rotinas, assistentes e IA supervisionada', 'Plano de evolução e viabilidade de integrações'] },
]

const priorities = [
  { id: 'operacao', short: 'Organizar operação e obras', message: 'organizar processos, equipes e acompanhamento das obras' },
  { id: 'comercial', short: 'Posicionamento e clientes', message: 'melhorar posicionamento, site, redes sociais e captação de clientes' },
  { id: 'sistema', short: 'Sistema de gestão completo', message: 'integrar atendimento, propostas, contratos, obras e financeiro em um sistema' },
  { id: 'entender', short: 'Entender por onde começar', message: 'identificar os principais gargalos e prioridades do meu negócio' },
  { id: 'ia', short: 'Aplicar IA na operação e gestão', message: 'aprender a usar, configurar e avaliar integrações de inteligência artificial com meus processos e sistema de gestão' },
  { id: 'mentoria', short: 'Conhecer o programa individual', message: 'avaliar a Mentoria Estratégica Individual do Grupo WG Almeida, com oito encontros de 90 minutos ao longo de oito semanas (12 horas ao vivo)' },
]

const faqs = [
  { question: 'Essa é uma mentoria ou uma consultoria com implementação?', answer: 'A oferta inicial é uma mentoria estratégica individual de oito semanas. Consultoria aprofundada, implementação de soluções e integrações técnicas são serviços possíveis, avaliados e contratados separadamente quando fizerem sentido.' },
  { question: 'O site, as campanhas e o sistema de gestão estão incluídos?', answer: 'Não. O programa individual prioriza orientação e exercícios supervisionados. Site, campanhas, CRM, agentes e desenvolvimento de sistemas podem ser avaliados, mas sua implantação e seus custos dependem de uma proposta específica aprovada.' },
  { question: 'O que acontece na conversa inicial?', answer: 'Conhecemos seu tipo de operação, seus objetivos e os problemas prioritários. A conversa orienta os próximos passos; não equivale a uma auditoria técnica completa gratuita.' },
  { question: 'É possível trabalhar com um sistema sob medida?', answer: 'Sim. Por meio da WG/Build.tech, avaliamos integrações, configurações e desenvolvimento conforme os processos, a viabilidade, o cronograma e o orçamento necessários.' },
  { question: 'Como a inteligência artificial entra na mentoria?', answer: 'Ensinamos aplicações práticas de IA para atendimento, documentos, organização e gestão, com orientação sobre configuração e uso responsável. A implementação de agentes, integrações com CRM ou sistemas e desenvolvimento depende dos acessos, segurança, viabilidade e escopo contratados.' },
  { question: 'Como funciona o programa individual de oito semanas?', answer: 'O programa prevê oito encontros individuais de 90 minutos, um por semana, durante oito semanas: 12 horas de acompanhamento ao vivo. Passamos por diagnóstico, processos, gestão comercial, IA aplicada, configuração de assistentes, avaliação de integrações, piloto supervisionado e plano de evolução. Agenda, suporte e condições comerciais são confirmados na proposta antes da contratação.' },
  { question: 'Como funciona o investimento?', answer: 'Depois de entender o contexto, apresentamos o escopo aplicável com etapas, responsabilidades, prazos e valores. A empresa decide o que contratar antes de qualquer execução.' },
]

function resolveCampaign() {
  if (typeof window === 'undefined') return ''
  const url = new URLSearchParams(window.location.search)
  const value = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].map((name) => {
    const raw = url.get(name) || ''
    // O termo interno "piloto" nao aparece na mensagem ao lead; o UTM original segue intacto no analytics.
    const shown = raw.replace(/[_-]?piloto/gi, '')
    return /^[a-z0-9_.-]{1,80}$/i.test(raw) ? name.slice(4) + '=' + shown : ''
  }).filter(Boolean)
  return value.length ? value.join(' | ') : ''
}

function useWhatsapp() {
  const [priority, setPriority] = useState('entender')
  const chosen = priorities.find((p) => p.id === priority) || priorities[3]
  const campaign = resolveCampaign()
  const message = [
    'Olá, William! Vim pela apresentação da Mentoria Estratégica Individual do Grupo WG Almeida.',
    'Minha prioridade é ' + chosen.message + '.',
    'Gostaria de conversar para entender os próximos passos.',
    campaign ? 'Origem da apresentação: ' + campaign + '.' : '',
  ].filter(Boolean).join(' ')
  const destination = COMPANY.ceoWhatsapp || COMPANY.whatsapp
  const href = destination + '?text=' + encodeURIComponent(message)
  const directMessage = [
    'Olá, William! Vim pela apresentação da Mentoria Estratégica Individual do Grupo WG Almeida.',
    'Gostaria de conversar para entender os próximos passos.',
    campaign ? 'Origem da apresentação: ' + campaign + '.' : '',
  ].filter(Boolean).join(' ')
  const directHref = destination + '?text=' + encodeURIComponent(directMessage)

  const onContact = (position) => {
    trackWhatsappClick({ context: 'mentoria_construcao_' + position, target: 'fundador' })
    trackCtaClick({ ctaId: 'mentoria_whatsapp_' + position, ctaLabel: 'Conversar sobre minha empresa', ctaContext: 'mentoria_construcao', ctaDestination: 'whatsapp' })
    trackEvent('mentoria_lead_intent', { context: 'mentoria_construcao', action: chosen.id, source: position })
  }
  const onPriority = (id) => {
    setPriority(id)
    trackEvent('mentoria_prioridade', { context: 'mentoria_construcao', action: id })
  }
  return { href, directHref, priority, onPriority, onContact }
}

function ContactLink({ children, href, onContact, position, className = '' }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => onContact(position)} className={'mcl-button mcl-button--orange ' + className}>
    {children}<ArrowUpRight size={19} strokeWidth={1.8} aria-hidden="true" />
  </a>
}

function FilmPlayer() {
  const [activated, setActivated] = useState(false)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef(null)
  const start = () => {
    setActivated(true)
    setPlaying(true)
    trackEvent('mentoria_video_start', { context: 'mentoria_construcao', action: 'play', source: 'apresentacao' })
  }
  useEffect(() => {
    if (!activated || !videoRef.current) return
    videoRef.current.play().catch(() => setPlaying(false))
  }, [activated])
  return (
    <div className="mcl-film" id="apresentacao">
      {!activated ? (
        <button type="button" onClick={start} aria-label="Reproduzir apresentação de William Almeida" className="mcl-film__cover">
          <img src={POSTER} alt="William Almeida apresenta a abordagem do Grupo WG Almeida" width="1280" height="720" loading="lazy" />
          <span className="mcl-film__veil" aria-hidden="true" />
          <span className="mcl-film__play"><Play size={28} fill="currentColor" aria-hidden="true" /></span>
          <span className="mcl-film__time">APRESENTAÇÃO COMPLETA · 2 MIN 26 S</span>
        </button>
      ) : (
        <video ref={videoRef} src={FILM} controls playsInline preload="metadata" poster={POSTER} aria-label="Vídeo de apresentação da mentoria do Grupo WG Almeida" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => {setPlaying(false); trackEvent('mentoria_video_complete', { context: 'mentoria_construcao', action: 'finished' })}}>
          <track kind="captions" src={ROOT + '/apresentacao-pt-BR.vtt'} srcLang="pt-BR" label="Português (Brasil)" default />
        </video>
      )}
      <span className="mcl-film__corner" aria-hidden="true">{activated ? (playing ? <Pause size={12}/> : <PlayCircle size={12}/>) : <PlayCircle size={12}/>} WG EM FOCO</span>
    </div>
  )
}

function SectionLabel({ children, inverse = false }) {
  return <div className={'mcl-section-label' + (inverse ? ' mcl-section-label--inverse' : '')}><span className="mcl-section-label__rule" />{children}</div>
}

export default function MentoriaConstrucaoLanding() {
  const { href, directHref, priority, onPriority, onContact } = useWhatsapp()
  const [mobileCtaVisible, setMobileCtaVisible] = useState(false)
  useNoindexBaseMeta()
  useEffect(() => {
    const observer = () => setMobileCtaVisible(window.scrollY > 350)
    window.addEventListener('scroll', observer, { passive: true })
    observer()
    return () => window.removeEventListener('scroll', observer)
  }, [])
  return (
    <>
      <Seo
        pathname="/mentoria-construcao"
        canonical={mentoriaLandingCanonical(typeof window === 'undefined' ? '' : window.location.hostname)}
        title="Mentoria Estratégica Individual para Empresas de Obras e Reformas | Grupo WG Almeida"
        description="Mentoria estratégica individual para obras e reformas: 8 encontros semanais de 90 minutos (12h ao vivo). Processos, gestão e IA aplicada; integrações conforme proposta."
        robots="noindex, nofollow"
        noindex
        og={{ image: 'https://wgalmeida.com.br/media/mentoria-construcao/apresentacao-capa.webp' }}
      />
      <div className="mcl" id="inicio">
        <a href="#conteudo" className="mcl-skip">Pular para o conteúdo</a>
        <header className="mcl-header">
          <div className="mcl-container mcl-header__inner">
            <a href="#inicio" className="mcl-brand" aria-label="Grupo WG Almeida: início da apresentação">
              <img src={LOGO} alt="" width="48" height="48" decoding="async" />
              <span><strong>GRUPO WG ALMEIDA</strong><small>CONSULTORIA & TRANSFORMAÇÃO</small></span>
            </a>
            <nav className="mcl-header__nav" aria-label="Navegação da página">
              <a href="#programa">Programa 8 semanas</a>
              <a href="#solucoes">O que entregamos</a>
              <a href="#ia-na-operacao">IA na prática</a>
              <a href="#duvidas">Dúvidas</a>
            </nav>
            <a href="#conversar" className="mcl-header__cta">Vamos conversar <ArrowUpRight size={16} aria-hidden="true" /></a>
          </div>
        </header>

        <main id="conteudo">
          <section className="mcl-hero" aria-labelledby="mcl-hero-title">
            <div className="mcl-container mcl-hero__grid">
              <div className="mcl-hero__copy">
                <SectionLabel>MENTORIA ESTRATÉGICA INDIVIDUAL · PROGRAMA DE 8 SEMANAS</SectionLabel>
                <h1 id="mcl-hero-title">Sua empresa não pode depender de você <em>para tudo.</em></h1>
                <p className="mcl-hero__lead">Oito encontros individuais para olhar a realidade da sua empresa, organizar prioridades e aprender a aplicar IA com método. Com a experiência operacional do Grupo WG Almeida desde 2011, trabalhamos estratégia, gestão e tecnologia sem prometer soluções prontas.</p>
                <div className="mcl-hero__actions">
                  <ContactLink href={href} onContact={onContact} position="hero">Conhecer a mentoria individual</ContactLink>
                  <a className="mcl-button mcl-button--text" href="#apresentacao"><PlayCircle size={19} aria-hidden="true"/> Ver apresentação <ArrowDown size={16} aria-hidden="true"/></a>
                </div>
                <div className="mcl-hero__cred">
                  <div><strong>DESDE 2011</strong><span>Experiência operacional</span></div>
                  <div><strong>8 SEMANAS</strong><span>8 encontros de 90 min</span></div>
                  <div><strong>IA APLICADA</strong><span>Com método e supervisão</span></div>
                </div>
              </div>
              <div className="mcl-hero__visual">
                <div className="mcl-hero__photo-frame">
                  <img src="/images/about/william-almeida-1200.webp" alt="Retrato institucional de William Almeida, fundador do Grupo WG Almeida" width="800" height="1000" fetchPriority="high" />
                  <div className="mcl-hero__picture-label"><span>WILLIAM ALMEIDA</span><strong>Fundador • Grupo WG Almeida</strong></div>
                </div>
                <span className="mcl-hero__side-note" aria-hidden="true">ESTRATÉGIA · OPERAÇÃO · TECNOLOGIA</span>
              </div>
            </div>
          </section>

          <section className="mcl-intro" aria-label="Nossa abordagem em uma frase">
            <div className="mcl-container mcl-intro__grid">
              <span>O QUE NOS MOVE</span>
              <p>Você conhece a obra. <strong>Nós ajudamos a estruturar a empresa por trás dela.</strong></p>
              <ArrowUpRight size={28} strokeWidth={1.3} aria-hidden="true"/>
            </div>
          </section>

          <section className="mcl-video-section" aria-labelledby="mcl-video-heading">
            <div className="mcl-container mcl-video-section__layout">
              <div className="mcl-video-section__copy">
                <SectionLabel inverse>CONHEÇA QUEM ESTÁ POR TRÁS</SectionLabel>
                <h2 id="mcl-video-heading">Da realidade do canteiro à transformação do negócio.</h2>
                <p>Antes de falar de mentoria, vale conhecer a nossa história. Assista à apresentação de William e entenda como podemos unir experiência real, estratégia e implementação.</p>
                <div className="mcl-video-section__tag">02:26 MIN <span /> UMA CONVERSA DIRETA</div>
              </div>
              <div className="mcl-video-section__media">
                <FilmPlayer />
                <div className="mcl-video-next">
                  <span>Gostou da apresentação? Conte-nos o que deseja melhorar na sua empresa.</span>
                  <a href="#conversar" onClick={() => trackCtaClick({ ctaId: 'mentoria_apos_video', ctaLabel: 'Conversar com William', ctaContext: 'mentoria_construcao', ctaDestination: 'formulario_whatsapp' })}>Conversar com William <ArrowUpRight size={16} aria-hidden="true"/></a>
                </div>
              </div>
            </div>
          </section>

          <section className="mcl-pain" aria-labelledby="mcl-pain-heading">
            <div className="mcl-container">
              <SectionLabel>O PROBLEMA NÃO É FALTA DE TRABALHO</SectionLabel>
              <div className="mcl-pain__top">
                <h2 id="mcl-pain-heading">Quando tudo passa por você, <em>o crescimento cobra um preço.</em></h2>
                <p>Mais obra, mais equipe e mais clientes podem ampliar os problemas quando atendimento, execução e controle não conversam entre si.</p>
              </div>
              <div className="mcl-pain__list">
                <article><span>01 / COMERCIAL</span><h3>Orçamento sem processo.</h3><p>Informações soltas, propostas demoradas e negociações que consomem o tempo de quem deveria liderar.</p></article>
                <article><span>02 / OPERAÇÃO</span><h3>Obra no improviso.</h3><p>Equipe, fornecedor, prazo e cliente dependendo de mensagens, memória e urgências todos os dias.</p></article>
                <article><span>03 / GESTÃO</span><h3>Decisões sem visão.</h3><p>Sem indicadores claros, fica difícil saber onde há margem, gargalo e oportunidade de melhorar.</p></article>
              </div>
            </div>
          </section>

          <section className="mcl-story" aria-labelledby="mcl-story-heading">
            <div className="mcl-story__image"><img src="/images/banners/foto-obra-3.jpg" alt="Imagem de obra utilizada na apresentação institucional do Grupo WG Almeida" width="900" height="960" loading="lazy" /></div>
            <div className="mcl-story__body">
              <div className="mcl-story__body-inner">
                <SectionLabel inverse>EXPERIÊNCIA QUE VEM DA EXECUÇÃO</SectionLabel>
                <h2 id="mcl-story-heading">Não aprendemos gestão apenas em uma sala de reunião.</h2>
                <p>O Grupo WG Almeida construiu sua trajetória desde 2011 na prática de projetos, clientes, fornecedores, equipes e obras. Arquitetura, engenharia e marcenaria evoluíram com a necessidade de organizar a execução e conectar decisões.</p>
                <p>Foi dessa experiência que também nasceu a WG/Build.tech: tecnologia criada para responder a desafios reais da operação.</p>
                <a href="/william-almeida" className="mcl-story__link">Conheça a trajetória do fundador <ArrowUpRight size={19} aria-hidden="true"/></a>
              </div>
            </div>
          </section>

          <section className="mcl-method" id="metodo" aria-labelledby="mcl-method-heading">
            <div className="mcl-container mcl-method__grid">
              <div className="mcl-method__sticky">
                <SectionLabel>COMO TRABALHAMOS</SectionLabel>
                <h2 id="mcl-method-heading">Antes de propor uma solução, precisamos entender <em>o seu negócio.</em></h2>
                <p>Sem diagnóstico, até a melhor ferramenta vira mais uma despesa. Nosso processo começa pelas prioridades e só depois define o que deve ser implementado.</p>
                <a href="#conversar" className="mcl-button mcl-button--outline">Falar sobre meu cenário <ArrowRight size={17} aria-hidden="true"/></a>
              </div>
              <div className="mcl-method__steps">
                {paths.map((item) => <article className="mcl-method__step" key={item.number}>
                  <div className="mcl-method__step-number">{item.number}</div>
                  <div><span>{item.label}</span><h3>{item.title}</h3><p>{item.text}</p></div>
                  <ArrowUpRight size={21} strokeWidth={1.3} aria-hidden="true" />
                </article>)}
              </div>
            </div>
          </section>

          <section className="mcl-pilot" id="programa" aria-labelledby="mcl-pilot-heading">
            <div className="mcl-container">
              <div className="mcl-pilot__intro">
                <div>
                  <SectionLabel>PROGRAMA DE 8 SEMANAS · MENTORIA INDIVIDUAL</SectionLabel>
                  <h2 id="mcl-pilot-heading">Oito semanas para colocar <em>o negócio no centro das decisões.</em></h2>
                </div>
                <div className="mcl-pilot__summary">
                  <strong>8 ENCONTROS DE 90 MIN · 12H AO VIVO</strong>
                  <p>Um encontro individual de 90 minutos por semana, durante oito semanas, com orientação de William Almeida e atividades práticas entre etapas. O conteúdo é adaptado à realidade de cada empresa.</p>
                </div>
              </div>
              <div className="mcl-pilot__weeks">
                {pilotWeeks.map((item) => <article className="mcl-pilot__week" key={item.week}>
                  <span>SEMANA {item.week}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>)}
              </div>
              <div className="mcl-pilot__bottom">
                <p>O programa soma 12 horas de encontros individuais, com exercícios supervisionados. Desenvolvimento de agentes, APIs, implantação de CRM ou sistemas são avaliados e orçados separadamente. Agenda, suporte e investimento são confirmados na proposta.</p>
                <a href="#conversar" onClick={() => onPriority('mentoria')} className="mcl-button mcl-button--outline">Quero conhecer a mentoria individual <ArrowRight size={17} aria-hidden="true"/></a>
              </div>
            </div>
          </section>

          <section className="mcl-offer" id="solucoes" aria-labelledby="mcl-offer-heading">
            <div className="mcl-container">
              <div className="mcl-offer__intro">
                <div><SectionLabel inverse>O QUE PODEMOS TRABALHAR</SectionLabel><h2 id="mcl-offer-heading">Mentoria para sua realidade. <em>Tecnologia com critério.</em></h2></div>
                <p>Organização da operação, melhoria comercial e aplicação de IA fazem parte da jornada de aprendizagem. Desenvolvimento e implantação de tecnologia são projetos distintos, sujeitos a viabilidade e proposta.</p>
              </div>
              <div className="mcl-offer__blocks">
                {areas.map((item, index) => <article className={'mcl-offer__block mcl-offer__block--'+index} key={item.number}>
                  <div className="mcl-offer__counter">{item.number} / 03 <span>{item.eyebrow}</span></div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <ul>{item.details.map((d) => <li key={d}><Check size={16} strokeWidth={2} aria-hidden="true"/>{d}</li>)}</ul>
                </article>)}
              </div>
              <p className="mcl-offer__disclosure">O programa individual prevê oito encontros de 90 minutos, um por semana, totalizando 12 horas ao vivo. Suporte, agenda e investimento serão confirmados antes da contratação. Desenvolvimento, implantação e integrações são orçados separadamente.</p>
              <a className="mcl-offer__preview-link" href={mentoriaApproachesPath(typeof window === 'undefined' ? '' : window.location.hostname)}>Explore os temas que podemos aprofundar na mentoria <ArrowUpRight size={17} aria-hidden="true"/></a>
            </div>
          </section>

          <section className="mcl-ai" id="ia-na-operacao" aria-labelledby="mcl-ai-heading">
            <div className="mcl-container">
              <div className="mcl-ai__intro">
                <div>
                  <SectionLabel>IA APLICADA À CONSTRUÇÃO E ÀS REFORMAS</SectionLabel>
                  <h2 id="mcl-ai-heading">Aprenda a usar IA. Depois, faça a tecnologia trabalhar <em>com a sua operação.</em></h2>
                </div>
                <p>Da primeira conversa com o cliente ao acompanhamento da obra, mostramos como utilizar e configurar ferramentas de inteligência artificial para tarefas reais. A conexão com sistemas, dados e rotinas é avaliada conforme a estrutura, os acessos e o escopo de cada empresa.</p>
              </div>
              <div className="mcl-ai__cards">
                <article>
                  <span>01 / APRENDER</span>
                  <h3>Usar com método.</h3>
                  <p>Aprenda a dar contexto à IA, estruturar pedidos, conferir respostas e preparar materiais de atendimento, propostas e gestão sem depender de respostas genéricas.</p>
                </article>
                <article>
                  <span>02 / CONFIGURAR</span>
                  <h3>Adaptar ao seu processo.</h3>
                  <p>Organize instruções, modelos de documento e bases de conhecimento aprovadas para orientar assistentes nas rotinas da sua equipe.</p>
                </article>
                <article>
                  <span>03 / CONECTAR</span>
                  <h3>Integrar com controle.</h3>
                  <p>Avalie automações e agentes que consultem informações autorizadas do CRM ou sistema de gestão e preparem ações para aprovação humana.</p>
                </article>
              </div>
              <div className="mcl-ai__example">
                <div className="mcl-ai__example-copy">
                  <strong>EXEMPLO DE APLICAÇÃO</strong>
                  <h3>Da mensagem do cliente à proposta organizada.</h3>
                  <p>Um fluxo orientado por IA pode ajudar a estruturar as informações recebidas e preparar o trabalho comercial. Preços, compromissos e envios continuam sob responsabilidade de pessoas autorizadas.</p>
                </div>
                <ol aria-label="Etapas ilustrativas de um fluxo com IA">
                  <li><span>01</span> Receber e organizar o briefing.</li>
                  <li><span>02</span> Consultar informações e modelos autorizados.</li>
                  <li><span>03</span> Preparar o rascunho da proposta.</li>
                  <li><span>04</span> Revisar, aprovar e registrar no sistema.</li>
                </ol>
              </div>
              <div className="mcl-ai__bottom">
                <p>A capacitação em IA pode compor a mentoria. Integrações, agentes, APIs e desenvolvimento técnico dependem de análise de viabilidade e de proposta aprovada; nenhuma ferramenta substitui decisões profissionais ou a proteção dos dados.</p>
                <a href="#conversar" onClick={() => onPriority('ia')} className="mcl-button mcl-button--outline">Quero aplicar IA na empresa <ArrowRight size={17} aria-hidden="true"/></a>
              </div>
            </div>
          </section>

          <section className="mcl-fit" aria-labelledby="mcl-fit-heading">
            <div className="mcl-container mcl-fit__grid">
              <div className="mcl-fit__copy">
                <SectionLabel>PARA QUEM FAZ SENTIDO</SectionLabel>
                <h2 id="mcl-fit-heading">Para quem quer sair do modo emergência e assumir o comando.</h2>
                <p>Empreiteiros, gestores de empresas de reforma, profissionais autônomos com equipe e empresários da construção que desejam estruturar seu próximo estágio com método e responsabilidade.</p>
                <a href="#conversar" className="mcl-fit__text-link">Quero avaliar minha empresa <ArrowUpRight size={18} aria-hidden="true"/></a>
              </div>
              <div className="mcl-fit__image"><img src="/images/banners/foto-obra-6.jpg" alt="Detalhe de obra ilustrando a atividade de construção e reformas" loading="lazy" width="900" height="650"/></div>
            </div>
          </section>

          <section className="mcl-evidence" aria-labelledby="mcl-evidence-heading">
            <div className="mcl-container mcl-evidence__layout">
              <div className="mcl-evidence__heading">
                <SectionLabel>POR QUE NOSSA EXPERIÊNCIA IMPORTA</SectionLabel>
                <h2 id="mcl-evidence-heading">Antes de orientar, vivemos <em>a operação.</em></h2>
                <p>Nossa abordagem nasce dos desafios que existem entre o primeiro atendimento e a entrega de uma obra. A experiência do Grupo desde 2011 ajuda a fundamentar diagnósticos e decisões, sem prometer resultados iguais para todas as empresas.</p>
              </div>
              <div className="mcl-evidence__proofs" aria-label="Áreas de experiência operacional">
                <article><span>01 / ATENDIMENTO</span><h3>Da conversa à proposta.</h3><p>Organização das informações, definição do escopo e comunicação comercial.</p></article>
                <article><span>02 / EXECUÇÃO</span><h3>Da equipe ao canteiro.</h3><p>Coordenação de etapas, fornecedores, responsabilidades e acompanhamento.</p></article>
                <article><span>03 / TECNOLOGIA</span><h3>Do processo ao controle.</h3><p>Estruturação de rotinas, informações e ferramentas com a WG/Build.tech, conforme necessidade.</p></article>
              </div>
            </div>
          </section>

          <section className="mcl-gallery" aria-labelledby="mcl-gallery-heading">
            <div className="mcl-container">
              <div className="mcl-gallery__intro">
                <div>
                  <SectionLabel>ACOMPANHE O GRUPO WG ALMEIDA</SectionLabel>
                  <h2 id="mcl-gallery-heading">Obras, marcenaria <em>e projetos.</em></h2>
                </div>
                <p>Essas frentes fazem parte do universo de atuação do Grupo WG Almeida. Acompanhe os registros e bastidores da nossa equipe no Instagram.</p>
              </div>
              <div className="mcl-gallery__grid">
                <figure><img src="/media/mentoria-construcao/galeria-preview/obra-instagram-vertical.webp" alt="Imagem digital ilustrativa de uma construção em andamento" loading="lazy" width="900" height="1600"/><figcaption>Obras</figcaption></figure>
                <figure><img src="/media/mentoria-construcao/galeria-preview/marcenaria-instagram-vertical.webp" alt="Imagem digital ilustrativa de cozinha planejada e marcenaria contemporânea" loading="lazy" width="900" height="1600"/><figcaption>Marcenaria</figcaption></figure>
                <figure><img src="/media/mentoria-construcao/galeria-preview/projetos-instagram-vertical.webp" alt="Imagem digital ilustrativa de residência contemporânea concluída" loading="lazy" width="900" height="1600"/><figcaption>Projetos</figcaption></figure>
              </div>
              <div className="mcl-gallery__bottom">
                
                <a href={COMPANY.instagram} target="_blank" rel="noopener noreferrer" className="mcl-button mcl-button--outline" onClick={() => trackCtaClick({ ctaId: 'mentoria_instagram', ctaLabel: 'Conhecer Instagram do Grupo', ctaContext: 'mentoria_construcao', ctaDestination: 'instagram' })}>Conhecer nosso Instagram <ArrowUpRight size={18} aria-hidden="true"/></a>
              </div>
            </div>
          </section>

          <section className="mcl-convert" id="conversar" aria-labelledby="mcl-convert-heading">
            <div className="mcl-container mcl-convert__grid">
              <div className="mcl-convert__heading">
                <SectionLabel inverse>SEU PRÓXIMO PASSO</SectionLabel>
                <h2 id="mcl-convert-heading">Vamos conversar sobre a mentoria individual.</h2>
                <p>Conte seu principal desafio e entenda se o programa de oito semanas faz sentido para sua operação. Agenda, condições e disponibilidade são confirmadas antes de qualquer contratação.</p>
                <div className="mcl-convert__note"><MessageCircle size={19} aria-hidden="true"/> Conversa inicial via WhatsApp. Sem compromisso de contratação.</div>
              </div>
              <div className="mcl-convert__panel">
                <h3>Qual é a sua prioridade hoje?</h3>
                <p>Selecione uma opção para começar a conversa com contexto.</p>
                <div className="mcl-convert__choices" role="group" aria-label="Principal prioridade da empresa">
                  {priorities.map((item) => <button type="button" key={item.id} aria-pressed={priority === item.id} onClick={() => onPriority(item.id)} className={'mcl-convert__choice'+(priority === item.id?' mcl-convert__choice--active':'')}>
                    <span className="mcl-convert__radio" aria-hidden="true">{priority === item.id && <Check size={12} strokeWidth={3}/>}</span>{item.short}
                  </button>)}
                </div>
                <ContactLink href={href} onContact={onContact} position="qualificacao" className="mcl-convert__submit">Iniciar conversa no WhatsApp</ContactLink>
                <p className="mcl-convert__direct">Prefere não escolher uma opção? <a href={directHref} target="_blank" rel="noopener noreferrer" onClick={() => onContact('qualificacao_direto')}>Chamar direto no WhatsApp <ArrowUpRight size={14} aria-hidden="true"/></a></p>
                <p className="mcl-convert__hint">Você será direcionado ao WhatsApp com uma mensagem pronta. Nenhum dado é enviado por este formulário.</p>
              </div>
            </div>
          </section>

          <section className="mcl-faq" id="duvidas" aria-labelledby="mcl-faq-heading">
            <div className="mcl-container mcl-faq__grid">
              <div><SectionLabel>PERGUNTAS FREQUENTES</SectionLabel><h2 id="mcl-faq-heading">O que você precisa saber antes de começar.</h2><p>Clareza no processo, nas entregas e no investimento faz parte da nossa forma de trabalhar.</p></div>
              <div className="mcl-faq__questions">
                {faqs.map((item) => <details key={item.question}><summary>{item.question}<ChevronDown size={19} aria-hidden="true"/></summary><p>{item.answer}</p></details>)}
              </div>
            </div>
          </section>
        </main>

        <footer className="mcl-footer">
          <div className="mcl-container mcl-footer__row">
            <div className="mcl-footer__identity"><img src={LOGO} alt="" width="48" height="48"/><span><strong>GRUPO WG ALMEIDA</strong><small>Experiência de operação conectada à tecnologia.</small></span></div>
            <div className="mcl-footer__links"><a href="/privacidade">Privacidade</a><a href="https://wgalmeida.com.br" target="_blank" rel="noopener noreferrer">Site institucional <ArrowUpRight size={13} aria-hidden="true"/></a></div>
          </div>
          <div className="mcl-container mcl-footer__bottom"><span>© {new Date().getFullYear()} Grupo WG Almeida. Todos os direitos reservados.</span><span>WG Arquitetura · WG Engenharia · WG Marcenaria · WG/Build.tech</span></div>
        </footer>
        {mobileCtaVisible && <div className="mcl-mobile-cta"><ContactLink href={href} onContact={onContact} position="mobile_fixo">Conversar sobre minha empresa</ContactLink></div>}
      </div>
    </>
  )
}
