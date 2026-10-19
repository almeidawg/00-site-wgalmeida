import { useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, CheckCircle2, HelpCircle, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import Seo from '@/components/SEO'
import { mentoriaContactCanonical, mentoriaLandingPath, mentoriaApproachesPath } from '@/lib/mentoriaDomain'
import { trackCtaClick, trackFormSubmit } from '@/lib/analytics'
import { validateMentoriaInterest } from '@/lib/mentoriaInterestContract'
import './mentoria-contato.css'

const LOGO = '/media/mentoria-construcao/logo-grupo-wg-almeida.png'
const PRIORITIES = [
  { id: 'operacao', label: 'Organizar operação, equipe e obras' },
  { id: 'comercial', label: 'Atendimento, propostas e captação de clientes' },
  { id: 'sistema', label: 'Sistema de gestão e indicadores' },
  { id: 'ia', label: 'Aplicar IA à realidade da empresa' },
  { id: 'mentoria', label: 'Entender o programa individual de 8 semanas' },
  { id: 'entender', label: 'Identificar meus principais gargalos' },
]
const SEGMENTS = ['Construtora / execução de obras', 'Reformas e manutenção', 'Arquitetura / engenharia', 'Marcenaria', 'Instalações / serviços técnicos', 'Outro segmento da construção']
const DEFAULT = { name: '', company: '', email: '', phone: '', role: '', segment: '', priority: 'entender', challenge: '', consent: false, website: '' }

function getInitialPriority(value) {
  return PRIORITIES.some((entry) => entry.id === value) ? value : DEFAULT.priority
}

function makeLabPayload(data, searchParams) {
  return {
    context: 'mentoria_construcao',
    program: 'individual_8_weeks_8x90_minutes',
    name: data.name.trim(),
    company: data.company.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.replace(/\D/g, ''),
    role: data.role.trim(),
    segment: data.segment,
    priority: data.priority,
    challenge: data.challenge.trim(),
    privacyConsent: true,
    website: data.website,
    utm_source: (searchParams.get('utm_source') || '').slice(0, 80),
    utm_medium: (searchParams.get('utm_medium') || '').slice(0, 80),
    utm_campaign: (searchParams.get('utm_campaign') || '').slice(0, 80),
  }
}

export default function MentoriaContato() {
  const [searchParams] = useSearchParams()
  const initialPriority = getInitialPriority(searchParams.get('prioridade'))
  const [form, setForm] = useState(() => ({ ...DEFAULT, priority: initialPriority }))
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const host = typeof window === 'undefined' ? '' : window.location.hostname
  const landingPath = mentoriaLandingPath(host)
  const approachesPath = mentoriaApproachesPath(host)
  const canSubmitInLab = typeof window !== 'undefined' && window.__MENTORIA_LAB__ === true
  const setField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }))
    if (status.state !== 'idle') setStatus({ state: 'idle', message: '' })
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (status.state === 'sending') return
    if (form.website) return
    if (!form.consent) {
      setStatus({ state: 'error', message: 'Leia e aceite a autorização de contato para continuar.' })
      return
    }
    const phoneDigits = form.phone.replace(/\D/g, '')
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      setStatus({ state: 'error', message: 'Informe um WhatsApp válido, com DDD.' })
      return
    }
    if (!canSubmitInLab) {
      setStatus({ state: 'unavailable', message: 'Este formulário ainda está em homologação. O recebimento de solicitações será ativado após as validações de privacidade, segurança e integração.' })
      return
    }
    const payload = makeLabPayload(form, searchParams)
    if (!validateMentoriaInterest(payload).ok) {
      setStatus({ state: 'error', message: 'Revise os campos e os parâmetros da solicitação antes de testar o envio.' })
      return
    }
    setStatus({ state: 'sending', message: 'Validando o formulário em ambiente de teste…' })
    try {
      // Contrato isolado. Não reutiliza /api/contact nem grava no CRM institucional.
      // O servidor local só retorna resposta sintética; um backend real requer release separado.
      const response = await fetch('/api/mentoria-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || result.simulated !== true) throw new Error('O ambiente de testes não confirmou o recebimento simulado. Nenhum cadastro foi realizado.')
      setStatus({ state: 'success', message: 'Formulário validado no laboratório. Nenhum dado real foi registrado ou enviado ao WhatsApp.' })
      trackFormSubmit({ formId: 'mentoria_interesse_laboratorio', status: 'simulated', context: 'mentoria_construcao' })
    } catch (error) {
      setStatus({ state: 'error', message: error.message || 'Não foi possível validar o formulário neste momento.' })
      trackFormSubmit({ formId: 'mentoria_interesse_laboratorio', status: 'error', context: 'mentoria_construcao' })
    }
  }

  return (
    <>
      <Seo
        pathname="/mentoria-construcao/contato"
        canonical={mentoriaContactCanonical(host)}
        title="Converse sobre a Mentoria Construção | Grupo WG Almeida"
        description="Conte o cenário da sua empresa de obras e reformas e sua principal prioridade. Formulário exclusivo de diagnóstico inicial para a Mentoria Estratégica Individual."
        robots="noindex, nofollow"
        noindex
        og={{ image: 'https://wgalmeida.com.br/media/mentoria-construcao/apresentacao-capa.webp' }}
      />
      <div className="mcf">
        <a className="mcf-skip" href="#formulario-mentoria">Ir ao formulário da mentoria</a>
        <header className="mcf-header">
          <div className="mcf-shell mcf-header__inner">
            <Link to={landingPath} className="mcf-identity" aria-label="Voltar para Mentoria Construção">
              <img src={LOGO} alt="" width="42" height="42" />
              <span><strong>GRUPO WG ALMEIDA</strong><small>MENTORIA CONSTRUÇÃO</small></span>
            </Link>
            <Link to={landingPath} className="mcf-header__back"><ArrowLeft size={17} aria-hidden="true" /> Voltar à apresentação</Link>
          </div>
        </header>
        <main id="conteudo" className="mcf-main">
          <div className="mcf-shell mcf-layout">
            <section className="mcf-intro" aria-labelledby="mcf-title">
              <p className="mcf-eyebrow"><span aria-hidden="true" /> MENTORIA ESTRATÉGICA INDIVIDUAL</p>
              <h1 id="mcf-title">Sua empresa tem desafios únicos. <em>Comecemos por eles.</em></h1>
              <p className="mcf-lead">Antes de falar em ferramentas, precisamos entender o seu negócio. Este formulário é exclusivo da Mentoria Construção e prepara uma primeira conversa sobre prioridades, processos e oportunidades de evolução.</p>
              <div className="mcf-steps" aria-label="Etapas de aproximação">
                <article><span>01</span><div><strong>Conte sua realidade</strong><p>Preencha os dados principais e indique o que deseja melhorar.</p></div></article>
                <article><span>02</span><div><strong>Alinhamos o próximo passo</strong><p>Após a ativação do atendimento, avaliamos o cenário e a disponibilidade para conversar.</p></div></article>
                <article><span>03</span><div><strong>Construímos um plano possível</strong><p>O programa individual prevê oito encontros de 90 minutos, com escopo e investimento definidos em proposta.</p></div></article>
              </div>
              <div className="mcf-facts">
                <div><strong>8 SEMANAS</strong><span>8 encontros individuais</span></div>
                <div><strong>12 HORAS</strong><span>Orientação ao vivo</span></div>
                <div><strong>SEM PROMESSAS PRONTAS</strong><span>Diagnóstico antes da proposta</span></div>
              </div>
              <Link to={approachesPath} className="mcf-topics-link" onClick={() => trackCtaClick({ ctaId: 'mentoria_form_abordagens', ctaLabel: 'Explorar temas', ctaContext: 'mentoria_construcao', ctaDestination: 'abordagens' })}>
                Ainda não sabe por onde começar? Explore nossos temas <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </section>
            <section className="mcf-card" id="formulario-mentoria" aria-labelledby="mcf-form-title">
              <div className="mcf-card__top">
                <div className="mcf-card__icon"><Building2 size={22} aria-hidden="true" /></div>
                <div><span>FORMULÁRIO EXCLUSIVO</span><h2 id="mcf-form-title">Vamos conhecer sua empresa.</h2></div>
              </div>
              <p className="mcf-card__description">Conte o essencial. Você não precisa enviar contratos, valores financeiros nem documentos confidenciais.</p>
              <div className="mcf-lab-notice"><LockKeyhole size={18} aria-hidden="true" /><span>{canSubmitInLab ? 'Modo laboratório: envios simulados, sem cadastro real.' : 'Pré-lançamento: recebimento desativado até a homologação do atendimento.'}</span></div>
              {status.state === 'success' ? (
                <div className="mcf-success" role="status">
                  <CheckCircle2 size={34} aria-hidden="true" />
                  <h3>Validação concluída</h3>
                  <p>{status.message}</p>
                  <button type="button" onClick={() => { setForm({ ...DEFAULT, priority: initialPriority }); setStatus({ state: 'idle', message: '' }) }}>Testar outro preenchimento</button>
                  <Link to={landingPath}>Voltar à mentoria</Link>
                </div>
              ) : (
                <form className="mcf-form" onSubmit={onSubmit} aria-describedby="mcf-required">
                  <p id="mcf-required" className="mcf-required">Os campos com * são obrigatórios.</p>
                  <div className="mcf-fields-row">
                    <label htmlFor="mcf-name">Seu nome *</label>
                    <input id="mcf-name" name="name" autoComplete="name" maxLength={120} required placeholder="Como podemos chamar você?" value={form.name} onChange={(e) => setField('name', e.target.value)} />
                  </div>
                  <div className="mcf-fields-row">
                    <label htmlFor="mcf-company">Nome da empresa *</label>
                    <input id="mcf-company" name="company" autoComplete="organization" maxLength={120} required placeholder="Como sua empresa se chama?" value={form.company} onChange={(e) => setField('company', e.target.value)} />
                  </div>
                  <div className="mcf-fields-grid">
                    <div className="mcf-fields-row">
                      <label htmlFor="mcf-email">E-mail profissional *</label>
                      <input id="mcf-email" name="email" autoComplete="email" type="email" maxLength={180} required placeholder="voce@empresa.com.br" value={form.email} onChange={(e) => setField('email', e.target.value)} />
                    </div>
                    <div className="mcf-fields-row">
                      <label htmlFor="mcf-phone">WhatsApp com DDD *</label>
                      <input id="mcf-phone" name="phone" autoComplete="tel" type="tel" inputMode="tel" maxLength={22} required placeholder="(11) 99999-9999" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                    </div>
                  </div>
                  <div className="mcf-fields-grid">
                    <div className="mcf-fields-row">
                      <label htmlFor="mcf-role">Sua função na empresa</label>
                      <input id="mcf-role" name="role" autoComplete="organization-title" maxLength={90} placeholder="Ex.: proprietário ou gestor" value={form.role} onChange={(e) => setField('role', e.target.value)} />
                    </div>
                    <div className="mcf-fields-row">
                      <label htmlFor="mcf-segment">Área de atuação *</label>
                      <select id="mcf-segment" name="segment" required value={form.segment} onChange={(e) => setField('segment', e.target.value)}>
                        <option value="">Selecione seu segmento</option>
                        {SEGMENTS.map((segment) => <option key={segment} value={segment}>{segment}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mcf-fields-row">
                    <label htmlFor="mcf-priority">Qual é sua prioridade hoje? *</label>
                    <select id="mcf-priority" name="priority" required value={form.priority} onChange={(e) => setField('priority', e.target.value)}>
                      {PRIORITIES.map((priority) => <option key={priority.id} value={priority.id}>{priority.label}</option>)}
                    </select>
                  </div>
                  <div className="mcf-fields-row">
                    <label htmlFor="mcf-challenge">Conte um pouco do principal desafio *</label>
                    <textarea id="mcf-challenge" name="challenge" rows={4} minLength={15} maxLength={1200} required placeholder="Ex.: hoje centralizo os atendimentos, orçamentos e andamento das obras. Quero organizar minha operação." value={form.challenge} onChange={(e) => setField('challenge', e.target.value)} />
                    <small>Escreva apenas o necessário para iniciarmos a conversa. Não inclua dados sensíveis de clientes.</small>
                  </div>
                  <div className="mcf-honeypot" aria-hidden="true"><label htmlFor="mcf-website">Deixe este campo em branco</label><input tabIndex={-1} autoComplete="off" id="mcf-website" name="website" value={form.website} onChange={(e) => setField('website', e.target.value)} /></div>
                  <label className="mcf-consent" htmlFor="mcf-consent">
                    <input id="mcf-consent" name="consent" type="checkbox" required checked={form.consent} onChange={(e) => setField('consent', e.target.checked)} />
                    <span>Li a <a href="https://wgalmeida.com.br/privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade <ArrowUpRight size={13} aria-hidden="true" /></a> e autorizo o contato do Grupo WG Almeida exclusivamente sobre esta solicitação. *</span>
                  </label>
                  {status.state === 'error' || status.state === 'unavailable' ? <p className="mcf-error" role="alert">{status.message}</p> : null}
                  <button className="mcf-submit" type="submit" disabled={status.state === 'sending'}>
                    {status.state === 'sending' ? 'Validando…' : canSubmitInLab ? 'Testar envio do formulário' : 'Solicitar conversa inicial'}
                    <ArrowRight size={19} aria-hidden="true" />
                  </button>
                  <p className="mcf-assurance"><ShieldCheck size={17} aria-hidden="true" /> Sem pagamento, agendamento ou contratação nesta etapa.</p>
                </form>
              )}
            </section>
          </div>
          <div className="mcf-shell mcf-below">
            <HelpCircle size={20} aria-hidden="true" />
            <p>A mentoria é um programa individual com oito encontros ao longo de oito semanas. Sistemas, integrações, agentes e implantação são avaliados e contratados separadamente. O envio neste ambiente não cria compromisso comercial.</p>
          </div>
        </main>
        <footer className="mcf-footer"><div className="mcf-shell"><span>© {new Date().getFullYear()} Grupo WG Almeida · Mentoria Construção</span><Link to={landingPath}><ArrowLeft size={15} aria-hidden="true" /> Voltar à apresentação</Link></div></footer>
      </div>
    </>
  )
}
