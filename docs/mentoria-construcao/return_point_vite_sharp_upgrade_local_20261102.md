# Return point — correção local de vite/sharp e ativação governada MCP — 02/11/2026

## Identidade canônica revalidada
- Produto: site WG Almeida / Mentoria, `almeidawg/00-site-wgalmeida`, worktree isolada `E:\01_WG_Ecosystem\09_TMP\mentoria-dependencies-high-fix-20261102`, branch `fix/mentoria-vite-sharp-high-20261102`, HEAD antes do patch `37229089de3b07bcdc0ac5812039f9201478bac4`. `project_context_validate` PASS, remote, Vercel e Git clean antes da alteração.
- Site em produção da sessão anterior: Vercel `site-wgalmeida` project `prj_uNqhTiNaZx3O1CxDlBXhNVKdIIOM` em `team_PZqrfArEACLjprLuIKVVA7Ch`. Deploy de baseline observado `dpl_82RwnFKZeTcpXaFAKygJxqaSEaF5`, SHA `fdc068d2c6fc279444e4ba458b4248c3d17ea480`; **nenhum push, PR de remediação, merge ou deploy realizado aqui**.
- Liz MCP canônico `E:\01_WG_Ecosystem\02_LIZ_PLATFORM\repo`, branch `feat/linkedin-post-cycle-topic-discovery-20261018`, HEAD `310cf0f2f86c7b812f8ba1816b3e0e06294eba0e`, checkout DIRTY por diversas operações. Alterações desta frente integradas seletivamente ao código-fonte e três artefatos runtime sem reconstruir todo o checkout.

