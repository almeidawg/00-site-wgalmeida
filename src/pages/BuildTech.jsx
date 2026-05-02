import React, { useEffect, useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { motion } from '@/lib/motion-lite';
import {
  ArrowRight,
  BarChart,
  Bot,
  CheckCircle2,
  Cpu,
  LayoutDashboard,
  Rocket,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ResponsiveWebpImage from '@/components/ResponsiveWebpImage';
import { getPublicPageImageSrc } from '@/data/publicPageImageCatalog';
import { SCHEMAS } from '@/data/schemaConfig';
import { COMPANY, PRODUCT_URLS } from '@/data/company';
import { trackCtaClick, trackDemoInteraction, trackWhatsappClick } from '@/lib/analytics';

const fadeInUp = {
  initial: { opacity: 0, y: 34 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
};

const BUILDTECH_HERO_IMAGE = getPublicPageImageSrc('buildtech', '/images/banners/PROCESSOS.webp');
const BUILDTECH_HERO_SRCSET = [
  '/images/banners/PROCESSOS-640.webp 640w',
  '/images/banners/PROCESSOS-960.webp 960w',
  '/images/banners/PROCESSOS.webp 1200w',
].join(', ');

const methodSteps = [
  {
    letter: 'S',
    title: 'Situar',
    text: 'Entendemos contexto, cliente, oferta, gargalo comercial e operacao antes de prometer tecnologia.',
  },
  {
    letter: 'T',
    title: 'Traduzir',
    text: 'Transformamos necessidade em jornada, modulos, dados, agentes e criterios claros de aprovacao.',
  },
  {
    letter: 'A',
    title: 'Acionar',
    text: 'Ativamos biblioteca WG, automacoes, integrações e agentes especializados por bloco de entrega.',
  },
  {
    letter: 'R',
    title: 'Rastrear',
    text: 'Cada entrega sai com evidencias, metricas, logs, proximo passo e caminho simples de evolucao.',
  },
];

const agents = [
  {
    icon: Users,
    title: 'Estratégia e oferta',
    text: 'Enquadra posicionamento, promessa, copy, jornada de compra e critérios de aprovação.',
  },
  {
    icon: LayoutDashboard,
    title: 'UX e vitrine funcional',
    text: 'Monta telas reais, estados de escolha, demonstrações e fluxo que o cliente entende sem reunião longa.',
  },
  {
    icon: Bot,
    title: 'Liz e automação',
    text: 'Conecta atendimento, WhatsApp, follow-up, tarefas e sinal operacional vivo do produto.',
  },
  {
    icon: BarChart,
    title: 'Dados e conversão',
    text: 'Organiza leads, eventos, métricas, painéis e leitura do que precisa melhorar depois do go-live.',
  },
];

const modules = [
  {
    id: 'site-vitrine',
    icon: Rocket,
    title: 'Site vitrine de alta conversão',
    tag: 'Entrada comercial',
    effort: 3,
    text: 'Home, rotas comerciais, SEO base, CTAs e narrativa alinhada ao público certo.',
  },
  {
    id: 'diagnostico',
    icon: CheckCircle2,
    title: 'Diagnóstico guiado',
    tag: 'Pré-venda',
    effort: 2,
    text: 'Fluxo para entender objetivo, maturidade, urgência, orçamento e melhor próximo passo.',
  },
  {
    id: 'crm',
    icon: LayoutDashboard,
    title: 'CRM e pipeline',
    tag: 'Operação',
    effort: 4,
    text: 'Captação, origem, prioridade, responsáveis, status e histórico de relacionamento.',
  },
  {
    id: 'whatsapp',
    icon: Bot,
    title: 'Agente WhatsApp',
    tag: 'Atendimento',
    effort: 4,
    text: 'Qualificação, respostas, handoff humano, follow-up e rastreabilidade por etapa.',
  },
  {
    id: 'dashboard',
    icon: BarChart,
    title: 'Dashboard executivo',
    tag: 'Gestão',
    effort: 3,
    text: 'Indicadores de funil, SLA, propostas, tarefas e gargalos para decisão diária.',
  },
  {
    id: 'integracoes',
    icon: Cpu,
    title: 'Integrações e automações',
    tag: 'Backoffice',
    effort: 5,
    text: 'Conexões com formulários, planilhas, APIs, e-mail, Supabase, Vercel e serviços externos.',
  },
];

const showcases = [
  {
    id: 'briefing',
    title: 'Briefing vivo',
    metric: '4 etapas',
    text: 'Da intenção inicial ao escopo priorizado com perguntas objetivas, contexto e critérios de decisão.',
  },
  {
    id: 'proposta',
    title: 'Proposta modular',
    metric: 'cesta ativa',
    text: 'O cliente escolhe módulos e visualiza uma composição clara antes da reunião comercial.',
  },
  {
    id: 'operacao',
    title: 'Operação assistida',
    metric: 'trace por ação',
    text: 'Atendimento, tarefas, CRM e indicadores ficam conectados para não depender de memória solta.',
  },
];

const cases = [
  {
    title: 'UMAUMA',
    type: 'Food service digital',
    text: 'Modelo de proposta modular com pitch, requisitos, demo, diagnóstico e landing comercial.',
  },
  {
    title: 'ObraEasy',
    type: 'SaaS operacional',
    text: 'Gestão de obra, parceiros, leads, financeiro e controle por etapas reais da operação.',
  },
  {
    title: 'Liz WhatsApp',
    type: 'Agente operacional',
    text: 'Atendimento assistido com contexto, comandos owner, integrações e rastreabilidade por trace.',
  },
];

function formatCurrency(value) {
  return Math.round(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

const BuildTech = () => {
  const location = useLocation();
  const [selectedModuleIds, setSelectedModuleIds] = useState([
    'site-vitrine',
    'diagnostico',
    'whatsapp',
  ]);
  const [proposalArea, setProposalArea] = useState(120);
  const [proposalComplexity, setProposalComplexity] = useState(2);
  const [activeShowcaseId, setActiveShowcaseId] = useState('briefing');

  useEffect(() => {
    const targetByPath = {
      '/buildtech/solucoes.html': 'solucoes',
      '/buildtech/metodo.html': 'metodo',
      '/buildtech/cases.html': 'cases',
      '/buildtech/blog.html': 'cesta',
    };
    const targetId = targetByPath[location.pathname];
    if (!targetId) return undefined;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname]);

  const selectedModules = useMemo(
    () => modules.filter((module) => selectedModuleIds.includes(module.id)),
    [selectedModuleIds],
  );

  const proposalEstimate = useMemo(() => {
    const effort = selectedModules.reduce((total, module) => total + module.effort, 0);
    const complexity = [1, 1.22, 1.48][Math.max(0, Math.min(2, proposalComplexity - 1))];
    const base = 4200 + Number(proposalArea || 0) * 64 + effort * 1280;
    return formatCurrency(base * complexity);
  }, [proposalArea, proposalComplexity, selectedModules]);

  const activeShowcase = showcases.find((item) => item.id === activeShowcaseId) || showcases[0];

  const toggleModule = (id) => {
    setSelectedModuleIds((current) => {
      if (current.includes(id)) {
        return current.length > 1 ? current.filter((item) => item !== id) : current;
      }
      return [...current, id];
    });
    trackDemoInteraction({ demoId: 'buildtech_module_basket', action: `toggle_${id}` });
  };

  const selectedLabel = selectedModules.map((module) => module.title).join(', ');
  const whatsappMessage = `Quero montar um projeto WG_Build.tech com estes módulos: ${selectedLabel}`;

  return (
    <>
      <SEO
        pathname="/buildtech"
        title="WG_Build.tech | Sites, sistemas e automação com IA"
        description="WG_Build.tech cria sites, sistemas, agentes e automações a partir da metodologia S T A R, biblioteca WG e vitrine funcional para aprovação."
        schema={[
          SCHEMAS.knowledgeGraph,
          SCHEMAS.softwareBuildTech,
          SCHEMAS.softwareMoodboard,
          SCHEMAS.softwareRoomVisualizer,
          SCHEMAS.breadcrumbBuildTech,
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Módulos WG_Build.tech',
            itemListElement: modules.map((module, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: module.title,
              description: module.text,
              url: `${PRODUCT_URLS.buildtech}/#cesta`,
            })),
          },
          SCHEMAS.faq([
            {
              question: 'O que é a WG_Build.tech?',
              answer: 'A WG_Build.tech é a frente do Grupo WG Almeida para sites, sistemas, agentes, automação e inteligência operacional aplicada a projetos digitais.',
            },
            {
              question: 'Como funciona a metodologia S T A R?',
              answer: 'A metodologia S T A R situa o contexto, traduz a demanda em módulos, aciona agentes e biblioteca WG, e rastreia entregas com evidências.',
            },
          ]),
        ]}
      />

      <section className="wg-page-hero wg-page-hero--store hero-under-header">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        >
          <ResponsiveWebpImage
            className="h-full w-full object-cover"
            alt="Painel tecnológico da WG_Build.tech"
            src={BUILDTECH_HERO_IMAGE}
            srcSet={BUILDTECH_HERO_SRCSET}
            width="1920"
            height="1080"
            loading="eager"
            decoding="async"
            fetchpriority="high"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-wg-blue/50 via-wg-black/75 to-wg-black" />
        </motion.div>

        <div className="container-custom">
          <div className="wg-page-hero-content px-4 pt-8 md:pt-10">
            <motion.span
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="wg-page-hero-kicker text-wg-orange"
            >
              Desenvolvimento & Automação
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.16 }}
              className="wg-page-hero-title"
            >
              WG_<span className="text-wg-orange">Build.tech</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.28 }}
              className="wg-page-hero-subtitle max-w-3xl"
            >
              Sites que convertem, sistemas que automatizam e agentes que mantêm cada etapa rastreável. O projeto BT nasce de metodologia, biblioteca e uma vitrine funcional para aprovar antes de escalar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.42 }}
              className="wg-page-hero-actions"
            >
              <Link
                to="/contato?context=buildtech"
                onClick={() => trackCtaClick({
                  ctaId: 'buildtech_hero_diagnostic',
                  ctaLabel: 'Montar diagnóstico BT',
                  ctaContext: 'buildtech_hero',
                  ctaDestination: '/contato?context=buildtech',
                })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-wg-orange px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-wg-orange/90"
              >
                Montar diagnóstico BT
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`https://wa.me/${COMPANY.phoneRaw.replace(/\D/g, '')}?text=${encodeURIComponent('Quero aprovar o site funcional da WG_Build.tech')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsappClick({ context: 'buildtech_hero', target: COMPANY.phoneRaw })}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm text-white transition-colors hover:bg-white/20"
              >
                Conversar com a Liz
                <Bot className="h-4 w-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="solucoes" className="section-padding-tight-top bg-wg-black text-white relative overflow-hidden scroll-mt-28">
        <div className="container-custom relative z-10">
          <motion.div {...fadeInUp} className="mb-8 max-w-3xl">
            <span className="text-[#ff8a57] text-sm tracking-widest uppercase">O que entregamos</span>
            <h2 className="mt-3 text-3xl md:text-5xl font-light tracking-tight">Uma operação digital montada por blocos úteis</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70 md:text-base">
              O cliente não compra uma lista solta de tecnologia. Ele aprova uma composição: presença digital, diagnóstico, automação, dados, atendimento e evolução contínua.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {agents.map((agent) => (
              <motion.article
                key={agent.title}
                {...fadeInUp}
                className="rounded-lg border border-white/10 bg-white/[0.055] p-6"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-wg-orange/15 text-wg-orange">
                  <agent.icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-light">{agent.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{agent.text}</p>
              </motion.article>
            ))}
          </div>

          <motion.div id="metodo" {...fadeInUp} className="mt-16 scroll-mt-28">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-[#ff8a57] text-sm tracking-widest uppercase">Metodologia S T A R</span>
                <h2 className="mt-3 text-3xl md:text-5xl font-light tracking-tight">Do contexto ao go-live com rastreabilidade</h2>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-white/70">
                S T A R é o rito do projeto BT: entender o cenário, transformar em arquitetura, acionar os agentes certos e registrar cada evidência de entrega.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {methodSteps.map((step) => (
                <article key={step.letter} className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-xl font-light text-wg-orange">
                    {step.letter}
                  </div>
                  <h3 className="text-lg font-light">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{step.text}</p>
                </article>
              ))}
            </div>
          </motion.div>

          <motion.div id="cesta" {...fadeInUp} className="mt-16 scroll-mt-28">
            <div className="mb-8">
              <span className="text-[#ff8a57] text-sm tracking-widest uppercase">Cesta de projeto</span>
              <h2 className="mt-3 text-3xl md:text-5xl font-light tracking-tight">Escolha os itens e veja a proposta ganhar forma</h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="grid gap-4 md:grid-cols-2">
                {modules.map((module) => {
                  const selected = selectedModuleIds.includes(module.id);
                  return (
                    <button
                      key={module.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleModule(module.id)}
                      className={`rounded-lg border p-5 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-wg-orange/40 ${
                        selected
                          ? 'border-wg-orange/70 bg-wg-orange/10'
                          : 'border-white/10 bg-white/[0.045] hover:border-wg-orange/50 hover:bg-white/[0.065]'
                      }`}
                    >
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-wg-orange/15 text-wg-orange">
                          <module.icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">{module.tag}</span>
                      </div>
                      <h3 className="text-xl font-light">{module.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/70">{module.text}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#ff8a57]">
                        {selected ? 'Selecionado' : 'Adicionar'}
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  );
                })}
              </div>

              <aside className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#ff8a57]">Resumo BT</span>
                    <h3 className="mt-1 text-2xl font-light">Projeto modular</h3>
                  </div>
                  <Zap className="h-6 w-6 text-wg-orange" />
                </div>

                <div className="space-y-2">
                  {selectedModules.map((module) => (
                    <div key={module.id} className="flex items-start gap-3 rounded-lg bg-wg-black/40 px-3 py-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-wg-orange" />
                      <div>
                        <p className="text-sm text-white">{module.title}</p>
                        <p className="text-xs text-white/50">{module.tag}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <label htmlFor="proposal-area" className="mb-2 block text-xs uppercase tracking-widest text-white/70">
                    Escopo operacional
                  </label>
                  <input
                    id="proposal-area"
                    name="proposal-area"
                    type="range"
                    aria-label="Escopo operacional"
                    min="40"
                    max="420"
                    step="10"
                    value={proposalArea}
                    onChange={(event) => setProposalArea(Number(event.target.value))}
                    className="w-full accent-wg-orange"
                  />
                  <div className="mt-2 flex justify-between text-sm text-white/70">
                    <span>{proposalArea} pontos de impacto</span>
                    <span>{proposalEstimate}</span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {['Essencial', 'Superior', 'Agentic'].map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setProposalComplexity(index + 1);
                        trackDemoInteraction({ demoId: 'buildtech_complexity', action: label.toLowerCase() });
                      }}
                      className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                        proposalComplexity === index + 1
                          ? 'border-wg-orange bg-wg-orange/15 text-white'
                          : 'border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.08]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/contato?context=buildtech"
                    onClick={() => trackCtaClick({
                      ctaId: 'buildtech_basket_contact',
                      ctaLabel: 'Enviar cesta',
                      ctaContext: 'buildtech_basket',
                      ctaDestination: '/contato?context=buildtech',
                    })}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-wg-orange px-4 py-3 text-sm text-white transition-colors hover:bg-wg-orange/90"
                  >
                    Enviar cesta
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={`https://wa.me/${COMPANY.phoneRaw.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsappClick({ context: 'buildtech_basket', target: COMPANY.phoneRaw })}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-wg-orange/40 px-4 py-3 text-sm text-wg-orange transition-colors hover:bg-wg-orange/10"
                  >
                    WhatsApp
                    <Bot className="h-4 w-4" />
                  </a>
                </div>
              </aside>
            </div>
          </motion.div>

          <motion.div id="experimente" {...fadeInUp} className="mt-16 scroll-mt-28">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-[#ff8a57] text-sm tracking-widest uppercase">Vitrine funcional</span>
                <h2 className="mt-3 text-3xl md:text-5xl font-light tracking-tight">Aprovar vendo, não imaginando</h2>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-white/70">
                Cada proposta pode nascer como página viva: cliente, time e agentes enxergam escopo, módulos, próximos passos e evidências no mesmo lugar.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="grid gap-3">
                {showcases.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={activeShowcaseId === item.id}
                    onClick={() => {
                      setActiveShowcaseId(item.id);
                      trackDemoInteraction({ demoId: item.id, action: 'open_showcase' });
                    }}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      activeShowcaseId === item.id
                        ? 'border-wg-orange/70 bg-wg-orange/10'
                        : 'border-white/10 bg-white/[0.045] hover:border-wg-orange/50'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-widest text-[#ff8a57]">{item.metric}</span>
                    <h3 className="mt-2 text-xl font-light">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{item.text}</p>
                  </button>
                ))}
              </div>

              <div className="rounded-lg border border-white/10 bg-wg-black/40 p-5">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#ff8a57]">{activeShowcase.metric}</span>
                    <h3 className="mt-1 text-2xl font-light">{activeShowcase.title}</h3>
                  </div>
                  <LayoutDashboard className="h-7 w-7 text-wg-orange" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    ['Entrada', 'briefing + origem + intenção'],
                    ['Módulos', selectedModules.length.toString().padStart(2, '0')],
                    ['Agentes', 'estratégia, UX, Liz, dados'],
                    ['Saída', 'vitrine + plano + evidências'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-white/[0.055] p-4">
                      <p className="text-xs uppercase tracking-widest text-white/50">{label}</p>
                      <p className="mt-2 text-sm text-white">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-lg bg-white/[0.055] p-4">
                  <p className="text-sm leading-relaxed text-white/75">
                    A Liz identifica a etapa do cliente, diferencia link público de painel autenticado, consulta sinais vivos quando disponíveis e encaminha a próxima ação com trace.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div id="cases" {...fadeInUp} className="mt-16 scroll-mt-28">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-[#ff8a57] text-sm tracking-widest uppercase">Casos e biblioteca</span>
                <h2 className="mt-3 text-3xl md:text-5xl font-light tracking-tight">O que já vira ponto de partida</h2>
              </div>
              <Link to="/contato?context=buildtech" className="inline-flex items-center gap-2 text-sm text-wg-orange hover:text-white">
                Conversar sobre um projeto
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {cases.map((item) => (
                <article key={item.title} className="rounded-lg border border-white/10 bg-white/[0.05] p-6">
                  <span className="text-xs uppercase tracking-widest text-white/60">{item.type}</span>
                  <h3 className="mt-3 text-2xl font-light">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{item.text}</p>
                </article>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...fadeInUp}
            className="mt-20 rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.08] to-wg-orange/10 p-8 md:p-10"
          >
            <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-center">
              <div>
                <span className="text-[#ff8a57] text-sm tracking-widest uppercase">Go-live controlado</span>
                <h2 className="mt-3 text-3xl md:text-5xl font-light tracking-tight">Site funcional primeiro. Produção depois da evidência.</h2>
                <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/70 md:text-base">
                  O projeto BT fica pronto para aprovação com conteúdo, interação, CTA, SEO e validação visual. Depois entram PR, Vercel e smoke real no domínio final.
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-wg-black/40 p-5">
                {[
                  `Domínio oficial: ${PRODUCT_URLS.buildtech.replace(/^https?:\/\//, '')}`,
                  'Nome oficial: WG_Build.tech',
                  'Apelidos operacionais: BuildTech e projeto BT',
                  'Validação final: desktop, mobile, console, links e formulário',
                ].map((item) => (
                  <div key={item} className="flex gap-3 py-2 text-sm text-white/75">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-wg-orange" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default BuildTech;
