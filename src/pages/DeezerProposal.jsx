import SEO from '@/components/SEO';

const scopes = [
  ['Gestão do Projeto','Coordenação Turn Key, planejamento, suprimentos, obra, subcontratados, interfaces e entrega.'],
  ['Mobilização','Preparação do local, proteções, logística, organização das frentes e limpeza de implantação.'],
  ['Civil e divisórias','Drywall com isolamento acústico e adequações civis previstas no cenário técnico aprovado.'],
  ['Pisos, teto e pintura','Acabamentos corporativos conforme validação final de materiais e condições existentes.'],
  ['Elétrica e iluminação','Infraestrutura, pontos de uso e iluminação geral conforme premissas e validação executiva.'],
  ['Hidráulica','Adequações funcionais de copa e PNE, condicionadas à infraestrutura existente.'],
  ['HVAC e incêndio','Allowances para adequações pontuais; intervenções adicionais dependem de diagnóstico e aprovação.'],
  ['TI / dados','Cabeamento estruturado Cat6, rack/CPD passivo e organização básica de infraestrutura.'],
  ['Marcenaria e mobiliário','Copa/móveis fixos, 2 phone booths e 2 mesas picnic conforme quantitativos preliminares.'],
];

const timeline = [
  ['D1–D5','Mobilização e validações finais','RFIs, regras de acesso, proteção e organização das frentes.'],
  ['D4–D18','Demolições, civil e infraestruturas','Preparações, drywall e execução coordenada das disciplinas MEP.'],
  ['D15–D32','Forro, iluminação e acabamentos','Piso, pintura e fechamento das interfaces técnicas.'],
  ['D28–D40','Marcenaria, FF&E e instalações finais','Montagens, ajustes, testes e finalização de ambientes.'],
  ['D41–D45','Comissionamento e entrega','Punch list, limpeza pós-obra, documentação e aceite.'],
];

const terms = [
  ['Preço global','R$ 459.836,08','Valor Máximo do Contrato proposto.'],
  ['Mark-up','30%','Política comercial aplicada à proposta.'],
  ['Validade','15 dias corridos','A partir da data de emissão.'],
  ['Prazo','45 dias úteis','Sujeito às liberações do edifício e itens de longo prazo.'],
  ['Garantia','12 meses','Para serviços executados pela contratada, conforme contrato.'],
  ['Pagamento','50% / 20% / 30%','Mobilização, medição intermediária e entrega.'],
];

