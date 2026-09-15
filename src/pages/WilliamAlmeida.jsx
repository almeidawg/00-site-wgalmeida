import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Compass,
  Lightbulb,
  Network,
  Quote,
  Rocket,
  Workflow,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { SCHEMAS } from '@/data/schemaConfig';
import ResponsiveWebpImage from '@/components/ResponsiveWebpImage';
import { withBasePath } from '@/utils/assetPaths';

const WILLIAM_IMAGE = withBasePath('/images/about/william-almeida-1200.webp');

const timeline = [
  {
    period: 'Antes de 2011',
    title: 'Atendimento, comercial, vendas e gestão',
    text: 'A base da trajetória veio antes da empresa própria: relacionamento com clientes, negociação, execução e gestão. Foi aí que começou a visão de negócio como sistema, e não como tarefas isoladas.',
  },
  {
    period: '28/10/2011',
    title: 'Início da trajetória empresarial WG',
    text: 'A primeira empresa da trajetória WG abriu em 28 de outubro de 2011. A partir daí, William passou a construir uma operação ligada a interiores, arquitetura, execução e gestão.',
  },
  {
    period: '2011–2024',
    title: 'Integração entre disciplinas e Turnkey',
    text: 'Arquitetura, Engenharia e Marcenaria passaram a operar de forma cada vez mais conectada. O aprendizado de campo mostrou que projeto, execução, fornecedores, custos, pessoas e informação precisavam funcionar como uma única jornada.',
  },
  {
    period: '2025',
    title: 'Nasce a WG/Build.tech',
    text: 'A tecnologia deixa de ser apenas apoio interno e vira um núcleo do Grupo: software, dados, automação e IA aplicados a problemas que já eram conhecidos por dentro da operação.',
  },
  {
    period: '2025–2026',
    title: 'Da operação para sistemas e produtos',
    text: 'Ferramentas, motores de decisão, plataformas, automações e agentes passam a materializar processos antes fragmentados. O foco deixa de ser “mais software” e passa a ser “melhor operação”.',
  },
  {
    period: 'Hoje',
    title: 'Founder, Operator & Builder + Advisory',
    text: 'William aplica a experiência acumulada como uma segunda visão de operador para founders e empresários que precisam conectar estratégia, operação, produto, tecnologia, automação e IA.',
  },
];

const principles = [
  ['Estratégia sem operação não executa.', Compass],
  ['Automação sem processo acelera o caos.', Workflow],
  ['Produto começa no problema, não na feature.', Lightbulb],
  ['IA precisa de contexto, processo e governança.', BrainCircuit],
  ['Integração reduz perda de contexto e decisão fraca.', Network],
  ['A primeira versão é uma forma de pensar e validar.', Rocket],
];

const projects = [
  {
    name: 'Grupo WG Almeida',
    role: 'Operação empresarial real',
    text: 'O ecossistema que conecta WG Arquitetura, WG Engenharia, WG Marcenaria e WG/Build.tech e dá origem à experiência operacional que sustenta a tese.',
    href: '/sobre',
  },
  {
    name: 'Turnkey',
    role: 'Integração operacional',
    text: 'Um modelo para conectar projeto, planejamento, execução, materiais, marcenaria, gestão e entrega, reduzindo interfaces onde contexto e responsabilidade se perdem.',
    href: '/obra-turn-key',
  },
  {
    name: 'WGEasy',
    role: 'Operação transformada em sistema',
    text: 'Backbone operacional criado para organizar processos, dados, CRM/ERP e governança do ecossistema.',
    href: '/wgeasy',
  },
  {
    name: 'ObraEasy',
    role: 'Conhecimento operacional transformado em produto',
    text: 'Produto construído a partir de problemas reais de viabilidade e jornada de obra, aproximando decisão, orçamento e acompanhamento.',
    href: '/obraeasy',
  },
  {
    name: 'ICCRI',
    role: 'Dados para decisão',
    text: 'Motor de referência de custos para obra e reforma, criado para transformar informação operacional em uma camada mais útil de decisão.',
    href: '/iccri',
  },
  {
    name: 'EasyRealState',
    role: 'Aplicação do método em outra vertical',
    text: 'Uma vertical imobiliária que combina avaliação, CRM, captação e inteligência comercial, usando tecnologia como estrutura horizontal para um problema setorial.',
    href: '/easy-real-state',
  },
  {
    name: 'WG/Build.tech',
    role: 'Tecnologia criada por quem opera',
    text: 'O núcleo tecnológico criado em 2025 para transformar conhecimento operacional em sistemas, SaaS, dados, automação, IA e produtos digitais.',
    href: '/buildtech',
  },
];

