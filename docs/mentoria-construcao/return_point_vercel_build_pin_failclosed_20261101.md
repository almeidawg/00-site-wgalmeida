# Return point — Pin de Build Command Vercel e anti-bypass da Mentoria (01/11/2026)

## Identidade e ponto de partida
- Produto: Mentoria Estratégica Individual no site institucional WG Almeida.
- Repo: `almeidawg/00-site-wgalmeida`; branch isolada `feat/mentoria-consent-site-20261101`; worktree `E:\01_WG_Ecosystem\09_TMP\mentoria-site-consent-lab-20261101`.
- HEAD inicial: `7928e39ae65fbce70dd440153c0b51b8620d7636`, árvore inicialmente limpa e sem lock.
- Projeto Vercel previamente conferido: `site-wgalmeida`, ID `prj_uNqhTiNaZx3O1CxDlBXhNVKdIIOM`, team `grupo-wg-almeida-vercel-projects`.
- Deploy remoto lido na sessão anterior, `dpl_7ZMYnoUa6PGAe4TyQGNxc4VuDeAy` da branch `chore/seo-audit-2026-11-01`, usou `npm run build`, mas NÃO continha o gate novo. Nenhum deploy do HEAD local foi feito.

## Mudança seletiva local
- Em `vercel.json`, acrescentado `"buildCommand": "npm run build"`. Segundo a documentação oficial da Vercel (https://vercel.com/docs/project-configuration/vercel-json), esta propriedade tem precedência sobre o Build Command do painel para o deployment. Não alterou URL, DNS, rotas, domínio ou configurações remotas.
- Em `tools/mentoria-commercial-build-gate-core.mjs`, verificação `vercel_build_command_not_guarded` rejeita ausência, alteração ou substituição desse comando.
- Também rejeita a propriedade legada `builds`, com erro `vercel_custom_builds_bypass_guard`, pois builders customizados podem introduzir caminhos diferentes do build Vite/React habitual.
- Em `src/__tests__/mentoriaCommercialBuildGate.test.js`, dois testes de regressão exercitam a configuração canônica, alternativas `vite build`, `npx vite build`, `npm run build:local`, ausência do campo e propriedade `builds`.
- Gate de Vite direto já existente permanece ativo. Consentimento, autenticação, OTP e interface comerciais continuam não montados.

## Evidências da sessão
1. TDD negativo: novo teste do pin falhou ao observar `buildCommand=undefined`; após patch, suite direcionada passou. Novo teste do `builds` falhou com `problems: []` antes do patch; depois passou.
2. Gate offline `node ./tools/check-mentoria-commercial-build-gate.mjs`: PASS.
3. Testes direcionados após os dois hardenings: 3 arquivos, **30/30 PASS**.
4. Suíte completa: 62 arquivos e **299/299 PASS**, exit=0; avisos antigos de React/act/fetchPriority e erros de testes negativos simulados persistem.
5. `npm run lint`: PASS, exit=0.
6. `npm run build`: PASS, exit=0, com logs de `mentoria-commercial-build-gate` e `mentoria-commercial-vite-gate` PASS antes do Vite; SEO gerado. Execução feita antes do segundo patch trivial de rejeição de `builds`, cuja validação foi comprovada na suíte direcionada + suíte completa.
7. `git diff --check`: sem erros. Artefatos rastreados de sitemap e snapshot gerados pelos testes/build foram restaurados seletivamente após cópia de evidência. Backups de patch movidos para `dist-mentoria-buildpin-evidence-20261101/`, ignorado por Git; não devem ser publicados.
8. A tentativa de `npm audit --omit=dev --json` foi recusada pela allowlist MCP: **não houve triagem de pacotes**. O log antigo da Vercel indicou 19 vulnerabilidades, sendo 2 high, 17 moderate; sua aplicabilidade à produção segue INCERTA.

## Fechamento e próximo gate
**RESOLVIDO:** arquivo versionado fixa `npm run build` e testes detectam troca de comando/legacy builders; CI e scripts locais protegidos; regressões verdes.

**PENDENTE:** provar o pin em deployment REMOTO do commit novo após autorização específica de push/merge/deploy; checar settings de root/config externa e logs do deployment autorizado. Serviço HTTPS comercial não montado; sessões HttpOnly assinadas, CSRF server-side, provedor OTP, antifraude e armazenamento durável reais ainda inexistentes/não homologados. Revisão jurídica do consentimento comercial `mentoria_commercial_contact` (distinta do Pixel Meta), assinatura e revogação de recibo, integração idempotente WGEasy e aprovação de publicação permanecem bloqueadas. Vulnerabilidades npm de produção não triadas por restrição do executor.

**RISCO VISTO:** operadores podem implantar outro checkout/config sem esta defesa; dashboards, builds legados, overrides fora do repositório e contas não homologadas exigem verificação de identidade de release. Fixar o comando não substitui autenticação real, consentimento jurídico ou revisão de owner.

**Aprendizado generalizável:** causa raiz = confiar em comando implícito da Vercel e apenas em hooks locais. Evidência = log remoto anterior com `npm run build` antigo, teste negativo do pin ausente e teste negativo de `builds`. Correção = configuração versionada, inspector fail-closed e regressão de remoção. Prevenção = comparar fonte Git, comando efetivo nos logs, SHA do deployment e testes de bloqueio antes de aprovar publicação. Validar sempre após um deploy autorizado.

**Status:** PARCIAL / FAIL_CLOSED. Nenhum push, merge, deploy, restart, DNS, SMS, WhatsApp pessoal, credencial nem escrita WGEasy nesta execução.
