import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  CheckCircle2,
  CircleDashed,
  Compass,
  ExternalLink,
  Globe2,
  Link2,
  Megaphone,
  MousePointerClick,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import SEO from '@/components/SEO';
import { COMPANY, PRODUCT_URLS } from '@/data/company';

const clientProfiles = {
  umauma: {
    name: 'Grupo UMAUMA',
    segment: 'Ecossistema de eventos, marcas e ativações',
    city: 'São Paulo, SP',
    publicStage: 'Proposta viva BuildTech',
    promise:
      'Transformar presença digital, proposta comercial, operação e atendimento em uma jornada clara para vender melhor e operar com menos ruído.',
    currentSignals: [
      'Projeto EventOS já mapeado como referência de sistema operacional para múltiplas frentes.',
      'Há material de pitch, diagnóstico, demo e entregáveis que pode virar proposta pública de alto impacto.',
      'O próximo salto é conectar canais externos, prova social, funil e ativos comerciais em uma única narrativa.',
    ],
    modules: ['Site premium', 'Proposta pública', 'Diagnóstico digital', 'Agente Liz', 'CRM comercial'],
  },
  modelo: {
    name: 'Cliente em diagnóstico',
    segment: 'Empresa em pré-venda BuildTech',
    city: 'Brasil',
    publicStage: 'Modelo de proposta 360',
    promise:
      'Criar uma proposta que já chegue com pesquisa, hipóteses, oportunidades, links e plano de implantação pronto para decisão.',
    currentSignals: [
      'Levantamento inicial pendente de nome oficial, domínio, cidade, redes e canais comerciais.',
      'Proposta preparada para receber evidências reais de web, social, busca, anúncios e plataformas.',
      'O cliente recebe clareza do que existe, do que falta e do que a WG_Build.tech assume ponta a ponta.',
    ],
    modules: ['Pesquisa completa', 'Mapa de canais', 'Plano de aquisição', 'Site funcional', 'Automação'],
  },
};

const researchChecklist = [
  {
    area: 'Site e domínio',
    icon: Globe2,
    status: 'verificar',
    question: 'Existe site ativo, domínio próprio, SSL, páginas indexáveis e CTAs claros?',
    deliverable: 'Mapa do site atual, lacunas de conversão, redirects, domínio recomendado e plano de publicação.',
  },
  {
    area: 'Google Business Profile',
    icon: BadgeCheck,
    status: 'conectar',
    question: 'Existe Perfil da Empresa no Google, avaliações, categoria correta, fotos e endereço consistente?',
    deliverable: 'Checklist de presença local, pontos de confiança, fotos, reviews, categorias e ações de reputação.',
  },
  {
    area: 'Redes sociais',
    icon: Link2,
    status: 'mapear',
    question: 'Quais perfis existem em Instagram, LinkedIn, Facebook, TikTok, YouTube, Pinterest e Houzz?',
    deliverable: 'Inventário de links, bio, frequência, coerência visual, prova social e canais prioritários.',
  },
  {
    area: 'Mídia paga',
    icon: Megaphone,
    status: 'conectar',
    question: 'Há Google Ads, Meta Ads, Pinterest Ads, LinkedIn Ads ou pixels instalados?',
    deliverable: 'Mapa de contas, acessos necessários, tags, UTMs, públicos, campanhas e rotina de performance.',
  },
  {
    area: 'SEO e autoridade',
    icon: Search,
    status: 'analisar',
    question: 'A marca aparece na busca? Existem páginas ranqueando, backlinks, notícias ou concorrentes capturando demanda?',
    deliverable: 'Leitura de busca, oportunidades de conteúdo, páginas comerciais e plano de autoridade.',
  },
  {
    area: 'Analytics e eventos',
    icon: MousePointerClick,
    status: 'instrumentar',
    question: 'Existe GA4, Search Console, Tag Manager, pixels e eventos de conversão confiáveis?',
    deliverable: 'Plano de mensuração, eventos, funil, dashboard e rastreabilidade do lead até proposta.',
  },
  {
    area: 'Canais de atendimento',
    icon: Bot,
    status: 'automatizar',
    question: 'WhatsApp, e-mail, formulários, CRM e respostas estão conectados ou dependem de memória solta?',
    deliverable: 'Fluxo de atendimento com Liz, qualificação, handoff humano, follow-up e registro de etapa.',
  },
  {
    area: 'Plataformas externas',
    icon: Compass,
    status: 'vincular',
    question: 'A empresa depende de marketplaces, reservas, catálogo, portal, CRM, ERP ou agenda externa?',
    deliverable: 'Mapa de integrações, links úteis, riscos de dependência e automações possíveis.',
  },
  {
    area: 'Risco e confiança',
    icon: ShieldCheck,
    status: 'blindar',
    question: 'Há inconsistência de nome, telefone, endereço, provas, políticas, contrato ou segurança?',
    deliverable: 'Plano de confiança digital com NAP, LGPD, termos, provas, reputação e governança de links.',
  },
];

