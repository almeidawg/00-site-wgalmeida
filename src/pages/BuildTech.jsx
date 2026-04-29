import React, { useEffect, useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { motion } from '@/lib/motion-lite';
import { Bot, Cpu, Zap, BarChart, ArrowRight, ShieldCheck, Rocket, LayoutDashboard, CheckCircle2, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ResponsiveWebpImage from '@/components/ResponsiveWebpImage';
import { getPublicPageImageSrc } from '@/data/publicPageImageCatalog';
import { useTranslation } from 'react-i18next';
import { SCHEMAS } from '@/data/schemaConfig';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
};

const BUILDTECH_HERO_IMAGE = getPublicPageImageSrc('buildtech', '/images/banners/PROCESSOS.webp');

const BuildTech = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [proposalArea, setProposalArea] = useState(120);
  const [proposalComplexity, setProposalComplexity] = useState(2);

  const proposalEstimate = useMemo(() => {
    const base = Number(proposalArea || 0) * 145;
    const multiplier = [1, 1.18, 1.34][Math.max(0, Math.min(2, proposalComplexity - 1))];
    return Math.round(base * multiplier).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    });
  }, [proposalArea, proposalComplexity]);

  useEffect(() => {
    const targetByPath = {
      '/buildtech/solucoes.html': 'solucoes',
      '/buildtech/metodo.html': 'metodo',
      '/buildtech/cases.html': 'cases',
      '/buildtech/blog.html': 'experimente',
    };
    const targetId = targetByPath[location.pathname];
    if (!targetId) return undefined;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname]);

  const services = [
    {
      icon: Bot,
      title: "Sistemas Agentic para Experiência",
      description: "Camadas inteligentes para transformar preferências, briefing e contexto em decisões mais claras e acionáveis.",
    },
    {
      icon: LayoutDashboard,
      title: "Licenciamento WG Easy",
      description: "Acesse a experiência completa de gestão que utilizamos no Grupo WG Almeida para controlar leads, propostas e obras.",
    },
    {
      icon: Cpu,
      title: "Automação de Workflow",
      description: "Conecte pré-venda, atendimento, projeto e operação em jornadas mais fluidas e menos manuais.",
    },
    {
      icon: BarChart,
      title: "Data Intelligence",
      description: "Análise preditiva de custos e prazos para garantir que seus projetos sejam entregues com precisão matemática.",
    },
  ];

  const methodSteps = [
    ['Diagnosticar', 'Mapeamos gargalos comerciais, operacionais e de dados antes de propor tecnologia.'],
    ['Conectar', 'Integramos formulários, CRM, WhatsApp, analytics e bases internas em fluxos auditáveis.'],
    ['Automatizar', 'Criamos agentes e rotinas que executam tarefas repetitivas sem perder rastreabilidade.'],
    ['Medir', 'Fechamos o ciclo com KPIs, eventos e painéis que mostram impacto real na operação.'],
  ];

  const liveDemos = [
    {
      title: 'CRM Pipeline',
      metric: '18 leads ativos',
      text: 'Lead entra por campanha, recebe origem, prioridade e proximo passo comercial.',
      icon: LayoutDashboard,
    },
    {
      title: 'IA WhatsApp Agent',
      metric: '4 etapas rastreadas',
      text: 'A Liz identifica contexto, qualifica demanda e encaminha para a proxima acao.',
      icon: Bot,
    },
    {
      title: 'Dashboard KPIs',
      metric: '92% SLA',
      text: 'Visao de funil, tempo de resposta, propostas abertas e gargalos operacionais.',
      icon: BarChart,
    },
    {
      title: 'Mapa de Projetos',
      metric: 'SP + regioes',
      text: 'Camada georreferenciada para leitura de carteira, demanda e oportunidade.',
      icon: Rocket,
    },
  ];

  const cases = [
    {
      title: 'UMAUMA',
      type: 'Food service digital',
      text: 'Cardapio, jornada de entrada e base para operacao orientada por campanhas.',
    },
    {
      title: 'ObraEasy',
      type: 'SaaS operacional',
      text: 'Fluxos de obra, parceiros, leads e medicao conectados em uma experiencia de gestao.',
    },
    {
      title: 'Easy Real State',
      type: 'Inteligencia imobiliaria',
      text: 'Leitura de ativo, potencial pos-obra e simulacoes para decisao de maior ticket.',
    },
  ];

  return (
    <>
      <SEO
        pathname="/buildtech"
        title="WG Build.tech | Consultoria de IA e Tecnologia para Construção"
        description="Tecnologia, IA e inteligência operacional para construção. Conheça as soluções WG para o mercado imobiliário."
        schema={[
          SCHEMAS.knowledgeGraph,
          SCHEMAS.softwareBuildTech,
          SCHEMAS.softwareMoodboard,
          SCHEMAS.softwareRoomVisualizer,
          SCHEMAS.breadcrumbBuildTech,
        ]}
      />

      {/* Hero Tecnológico */}
      <section className="wg-page-hero wg-page-hero--store hero-under-header">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <ResponsiveWebpImage
            className="w-full h-full object-cover"
            alt="Tecnologia WG Build.tech"
            src={BUILDTECH_HERO_IMAGE}
            width="1920"
            height="1080"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-wg-blue/60 via-wg-blue/80 to-wg-black/90"></div>
        </motion.div>

        <div className="container-custom">
          <div className="wg-page-hero-content px-4 pt-8 md:pt-10">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="wg-page-hero-kicker text-wg-orange"
            >
              A Próxima Fronteira da Construção
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="wg-page-hero-title"
            >
              WG <span className="text-wg-orange">Build.tech</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="wg-page-hero-subtitle max-w-3xl"
            >
              Transformamos operação, atendimento e decisão em um ecossistema inteligente orientado por dados, contexto e automação útil.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="wg-page-hero-actions"
            >
              <Link
                to="/solicite-proposta?service=Sistema%20de%20Experi%C3%AAncia%20Visual&context=buildtech"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/12 px-6 py-3 text-sm text-white transition-colors hover:bg-white/20"
              >
                Falar com Especialista
                <Zap className="w-4 h-4 fill-white" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Serviços Tech */}
      <section id="solucoes" className="section-padding-tight-top bg-wg-black text-white relative overflow-hidden scroll-mt-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-wg-blue rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-wg-orange rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-wg-orange/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-wg-orange/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <service.icon className="w-6 h-6 text-wg-orange" />
                </div>
                <h3 className="text-xl font-light mb-3">{service.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...fadeInUp}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              {
                icon: CheckCircle2,
                title: 'Para clientes finais',
                text: 'Experiências que reduzem indecisão e aproximam inspiração de uma escolha concreta.',
              },
              {
                icon: Users,
                title: 'Para corretores e parceiros',
                text: 'Ferramentas de pré-venda e alinhamento visual que elevam percepção de valor e conversão.',
              },
              {
                icon: LayoutDashboard,
                title: 'Para profissionais',
                text: 'Materiais e fluxos mais organizados para briefing, apresentação e continuidade do projeto.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="w-10 h-10 rounded-xl bg-wg-orange/15 text-wg-orange flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-light mb-2">{item.title}</h2>
                <p className="text-white/65 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            {...fadeInUp}
            id="metodo"
            className="mt-16 scroll-mt-28"
          >
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-wg-orange text-sm tracking-widest uppercase">Metodo WG Build.tech</span>
                <h2 className="mt-3 text-3xl md:text-5xl font-light tracking-tight">Tecnologia aplicada com governanca, nao improviso</h2>
              </div>
              <p className="max-w-2xl text-white/62 text-sm leading-relaxed">
                Cada solucao nasce com descoberta, dados, automacao, seguranca e medicao. A interface fica simples; a engenharia trabalha nos bastidores.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {methodSteps.map(([title, text], index) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-wg-orange/15 text-sm text-wg-orange">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="mb-2 text-lg font-light">{title}</h3>
                  <p className="text-sm leading-relaxed text-white/60">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...fadeInUp}
            id="experimente"
            className="mt-16 scroll-mt-28"
          >
            <div className="mb-8">
              <span className="text-wg-orange text-sm tracking-widest uppercase">Experimente ao vivo</span>
              <h2 className="mt-3 text-3xl md:text-5xl font-light tracking-tight">Demos leves para entender valor antes da reuniao</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_0.92fr]">
              <div className="grid gap-4 md:grid-cols-2">
                {liveDemos.map((demo) => (
                  <div key={demo.title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-wg-orange/15 text-wg-orange">
                        <demo.icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/62">{demo.metric}</span>
                    </div>
                    <h3 className="mb-2 text-xl font-light">{demo.title}</h3>
                    <p className="text-sm leading-relaxed text-white/60">{demo.text}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-light">Simulador de proposta</h3>
                    <p className="mt-1 text-sm text-white/58">Estimativa inicial para automacao, dashboard e integrações.</p>
                  </div>
                  <Zap className="h-6 w-6 text-wg-orange" />
                </div>
                <label className="mb-2 block text-xs uppercase tracking-widest text-white/50">Area operacional impactada</label>
                <input
                  type="range"
                  min="40"
                  max="420"
                  step="10"
                  value={proposalArea}
                  onChange={(event) => setProposalArea(Number(event.target.value))}
                  className="w-full accent-wg-orange"
                />
                <div className="mt-2 flex justify-between text-sm text-white/60">
                  <span>{proposalArea} m2 equivalentes</span>
                  <span>{proposalEstimate}</span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {['Essencial', 'Avancado', 'Agentic'].map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setProposalComplexity(index + 1)}
                      className={`rounded-xl border px-3 py-2 text-xs transition-colors ${
                        proposalComplexity === index + 1
                          ? 'border-wg-orange bg-wg-orange/16 text-white'
                          : 'border-white/10 bg-white/[0.03] text-white/58 hover:bg-white/[0.08]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mt-5 rounded-xl bg-wg-black/55 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm text-white/70">
                    <Bot className="h-4 w-4 text-wg-orange" />
                    Liz demo
                  </div>
                  <p className="text-sm leading-relaxed text-white/58">
                    "Identifiquei origem BuildTech, interesse em automacao e prioridade comercial. Proximo passo: enviar diagnostico guiado e abrir oportunidade no CRM."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            {...fadeInUp}
            id="cases"
            className="mt-16 scroll-mt-28"
          >
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-wg-orange text-sm tracking-widest uppercase">Cases e produtos</span>
                <h2 className="mt-3 text-3xl md:text-5xl font-light tracking-tight">Laboratorio vivo do ecossistema WG</h2>
              </div>
              <Link to="/contato?context=buildtech" className="inline-flex items-center gap-2 text-sm text-wg-orange hover:text-white">
                Conversar sobre um projeto
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {cases.map((item) => (
                <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
                  <span className="text-xs uppercase tracking-widest text-white/44">{item.type}</span>
                  <h3 className="mt-3 text-2xl font-light">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{item.text}</p>
                </article>
              ))}
            </div>
          </motion.div>

          {/* Destaque WG Easy */}
          <motion.div
            {...fadeInUp}
            className="mt-20 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-wg-blue/20 to-wg-orange/10 border border-white/10 flex flex-col md:flex-row items-center gap-12"
          >
            <div className="flex-1">
              <span className="text-wg-orange text-sm tracking-widest uppercase mb-4 block">Powered by WG Easy</span>
              <h2 className="text-3xl md:text-5xl font-light mb-6 tracking-tight">A experiência de gestão por trás das obras mais exigentes</h2>
              <p className="text-white/70 text-lg mb-8">
                Utilize a mesma inteligência operacional que permitiu ao Grupo WG Almeida escalar sua operação com mais clareza, automação útil e menos esforço manual. Do CRM ao controle de suprimentos em uma jornada conectada.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-white/80">
                  <ShieldCheck className="w-5 h-5 text-wg-orange" />
                  Segurança de dados padrão bancário
                </li>
                <li className="flex items-center gap-3 text-white/80">
                  <Rocket className="w-5 h-5 text-wg-orange" />
                  Implementação rápida em 15 dias
                </li>
              </ul>
              <Link
                to="/solicite-proposta?service=Sistema%20de%20Experi%C3%AAncia%20Visual&context=buildtech"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition-all"
              >
                Solicitar Demonstração
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">
                 <img
                   src="/images/logo-buildtech-transparent.webp"
                   alt="Interface WG Easy"
                   className="w-full h-full object-cover bg-white"
                   onError={(event) => {
                     if (event.currentTarget.dataset.fallbackApplied === 'true') return;
                     event.currentTarget.dataset.fallbackApplied = 'true';
                     event.currentTarget.src = '/images/banners/ENGENHARIA.webp';
                   }}
                 />
                 <div className="absolute inset-0 bg-wg-blue/20 flex items-center justify-center">
                    <div className="p-4 bg-wg-black/80 backdrop-blur-md rounded-xl text-center">
                       <LayoutDashboard className="w-12 h-12 text-wg-orange mx-auto mb-2" />
                       <span className="text-xs uppercase tracking-tighter">Dashboard Ativo</span>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default BuildTech;
