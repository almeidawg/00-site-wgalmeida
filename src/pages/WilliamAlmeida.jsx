import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Quote } from 'lucide-react';
import Seo from '@/components/SEO';
import ResponsiveWebpImage from '@/components/ResponsiveWebpImage';
import { SCHEMAS } from '@/data/schemaConfig';
import { withBasePath } from '@/utils/assetPaths';

const WILLIAM_IMAGE = withBasePath('/images/about/william-almeida-1200.webp');
const CTA = '/contato?context=william-advisory';

const timeline = [
  ['Antes de 2011', 'Atendimento, comercial, vendas e gestão', 'A base veio antes da empresa própria: relacionamento com clientes, negociação, execução e gestão. Foi aí que começou a visão de negócio como sistema, e não como tarefas isoladas.'],
  ['28/10/2011', 'Início da trajetória empresarial WG', 'A primeira empresa da trajetória WG abriu em 28 de outubro de 2011. A partir daí, William passou a construir uma operação ligada a interiores, arquitetura, execução e gestão.'],
  ['2011–2024', 'Integração entre disciplinas e Turnkey', 'Arquitetura, Engenharia e Marcenaria passaram a operar de forma cada vez mais conectada. Projeto, execução, fornecedores, custos, pessoas e informação precisavam funcionar como uma única jornada.'],
  ['2025', 'Nasce a WG/Build.tech', 'A tecnologia deixa de ser apenas apoio interno e vira um núcleo do Grupo: software, dados, automação e IA aplicados a problemas já conhecidos por dentro da operação.'],
  ['2025–2026', 'Da operação para sistemas e produtos', 'Ferramentas, motores de decisão, plataformas, automações e agentes passam a materializar processos antes fragmentados. O foco deixa de ser “mais software” e passa a ser “melhor operação”.'],
  ['Hoje', 'Founder, Operator & Builder + Advisory', 'William aplica a experiência acumulada como uma segunda visão de operador para founders e empresários que precisam conectar estratégia, operação, produto, tecnologia, automação e IA.'],
];

const projects = [
  ['Grupo WG Almeida', 'Operação empresarial real', 'O ecossistema que conecta WG Arquitetura, WG Engenharia, WG Marcenaria e WG/Build.tech e sustenta a experiência operacional.', '/sobre'],
  ['Turnkey', 'Integração operacional', 'Modelo que conecta projeto, planejamento, execução, materiais, marcenaria, gestão e entrega, reduzindo interfaces onde contexto se perde.', '/obra-turn-key'],
  ['WGEasy', 'Operação transformada em sistema', 'Backbone operacional criado para organizar processos, dados, CRM/ERP e governança do ecossistema.', '/wgeasy'],
  ['ObraEasy', 'Conhecimento transformado em produto', 'Produto construído a partir de problemas reais de viabilidade e jornada de obra, aproximando decisão, orçamento e acompanhamento.', '/obraeasy'],
  ['ICCRI', 'Dados para decisão', 'Motor de referência de custos para obra e reforma, transformando informação operacional em uma camada mais útil de decisão.', '/iccri'],
  ['EasyRealState', 'Método aplicado a outra vertical', 'Vertical imobiliária que combina avaliação, CRM, captação e inteligência comercial com tecnologia como estrutura horizontal.', '/easy-real-state'],
  ['WG/Build.tech', 'Tecnologia criada por quem opera', 'Núcleo criado em 2025 para transformar conhecimento operacional em sistemas, SaaS, dados, automação, IA e produtos digitais.', '/buildtech'],
];

const advisoryTopics = [
  'Estratégia empresarial e tomada de decisão', 'Arquitetura operacional e desenho de processos',
  'Produto e transformação de conhecimento em software', 'IA e automação aplicadas ao negócio',
  'Sistemas, integrações, dados e governança', 'Vertical SaaS e co-criação com especialistas',
];

const seoKeywords = ['William Almeida', 'William Almeida Grupo WG Almeida', 'William Almeida WG/Build.tech', 'advisor estratégico', 'advisor para fundadores', 'advisor para empresários', 'consultor estratégico', 'estratégia e operações', 'IA para empresas', 'automação empresarial'];

