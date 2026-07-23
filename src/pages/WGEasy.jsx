import SEO from '@/components/SEO'
import WGEasyEstimateCalculator from '@/components/WGEasyEstimateCalculator'
import { PRODUCT_URLS } from '@/data/company'
import { ArrowRight, Calculator, FileSearch, Layers3, Workflow } from 'lucide-react'

const capabilities = [
  { icon: FileSearch, title: 'Briefing e plantas', text: 'Organiza entradas, arquivos, ambientes, medidas e revisão humana.' },
  { icon: Layers3, title: 'Quantitativos e custos', text: 'Conecta composições, materiais, mão de obra, perdas, despesas e impostos.' },
  { icon: Calculator, title: 'Orçamento e proposta', text: 'Mantém cálculo, versões e comunicação comercial na mesma cadeia.' },
  { icon: Workflow, title: 'Acompanhamento', text: 'Transforma o aceite em projeto, cronograma, tarefas e indicadores.' },
]

export default function WGEasy() {
  return (
    <>
      <SEO pathname="/wgeasy" title="WG Easy | Orçamento e gestão de projetos e obras"
        description="Conheça o WG Easy, plataforma do Grupo WG Almeida para organizar briefing, quantitativos, orçamento, proposta e acompanhamento." />
      <section className="wg-page-hero hero-under-header bg-wg-black text-white">
        <div className="container-custom py-14 md:py-20">
          <p className="mb-3 text-sm uppercase tracking-[0.18em] text-wg-orange">Produto WG/Build.tech</p>
          <h1 className="max-w-4xl text-4xl font-inter font-light md:text-5xl">WG Easy</h1>
          <p className="mt-5 max-w-3xl text-lg text-white/80">
            Uma cadeia operacional para transformar briefing e projeto em quantitativos, orçamento, proposta e acompanhamento, com revisão técnica e rastreabilidade.
          </p>
          <a href={PRODUCT_URLS.wgeasy} target="_blank" rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-wg-orange px-5 py-3 text-white">
            Acessar WG Easy <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-gray-200 p-5">
                <Icon className="h-6 w-6 text-wg-orange" />
                <h2 className="mt-4 text-xl font-inter font-light">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-wg-gray">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-10">
            <WGEasyEstimateCalculator />
          </div>
        </div>
      </section>
    </>
  )
}