const advisoryTopics = [
  'Estratégia empresarial e tomada de decisão',
  'Arquitetura operacional e desenho de processos',
  'Produto e transformação de conhecimento em software',
  'IA e automação aplicadas ao negócio',
  'Sistemas, integrações, dados e governança',
  'Vertical SaaS e co-criação com especialistas',
];

export default function WilliamAlmeida() {
  return (
    <>
      <SEO
        pathname="/william-almeida"
        schema={[SCHEMAS.profileWilliam, SCHEMAS.personWilliam, SCHEMAS.breadcrumbWilliam]}
        keywords={[
          'William Almeida',
          'William Almeida Grupo WG Almeida',
          'William Almeida WG/Build.tech',
          'advisor estratégico',
          'advisor para fundadores',
          'advisor para empresários',
          'consultor estratégico',
          'estratégia e operações',
          'IA para empresas',
          'automação empresarial',
        ]}
      />

      <section className="relative overflow-hidden bg-wg-black text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-28 top-10 h-96 w-96 rounded-full bg-wg-orange blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-wg-green blur-3xl" />
        </div>
        <div className="container-custom relative z-10 grid min-h-[720px] items-center gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div>
            <p className="mb-5 text-sm uppercase tracking-[0.24em] text-wg-orange">William Almeida</p>
            <h1 className="max-w-4xl text-4xl font-light leading-tight md:text-6xl lg:text-7xl">
              Founder, Operator & Builder
            </h1>
            <p className="mt-6 max-w-3xl text-xl font-light leading-relaxed text-white/85 md:text-2xl">
              Advisor Estratégico para fundadores e empresários em estratégia, operações, produto, tecnologia, automação e IA.
            </p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
              Uma segunda visão de operador para decisões que atravessam crescimento, processo, produto e tecnologia — construída a partir de uma trajetória empresarial iniciada em 2011.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/contato?context=william-advisory"
                className="inline-flex items-center gap-2 rounded-full bg-wg-orange px-6 py-3 font-medium text-white transition hover:opacity-90"
              >
                Conversar com William <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#trajetoria"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-white transition hover:border-white/60"
              >
                Conhecer minha trajetória
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-[2rem] border border-wg-orange/25" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
              <ResponsiveWebpImage
                src={WILLIAM_IMAGE}
                alt="William Almeida, fundador do Grupo WG Almeida e da WG/Build.tech"
                className="h-[560px] w-full object-cover object-center"
                width="1200"
                height="1500"
                loading="eager"
                fetchpriority="high"
                sizes="(max-width: 1024px) 92vw, 40vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-7 pt-28">
                <p className="text-sm uppercase tracking-[0.2em] text-wg-orange">Desde 2011</p>
                <p className="mt-2 text-lg text-white/90">Fundador do Grupo WG Almeida e da WG/Build.tech</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container-custom grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-wg-orange">A tese</p>
            <h2 className="mt-4 text-3xl font-light text-wg-black md:text-5xl">Tecnologia criada por quem opera.</h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-wg-gray">
            <p>A trajetória não começou no software. Antes vieram vendas, clientes, projetos, fornecedores, obras, equipes, custos, prazos e a responsabilidade de fazer uma operação funcionar no mundo real.</p>
            <p>Ao longo dos anos, o problema se tornou cada vez mais claro: empresas perdem contexto quando pessoas, processos, dados e ferramentas trabalham de forma fragmentada.</p>
            <p>Foi dessa experiência que surgiu uma forma de pensar: entender a operação, estruturar o processo, materializar uma solução, validar no mundo real e só depois automatizar e escalar.</p>
          </div>
        </div>
      </section>

      <section id="trajetoria" className="bg-wg-gray-light py-20 md:py-28">
        <div className="container-custom">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.22em] text-wg-orange">Trajetória</p>
            <h2 className="mt-4 text-3xl font-light text-wg-black md:text-5xl">Da operação para a integração. Da integração para sistemas.</h2>
          </div>
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            {timeline.map((item) => (
              <article key={`${item.period}-${item.title}`} className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-wg-orange">{item.period}</p>
                <h3 className="mt-3 text-2xl font-light text-wg-black">{item.title}</h3>
                <p className="mt-4 leading-relaxed text-wg-gray">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-wg-orange">Como penso</p>
              <h2 className="mt-4 text-3xl font-light text-wg-black md:text-5xl">Negócios são sistemas.</h2>
              <p className="mt-6 text-lg leading-relaxed text-wg-gray">Antes de recomendar tecnologia, é preciso entender estratégia, oferta, comercial, operação, pessoas, processos, dados, dependências, gargalos e decisões.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {principles.map(([text, Icon]) => (
                <div key={text} className="rounded-2xl border border-black/5 bg-wg-gray-light p-6">
                  <Icon className="h-6 w-6 text-wg-orange" />
                  <p className="mt-5 text-lg font-medium leading-snug text-wg-black">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-wg-black py-20 text-white md:py-28">
        <div className="container-custom">
          <p className="text-sm uppercase tracking-[0.22em] text-wg-orange">Método</p>
          <h2 className="mt-4 max-w-4xl text-3xl font-light md:text-5xl">O produto muda. O especialista muda. O mercado muda. O método permanece.</h2>
          <div className="mt-12 grid gap-3 md:grid-cols-4">
            {['Entender', 'Estruturar', 'Materializar', 'Validar', 'Automatizar', 'Medir', 'Produto', 'Escala'].map((step, index) => (
              <div key={step} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <span className="text-xs text-wg-orange">0{index + 1}</span>
                <p className="mt-2 text-lg">{step}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/65">A especialização vertical precisa vir de quem conhece profundamente o mercado. A WG/Build.tech entra com produto, software, dados, IA e automação para transformar esse conhecimento em algo testável, operacional e escalável.</p>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container-custom">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.22em] text-wg-orange">Projetos e sistemas</p>
              <h2 className="mt-4 text-3xl font-light text-wg-black md:text-5xl">Algumas coisas que construí no caminho.</h2>
            </div>
            <p className="max-w-xl text-wg-gray">Não como uma coleção de softwares, mas como etapas de uma mesma evolução: operação → integração → dados → sistemas → produto.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.name}
                to={project.href}
                className="group rounded-2xl border border-black/5 bg-wg-gray-light p-7 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="text-sm uppercase tracking-[0.15em] text-wg-orange">{project.role}</p>
                <h3 className="mt-3 text-2xl font-light text-wg-black">{project.name}</h3>
                <p className="mt-4 leading-relaxed text-wg-gray">{project.text}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-wg-black">
                  Conhecer <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-wg-gray-light py-20 md:py-28">
        <div className="container-custom grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-wg-orange">Advisory</p>
            <h2 className="mt-4 text-3xl font-light text-wg-black md:text-5xl">Uma segunda visão de operador.</h2>
            <p className="mt-6 text-lg leading-relaxed text-wg-gray">Para founders, empresários, CEOs e sócios que precisam tomar decisões importantes sem analisar estratégia, operação e tecnologia em silos.</p>
            <Link
              to="/contato?context=william-advisory"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-wg-black px-6 py-3 text-white transition hover:bg-black/85"
            >
              Conversar sobre um desafio <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {advisoryTopics.map((topic) => (
              <div key={topic} className="flex gap-3 rounded-2xl bg-white p-6 shadow-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-wg-green" />
                <p className="leading-relaxed text-wg-black">{topic}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container-custom grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <Quote className="h-10 w-10 text-wg-orange" />
            <blockquote className="mt-6 max-w-4xl text-3xl font-light leading-snug text-wg-black md:text-5xl">
              “Antes de automatizar uma empresa, é preciso entender como ela realmente funciona.”
            </blockquote>
            <p className="mt-6 text-wg-gray">William Almeida</p>
          </div>
          <div className="rounded-2xl bg-wg-black p-8 text-white">
            <Building2 className="h-7 w-7 text-wg-orange" />
            <h3 className="mt-5 text-2xl font-light">Ecossistema Grupo WG Almeida</h3>
            <p className="mt-4 leading-relaxed text-white/65">Quatro núcleos ativos: WG Arquitetura, WG Engenharia, WG Marcenaria e WG/Build.tech. O Turnkey funciona como modelo de integração, não como um quinto núcleo.</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-white/15 px-3 py-2">Arquitetura</span>
              <span className="rounded-full border border-white/15 px-3 py-2">Engenharia</span>
              <span className="rounded-full border border-white/15 px-3 py-2">Marcenaria</span>
              <span className="rounded-full border border-white/15 px-3 py-2">WG/Build.tech</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-wg-orange py-16 text-white">
        <div className="container-custom flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-white/75">Próxima decisão</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-light md:text-4xl">Se o problema atravessa estratégia, operação e tecnologia, vale olhar para ele como um único sistema.</h2>
          </div>
          <Link
            to="/contato?context=william-advisory"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-wg-black transition hover:bg-white/90"
          >
            Iniciar uma conversa <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
