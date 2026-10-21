/**
 * Offline, fail-closed preflight: NÃO representa E2E browser, direitos de mídia
 * ou aprovação do owner. Não abre rede, banco, Vercel, DNS nem envia mensagens.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MENTORIA_ABORDAGENS, MENTORIA_ABORDAGENS_TOTAL } from '../src/data/mentoriaAbordagens.js'
import {
  MENTORIA_HOST, MENTORIA_ORIGIN,
  mentoriaApproachesCanonical, mentoriaApproachesPath, mentoriaLandingPath,
} from '../src/lib/mentoriaDomain.js'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const src = (p) => readFileSync(resolve(root, p), 'utf8')
const present = (p) => existsSync(resolve(root, p))
// Sem argumento de CLI: a pasta de build vem de uma lista fixa de nomes conhecidos.
const DIST_CANDIDATES = ['dist-mentoria-qa-20261018', 'dist-qa-release', 'dist']
const distName = DIST_CANDIDATES.find((name) => existsSync(resolve(root, name))) || 'dist'
const dist = resolve(root, distName)
const assets = existsSync(resolve(dist, 'assets')) ? readdirSync(resolve(dist, 'assets')) : []
const ok = (condition, description) => ({ id: description, status: condition ? 'PASS' : 'FAIL' })
const all = []
all.push(ok(MENTORIA_HOST === 'mentoria.wgalmeida.com.br' &&
  MENTORIA_ORIGIN === 'https://mentoria.wgalmeida.com.br' &&
  mentoriaLandingPath(MENTORIA_HOST) === '/' &&
  mentoriaApproachesPath(MENTORIA_HOST) === '/abordagens' &&
  mentoriaApproachesCanonical(MENTORIA_HOST) === MENTORIA_ORIGIN + '/abordagens',
  'origens_e_caminhos_controlados'))
const landing = src('src/pages/MentoriaConstrucaoLanding.jsx')
const weekText = landing.split('const pilotWeeks = [')[1]?.split('\n]')[0] || ''
all.push(ok((weekText.match(/\bweek:\s*'\d{2}'/g) || []).length === 8 &&
  landing.includes('8 encontros') &&
  landing.includes('Explore os temas que podemos aprofundar na mentoria'),
  'roteiro_8_semanas_e_cta_preservados'))
all.push(ok(MENTORIA_ABORDAGENS.length === 10 && MENTORIA_ABORDAGENS_TOTAL === 30 &&
  MENTORIA_ABORDAGENS.every((area) => area.possibilidades.length === 3 && area.pergunta.endsWith('?')),
  'conteudo_editorial_10_frentes_30_assuntos'))
const approaches = src('src/pages/MentoriaAbordagens.jsx')
all.push(ok(approaches.includes('noindex') &&
  !/WG360_TRAFFIC_POLICY|estimateTrafficFee|EXAMPLE_PRICES|unitPrice|subtotal|type="number"|type="checkbox"/.test(approaches),
  'sem_comercializacao_no_editorial'))
const app = src('src/App.jsx')
all.push(ok(app.includes("location.pathname === '/mentoria-construcao/abordagens'") &&
  app.includes("location.pathname === '/mentoria-construcao/proposta-360'") &&
  app.includes("isMentoriaDomain && location.pathname === '/abordagens'") &&
  app.includes('<MentoriaAbordagens />'), 'rotas_compatibilidade'))
const html = src('index.html')
const builtHtml = existsSync(resolve(dist, 'index.html')) ?
  readFileSync(resolve(dist, 'index.html'), 'utf8') : ''
all.push(ok(html.includes("onMentoriaHost") &&
  html.includes("canonical.href = 'https://mentoria.wgalmeida.com.br/'") &&
  html.includes("'noindex, nofollow'") && builtHtml.includes('mentoria.wgalmeida.com.br'),
  'host_pre_hidratacao_noindex'))
all.push(ok(assets.some((v) => /^MentoriaAbordagens-.+\.js$/.test(v)) &&
  assets.some((v) => /^MentoriaConstrucaoLanding-.+\.js$/.test(v)) &&
  assets.some((v) => /^MentoriaAbordagens-.+\.css$/.test(v)), 'vite_bundles_presentes'))
const video = 'public/media/mentoria-construcao/apresentacao-720p.mp4'
const caption = 'public/media/mentoria-construcao/apresentacao-pt-BR.vtt'
all.push(ok(present(video) && statSync(resolve(root, video)).size > 1024 * 1024 &&
  present(caption) && src(caption).trimStart().startsWith('WEBVTT'), 'midia_tecnica_arquivo_legenda'))
const approvals = JSON.parse(src('docs/mentoria-construcao/launch-approvals.json'))
const approved = approvals.checks.filter((c) =>
  c.status === 'approved' && c.approvedBy && c.approvedAt &&
  Array.isArray(c.evidence) && c.evidence.length).map((c) => c.id)
const blockers = approvals.checks.filter((c) => !approved.includes(c.id)).map(({ id }) => id)
const pending = [
  'qa_visual_mobile_desktop_em_staging_https_ainda_pendente',
  'previsualizacao_https_staging_seletiva',
  'direitos_de_midia_licencas_e_criativos',
  'revisao_lgpd_e_rastreadores',
  'operacao_whatsapp_crm_e_tracking_reais',
  'revisao_de_dependencias_emambiente_de_auditoria',
  'preco_contrato_agenda_e_capacidade_aprovados',
  'dominio_dns_certificado_em_release_aprovado',
  'owner_go_de_producao',
]
const report = {
  project: 'site-wgalmeida',
  intent: 'mentoria-construcao',
  technicalOffline: all.every((x) => x.status === 'PASS') ? 'PASS' : 'FAIL',
  realLaunch: 'NO-GO',
  tests: all,
  launchApprovals: { count: approved.length, total: approvals.checks.length, approved, blockers },
  pending,
  caveat: 'Offline; não prova navegador, provider WhatsApp, CRM, DNS, SSL, privacidade ou release.',
}
console.log(JSON.stringify(report, null, 2))
if (report.technicalOffline !== 'PASS') process.exitCode = 1