## Diagnóstico anterior (fonte oficial)
- [GitHub Actions npm audit oficial](https://github.com/almeidawg/00-site-wgalmeida/actions/runs/41382749017) em PR #166 DRAFT: baseline completo com **19 alertas (17 moderate, 2 high)**, `--omit=dev` com **2 moderate e 0 high**.
- Os dois `high` pertencem a dependências de desenvolvimento/build: `vite@8.0.16` e `sharp@0.33.5`; versões de correção propostas pelo npm: `vite@8.3.5`, `sharp@0.35.5`. Os dois `moderate` no recorte de produção: `react-router@6.30.6` e `react-router-dom@6.30.6`, exigem análise de migração major separada.
- A implementação dos dois testes de regressão de processamento de SVG/PNG para WebP estava em commit local anterior `3722908`, 316 testes baseline.

## MCP: build seletivo, restart e health
- Autorização explícita do owner para build/restart do `01-liz-mcp-server` com backup, health e rollback. Lease `lease-1793620626186-9d45e1e0` adquirida antes da promoção e liberada após health.
- Backup prévio do runtime `apps/mcp-server/.tmp/mentoria-mcp-release-20261102/dist-before`: **691 arquivos**, SHA-256 de `index.js` e `mutationLeasePolicy.js` comparado com runtime antes da promoção.
- Código-fonte da capability previamente validado com `npm run typecheck`, `605` testes MCP PASS / `1` skip, ESLint global PASS (heap 2GB).
- Staging seletivo gerado somente para `dist/index.js`, `dist/tools/mutationLeasePolicy.js`, `dist/tools/mentoriaNpmMaintenance.js`, com restante do dist antigo preservado. Uma versão do staging inicialmente transpila CommonJS incompatível com ESM, detectada por teste de importação e corrigida ANTES da promoção, usando TS ESNext. `node --check` dos três arquivos PASS; import ESM e dry-run direto PASS.
- Promoção por `promote-selective-build.mjs`: **PROMOTED_AWAITING_RESTART**, 3 arquivos, verificação hash e backup. Recibo `apps/mcp-server/.tmp/mentoria-mcp-release-20261102/promotion-receipt.json`.
- `pm2_restart` aceitou a solicitação; conector caiu temporariamente durante a troca. Após reconexão, PM2 `01-liz-mcp-server` **ONLINE**, novo PID `16620` (anterior `11188`), restart count 1; logs confirmaram `MCP Server iniciado` em 02/11/2026 09:17:11 (-03), porta 4446, `mcp_tools:223`. Health por status/logs e tool live. Consulta HTTP direta localhost 4446 negada pela política; não houve bypass.
- `wg_capability_execute` LIVE com payload/lease de site: aprovação inválida retornou `DENIED / OWNER_APPROVAL_REQUIRED`; aprovação canônica dry-run retornou `DRY_RUN / OWNER_APPROVED_TARGET_MATCH`. Capacidade `mentoria.security_dependencies_update` comprovadamente ativa.

## Aplicação da atualização isolada
- Lease separada da worktree do site `lease-1793621885255-fd76993d` com recursos Git, path e ambos manifests. Chamada LIVE `wg_capability_execute` com `dry_run:false`, versão e identidade canônicas: `ok:true, status:COMPLETED, code:LOCK_UPDATED_TESTS_REQUIRED`.
- **Backups ANTES da mutação** foram criados pela capacidade: `dist-mentoria-high-remediation-evidence-20261102/package.json.before-governed-install` e `package-lock.json.before-governed-install`.
- `package.json` alterado somente em `devDependencies`: `vite: 8.0.16 -> 8.3.5`, `sharp: ^0.33.5 -> 0.35.5`. `package-lock.json` gerado pelo npm oficial com transitivas alteradas, conferido com pacote `vite@8.3.5` e `sharp@0.35.5` em `node_modules` e no lockfile.
- `npm ci` disparado, mas a chamada excedeu o timeout de execução remoto; NÃO declarar que `npm ci` concluiu com exit0. `node_modules` conferido com versões corretas e testes/build subsequentes OK.
- Contrato de imagens SVG (2400x1200 -> WebP 1600x800; skip idempotente) e PNG embutido (WebP 320x160): **2/2 PASS** com novo Sharp.
- `npm run verify:fast`: **64/64 arquivos, 316/316 testes PASS**, ESLint, import scanner, public i18n, brand visual, estrutural, consistência strict PASS. Avisos não fatais React act/fetchPriority e Vite config native.
- `npm run build`: **PASS, Vite 8.3.5**, gates `[mentoria-commercial-build-gate] PASS: consent/OTP still unmounted` e `[mentoria-commercial-vite-gate] PASS: consent/OTP not mounted`; SEO pós-build: 14 HTML normalizados, 175 rotas mantidas. Captação comercial real permanece **fail-closed**.
- `npm run verify:deploy`: **BLOQUEADO pela allowlist** do MCP, sem execução; seus componentes principais lint/testes/build foram rodados separadamente. NÃO alegar que verify:deploy passou.
- Backups de sitemap e snapshot feitos antes e depois; restaurados seletivamente `public/sitemap.xml`, `public/sitemap-index.xml`, `src/__tests__/__snapshots__/example.test.jsx.snap`, sem misturar alterações de SEO geradas. `git diff --check` PASS. Diff de código após restauração esperado somente `package.json`, `package-lock.json` e este return point.
- `npm audit --json` e `npm audit --omit=dev --json` permanecem bloqueados no executor local; é obrigatório **repetir auditoria oficial no CI** antes de declarar zero high. O PR #166 é uma auditoria da versão anterior, não representa pós-patch.

## Próximos gates
1. Commit local seletivo dos dois manifests e deste return point, com inspeção de diff (não commitar assets gerados). Revalidar worktree clean e leases.
2. Obter `npm ci` com exit comprovado e CI oficial pós-fix; exigir `npm audit` 0 high e documentação de moderates residuais. Avaliar compatibilidade Windows e Linux do `sharp@0.35.5`.
3. Abertura de PR, push, merge e deployment do site **dependem de novo gate explícito do owner** e da revisão/CI completos; não realizar implicitamente. Manter rollback de produção `dpl_82RwnFKZeTcpXaFAKygJxqaSEaF5` como baseline conhecido, revalidar sempre.
4. React Router 6 -> 7 é risco moderado separado; não misturar update major de router com high patch toolchain.
5. Criar aprendizado permanente de governança: código-fonte/tipos/testes não bastam — validar formato ESM no staging, hash exato, restart PM2, health e tools live; manter instalação npm restrita com owner e manifests exatos.

## Classificação
- **RESOLVIDO:** capacidade governada live; reinício PM2 saudável; atualização local dos dois pacotes; 316 testes + build PASS; backups.
- **PENDENTE:** relatório audit oficial pós-fix, prova de `npm ci` clean, CI remota, push/PR/merge/deploy (gates).
- **RISCO VISTO:** moderates React Router; regras allowlist barram verify:deploy; checkout Liz dirty não deve ser publicado integralmente.
- **STATUS:** OK para atualização e testes LOCAIS; PARCIAL para evidência de remediação completa e publicação.
