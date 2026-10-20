import { WG360_PAYMENT_OPTIONS, formatWg360Cents, getWg360TermText } from '@/data/wg360PaymentOptions'
import './wg360-payment-choice.css'

/** Interface de estudo sem integração financeira. Não aceitar dados de cartão aqui. */
export function WG360PaymentChoice({proposal,chosen,onChange,illustration}){
 const hasPending=proposal.unknownItems>0
 return <section className="wgp-payment-choice" aria-label="Condição de pagamento simulada">
  <span className="wgp-payment-choice__eyebrow">CONDIÇÃO DE PAGAMENTO · SIMULAÇÃO</span>
  <h3>Como deseja pagar?</h3>
  <p>Os valores e descontos ainda dependem de aprovação comercial. Escolha uma opção para conferir como ela aparecerá no termo de adesão.</p>
  <div role="radiogroup" aria-label="Escolher modalidade de pagamento">
   {WG360_PAYMENT_OPTIONS.map(opt=><label key={opt.id} className={'wgp-payment-choice__item'+(chosen===opt.id?' active':'')}>
    <input type="radio" name="wg360-payment" value={opt.id} checked={chosen===opt.id} onChange={()=>onChange(opt.id)} disabled={hasPending}/>
    <span><strong>{opt.title}</strong><small>{opt.help}</small></span>
   </label>)}
  </div>
  {hasPending?<p className="wgp-payment-choice__warning">Existem itens sem orçamento. Não é possível confirmar a condição enquanto houver preços pendentes.</p>
  :<div className="wgp-payment-choice__total"><span>Total da modalidade escolhida</span><strong>{formatWg360Cents(illustration.amountCents)}</strong><small>{illustration.installmentsText}</small></div>}
  <p className="wgp-payment-choice__warning">Nenhuma cobrança é criada nesta página. Cartão e Pix serão habilitados somente após aceite assinado e integração Asaas homologada.</p>
 </section>
}
export function WG360AdhesionTerm({proposal,illustration}){
 if(proposal.unknownItems>0)return <p className="wgp-payment-choice__warning">O termo de adesão não pode ser consolidado enquanto existirem itens sem preço aprovado.</p>
 return <section className="wgp-adhesion-term" aria-label="Termo de adesão demonstrativo">
  <div className="wgp-payment-choice__eyebrow">TERMO DE ADESÃO VINCULADO À CONDIÇÃO ESCOLHIDA</div>
  <pre>{getWg360TermText(proposal,illustration)}</pre>
  <p>Este termo é apenas um modelo de revisão: não é uma assinatura, não comprova identidade e não autoriza faturamento.</p>
 </section>
}
