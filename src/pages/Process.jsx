import React, { useEffect, useMemo, useState } from 'react';
import SEO from '@/components/SEO';
import { motion } from '@/lib/motion-lite';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  Camera,
  CheckCircle,
  Clock3,
  DoorOpen,
  FileText,
  FolderOpen,
  Hammer,
  Lightbulb,
  MessagesSquare,
  Monitor,
  PenTool,
  Ruler,
  Users,
} from 'lucide-react';
import ResponsiveWebpImage from '@/components/ResponsiveWebpImage';
import { getPublicPageImageSrc } from '@/data/publicPageImageCatalog';
import { useTranslation } from 'react-i18next';
import { SCHEMAS } from '@/data/schemaConfig';

const TIMELINE_CONTENT = {
  pt: {
    heroTitle: 'Timeline da Obra',
    heroSubtitle: 'Escolha o tipo de projeto, ajuste a metragem e visualize uma linha do tempo clara, elegante e orientada por método.',
    selectorKicker: 'Planejamento inteligente',
    selectorTitle: 'Veja a obra ganhar ritmo antes mesmo do primeiro passo.',
    selectorSubtitle: 'A experiência abaixo traduz a metodologia WG em leitura guiada: tipo de projeto, faixa de metragem, estimativas locais, ICCRI e Etapas WG organizadas para facilitar decisão e execução.',
    reform: 'Reforma',
    build: 'Construção',
    areaLabel: 'Metragem estimada',
    summaryDuration: 'Estimativa total',
    summaryStages: 'Macroetapas',
    summaryFocus: 'Foco da jornada',
    summaryRange: 'Faixa analisada',
    stageListLabel: 'Etapas principais',
    stagePanelLabel: 'Detalhamento da etapa',
    estimatedDataLabel: 'Leitura estimativa',
    estimatedDataText: 'Os tempos desta tela são estimativas orientativas, calculadas localmente a partir da metodologia WG Almeida. Os tempos variam conforme metragem, escopo e dinâmica da obra.',
    durationUnit: 'semanas',
    areaUnit: 'm²',
    ctaTitle: 'Quer transformar essa estimativa em um cronograma real?',
    ctaText: 'A partir do briefing, da metragem e do escopo do projeto, estruturamos a sequência executiva com muito mais previsibilidade.',
    ctaPrimary: 'Solicitar proposta',
    ctaSecondary: 'Falar com a equipe',
    focusReform: 'estimativas para compatibilização e obra em imóvel existente',
    focusBuild: 'estimativas para planejamento integral e estrutura controlada',
    labels: {
      days: 'dias',
      week: 'semana',
      weeks: 'semanas',
      businessDays: 'dias úteis',
      calendarDays: 'dias corridos',
      fromTo: 'de {min} a {max}'
    }
  },
  en: {
    heroTitle: 'Construction Timeline',
    heroSubtitle: 'Choose the project type, adjust the area and visualize a clear, elegant, and method-oriented timeline.',
    selectorKicker: 'Smart planning',
    selectorTitle: 'See the work gain rhythm even before the first step.',
    selectorSubtitle: 'The experience below translates the WG methodology into a guided reading: project type, area range, local estimates, ICCRI and WG Stages organized to facilitate decision and execution.',
    reform: 'Renovation',
    build: 'Construction',
    areaLabel: 'Estimated area',
    summaryDuration: 'Total estimate',
    summaryStages: 'Macro-stages',
    summaryFocus: 'Journey focus',
    summaryRange: 'Analyzed range',
    stageListLabel: 'Main stages',
    stagePanelLabel: 'Stage details',
    estimatedDataLabel: 'Estimated reading',
    estimatedDataText: 'The times on this screen are guideline estimates, calculated locally from the WG Almeida methodology. Times vary according to area, scope and work dynamics.',
    durationUnit: 'weeks',
    areaUnit: 'sqm',
    ctaTitle: 'Want to transform this estimate into a real schedule?',
    ctaText: 'Based on the briefing, area and project scope, we structure the executive sequence with much more predictability.',
    ctaPrimary: 'Request proposal',
    ctaSecondary: 'Talk to the team',
    focusReform: 'estimates for coordination and work on existing property',
    focusBuild: 'estimates for integral planning and controlled structure',
    labels: {
      days: 'days',
      week: 'week',
      weeks: 'weeks',
      businessDays: 'business days',
      calendarDays: 'calendar days',
      fromTo: 'from {min} to {max}'
    }
  }
};

