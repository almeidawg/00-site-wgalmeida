# AGENTS.md — site-wgalmeida

## Heranca obrigatoria WG
Este AGENTS deve ser usado em conjunto com:
- C:\Users\Atendimento\Documents\_GRUPO_WG_ALMEIDA\AGENTS.md (Workspace Root)
- C:\Users\Atendimento\Documents\_GRUPO_WG_ALMEIDA\00_CORE\01_GOVERNANCA\11_DOCS_PROMPTS_E_AGENTES_MESTRES\20260518_IA-START-HERE_Guia-Inicial.md
- C:\Users\Atendimento\Documents\_GRUPO_WG_ALMEIDA\00_CORE\01_GOVERNANCA\11_DOCS_PROMPTS_E_AGENTES_MESTRES\20260518_AGENTS-PRATICAS_Manual-Dev.md

## PROJETO
- Nome: site-wgalmeida
- Responsavel: Time Marketing + BuildTech
- Status: CORE / ACTIVE

## SEO & IA 2026 (NOVO)
- **Missão:** Priorizar indexação real e prontidão total para IA (Gemini, SGE, ChatGPT, Perplexity) mantendo o Score de AI Readiness em 100/100.
- **Sitemap:** Build gera automaticamente `dist/sitemap.xml` com 161 rotas canônicas. Validar sempre após o build estático.
- **Pre-rendering de Schemas:** Os Schemas JSON-LD (BreadcrumbList, Person, Organization, FAQPage, ProfessionalService) devem ser injetados de forma estática no `<head>` de todas as páginas estáticas durante a geração (`build-seo-routes.mjs`), garantindo leitura 100% livre de JS para crawlers.
- **E-E-A-T (Autoria Intelectual):** Todo conteúdo herda autoria explícita de William Almeida vinculada ao seu Schema `Person` (sameAs para LinkedIn/Behance). O item de CAU/CREA da empresa ou de William fica PENDENTE de listagem de parceiros profissionais pautados, priorizando matérias de autoridade intelectual do fundador (como o índice proprietário ICCRI) e cases reais de obra.
- **Auditoria Recorrente:** Executar `node scripts/pagespeed-monitor.js` e `node scripts/ai-readiness-audit.js` a cada 5 dias.
- **Indexação:** Monitorar "Crawled - currently not indexed" no GSC. Se subir >10%, tratar como INCIDENTE.

## WG_BUILD.TECH
- Nome publico oficial: `WG_Build.tech`.
- Dominio oficial: `https://wgalmeida.com.br/buildtech` (Estrutura de Subdiretório Unificado para preservação de Domain Authority).
- Plataformas integradas de simulação e B2B conectadas: EasyRealState (`https://easyrealstate.wgalmeida.com.br`), ObraEasy (`https://obraeasy.wgalmeida.com.br`), simulador de custos EVF (`/evf4`) e WG Moodboard (`/moodboard`).


## STACK
- Frontend: React + Vite + TypeScript
- Infra: Vercel

## AUDIT & COMMANDS
- `npm run build`: Consolida assets, sitemap e schemas.
- `node scripts/generate-schemas.cjs`: Atualiza arquivos JSON-LD.
- `node scripts/pagespeed-monitor.js`: Monitora performance Core Web Vitals.
- `node scripts/ai-readiness-audit.js`: Valida prontidão para consumo por LLMs.
- `npm run verify:deploy`: Valida saúde pós-publicação.

## REGRAS DE MIDIA E PRODUCAO
- Cloudinary/CDN é a fonte canônica de vídeos; MP4 grande no repo é proibido.
- Validar `video.readyState` e console sem CSP blocks em produção.
- Imagem quebrada? Validar `naturalWidth > 0` APÓS lazy loading (scroll real).

## GIT / CI / DEPLOY
- `main` é branch protegida (GH006). Push direto proibido.
- **Fluxo:** Branch `fix/*` ou `feat/*` -> PR -> Merge -> Vercel Production Auto-Deploy.
- Se deploy via CLI for necessário: `vercel login` seguido de `vercel --prod`.

## ROLLBACK
- Deploy: Painel Vercel.
- SEO: Rebuild completo para regenerar sitemap.xml íntegro.

## CONTEXTO RAPIDO
Camada de aquisição do ecossistema WG, focada em autoridade técnica e visibilidade híbrida (Search + AI).
