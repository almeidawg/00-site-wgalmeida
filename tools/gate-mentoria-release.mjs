import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const file=resolve(root,'docs/mentoria-construcao/launch-approvals.json')
const json=process.argv.includes('--json')
const minimum=['security_dependencies','release_code','offer_approved','rights_media','creative_pilot','ai_demo','whatsapp_e2e','tracking_verified','privacy_legal','media_plan','owner_go']
let report
try {
 if(!existsSync(file)) throw new Error('Registro de aprovações ausente')
 const data=JSON.parse(readFileSync(file,'utf8'))
 if(data.schemaVersion!==1 || data.project!=='site-wgalmeida' || data.route!=='/mentoria-construcao' || !Array.isArray(data.checks)) throw new Error('Identidade/estrutura do registro inválida')
 const seen=new Set()
 const checks=data.checks.map(item=>{
   if(!item || typeof item.id!=='string' || seen.has(item.id)) throw new Error('IDs inválidos/duplicados')
   seen.add(item.id)
   const valid=item.status==='approved' && typeof item.approvedBy==='string' && item.approvedBy.trim().length>1 && typeof item.approvedAt==='string' && /^\d{4}-\d{2}-\d{2}/.test(item.approvedAt) && Array.isArray(item.evidence) && item.evidence.length>0 && item.evidence.every(v=>typeof v==='string'&&v.trim().length>4)
   return {id:item.id,title:item.title||item.id,status:valid?'OK':'BLOQUEADO'}
 })
 for(const id of minimum)if(!seen.has(id))checks.push({id,title:'Obrigatório e ausente',status:'BLOQUEADO'})
 report={project:'site-wgalmeida',route:'/mentoria-construcao',verdict:checks.every(c=>c.status==='OK')?'GO':'NO-GO',checks}
} catch(err){
 report={project:'site-wgalmeida',route:'/mentoria-construcao',verdict:'NO-GO',error:String(err),checks:minimum.map(id=>({id,status:'BLOQUEADO'}))}
}
if(json){console.log(JSON.stringify(report,null,2))}
else {
 console.log('GATE DE LANÇAMENTO MENTORIA — '+report.verdict)
 if(report.error)console.log('ERRO: '+report.error)
 for(const c of report.checks)console.log((c.status==='OK'?'[OK] ':'[PENDENTE] ')+c.id+' — '+(c.title||''))
 console.log('\nEste gate verifica o registro das aprovações. Não substitui testes, auditorias, compliance ou confirmação de evidências por responsável humano.')
}
if(report.verdict!=='GO')process.exitCode=2