const PROCESS_STEP_FALLBACKS = {
  'processPage.steps.0': {
    title: 'Briefing e necessidades',
    description: 'Levantamento do contexto, rotina, metragem e intenção do projeto.',
  },
  'processPage.steps.1': {
    title: 'Conceito e estudo preliminar',
    description: 'Direção visual, soluções iniciais e leitura técnica para orientar as decisões.',
  },
  'processPage.steps.2': {
    title: 'Aprovação e compatibilização',
    description: 'Validação de escopo, materiais, prioridades e pontos críticos antes da execução.',
  },
  'processPage.steps.3': {
    title: 'Planejamento executivo',
    description: 'Sequência de obra, compras, fornecedores e marcos de acompanhamento organizados.',
  },
  'processPage.steps.4': {
    title: 'Execução e acompanhamento',
    description: 'Obra conduzida com coordenação técnica, controle de qualidade e comunicação clara.',
  },
  'processPage.steps.5': {
    title: 'Entrega assistida',
    description: 'Revisão final, ajustes, documentação e transição para uso do ambiente.',
  },
  'processPage.onboarding': {
    title: 'Projeto e viabilidade',
    subtitle: 'Estudo técnico, estimativa de escopo e organização inicial para avançar com segurança.',
  },
  'home.methodology.steps.4': {
    title: 'Marcenaria premium',
    desc: 'Acabamentos e mobiliário sob medida integrados ao projeto.',
  },
};

const stageText = (t, key, field) => t(`${key}.${field}`, {
  defaultValue: PROCESS_STEP_FALLBACKS[key]?.[field] || '',
});

