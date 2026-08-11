import { Link } from 'react-router-dom'
import SEO from '@/components/SEO'
import { COMPANY } from '@/data/company'

const UPDATED_AT = '10 de agosto de 2026'

function ContactLink() {
  return <a className="text-wg-orange underline underline-offset-4" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
}

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        pathname="/privacidade"
        title="Política de Privacidade | Grupo WG Almeida"
        description="Como o Grupo WG Almeida trata dados pessoais em seus canais digitais, incluindo o atendimento assistido pela Liz."
        canonical="https://wgalmeida.com.br/privacidade"
      />
      <article className="mx-auto w-full max-w-4xl px-5 py-16 md:px-8 md:py-24 text-slate-800">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-wg-orange">Grupo WG Almeida</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Política de Privacidade</h1>
        <p className="mt-5 text-base leading-7 text-slate-600">Atualizada em {UPDATED_AT}</p>

        <div className="mt-12 space-y-10 text-base leading-8 text-slate-700">
          <section>
            <h2 className="text-2xl font-semibold text-slate-950">1. Quem trata seus dados</h2>
            <p className="mt-3">O Grupo WG Almeida trata dados pessoais nos seus sites, formulários, canais de atendimento e soluções digitais, inclusive no atendimento assistido pela Liz, para responder solicitações, elaborar propostas, prestar serviços e manter relações comerciais.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">2. Dados que podemos receber</h2>
            <p className="mt-3">Podemos receber dados de identificação e contato, como nome, telefone, e-mail, empresa, cidade, informações do imóvel ou do projeto e o conteúdo de mensagens enviadas voluntariamente. Não solicitamos dados sensíveis quando eles não forem necessários ao atendimento.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">3. Finalidades e bases legais</h2>
            <p className="mt-3">Usamos esses dados para atender pedidos de contato, diagnóstico, proposta e suporte; executar contrato ou medidas pré-contratuais; cumprir obrigações legais; proteger a segurança dos canais; e, quando aplicável, comunicar conteúdos e oportunidades compatíveis com a relação existente. O tratamento observa as bases legais previstas na LGPD, inclusive execução de contrato, legítimo interesse e consentimento quando necessário.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">4. Compartilhamento e segurança</h2>
            <p className="mt-3">O acesso é limitado às pessoas e fornecedores que precisam dele para operar os canais, atender a solicitação ou cumprir obrigações legais. Adotamos controles técnicos e organizacionais proporcionais ao serviço. Não vendemos dados pessoais.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">5. Retenção</h2>
            <p className="mt-3">Mantemos os dados pelo tempo necessário para atender a finalidade informada, cumprir obrigações legais, resolver solicitações e preservar registros essenciais de segurança. Depois desse período, os dados são eliminados ou anonimizados quando aplicável.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">6. Seus direitos</h2>
            <p className="mt-3">Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, bloqueio, eliminação, portabilidade, informação sobre compartilhamentos e revisão de consentimento, nos limites da legislação aplicável.</p>
            <p className="mt-3">Para pedir exclusão de dados ou exercer outro direito, siga as instruções em <Link className="text-wg-orange underline underline-offset-4" to="/exclusao-de-dados">Exclusão de Dados</Link>.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">7. Contato</h2>
            <p className="mt-3">Envie sua solicitação para <ContactLink /> com o assunto “Privacidade”. Podemos pedir informações adicionais apenas para confirmar sua identidade e proteger seus dados.</p>
          </section>
        </div>
      </article>
    </>
  )
}