const starSteps = [
  ['S', 'Situar', 'Entender mercado, cliente, canais, concorrência, presença e maturidade digital.'],
  ['T', 'Traduzir', 'Converter o diagnóstico em escopo, módulos, links, integrações e decisão comercial.'],
  ['A', 'Acionar', 'Montar site, proposta, agentes, CRM, mídia, dados e ativos externos conectados.'],
  ['R', 'Rastrear', 'Acompanhar abertura, clique, lead, conversa, proposta, follow-up e evolução do funil.'],
];

const proposalBlocks = [
  {
    title: 'Dossiê de presença digital',
    text: 'A proposta começa mostrando o que encontramos: site, redes, Google, busca, reputação, anúncios, links e lacunas.',
  },
  {
    title: 'Mapa de oportunidades',
    text: 'Cada descoberta vira ação: corrigir, criar, conectar, automatizar, medir ou transformar em argumento comercial.',
  },
  {
    title: 'Plano de implantação',
    text: 'O cliente entende o que entra primeiro, o que depende de acesso, o que será publicado e como será validado.',
  },
  {
    title: 'Link público rastreável',
    text: 'A proposta fica em URL própria por cliente, pronta para aprovação, reunião, WhatsApp e evolução de escopo.',
  },
];

const statusStyles = {
  verificar: 'border-blue-300 bg-blue-50 text-blue-900',
  conectar: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  mapear: 'border-wg-brown bg-white text-wg-brown',
  analisar: 'border-fuchsia-300 bg-fuchsia-50 text-fuchsia-900',
  instrumentar: 'border-cyan-300 bg-cyan-50 text-cyan-900',
  automatizar: 'border-lime-300 bg-lime-50 text-lime-900',
  vincular: 'border-indigo-300 bg-indigo-50 text-indigo-900',
  blindar: 'border-rose-300 bg-rose-50 text-rose-900',
};

function normaliseSlug(slug) {
  return (slug || 'modelo').toLowerCase().replace(/[^a-z0-9-]/g, '');
}

