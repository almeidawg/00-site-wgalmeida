import SEO from '@/components/SEO'
import ICCRILinksBlock from '@/components/ICCRILinksBlock'
import LizAssistant from '@/components/LizAssistant'
import WGEasyEstimateCalculator from '@/components/WGEasyEstimateCalculator'
import { motion } from '@/lib/motion-lite'
import { ArrowRight, BarChart3, Building2, Landmark, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PRODUCT_URLS, WG_PRODUCT_MESSAGES } from '@/data/company';
import {
  getCommercialPackages,
  getCommercialService,
} from '@/data/commercialGovernance';

const ICCRI_PAGE_URL = 'https://wgalmeida.com.br/iccri'
const ICCRI_SERVICE_ID = 'iccri-reforma-civil-sp'

export default function ICCRI() {
  const commercialService = getCommercialService(ICCRI_SERVICE_ID)
  const commercialPackages = getCommercialPackages(ICCRI_SERVICE_ID)

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${ICCRI_PAGE_URL}#webpage`,
      url: ICCRI_PAGE_URL,
      name: 'ICCRI - Índice de Custo de Construção e Reforma Inteligente',
      description:
        'Motor proprietario da WG Almeida para conectar custo, categorias, servicos, composicoes e leitura operacional da obra, com simulador de faixa de investimento em 2026.',
      isPartOf: { '@id': 'https://wgalmeida.com.br/#website' },
      about: { '@id': `${ICCRI_PAGE_URL}#dataset-iccri` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      '@id': `${ICCRI_PAGE_URL}#dataset-iccri`,
      name: 'ICCRI 2026 - Índice de Custo de Construção e Reforma Inteligente',
      description:
        'Base proprietaria da WG Almeida com faixas de custo de reforma por m2, categorias operacionais, fatores de ajuste e leitura metodologica da obra.',
      url: ICCRI_PAGE_URL,
      creator: {
        '@type': 'Organization',
        '@id': 'https://wgalmeida.com.br/#organization',
        name: 'Grupo WG Almeida',
      },
      inLanguage: 'pt-BR',
      temporalCoverage: '2020/2026',
      spatialCoverage: {
        '@type': 'City',
        name: 'São Paulo',
      },
      isAccessibleForFree: true,
      variableMeasured: [
        { '@type': 'PropertyValue', name: 'custo_reforma_m2_essencial' },
        { '@type': 'PropertyValue', name: 'custo_reforma_m2_equilibrado' },
        { '@type': 'PropertyValue', name: 'custo_reforma_m2_superior' },
        { '@type': 'PropertyValue', name: 'custo_reforma_m2_exclusivo' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'O que e o ICCRI?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'O ICCRI e o indice proprietario da WG Almeida para estimar custo de reforma por m2 com base em dados reais de obras.',
          },
        },
        {
          '@type': 'Question',
          name: 'Com que frequencia o ICCRI e atualizado?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A atualizacao e periodica com base em variacao de materiais, mao de obra e historico operacional consolidado pela equipe tecnica.',
          },
        },
      ],
    },
  ]

  return (
    <>
      <SEO
        pathname="/iccri"
        title="ICCRI 2026 | Índice de Custo de Construção e Reforma Inteligente"
        description="Motor proprietario da WG Almeida para estimar custo, organizar categorias operacionais da obra e simular faixa de investimento para cliente final, corretores e parceiros."
        keywords="iccri, custo reforma m2, tabela custo reforma 2026, simulador custo obra, evf, avm, easyrealstate, obraeasy"
        url={ICCRI_PAGE_URL}
        schema={schema}
      />

      <section className="wg-page-hero wg-page-hero--default hero-under-header bg-wg-black text-white">
        <div className="container-custom py-14 md:py-20">
          <motion.h1
            className="text-4xl md:text-5xl font-inter font-light mb-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            ICCRI · Índice de Custo de Construção e Reforma Inteligente
          </motion.h1>
          <motion.p
            className="max-w-4xl text-lg text-white/80"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            O ICCRI é um índice proprietário da WG Almeida baseado em dados reais de obras.
            Ele organiza custo, categorias, serviços e composições em uma leitura operacional mais didática para tomada de decisão com previsibilidade.
          </motion.p>
          <motion.p
            className="mt-4 max-w-4xl text-base text-white/65"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
          >
            Como referência isolada, ele abre uma faixa. Quando entra no ecossistema WG, ele ajuda a
            sustentar a confiança da tese do ativo com base em custo real, fechamento real e captura de valor.
          </motion.p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-12 gap-8">
          <article className="lg:col-span-8 space-y-10">
            <div className="rounded-2xl border border-gray-200 bg-wg-gray-light p-6">
              <h2 className="text-2xl font-inter font-light text-wg-black mb-3">Quanto custa reformar em 2026?</h2>
              <p className="text-wg-gray leading-relaxed mb-4">
                Segundo a regua comercial homologada do ICCRI 2026, o custo estimado por m2 varia por nível de pacote. Essa é a camada de referência; a metodologia WG organiza a obra pelas etapas e gatilhos operacionais:
              </p>
              <ul className="space-y-2 text-wg-black">
                {commercialPackages.map((entry) => (
                  <li key={entry.key}>{entry.label}: {entry.rangeLabel}</li>
                ))}
              </ul>
              {commercialService?.sourceOfTruth && (
                <p className="mt-4 text-sm leading-relaxed text-wg-gray">
                  Fonte de verdade: {commercialService.sourceOfTruth}.
                </p>
              )}
            </div>

            <div>
              <WGEasyEstimateCalculator />
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={`${PRODUCT_URLS.obraeasy}/evf4`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-wg-orange px-4 py-2 text-white"
                >
                  Calcule seu custo agora
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href={`${PRODUCT_URLS.easyrealstate}/calculo`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-wg-blue px-4 py-2 text-wg-blue"
                >
                  Avaliar com AVM
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-wg-gray">
                Esta simulação é uma referência editorial guiada. A leitura mais forte acontece quando
                ela se conecta ao Easy Real State, ao EVF e ao realizado do ObraEasy para indicar se a
                tese ainda está experimental, se já pode ser conduzida de forma assistida ou se começa
                a ficar mais defensável com base real.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-inter font-light text-wg-black mb-3">Como o ICCRI é calculado</h2>
              <ul className="space-y-2 text-wg-gray leading-relaxed">
                <li>Custos reais de obras executadas</li>
                <li>Dados históricos operacionais da WG Almeida</li>
                <li>Variação de materiais e mão de obra</li>
                <li>Complexidade técnica dos projetos</li>
                <li>{WG_PRODUCT_MESSAGES.marketReferences}</li>
              </ul>
              <p className="mt-4 text-sm leading-relaxed text-wg-gray">
                O diferencial do ICCRI não está só em abrir faixas de custo. Ele está em servir de
                ponte entre custo, etapa operacional, execução real e leitura de captura de valor
                dentro do ecossistema WG.
              </p>
            </div>

            <LizAssistant context="custo" />
            <ICCRILinksBlock context="custo" />
          </article>

          <aside className="lg:col-span-4 space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-inter font-light text-wg-black mb-4">Para quem o ICCRI é útil</h3>
              <div className="space-y-4 text-sm text-wg-gray">
                <p className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 mt-0.5 text-wg-blue" />
                  Cliente final: planejamento com segurança e previsibilidade.
                </p>
                <p className="flex items-start gap-2">
                  <Users className="w-4 h-4 mt-0.5 text-wg-blue" />
                  Corretores e imobiliárias: precificação e potencial de valorização.
                </p>
                <p className="flex items-start gap-2">
                  <Landmark className="w-4 h-4 mt-0.5 text-wg-blue" />
                  Bancos e construtoras: benchmark para análise de decisão.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-inter font-light text-wg-black mb-3">Conteudos relacionados</h3>
              <ul className="space-y-2 text-sm">
                <li><Link className="text-wg-blue hover:underline" to="/blog/tabela-precos-reforma-2026-iccri">Tabela ICCRI 2026</Link></li>
                <li><Link className="text-wg-blue hover:underline" to="/blog/custo-reforma-m2-sao-paulo">Custo de reforma por m2 em São Paulo</Link></li>
                <li><Link className="text-wg-blue hover:underline" to="/blog/quanto-custa-reforma-apartamento-100m2">Quanto custa reformar 100m2</Link></li>
                <li><Link className="text-wg-blue hover:underline" to="/blog/como-calcular-custo-de-obra">Como calcular custo de obra</Link></li>
                <li><Link className="text-wg-blue hover:underline" to="/blog/custo-marcenaria-planejada">Custo de marcenaria planejada</Link></li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-wg-orange" />
                <h3 className="text-lg font-inter font-light text-wg-black">Ferramentas</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li><a className="text-wg-blue hover:underline" href={`${PRODUCT_URLS.obraeasy}/evf4`} target="_blank" rel="noopener noreferrer">Simulador de custo de obra (ObraEasy)</a></li>
                <li><a className="text-wg-blue hover:underline" href={`${PRODUCT_URLS.easyrealstate}/calculo`} target="_blank" rel="noopener noreferrer">Avaliacao imobiliaria (AVM)</a></li>
                <li><Link className="text-wg-blue hover:underline" to="/easy-real-state">Calculadora EasyRealState</Link></li>
                <li><Link className="text-wg-blue hover:underline" to="/buildtech">Ecossistema WG_Build.tech</Link></li>
                <li><Link className="text-wg-blue hover:underline" to="/tools/moodboard-generator">Tool: Moodboard Generator</Link></li>
                <li><Link className="text-wg-blue hover:underline" to="/tools/room-visualizer">Tool: Room Visualizer</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
