import {useMemo,useState} from 'react'
import {ArrowLeft,ArrowRight,BookOpen,CheckCircle2,ChevronDown,MessageSquare,Printer,ShieldCheck,AlertTriangle,XCircle} from 'lucide-react'
import SEO from '@/components/SEO'
import WGCampaignHeader from '@/components/WGCampaignHeader'
import { WG360PaymentChoice, WG360AdhesionTerm } from '@/components/WG360PaymentChoice'
import { buildWg360PaymentIllustration, formatWg360Cents } from '@/data/wg360PaymentOptions'
import {buildExampleProposal,getSelectedProposalIds,WG360_WORKFLOW} from '@/data/wg360ProposalModel'
import './wg360-proposta-cliente.css'
import './wg360-editorial-refinement.css'

const BRL=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'})
const TABS=[['escopo','Escopo e valores'],['cronograma','Etapas e entregas'],['termos','Condições e aceite'],['workflow','Jornada integrada']]
const initialMessage='O conteúdo exibido é inteiramente fictício. Aprovar ou revisar nesta página apenas demonstra a experiência visual: nada será enviado ou registrado.'
export default function WG360PropostaCliente(){
 const proposal=useMemo(()=>buildExampleProposal(getSelectedProposalIds(typeof window!=='undefined'?window.location.search:'')),[])
 const [tab,setTab]=useState('escopo')
 const [openGroup,setOpenGroup]=useState(null)
 const [action,setAction]=useState(null)
 const [reason,setReason]=useState('')
 const [confirmed,setConfirmed]=useState(false)
 const [paymentId,setPaymentId]=useState('PIX')
 const payment=useMemo(()=>buildWg360PaymentIllustration(Math.round(proposal.knownTotal*100),paymentId),[proposal.knownTotal,paymentId])
 const [simulation,setSimulation]=useState(null)
 const [banner,setBanner]=useState(initialMessage)
 const canSubmitReview=reason.trim().length>=12
 const completeAction=()=>{
  if(action==='revisar'&&!canSubmitReview)return
  if(action==='aprovar'&&(!confirmed||proposal.unknownItems>0))return
  setSimulation({action,reason:reason.trim(),version:proposal.revision,paymentId,amountCents:payment.amountCents})
  setBanner(action==='aprovar'?'Aprovação simulada, com '+payment.title+' ('+formatWg360Cents(payment.amountCents)+') refletida no termo de adesão. Não houve assinatura, cobrança nem pagamento.':action==='revisar'?'Solicitação de revisão simulada em memória. A WG não recebeu esta mensagem.':'Recusa simulada em memória. Nenhum status foi alterado em servidor.')
  setAction(null);setReason('');setConfirmed(false)
 }
 const startAction=(a)=>{if(a==='aprovar'&&proposal.unknownItems>0){setBanner('Não é possível simular a aprovação com itens ainda sem orçamento. Revise o escopo.');setTab('escopo');return;}setReason('');setConfirmed(false);setAction(a)}
 const btn=(a,label,Icon,cls)=> <button className={'wgp-action '+cls} type="button" onClick={()=>startAction(a)}><Icon size={17}/>{label}</button>
 return <>
 <SEO pathname="/mentoria-construcao/proposta-modelo" title="Modelo de proposta WG 360° | Demonstração" description="Modelo demonstrativo de proposta por link, com escopo, preços ilustrativos e ações simuladas. Não constitui oferta ou aceite." noindex/>
 <div className="wgp">
  <div className="wgp-topline">AMBIENTE DE DEMONSTRAÇÃO · ESTA NÃO É UMA PROPOSTA ENVIADA A CLIENTE</div>
  <WGCampaignHeader variant="proposal"/>
  <main className="wgp-wrap">
    <section className="wgp-cover">
      <div className="wgp-cover__heading">
        <div><p className="wgp-eyebrow">GRUPO WG ALMEIDA · BUILD.TECH</p><h1>{proposal.title}</h1><p>Um documento comercial organizado, com serviços relacionados, condições e jornada de entrega. Layout inspirado no modelo de proposta e ações do WGEasy.</p></div>
        <div className="wgp-cover__stamp"><b>{proposal.code}</b><span>VERSÃO {proposal.revision}</span><strong>{proposal.status}</strong><small>Dados e valores fictícios</small></div>
      </div>
      <div className="wgp-cover__facts"><div><span>APRESENTADO A</span><strong>{proposal.company}</strong></div><div><span>EMITENTE</span><strong>{proposal.issuer}</strong></div><div><span>ITENS DO ESCOPO</span><strong>{proposal.count} serviços · {proposal.groups.length} categorias</strong></div><div><span>VALIDADE</span><strong>A definir na proposta real</strong></div></div>
      <div className="wgp-cover__total"><div><span>VALOR CONHECIDO NO EXEMPLO</span><strong>{BRL.format(proposal.knownTotal)}</strong><small>{proposal.unknownItems>0?('+'+proposal.unknownItems+' itens ainda sem orçamento; o total é parcial'):'Valor integralmente ilustrativo, sem validade comercial'}</small></div><div><span>CONDIÇÃO ILUSTRATIVA</span><strong>{proposal.payment.description}</strong><small>Não gera cobrança; taxas e vencimentos serão definidos caso a caso.</small></div></div>
    </section>

    <div className="wgp-banner" role="status"><AlertTriangle size={19}/><p>{banner}</p></div>

    <nav className="wgp-tabs" aria-label="Seções da proposta">{TABS.map(([id,label])=><button type="button" onClick={()=>setTab(id)} aria-current={tab===id?'page':undefined} className={tab===id?'active':''} key={id}>{label}</button>)}</nav>
    <div className="wgp-main">
      <div className="wgp-main__body">
        {tab==='escopo'&&<section className="wgp-panel">
          <div className="wgp-panel__intro"><p className="wgp-eyebrow">01 / ESCOPO</p><h2>O que faz parte da proposta</h2><p>Serviços organizados por núcleo/categoria, preservando código, descrição, entregável e composição financeira. Itens sem preço continuam sujeitos a orçamento formal.</p></div>
          {proposal.groups.map(group=><section className="wgp-group" key={group.id}>
            <button className="wgp-group__toggle" type="button" onClick={()=>setOpenGroup(openGroup===group.id?'':group.id)} aria-expanded={openGroup===group.id||openGroup===null}><span><small>{group.items.length} {group.items.length===1?'ITEM':'ITENS'}</small><strong>{group.name}</strong></span><ChevronDown size={20}/></button>
            {(openGroup===null||openGroup===group.id)&&<div className="wgp-group__items">{group.items.map(item=><article className="wgp-service" key={item.id}>
              <div className="wgp-service__info"><span className="wgp-code">{item.id}</span><h3>{item.title}</h3><p>{item.description}</p><p className="wgp-deliverable"><strong>ENTREGÁVEL:</strong> {item.deliverable}</p></div>
              <div className="wgp-service__price"><small>{item.quantity} {item.unit}</small><strong>{item.subtotal===null?'Sob orçamento':BRL.format(item.subtotal)}</strong><span>{item.subtotal===null?'Valor não aprovado':'Preço ilustrativo'}</span></div>
            </article>)}</div>}
          </section>)}
        </section>}
        {tab==='cronograma'&&<section className="wgp-panel"><div className="wgp-panel__intro"><p className="wgp-eyebrow">02 / ENTREGAS</p><h2>Marcos de implementação</h2><p>Sequência ilustrativa, adaptável à contratação e distinta dos oito encontros da mentoria.</p></div><div className="wgp-timeline">{[['01','Diagnóstico e formalização','Aprovar escopo, regras, acessos, responsáveis, riscos e condições.'],['02','Planejamento e arquitetura','Estruturar backlog, módulos contratados, dados, integrações e critérios de aceite.'],['03','Construção e homologação','Executar marcos, revisar qualidade, segurança, documentação e testes.'],['04','Go-live e aceite técnico','Transferir para ambiente aprovado, validar entregáveis e acionar operação.'],['05','Operação assistida de 90 dias','Acompanhar adoção e corrigir itens de escopo sob SLA contratual.']].map(([id,title,desc])=><article key={id}><b>{id}</b><div><h3>{title}</h3><p>{desc}</p></div></article>)}</div></section>}
        {tab==='termos'&&<section className="wgp-panel"><div className="wgp-panel__intro"><p className="wgp-eyebrow">03 / CONDIÇÕES</p><h2>Termos para revisão contratual</h2><p>O aceite real deverá referenciar a versão imutável da proposta, contrato e anexos, com identificação das partes, evidências e mecanismos adequados de assinatura.</p></div><div className="wgp-terms">{[
         ['01','Escopo e mudanças','Somente itens identificados na versão assinada são contratados. Alterações exigem nova versão e aceite.'],
         ['02','Prazos e responsabilidades','Cronograma, dependências, fornecimento de dados, prazos de resposta, critérios de aceite e responsabilidades serão descritos por marco.'],
         ['03','Pagamentos e despesas de terceiros','Preço, impostos, entrada, parcelas, Asaas e vencimentos exigem proposta financeira. Google Workspace, Supabase, Vercel, domínios e APIs são custos do cliente.'],
         ['04','Propriedade intelectual','O contrato detalhará a titularidade e a cessão/licença do desenvolvimento sob medida após quitação, preservando componentes preexistentes WG e licenças de terceiros.'],
         ['05','Proteção de dados e sigilo','Finalidades, papéis LGPD, acesso, subprocessadores, retenção, segurança, incidentes e entrega de dados devem ser acordados.'],
         ['06','Operação assistida e manutenção','Para implantação de plataforma sob medida, 90 dias de operação assistida a partir do go-live/aceite, com SLA e exclusões. Evoluções posteriores são opcionais.'],
         ['07','Aceite, revisão e provas','Aprovação real requer autenticação e prova de autoria e integridade; pedido de revisão não constitui contratação. Esta página não registra ações.']
        ].map(([id,title,desc])=><article key={id}><span>{id}</span><div><h3>{title}</h3><p>{desc}</p></div></article>)}</div><WG360AdhesionTerm proposal={proposal} illustration={payment}/></section>}
        {tab==='workflow'&&<section className="wgp-panel"><div className="wgp-panel__intro"><p className="wgp-eyebrow">04 / INTEGRAÇÃO</p><h2>Do atendimento à operação</h2><p>Fluxo planejado para a integração entre módulos WG, sem alteração de dados reais nesta demonstração.</p></div><div className="wgp-timeline">{WG360_WORKFLOW.map((step,index)=><article key={step.id}><b>{String(index+1).padStart(2,'0')}</b><div><h3>{step.title}</h3><p>{step.detail}</p></div></article>)}</div><div className="wgp-legalhint"><ShieldCheck size={19}/><span>Produção só após backend isolado, controles de acesso, conciliação de eventos e validação jurídica. Não conectar diretamente ao banco interno do WGEasy.</span></div></section>}
      </div>
      <aside className="wgp-sidebar"><div className="wgp-sidebar__top"><span>MODELO WG 360°</span><h3>Pronto para revisar o escopo?</h3><p>Veja como o cliente poderá solicitar mudanças ou aprovar a versão recebida. Este ambiente é exclusivamente demonstrativo.</p></div><div className="wgp-sidebar__body">
        <div className="wgp-sidebar__sum" data-testid="sidebar-total"><span>Total ilustrativo conhecido</span><strong>{BRL.format(proposal.knownTotal)}</strong><small>{proposal.unknownItems?proposal.unknownItems+' itens sob orçamento':''}</small></div>
        {simulation&&<div className="wgp-simstatus"><CheckCircle2 size={16}/> Última ação simulada: {simulation.action==='aprovar'?'Aprovação':simulation.action==='revisar'?'Revisão':'Recusa'}. Nenhum registro real.</div>}
        {simulation?.action==='aprovar'&&<section className="wgp-nextpayment" aria-label="Próximo passo demonstrativo"><h4>{simulation.paymentId==='PIX'?'Pagamento Pix':simulation.paymentId==='BOLETO'?'Pagamento por boleto':'Pagamento por cartão'}</h4><p>{simulation.paymentId==='PIX'?'Pix copia e cola e QR Code serão gerados pelo Asaas somente após assinatura validada e emissão da cobrança.':simulation.paymentId==='BOLETO'?'A linha digitável e o boleto serão disponibilizados somente após assinatura validada e emissão no Asaas.':'O checkout hospedado da Asaas ficará disponível somente após assinatura validada e emissão da cobrança.'}</p><button type="button" disabled>{simulation.paymentId==='PIX'?'Pix copia e cola indisponível na prévia':simulation.paymentId==='BOLETO'?'Boleto indisponível na prévia':'Checkout Asaas indisponível na prévia'}</button></section>}
        <div className="wgp-sidebar__payment" data-testid="sidebar-payment"><WG360PaymentChoice proposal={proposal} chosen={paymentId} onChange={setPaymentId} illustration={payment}/></div>
        {btn('aprovar','Simular aprovação',CheckCircle2,'wgp-action--approve')}
        {btn('revisar','Simular pedido de revisão',MessageSquare,'wgp-action--review')}
        {btn('recusar','Simular recusa',XCircle,'wgp-action--decline')}
        <button className="wgp-print" type="button" onClick={()=>window.print()}><Printer size={16}/> Imprimir modelo / salvar PDF</button>
        <p>Os botões de uma proposta formal só serão habilitados após identidade, versão imutável e backend de aceite estarem homologados.</p>
      </div></aside>
    </div>
    <section className="wgp-last"><BookOpen size={24}/><div><h2>O próximo passo é transformar esse modelo em propostas reais.</h2><p>A estrutura já corresponde ao fluxo do WGEasy em apresentação, grupos de escopo e ações do cliente. A integração transacional exige implantação isolada e autorização, pois o WGEasy interno não é o banco de propostas dos clientes.</p></div><a href="/mentoria-construcao/abordagens">Explorar possíveis temas da mentoria <ArrowRight size={16}/></a></section>
  </main>
  <footer className="wgp-footer"><div className="wgp-wrap">Grupo WG Almeida · Modelo demonstrativo WG 360° · Não constitui proposta, aceite ou contrato <span>2026</span></div></footer>
  {action&&<div className="wgp-modalback" role="presentation"><div className="wgp-dialog" role="dialog" aria-modal="true" aria-labelledby="wgp-dialog-title">
    <p className="wgp-eyebrow">SIMULAÇÃO LOCAL · SEM ENVIO</p><h2 id="wgp-dialog-title">{action==='aprovar'?'Simular aprovação':action==='revisar'?'Simular pedido de revisão':'Simular recusa'}</h2>
    {action==='aprovar'?<><p>Você está apenas testando a experiência da proposta {proposal.code}, versão {proposal.revision}, com pagamento {payment.title.toLowerCase()} de {formatWg360Cents(payment.amountCents)}. Este teste não expressa aceite jurídico e não cria contrato.</p><WG360AdhesionTerm proposal={proposal} illustration={payment}/><label className="wgp-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> Entendi que isto é uma simulação e não uma assinatura ou contratação.</label></>:<><p>Descreva o motivo para testar o fluxo de revisão. Não informe dados pessoais, informações sigilosas ou credenciais.</p><textarea value={reason} onChange={e=>setReason(e.target.value)} maxLength={500} rows={5} placeholder="Exemplo fictício: revisar o escopo do CRM antes de contratar..."/>{action==='revisar'&&<small>Mínimo de 12 caracteres para simular o pedido.</small>}</>}
    <div className="wgp-dialog__actions"><button type="button" onClick={()=>{setAction(null);setConfirmed(false)}}>Cancelar</button><button type="button" disabled={(action==='aprovar'&&!confirmed)||(action==='revisar'&&!canSubmitReview)} onClick={completeAction}>Confirmar simulação</button></div>
  </div></div>}
 </div>
 </>
}