export default function BuildTechClientProposal() {
  const params = useParams();
  const slug = normaliseSlug(params.slug);
  const profile = clientProfiles[slug] || clientProfiles.modelo;
  const [activeArea, setActiveArea] = useState(researchChecklist[0].area);

  const publicUrl = `${PRODUCT_URLS.buildtech}/clientes/${slug}`;
  const activeChecklist = useMemo(
    () => researchChecklist.find((item) => item.area === activeArea) || researchChecklist[0],
    [activeArea]
  );
  const whatsappText = encodeURIComponent(
    `Quero revisar a proposta 360 da WG_Build.tech para ${profile.name}: ${publicUrl}`
  );
  const whatsappPhone = COMPANY.phoneRaw.replace(/\D/g, '');

  return (
    <>
      <SEO
        pathname={`/clientes/${slug}`}
        title={`${profile.name} | Proposta 360 WG_Build.tech`}
        description={`Proposta pública WG_Build.tech para ${profile.name}, com pesquisa digital, presença, canais, automação, site e plano de implantação.`}
        canonical={publicUrl}
        noindex
      />

      <div className="min-h-screen bg-[#f7f4ec] text-[#151515]">
        <section className="relative overflow-hidden border-b border-black/10 bg-[#111111] text-white">
          <div className="mx-auto grid min-h-[88vh] max-w-7xl grid-cols-1 gap-10 px-5 py-10 md:grid-cols-[1fr_0.9fr] md:px-8 lg:px-10">
            <div className="flex flex-col justify-between gap-12">
              <nav className="flex flex-wrap items-center justify-between gap-4 text-sm">
                <a href={PRODUCT_URLS.buildtech} className="font-semibold">
                  WG_Build.tech
                </a>
                <div className="flex flex-wrap items-center gap-3 text-white/70">
                  <span>Proposta viva</span>
                  <span>{profile.publicStage}</span>
                </div>
              </nav>

              <div className="max-w-4xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/75">
                  <Sparkles className="h-4 w-4 text-[#b6ff6d]" />
                  Pesquisa, estratégia, site, agentes e operação em um link.
                </div>
                <h1 className="text-5xl font-semibold leading-[0.95] md:text-7xl lg:text-8xl">
                  Uma proposta que chega sabendo onde o cliente está.
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72">
                  {profile.promise}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/${whatsappPhone}?text=${whatsappText}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#b6ff6d] px-5 py-3 font-semibold text-black transition hover:-translate-y-0.5"
                  >
                    Revisar com a Liz
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#pesquisa"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Ver dossiê
                    <Search className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {['Pesquisa completa', 'Plano conectado', 'Pronto para aprovação'].map((item) => (
                  <div key={item} className="rounded-lg border border-white/12 bg-white/[0.06] p-4">
                    <CheckCircle2 className="mb-3 h-5 w-5 text-[#b6ff6d]" />
                    <p className="text-sm text-white/78">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="flex items-center">
              <div className="w-full rounded-lg border border-white/15 bg-white p-4 text-black shadow-2xl">
                <div className="rounded-lg bg-[#f0eee6] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-black/55">Cliente</p>
                      <h2 className="mt-1 text-3xl font-semibold">{profile.name}</h2>
                      <p className="mt-2 text-sm text-black/60">{profile.segment}</p>
                    </div>
                    <span className="rounded-lg bg-black px-3 py-2 text-sm text-white">{slug}</span>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white p-4">
                      <p className="text-xs text-black/50">Link público</p>
                      <p className="mt-2 break-words text-sm font-semibold">{publicUrl}</p>
                    </div>
                    <div className="rounded-lg bg-white p-4">
                      <p className="text-xs text-black/50">Local</p>
                      <p className="mt-2 text-sm font-semibold">{profile.city}</p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-lg bg-[#111] p-5 text-white">
                    <p className="text-sm text-white/60">Sinais já conhecidos</p>
                    <ul className="mt-4 space-y-3">
                      {profile.currentSignals.map((signal) => (
                        <li key={signal} className="flex gap-3 text-sm leading-6 text-white/80">
                          <CircleDashed className="mt-1 h-4 w-4 flex-none text-[#b6ff6d]" />
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="pesquisa" className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase text-black/50">Pesquisa 360</p>
              <h2 className="mt-3 text-4xl font-semibold md:text-6xl">Nada de proposta no escuro.</h2>
              <p className="mt-5 text-lg leading-8 text-black/65">
                Antes de vender site, sistema ou tráfego, a WG_Build.tech mostra o cenário real:
                o que existe, o que falta, quais acessos precisamos e onde a primeira vitória aparece.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {researchChecklist.map((item) => {
                const Icon = item.icon;
                const active = item.area === activeArea;
                return (
                  <button
                    key={item.area}
                    type="button"
                    onClick={() => setActiveArea(item.area)}
                    className={`rounded-lg border p-4 text-left transition ${
                      active ? statusStyles[item.status] : 'border-black/10 bg-white hover:-translate-y-0.5'
                    }`}
                    aria-pressed={active}
                  >
                    <Icon className="mb-4 h-5 w-5" />
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold">{item.area}</h3>
                      <span className="text-xs uppercase">{item.status}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 opacity-75">{item.question}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-black/10 bg-[#111] p-6 text-white">
            <div className="grid gap-5 md:grid-cols-[0.35fr_1fr]">
              <div>
                <p className="text-sm text-white/55">Entrega destacada</p>
                <h3 className="mt-2 text-2xl font-semibold">{activeChecklist.area}</h3>
              </div>
              <p className="text-lg leading-8 text-white/76">{activeChecklist.deliverable}</p>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
            <div className="grid gap-4 md:grid-cols-4">
              {proposalBlocks.map((block, index) => (
                <article key={block.title} className="rounded-lg border border-black/10 bg-[#f7f4ec] p-5">
                  <span className="text-sm text-black/45">0{index + 1}</span>
                  <h3 className="mt-4 text-xl font-semibold">{block.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/62">{block.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold uppercase text-black/50">Método S T A R</p>
              <h2 className="mt-3 text-4xl font-semibold md:text-6xl">Da investigação ao plano conectado.</h2>
            </div>
            <div className="grid gap-3">
              {starSteps.map(([letter, title, text]) => (
                <div key={letter} className="grid grid-cols-[56px_1fr] gap-4 rounded-lg border border-black/10 bg-white p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-black text-2xl font-semibold text-[#b6ff6d]">
                    {letter}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-black/62">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-black/10 bg-[#e9f2ff] py-16">
          <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1fr]">
              <div>
                <p className="text-sm font-semibold uppercase text-black/50">Módulos recomendados</p>
                <h2 className="mt-3 text-4xl font-semibold md:text-6xl">A proposta já nasce com cesta de execução.</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.modules.map((module) => (
                  <div key={module} className="rounded-lg border border-black/10 bg-white p-5">
                    <BarChart3 className="mb-4 h-5 w-5 text-blue-700" />
                    <h3 className="font-semibold">{module}</h3>
                    <p className="mt-2 text-sm leading-6 text-black/60">
                      Escopo, responsável, evidência e próximo passo ficam visíveis na proposta pública.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#111] px-5 py-16 text-white md:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl rounded-lg border border-white/15 bg-white/[0.04] p-6 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <p className="text-sm font-semibold uppercase text-white/50">O que pedimos do cliente</p>
                <h2 className="mt-3 text-4xl font-semibold md:text-6xl">Acessos sem fricção. Execução sem desculpa.</h2>
              </div>
              <div className="space-y-3">
                {[
                  'Nome oficial, domínio, redes sociais e principais concorrentes.',
                  'Acesso ou convite para Google Business Profile, Search Console, GA4 e Tag Manager quando existirem.',
                  'Acesso a Meta Business, Google Ads, Pinterest/LinkedIn Ads e pixels se houver mídia ativa.',
                  'Telefone, WhatsApp, e-mail comercial, CRM, formulários e plataformas externas em uso.',
                  'Permissão para criar links, eventos, UTMs, páginas e automações com rastreabilidade.',
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-lg bg-white/[0.06] p-4 text-sm leading-6 text-white/78">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-[#b6ff6d]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-[#f7f4ec] px-5 py-10 md:px-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">WG_Build.tech · Proposta 360</p>
              <p className="mt-1 text-sm text-black/55">
                Link público, pesquisa, plano e implantação para clientes BuildTech.
              </p>
            </div>
            <a
              href={publicUrl}
              className="inline-flex items-center gap-2 rounded-lg border border-black/15 bg-white px-4 py-3 text-sm font-semibold"
            >
              Abrir link oficial
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