// Reutilizamos a lógica de estágios, mas com chaves de tradução dinâmicas
const getStages = (type, t) => {
  const isReform = type === 'reform';
  
  if (isReform) {
    return [
      {
        icon: Lightbulb,
        title: stageText(t, 'processPage.steps.0', 'title'),
        summary: stageText(t, 'processPage.steps.0', 'description'),
        detail: stageText(t, 'processPage.steps.0', 'description'),
        baseWeeks: 1.2,
        accent: {
          card: 'bg-[#f3f8f7] shadow-[inset_0_0_0_1px_rgba(94,155,148,0.14)]',
          icon: 'bg-[#e1f0ed] text-wg-green',
          active: 'bg-[#5e9b94] text-white shadow-[0_16px_45px_rgba(18,18,18,0.14)]',
        },
      },
      {
        icon: PenTool,
        title: stageText(t, 'processPage.steps.1', 'title'),
        summary: stageText(t, 'processPage.steps.1', 'description'),
        detail: stageText(t, 'processPage.steps.1', 'description'),
        baseWeeks: 3.1,
        accent: {
          card: 'bg-[#f3f8f7] shadow-[inset_0_0_0_1px_rgba(94,155,148,0.14)]',
          icon: 'bg-[#e1f0ed] text-wg-green',
          active: 'bg-[#4f867f] text-white shadow-[0_16px_45px_rgba(18,18,18,0.14)]',
        },
      },
      {
        icon: FileText,
        title: stageText(t, 'processPage.steps.3', 'title'),
        summary: stageText(t, 'processPage.steps.3', 'description'),
        detail: stageText(t, 'processPage.steps.3', 'description'),
        baseWeeks: 7.4,
        accent: {
          card: 'bg-[#f4f7fb] shadow-[inset_0_0_0_1px_rgba(123,151,187,0.16)]',
          icon: 'bg-[#e7edf6] text-wg-blue',
          active: 'bg-[#395b81] text-white shadow-[0_16px_45px_rgba(18,18,18,0.14)]',
        },
      },
      {
        icon: Hammer,
        title: stageText(t, 'processPage.steps.4', 'title'),
        summary: stageText(t, 'processPage.steps.4', 'description'),
        detail: stageText(t, 'processPage.steps.4', 'description'),
        baseWeeks: 9.6,
        accent: {
          card: 'bg-[#f3f6fb] shadow-[inset_0_0_0_1px_rgba(123,151,187,0.16)]',
          icon: 'bg-[#e2eaf5] text-wg-blue',
          active: 'bg-[#2f537c] text-white shadow-[0_16px_45px_rgba(18,18,18,0.14)]',
        },
      },
      {
        icon: DoorOpen,
        title: stageText(t, 'home.methodology.steps.4', 'title'),
        summary: stageText(t, 'home.methodology.steps.4', 'desc'),
        detail: stageText(t, 'home.methodology.steps.4', 'desc'),
        baseWeeks: 4.2,
        accent: {
          card: 'bg-[#fbf6f2] shadow-[inset_0_0_0_1px_rgba(208,171,142,0.16)]',
          icon: 'bg-[#f3e8df] text-wg-orange-text',
          active: 'bg-[#8B5E3C] text-white shadow-[0_16px_45px_rgba(18,18,18,0.14)]',
        },
      },
      {
        icon: CheckCircle,
        title: stageText(t, 'processPage.steps.5', 'title'),
        summary: stageText(t, 'processPage.steps.5', 'description'),
        detail: stageText(t, 'processPage.steps.5', 'description'),
        baseWeeks: 1.4,
        accent: {
          card: 'bg-[#f8f7f5] shadow-[inset_0_0_0_1px_rgba(46,46,46,0.08)]',
          icon: 'bg-black/5 text-wg-black',
          active: 'bg-[#2f2c29] text-white shadow-[0_16px_45px_rgba(18,18,18,0.14)]',
        },
      }
    ];
  }

  // Build Stages
  return [
    {
      icon: Lightbulb,
      title: stageText(t, 'processPage.steps.0', 'title'),
      summary: stageText(t, 'processPage.steps.0', 'description'),
      detail: stageText(t, 'processPage.steps.0', 'description'),
      baseWeeks: 2.1,
      accent: {
        card: 'bg-[#f3f8f7] shadow-[inset_0_0_0_1px_rgba(94,155,148,0.14)]',
        icon: 'bg-[#e1f0ed] text-wg-green',
        active: 'bg-[#5e9b94] text-white shadow-[0_16px_45px_rgba(18,18,18,0.14)]',
      },
    },
    {
      icon: PenTool,
      title: stageText(t, 'processPage.onboarding', 'title'),
      summary: stageText(t, 'processPage.onboarding', 'subtitle'),
      detail: stageText(t, 'processPage.onboarding', 'subtitle'),
      baseWeeks: 5.8,
      accent: {
        card: 'bg-[#f3f8f7] shadow-[inset_0_0_0_1px_rgba(94,155,148,0.14)]',
        icon: 'bg-[#e1f0ed] text-wg-green',
        active: 'bg-[#4f867f] text-white shadow-[0_16px_45px_rgba(18,18,18,0.14)]',
      },
    },
    {
      icon: FileText,
      title: stageText(t, 'processPage.steps.2', 'title'),
      summary: stageText(t, 'processPage.steps.2', 'description'),
      detail: stageText(t, 'processPage.steps.2', 'description'),
      baseWeeks: 7.8,
      accent: {
        card: 'bg-[#f4f7fb] shadow-[inset_0_0_0_1px_rgba(123,151,187,0.16)]',
        icon: 'bg-[#e7edf6] text-wg-blue',
        active: 'bg-[#395b81] text-white shadow-[0_16px_45px_rgba(18,18,18,0.14)]',
      },
    },
    {
      icon: Hammer,
      title: stageText(t, 'processPage.steps.4', 'title'),
      summary: stageText(t, 'processPage.steps.4', 'description'),
      detail: stageText(t, 'processPage.steps.4', 'description'),
      baseWeeks: 15.8,
      accent: {
        card: 'bg-[#f3f6fb] shadow-[inset_0_0_0_1px_rgba(123,151,187,0.16)]',
        icon: 'bg-[#e2eaf5] text-wg-blue',
        active: 'bg-[#2f537c] text-white shadow-[0_16px_45px_rgba(18,18,18,0.14)]',
      },
    },
    {
      icon: Users,
      title: stageText(t, 'home.methodology.steps.4', 'title'),
      summary: stageText(t, 'home.methodology.steps.4', 'desc'),
      detail: stageText(t, 'home.methodology.steps.4', 'desc'),
      baseWeeks: 4.2,
      accent: {
        card: 'bg-[#fbf6f2] shadow-[inset_0_0_0_1px_rgba(208,171,142,0.16)]',
        icon: 'bg-[#f3e8df] text-wg-orange-text',
        active: 'bg-[#8B5E3C] text-white shadow-[0_16px_45px_rgba(18,18,18,0.14)]',
      },
    },
    {
      icon: CheckCircle,
      title: stageText(t, 'processPage.steps.5', 'title'),
      summary: stageText(t, 'processPage.steps.5', 'description'),
      detail: stageText(t, 'processPage.steps.5', 'description'),
      baseWeeks: 2.3,
      accent: {
        card: 'bg-[#f9f8f6] shadow-[inset_0_0_0_1px_rgba(46,46,46,0.08)]',
        icon: 'bg-black/5 text-wg-black',
        active: 'bg-[#2f2c29] text-white shadow-[0_16px_45px_rgba(18,18,18,0.14)]',
      },
    },
  ];
};

