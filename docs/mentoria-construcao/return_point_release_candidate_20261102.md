# Return point — Candidato de release seguro da Mentoria (02/11/2026)

## Identidade canônica e baseline
- Produto: Mentoria Estratégica Individual WG Almeida, site `mentoria.wgalmeida.com.br`.
- Repo `almeidawg/00-site-wgalmeida`, branch `feat/mentoria-consent-site-20261101`, worktree isolada `E:\01_WG_Ecosystem\09_TMP\mentoria-site-consent-lab-20261101`.
- Baseline de análise: HEAD `189cbe0ac7dd590dde14e6e20794797d0f7baf48`; `origin/main` após `git fetch --all --prune` = `b68cb89b570d1be933cd53ad138771c4b48425e0`.
- `git merge-base HEAD origin/main` = `b68cb89`; `git rev-list --left-right --count origin/main...HEAD` = `0 10`, sem divergência a reconciliar na captura.
- Vercel projeto `site-wgalmeida` (`prj_uNqhTiNaZx3O1CxDlBXhNVKdIIOM`) / team `grupo-wg-almeida-vercel-projects` (`team_PZqrfArEACLjprLuIKVVA7Ch`). Domínio `mentoria.wgalmeida.com.br` verificado como projeto correspondente pela API. Deployment de produção em `dpl_DHh9xiR7SzEUg9S6YWsGRykY3xBV` = `main` SHA `b68cb89`.
- Vinculo local Vercel não existia nesta worktree; criado o arquivo IGNORADO `.vercel/project.json` somente com orgId, projectId e projectName confirmados (sem tokens, sem leitura de env). `project_context_validate` passou o check `vercel_link`, embora a árvore ainda precisasse ficar limpa.

## Escopo candidato
- 10 commits próprios inicialmente sobre a main, 25 arquivos, majoritariamente novos contratos server-only privados de opt-in/recibo, testes, documentação e três configurações de build (`package.json`, `vite.config.js`, `vercel.json`).
- A landing pública e CTA original não foram alterados. O formulário e as funções comerciais permanecem **não montados**. Não ativar OTP, intake comercial nem WGEasy via publicação do site.
- Os gates npm/Vite/vercel.json protegem contra montagem acidental dos componentes privados.

## Achados de QA no preparo de release
1. O `npm run verify:fast` falhou inicialmente por 7 falsos positivos do scanner de imports em strings com imports **simulados** do teste `mentoriaCommercialBuildGate.test.js`. Corrigido separando as palavras dos fixtures JavaScript em concatenação de strings, preservando o texto REAL que os testes gravam temporariamente. Scanner e 14 testes do build gate passaram após correção.
2. `git diff --check origin/main...HEAD` detectou trailing whitespace em uma linha do return point `return_point_commercial_release_gate_20261101.md`. Espaço final retirado seletivamente.
3. `npm run verify:fast`: **PASS (exit=0)** incluindo ESLint, imports, i18n, visual, structural, consistência normal/strict e suite **63/63, 311/311 PASS**.
4. `npm run build`: **PASS (exit=0)** com `[mentoria-commercial-build-gate] PASS`, `[mentoria-commercial-vite-gate] PASS` e SEO pós-processado.
5. `npm run verify:deploy`: a invocação foi recusada pela allowlist do executor MCP. **NÃO afirmar que este gate local passou**. Os checks CI no PR precisam executar gates oficiais antes do merge.
6. Três artefatos transitórios gerados por build/testes (`public/sitemap.xml`, `public/sitemap-index.xml`, `src/__tests__/__snapshots__/example.test.jsx.snap`) tiveram backups e foram restaurados seletivamente; backups de correções foram movidos para `dist-mentoria-release-evidence-20261102/` (ignorado por Git).
7. O histórico de aviso de vulnerabilidades npm permanece pendente de triagem; o comando `npm audit` foi bloqueado pela allowlist em execução anterior.

## Correção da revisão automática PR #161
- A branch candidata foi publicada no commit `1cb8e2f`; PR #161 em `https://github.com/almeidawg/00-site-wgalmeida/pull/161`.
- O CI GitHub `Required CI gates` execução 73 aprovou `build-and-test` e `deploy-gate-final`, e a Vercel Preview `dpl_Ari6Um3eXHSr22enMepjo55QSgEF` chegou a `READY`.
- O merge não foi permitido pela política GitHub `All comments must be resolved`. Thread `PRRT_kwDOQ5MDZc6ygFtT`, comentário P2 do Codex em `package.json:11`: em `npm run analyze`, `ANALYZE=true` estava ligado ao gate Node e NÃO ao Vite, impedindo `stats.html`.
- Correção: `ANALYZE=true node ./tools/check-mentoria-commercial-build-gate.mjs && ANALYZE=true vite build`, mantendo o guard; o inspector agora exige a env também no comando Vite e há teste negativo que falha se ela for retirada.
- Validação pós-correção: teste direcionado `15/15 PASS`; `npm run verify:fast` **63 arquivos / 312 testes PASS**; `npm run build` PASS com ambos os gates; ESLint PASS. Backups preservados e artefatos rastreados gerados restaurados seletivamente.
- Necessário commitar/push da correção, responder e resolver somente o thread após revisão, aguardar novamente CI/Vercel e revalidar o SHA antes do merge. Não ignorar gate da `main`.

## Release e gates
- Autorização geral do owner nesta conversa: preparar commit, push, PR/merge e deixar o site em produção. Essa autorização NÃO substitui as condições técnicas abaixo.
- Publicação aprovada **somente para código inativo/proteções do site**, nunca para ativação do atendimento comercial sensível.
- Antes do merge exigir PR, checks GitHub e Vercel/Sonar relevantes verdes, head SHA imutável e conformidade do escopo.
- Antes de considerar produção concluída: verificar novo deployment `target:production`, branch main/merge SHA, comando real de build protegido em logs, domínio HTTPS `mentoria.wgalmeida.com.br`, resposta e saúde da landing, ausência de rota pública de OTP/consentimento, e fallback/rollback conhecido `dpl_DHh9xiR7SzEUg9S6YWsGRykY3xBV`.
- Bloquear qualquer ativação comercial real até haver serviços HTTPS/sessões, validação OTP antifraude, recibo jurídico aprovado e revogável e WGEasy idempotente efetivamente homologados.

## Aprendizado governança
- Contexto: suíte Vitest passing não garantia CI `verify:fast`; houve falso positivo de detector de imports em texto de fixtures.
- Causa: scanner estático genérico interpreta strings literais como código. Corrigimos APENAS fixtures sem relaxar scanner global.
- Evidência: 7 caminhos de import fictícios ausentes; após correção, scanner e verify:fast PASS.
- Prevenção: executar o pipeline completo exigido pelo CI antes de qualquer push/merge; validação positiva de testes sintéticos não implica pipeline verde.
- Risco residual: `verify:deploy` só poderá ser considerado após GitHub CI real; a existência de link Vercel e build local não substitui deploy nem E2E.

**STATUS PRÉ-PUBLICAÇÃO: PARCIAL / FAIL_CLOSED enquanto checks remotos e deploy ainda não comprovados.**