export default function DeezerProposal() {
  const url = 'https://wgalmeida.com.br/propostas/deezer-2026';

  return (
    <>
      <SEO
        pathname="/propostas/deezer-2026"
        title="Proposta WG Almeida · Deezer Brasil"
        description="Proposta comercial Turn Key da WG Almeida para reforma e adaptação do escritório Deezer em São Paulo."
        canonical={url}
        noindex
      />
      <main className="min-h-screen bg-[#08080c] text-white">
        <section className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
          <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_0%,rgba(162,56,255,.22),transparent_34%),linear-gradient(135deg,#101018,#0c0c12)] p-6 shadow-2xl md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <img src="/propostas/deezer-2026/deezer-logo.png" alt="Deezer" className="h-auto w-[210px] max-w-[52vw]" />
              <span className="text-sm font-semibold uppercase tracking-[.22em] text-[#f2b13a]">WG Almeida · Turn Key</span>
            </div>

            <p className="mt-10 text-xs font-bold uppercase tracking-[.28em] text-[#A238FF]">Proposta comercial · Reforma escritório São Paulo</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">Gestão ponta a ponta para adaptação do escritório Deezer.</h1>
            <p className="mt-5 max-w-4xl text-base leading-7 text-white/70 md:text-lg">
              Proposta preparada a partir do RFP, do layout Pré-Executivo Rev.02 e do modelo comercial disponibilizado pela Deezer. A WG Almeida assume coordenação, suprimentos, execução, subcontratados e entrega sob regime de preço global.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Cliente','Deezer Music Brasil Ltda.'],
                ['Local','Pinheiros · São Paulo'],
                ['Prazo-base','45 dias úteis'],
                ['Maximum Contract Value','R$ 459.836,08'],
              ].map(([label,value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
                  <span className="text-xs uppercase tracking-[.16em] text-white/45">{label}</span>
                  <div className="mt-2 text-xl font-semibold">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <section className="mt-7 rounded-[1.7rem] border border-white/10 bg-white/[.025] p-6 md:p-8">
            <h2 className="text-2xl font-semibold md:text-3xl">Escopo integrado</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {scopes.map(([title,text]) => (
                <article key={title} className="rounded-2xl border border-white/10 bg-[#11111a] p-5">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">{text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-7 rounded-[1.7rem] border border-white/10 bg-white/[.025] p-6 md:p-8">
            <h2 className="text-2xl font-semibold md:text-3xl">Cronograma de referência</h2>
            <div className="mt-5 space-y-3">
              {timeline.map(([day,title,text]) => (
                <div key={day} className="grid gap-2 rounded-2xl border border-white/10 bg-[#11111a] p-5 md:grid-cols-[90px_1fr]">
                  <strong className="text-[#A238FF]">{day}</strong>
                  <div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-white/65">{text}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section id="condicoes" className="mt-7 rounded-[1.7rem] border border-white/10 bg-white/[.025] p-6 md:p-8">
            <h2 className="text-2xl font-semibold md:text-3xl">Condições comerciais</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {terms.map(([label,value,text]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-[#11111a] p-5">
                  <span className="text-xs uppercase tracking-[.16em] text-white/45">{label}</span>
                  <strong className="mt-2 block text-xl">{value}</strong>
                  <p className="mt-2 text-sm leading-6 text-white/65">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-7 rounded-[1.7rem] border border-[#f2b13a]/30 bg-[#f2b13a]/[.06] p-6 md:p-8">
            <h2 className="text-2xl font-semibold">Premissas e controles de mudança</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-white/70 md:text-base">
              <li>O layout Pré-Executivo Rev.02 é a base de execução, sem alteração de projeto pela WG.</li>
              <li>O cenário utiliza área global de referência de 400 m² e pé-direito de 2,44 m nas premissas autorizadas.</li>
              <li>HVAC, proteção contra incêndio, demolição e determinadas infraestruturas permanecem como allowances até validação de campo/projeto.</li>
              <li>Qualquer alteração de escopo ou custo extra será executada somente após aprovação prévia e escrita da Deezer.</li>
              <li>Condições imprevistas ou divergências do existente serão formalizadas por change order antes da execução adicional.</li>
            </ul>
          </section>

          <section className="mt-7 rounded-[1.7rem] border border-white/10 bg-white/[.025] p-6 md:p-8">
            <h2 className="text-2xl font-semibold">Entrega Turn Key</h2>
            <p className="mt-3 max-w-4xl leading-7 text-white/70">
              A WG Almeida conduzirá a reforma integrando arquitetura, engenharia, marcenaria e gestão de obra. A documentação de contratação, responsáveis técnicos e registros aplicáveis serão formalizados conforme o escopo executivo aprovado e as exigências do edifício.
            </p>
            <a href="mailto:contato@wgalmeida.com.br?subject=Proposta%20Deezer%20Brasil%20-%20WG%20Almeida" className="mt-6 inline-flex rounded-full bg-[#f2b13a] px-5 py-3 font-semibold text-black">
              Falar com a WG Almeida
            </a>
          </section>

          <footer className="py-8 text-center text-xs text-white/40">
            WG Almeida · Proposta Deezer Brasil · 24/09/2026 · Conteúdo confidencial para avaliação comercial.
          </footer>
        </section>
      </main>
    </>
  );
}
