import { Link } from 'react-router-dom'
import SEO from '@/components/SEO'
import { COMPANY } from '@/data/company'

export default function DataDeletion() {
  return (
    <>
      <SEO
        pathname="/exclusao-de-dados"
        title="Exclusão de Dados | Grupo WG Almeida"
        description="Instruções para solicitar a exclusão de dados pessoais tratados pelo Grupo WG Almeida."
        canonical="https://wgalmeida.com.br/exclusao-de-dados"
      />
      <article className="mx-auto w-full max-w-4xl px-5 py-16 md:px-8 md:py-24 text-slate-800">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-wg-orange">Grupo WG Almeida</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Solicitação de exclusão de dados</h1>
        <div className="mt-12 space-y-8 text-base leading-8 text-slate-700">
          <p>Para solicitar a exclusão dos seus dados pessoais tratados em nossos canais, envie um e-mail para <a className="text-wg-orange underline underline-offset-4" href={`mailto:${COMPANY.email}?subject=${encodeURIComponent('Solicitação de exclusão de dados')}`}>{COMPANY.email}</a> com o assunto “Solicitação de exclusão de dados”.</p>
          <p>Inclua o nome e o canal de contato utilizado, como WhatsApp, formulário do site ou e-mail. Não envie documentos ou informações sensíveis na primeira mensagem.</p>
          <p>Confirmaremos a identidade de forma proporcional antes de processar o pedido. A exclusão será realizada quando aplicável, ressalvadas informações que precisem ser mantidas por obrigação legal, prevenção a fraude, segurança ou defesa de direitos.</p>
          <p>Para conhecer o tratamento dos dados e os demais direitos do titular, consulte a <Link className="text-wg-orange underline underline-offset-4" to="/privacidade">Política de Privacidade</Link>.</p>
        </div>
      </article>
    </>
  )
}
