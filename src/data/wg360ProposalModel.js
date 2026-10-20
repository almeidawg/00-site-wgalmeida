import {WG360_CATALOG,WG360_BY_ID} from './wg360Catalog.js'

/**
 * CONTRATO VISUAL DE PROPOSTA WG360.
 * A função abaixo fornece exclusivamente dados demonstrativos públicos.
 * Nenhuma ação sobre este objeto gera aceite, contrato ou cobrança real.
 * Valores redondos são exemplos não aprovados comercialmente.
 */
export const EXAMPLE_PRICES={ 'MEN-001':6000, 'WEB-001':9000, 'COM-003':8000 }
export const EXAMPLE_IDS=['MEN-001','WEB-001','COM-003']
export const EXAMPLE_PAYMENT={
  description:'40% de entrada no aceite contratual e 60% por marcos de implantação',
  disclaimer:'Exemplo fictício, sujeito a proposta financeira e contrato revisados. Não gera cobrança.'
}
export function getSelectedProposalIds(query=''){
 const params=new URLSearchParams(query.startsWith('?')?query.slice(1):query)
 const provided=(params.get('itens')||'').split(',')
 const allowed=[...new Set(provided.filter(id=>Object.hasOwn(WG360_BY_ID,id)))].slice(0,77)
 return allowed.length?allowed:EXAMPLE_IDS
}
export function buildExampleProposal(ids=EXAMPLE_IDS){
 const allowed=[...new Set(ids.filter(id=>Object.hasOwn(WG360_BY_ID,id)))].slice(0,77)
 const groups=WG360_CATALOG.map(category=>{
  const items=allowed.filter(id=>WG360_BY_ID[id]?.categoryId===category.id).map(id=>{
    const source=WG360_BY_ID[id]
    const price=Object.hasOwn(EXAMPLE_PRICES,id)?EXAMPLE_PRICES[id]:null
    return {id,title:source.title,description:source.description,deliverable:source.deliverable,quantity:1,unit:'serviço',unitPrice:price,subtotal:price,scopeType:source.stage}
  })
  return {id:category.id,name:category.name,items}
 }).filter(x=>x.items.length)
 const all=groups.flatMap(x=>x.items)
 const knownTotal=all.reduce((sum,item)=>sum+(item.subtotal??0),0)
 const unknown=all.filter(item=>item.subtotal===null).length
 return {
   example:true,
   code:'WG360-DEMO-001',
   revision:'R00',
   status:'DEMONSTRAÇÃO',
   title:'Proposta de transformação WG 360°',
   company:'Empresa Exemplo (fictícia)',
   issuer:'Grupo WG Almeida · WG/Build.tech',
   groups, knownTotal, unknownItems:unknown, count:all.length,
   payment:EXAMPLE_PAYMENT,
 }
}
export const WG360_WORKFLOW=[
  {id:'lead',title:'Lead e atendimento',detail:'Origem, consentimento, qualificação e responsável comercial'},
  {id:'opportunity',title:'Oportunidade',detail:'Diagnóstico, contexto e qualificação por demanda'},
  {id:'proposal',title:'Proposta enviada',detail:'Itens e categorias, valores, validade, versão imutável'},
  {id:'review',title:'Aprovar ou revisar',detail:'Confirmação de identidade, evidências de autoria e integridade'},
  {id:'contract',title:'Contrato e jurídico',detail:'Termos versionados e assinatura adequada ao risco'},
  {id:'payment',title:'Financeiro',detail:'Plano de cobrança, Asaas, reconciliação por webhook'},
  {id:'planning',title:'Planejamento e execução',detail:'Marcos, equipes, módulos, fornecedores, tarefas'},
  {id:'operations',title:'Operação assistida',detail:'Aceite técnico, suporte de 90 dias e indicadores'},
]