const PROCESS_HERO_IMAGE = getPublicPageImageSrc('process', '/images/banners/PROCESSOS.webp');

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatArea(value, unit = 'm²') {
  return `${Math.round(value)} ${unit}`;
}

const areaProfile = (area, projectType, t) => {
  const maxArea = 500;
  const minArea = 20;
  const normalized = (clamp(area, minArea, maxArea) - minArea) / (maxArea - minArea);
  const factor = projectType === 'reform' ? 0.7 + normalized * 0.95 : 0.76 + normalized * 1.12;

  if (normalized < 0.24) return { label: t('common.compact'), factor };
  if (normalized < 0.52) return { label: t('common.intermediate'), factor };
  if (normalized < 0.8) return { label: t('common.wide'), factor };
  return { label: t('common.special'), factor };
};

const Process = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.startsWith('en') ? 'en' : 'pt';
  const copy = TIMELINE_CONTENT[currentLang];
  
  const [projectType, setProjectType] = useState('reform');
  const [area, setArea] = useState(160);
  const [leadName, setLeadName] = useState('');
  const [leadWhatsapp, setLeadWhatsapp] = useState('');
  const [leadEmail, setLeadEmail] = useState('');

  const profile = areaProfile(area, projectType, t);
  const stages = useMemo(() => getStages(projectType, t), [projectType, t]);
  const [activeStage, setActiveStage] = useState(0);
  const stageIndex = clamp(activeStage, 0, stages.length - 1);
  const currentStage = stages[stageIndex];
  
  const minProfile = areaProfile(20, projectType, t);
  const maxProfile = areaProfile(500, projectType, t);
  
  const adjustedStages = stages.map((stage) => ({
    ...stage,
    duration: Math.max(0.8, Math.round(stage.baseWeeks * profile.factor * 2) / 2),
  }));
  const totalDuration = adjustedStages.reduce((sum, stage) => sum + stage.duration, 0);

  const leadWhatsappHref = useMemo(() => {
    const summary = [
      `Olá, equipe WG Almeida.`,
      `Quero receber o estudo inicial da Timeline da Obra e avançar para o EVF.`,
      `Nome: ${leadName || 'não informado'}`,
      `WhatsApp: ${leadWhatsapp || 'não informado'}`,
      `E-mail: ${leadEmail || 'não informado'}`,
      `Projeto: ${projectType === 'reform' ? copy.reform : copy.build}`,
      `Metragem estimada: ${formatArea(area)}`,
      `Duração estimada: ${totalDuration.toFixed(1)} semanas`,
    ].join('\n');

    return `https://wa.me/5511984650002?text=${encodeURIComponent(summary)}`;
  }, [area, copy.build, copy.reform, leadEmail, leadName, leadWhatsapp, projectType, totalDuration]);

  return (
    <>
      <SEO pathname="/processo" title={copy.heroTitle} description={copy.heroSubtitle} />

      {/* Hero Section */}
      <section className="wg-page-hero wg-page-hero--store hero-under-header">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <ResponsiveWebpImage
            className="w-full h-full object-cover"
            alt={copy.heroTitle}
            src={PROCESS_HERO_IMAGE}
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-wg-black/40 via-wg-black/58 to-wg-black/78"></div>
        </motion.div>

        <div className="container-custom relative z-10">
          <div className="wg-page-hero-content px-4 pt-8 md:pt-10">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="wg-page-hero-kicker text-wg-orange"
            >
              {copy.selectorKicker}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.18 }}
              className="wg-page-hero-title"
            >
              {copy.heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="wg-page-hero-subtitle max-w-3xl"
            >
              {copy.heroSubtitle}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Interface da Timeline */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-wg-black mb-4">{copy.selectorTitle}</h2>
            <p className="text-wg-gray max-w-3xl mx-auto font-light">{copy.selectorSubtitle}</p>
          </div>

          <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
            {/* Controles */}
            <div className="space-y-8">
              <div className="bg-gray-50 p-8 rounded-[2rem] border border-black/5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-wg-gray mb-6">{copy.areaLabel}</h3>
                <input 
                  type="range" 
                  min="20" 
                  max="500" 
                  value={area} 
                  onChange={(e) => setArea(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-wg-orange"
                />
                <div className="flex justify-between mt-4 text-2xl font-playfair italic text-wg-black">
                  <span>{area} {copy.areaUnit}</span>
                  <span className="text-sm uppercase tracking-widest font-inter font-light text-wg-gray pt-2">{profile.label}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setProjectType('reform')}
                  className={`flex-1 py-4 rounded-xl font-light transition-all ${projectType === 'reform' ? 'bg-wg-black text-white' : 'bg-gray-100 text-wg-gray hover:bg-gray-200'}`}
                >
                  {copy.reform}
                </button>
                <button 
                  onClick={() => setProjectType('build')}
                  className={`flex-1 py-4 rounded-xl font-light transition-all ${projectType === 'build' ? 'bg-wg-black text-white' : 'bg-gray-100 text-wg-gray hover:bg-gray-200'}`}
                >
                  {copy.build}
                </button>
              </div>

              <div className="bg-wg-blue p-8 rounded-[2rem] text-white">
                <h3 className="text-xs uppercase tracking-[0.2em] text-white/60 mb-6">{copy.summaryDuration}</h3>
                <div className="text-5xl font-playfair italic mb-2">
                  {totalDuration.toFixed(0)} <span className="text-xl not-italic font-light opacity-60">{copy.durationUnit}</span>
                </div>
                <p className="text-sm font-light text-white/70 leading-relaxed">
                  {projectType === 'reform' ? copy.focusReform : copy.focusBuild}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {adjustedStages.map((stage, idx) => (
                <motion.div
                  key={idx}
                  onClick={() => setActiveStage(idx)}
                  className={`p-6 rounded-[2rem] cursor-pointer border transition-all ${activeStage === idx ? 'bg-white shadow-2xl border-wg-orange/20 scale-[1.02]' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeStage === idx ? 'bg-wg-orange text-white' : 'bg-white text-wg-gray shadow-sm'}`}>
                      <stage.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <h4 className={`text-lg font-light ${activeStage === idx ? 'text-wg-black' : 'text-wg-gray'}`}>{stage.title}</h4>
                        <span className="text-sm font-mono text-wg-orange">~{stage.duration} {copy.durationUnit}</span>
                      </div>
                      <p className="text-sm text-wg-gray font-light line-clamp-1">{stage.summary}</p>
                    </div>
                  </div>
                  {activeStage === idx && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 pt-6 border-t border-gray-100 space-y-4"
                    >
                      <p className="text-wg-black leading-relaxed font-light">{stage.detail}</p>
                      <Link to="/solicite-proposta" className="inline-flex items-center gap-2 text-wg-orange text-sm font-bold uppercase tracking-widest hover:gap-4 transition-all">
                        {copy.ctaPrimary} <ArrowRight size={14} />
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rodapé CTA */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-light text-wg-black mb-6">{copy.ctaTitle}</h2>
            <p className="text-lg text-wg-gray mb-10 font-light leading-relaxed">{copy.ctaText}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/solicite-proposta" className="wg-btn-pill-primary px-10 py-5">
                {copy.ctaPrimary}
              </Link>
              <a href={leadWhatsappHref} target="_blank" rel="noopener noreferrer" className="wg-btn-pill-secondary px-10 py-5">
                {copy.ctaSecondary}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Process;
