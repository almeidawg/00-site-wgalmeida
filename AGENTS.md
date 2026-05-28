# AGENTS.md — site-wgalmeida

## Heranca obrigatoria WG
Este AGENTS deve ser usado em conjunto com:
- C:\Users\Atendimento\AGENTS.md
- C:\Users\Atendimento\Documents\_GRUPO_WG_ALMEIDA\01_APPS\02_BUILDTECH\IA-START-HERE-WG.md
- C:\Users\Atendimento\Documents\_GRUPO_WG_ALMEIDA\01_APPS\02_BUILDTECH\AGENTS-BOAS-PRATICAS-WG.md

## PROJETO
- Nome: site-wgalmeida
- Responsavel: Time Marketing + BuildTech
- Status: CORE / ACTIVE

## SEO & IA 2026 (NOVO)
- **Missão:** Priorizar indexação real e prontidão para IA (Gemini, SGE, ChatGPT) antes de novos conteúdos.
- **Sitemap:** Build gera automaticamente `dist/sitemap.xml` com ~161 rotas. Validar sempre após build.
- **Schema.org:** Tags JSON-LD em `public/schemas/` (Organization, Person, FAQ) são obrigatórias.
- **E-E-A-T:** Todo conteúdo deve ter autoria explícita (William Almeida), cases reais e sinais de confiança.
- **Auditoria Recorrente:** Executar `node scripts/pagespeed-monitor.js` e `node scripts/ai-readiness-audit.js` a cada 5 dias.
- **Indexação:** Monitorar "Crawled - currently not indexed" no GSC. Se subir >10%, tratar como INCIDENTE.

## WG_BUILD.TECH
- Nome publico oficial: `WG_Build.tech`.
- Dominio oficial: `https://buildtech.wgalmeida.com.br`.

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