function Eyebrow({ children }) {
  return <p className="text-sm uppercase tracking-[0.22em] text-wg-orange">{children}</p>;
}

function ActionLink({ children, light = false }) {
  const tone = light ? 'bg-white text-wg-black hover:bg-white/90' : 'bg-wg-black text-white hover:bg-black/85';
  return <Link to={CTA} className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium transition ${tone}`}>{children}<ArrowRight className="h-4 w-4" /></Link>;
}

export default function WilliamAlmeida() {
  return <>
    <Seo pathname="/william-almeida" schema={[SCHEMAS.profileWilliam, SCHEMAS.personWilliam, SCHEMAS.breadcrumbWilliam]} keywords={seoKeywords} />
    <main>
      <section className="relative overflow-hidden bg-wg-black text-white">
        <div className="container-custom relative z-10 grid min-h-[720px] items-center gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div>
            <Eyebrow>William Almeida</Eyebrow>
            <h1 className="mt-5 max-w-4xl text-4xl font-light leading-tight md:text-6xl lg:text-7xl">Founder, Operator & Builder</h1>
            <p className="mt-6 max-w-3xl text-xl font-light leading-relaxed text-white/85 md:text-2xl">Advisor Estratégico para fundadores e empresários em estratégia, operações, produto, tecnologia, automação e IA.</p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">Uma segunda visão de operador para decisões que atravessam crescimento, processo, produto e tecnologia — construída a partir de uma trajetória empresarial iniciada em 2011.</p>
            <div className="mt-9 flex flex-wrap gap-4"><Link to={CTA} className="inline-flex items-center gap-2 rounded-full bg-wg-orange px-6 py-3 font-medium text-white">Conversar com William <ArrowRight className="h-4 w-4" /></Link><a href="#trajetoria" className="rounded-full border border-white/25 px-6 py-3">Conhecer minha trajetória</a></div>
          </div>
          <figure className="mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
            <ResponsiveWebpImage src={WILLIAM_IMAGE} alt="William Almeida, fundador do Grupo WG Almeida e da WG/Build.tech" className="h-[560px] w-full object-cover object-center" width="1200" height="1500" loading="eager" fetchpriority="high" sizes="(max-width: 1024px) 92vw, 40vw" />
            <figcaption className="p-6"><span className="text-wg-orange">Desde 2011</span><br />Fundador do Grupo WG Almeida e da WG/Build.tech</figcaption>
          </figure>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28"><div className="container-custom grid gap-12 lg:grid-cols-[0.9fr_1.1fr]"><div><Eyebrow>A tese</Eyebrow><h2 className="mt-4 text-3xl font-light text-wg-black md:text-5xl">Tecnologia criada por quem opera.</h2></div><div className="space-y-5 text-lg leading-relaxed text-wg-gray"><p>A trajetória não começou no software. Antes vieram vendas, clientes, projetos, fornecedores, obras, equipes, custos, prazos e a responsabilidade de fazer uma operação funcionar no mundo real.</p><p>Ao longo dos anos, o problema ficou claro: empresas perdem contexto quando pessoas, processos, dados e ferramentas trabalham de forma fragmentada.</p><p>Daí surgiu uma forma de pensar: entender a operação, estruturar o processo, materializar uma solução, validar no mundo real e só depois automatizar e escalar.</p></div></div></section>

      <section id="trajetoria" className="bg-wg-gray-light py-20 md:py-28"><div className="container-custom"><Eyebrow>Trajetória</Eyebrow><h2 className="mt-4 max-w-3xl text-3xl font-light text-wg-black md:text-5xl">Da operação para a integração. Da integração para sistemas.</h2><div className="mt-14 grid gap-5 lg:grid-cols-2">{timeline.map(([period, title, text]) => <article key={period} className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm"><strong className="text-sm uppercase tracking-[0.18em] text-wg-orange">{period}</strong><h3 className="mt-3 text-2xl font-light text-wg-black">{title}</h3><p className="mt-4 leading-relaxed text-wg-gray">{text}</p></article>)}</div></div></section>

      <section className="bg-wg-black py-20 text-white md:py-28"><div className="container-custom"><Eyebrow>Método</Eyebrow><h2 className="mt-4 max-w-4xl text-3xl font-light md:text-5xl">O produto muda. O especialista muda. O mercado muda. O método permanece.</h2><div className="mt-12 grid gap-3 md:grid-cols-4">{['Entender', 'Estruturar', 'Materializar', 'Validar', 'Automatizar', 'Medir', 'Produto', 'Escala'].map((step, index) => <div key={step} className="rounded-xl border border-white/10 bg-white/5 p-5"><span className="text-xs text-wg-orange">0{index + 1}</span><p className="mt-2 text-lg">{step}</p></div>)}</div><p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/65">A especialização vertical vem de quem conhece profundamente o mercado. A WG/Build.tech conecta esse conhecimento a produto, software, dados, IA e automação para torná-lo testável, operacional e escalável.</p></div></section>

      <section className="bg-white py-20 md:py-28"><div className="container-custom"><Eyebrow>Projetos e sistemas</Eyebrow><h2 className="mt-4 text-3xl font-light text-wg-black md:text-5xl">Algumas coisas que construí no caminho.</h2><p className="mt-5 max-w-3xl text-wg-gray">Não como uma coleção de softwares, mas como etapas de uma mesma evolução: operação → integração → dados → sistemas → produto.</p><div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{projects.map(([name, role, text, href]) => <Link key={name} to={href} className="group rounded-2xl border border-black/5 bg-wg-gray-light p-7 transition hover:-translate-y-1 hover:shadow-lg"><small className="uppercase tracking-[0.15em] text-wg-orange">{role}</small><h3 className="mt-3 text-2xl font-light text-wg-black">{name}</h3><p className="mt-4 leading-relaxed text-wg-gray">{text}</p><span className="mt-6 inline-flex items-center gap-2 font-medium">Conhecer <ArrowRight className="h-4 w-4" /></span></Link>)}</div></div></section>

      <section className="bg-wg-gray-light py-20 md:py-28"><div className="container-custom grid gap-12 lg:grid-cols-[0.9fr_1.1fr]"><div><Eyebrow>Advisory</Eyebrow><h2 className="mt-4 text-3xl font-light text-wg-black md:text-5xl">Uma segunda visão de operador.</h2><p className="mt-6 text-lg leading-relaxed text-wg-gray">Para founders, empresários, CEOs e sócios que precisam tomar decisões importantes sem analisar estratégia, operação e tecnologia em silos.</p><div className="mt-8"><ActionLink>Conversar sobre um desafio</ActionLink></div></div><div className="grid gap-4 sm:grid-cols-2">{advisoryTopics.map((topic) => <div key={topic} className="flex gap-3 rounded-2xl bg-white p-6 shadow-sm"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-wg-green" /><p className="leading-relaxed text-wg-black">{topic}</p></div>)}</div></div></section>

      <section className="bg-white py-20 md:py-28"><div className="container-custom"><Quote className="h-10 w-10 text-wg-orange" /><blockquote className="mt-6 max-w-4xl text-3xl font-light leading-snug text-wg-black md:text-5xl">“Antes de automatizar uma empresa, é preciso entender como ela realmente funciona.”</blockquote><p className="mt-6 text-wg-gray">William Almeida</p><p className="mt-10 max-w-3xl leading-relaxed text-wg-gray">O Grupo WG Almeida opera quatro núcleos ativos: WG Arquitetura, WG Engenharia, WG Marcenaria e WG/Build.tech. O Turnkey é o modelo de integração entre capacidades, não um quinto núcleo.</p></div></section>

      <section className="bg-wg-orange py-16 text-white"><div className="container-custom flex flex-col justify-between gap-8 lg:flex-row lg:items-center"><h2 className="max-w-3xl text-3xl font-light md:text-4xl">Se o problema atravessa estratégia, operação e tecnologia, vale olhar para ele como um único sistema.</h2><ActionLink light>Iniciar uma conversa</ActionLink></div></section>
    </main>
  </>;
}
