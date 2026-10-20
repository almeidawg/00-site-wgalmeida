/** Cenários apenas ilustrativos para revisar a experiência de contratação. Não geram cobranças. */
export const WG360_PAYMENT_OPTIONS = Object.freeze([
 {id:'PIX',title:'Pix à vista',method:'PIX',installments:1,discountBps:300,help:'Hipótese de 3% de desconto Pix — valor ainda não aprovado.'},
 {id:'CARD_1',title:'Cartão em 1x',method:'CREDIT_CARD',installments:1,discountBps:0,help:'Sem acréscimo para o comprador; tarifa Asaas absorvida pela WG na simulação.'},
 {id:'CARD_3',title:'Cartão em 3x',method:'CREDIT_CARD',installments:3,discountBps:0,help:'Parcelamento do total sem acréscimo para o comprador. Tarifa Asaas não exibida como juros.'},
 {id:'CARD_6',title:'Cartão em 6x',method:'CREDIT_CARD',installments:6,discountBps:0,help:'Parcelamento do total sem acréscimo para o comprador. Taxa e antecipação dependem da conta WG.'},
 {id:'BOLETO',title:'Boleto à vista',method:'BOLETO',installments:1,discountBps:0,help:'Opção técnica Asaas, sujeita a aprovação comercial e confirmação do vencimento.'},
])
export const WG360_FORMAT_BRL = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'})
export function formatWg360Cents(cents){return WG360_FORMAT_BRL.format(cents/100)}
export function buildWg360PaymentIllustration(totalCents,planId){
 if(!Number.isSafeInteger(totalCents)||totalCents<0)throw new Error('INVALID_TOTAL')
 const option=WG360_PAYMENT_OPTIONS.find(x=>x.id===planId)
 if(!option)throw new Error('INVALID_PAYMENT_PLAN')
 const discountCents=Math.round(totalCents*option.discountBps/10000)
 const amountCents=totalCents-discountCents
 const base=Math.floor(amountCents/option.installments)
 const installmentsCents=Array.from({length:option.installments},(_,i)=>i===option.installments-1?amountCents-base*(option.installments-1):base)
 return {...option,baseTotalCents:totalCents,discountCents,amountCents,installmentsCents,installmentsText:option.installments===1?formatWg360Cents(amountCents):option.installments+'× '+formatWg360Cents(base)+(installmentsCents.at(-1)!==base?' (última '+formatWg360Cents(installmentsCents.at(-1))+')':'')}
}
export function getWg360TermText(proposal,plan){
 if(proposal.unknownItems>0)throw new Error('ITEMS_WITHOUT_APPROVED_PRICES')
 return [
  'TERMO DE ADESÃO — SIMULAÇÃO SEM VALIDADE CONTRATUAL',
  'Documento: '+proposal.code+' · Versão '+proposal.revision,
  'Contratante demonstrativa: '+proposal.company,
  'Objeto: '+proposal.title+' com '+proposal.count+' itens organizados por categorias.',
  'Valor do escopo: '+formatWg360Cents(plan.baseTotalCents),
  'Modalidade escolhida: '+plan.title+' ('+plan.method+').',
  'Desconto simulado: '+formatWg360Cents(plan.discountCents),
  'Valor total simulado para pagamento: '+formatWg360Cents(plan.amountCents),
  'Parcelas: '+plan.installmentsCents.map((c,i)=>(i+1)+'ª '+formatWg360Cents(c)).join('; '),
  'Pagamento: condicionado à emissão de cobrança no Asaas após a assinatura juridicamente validada.',
  'Pagamento por cartão: checkout Asaas hospedado, sem coleta de número/CVV pelo site WG.',
  'Pagamento Pix: QR Code dinâmico e código copia e cola somente após cobrança PIX emitida pelo Asaas.',
  'Pagamento por boleto: linha digitável/boleto somente após emissão oficial da cobrança pelo Asaas.',
  'Validade, datas, impostos, contrato, taxas, SLA e identidade serão confirmados em proposta formal.',
  'Para implementação técnica contratada, 90 dias de operação assistida a partir de go-live/aceite nos limites contratuais.',
  'Código sob medida, bibliotecas prévias WG e serviços de terceiros observarão o contrato definitivo e licenças.',
  'Esta seleção NÃO é assinatura, NÃO autoriza cobrança e NÃO constitui aceite.'
 ].join('\n')
}
