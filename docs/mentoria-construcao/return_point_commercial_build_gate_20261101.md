# Return point — Mentoria: gate comercial aplicado ao build, não apenas ao Vitest

Data: 2026-11-01. Produto: Mentoria Estratégica Individual do Grupo WG Almeida. Repo canônico da landing: \`almeidawg/00-site-wgalmeida\`; domínio verificado \`mentoria.wgalmeida.com.br\`, Vercel project \`site-wgalmeida\` (\`prj_uNqhTiNaZx3O1CxDlBXhNVKdIIOM\`). Worktree segregado \`E:\01_WG_Ecosystem\09_TMP\mentoria-site-consent-lab-20261101\`, branch \`feat/mentoria-consent-site-20261101\`. Base anterior local limpa \`2cae3fed931ecbfa607262b136d6452340922af5\`. Checkout operacional original em \`E:\03_WG_Operacional\01_Apps\04_WG_Buildtech\00_Produtos_WG_Institucional\00-site-wgalmeida\frontend\` tem alterações de outras frentes e não foi modificado.

## Falha demonstrada

O commit anterior havia criado \`src/__tests__/mentoriaCommercialReleaseGate.test.js\` com regressões que recusam montagem indevida de formulário/endpoint comercial, mas o \`package.json\` chamava \`vite build\` sem executar o teste. Um build podia assim continuar mesmo se o teste de segurança nem fosse executado. O gate de aprovação geral \`tools/gate-mentoria-release.mjs\` já existia, mas é outro controle, baseado no checklist humano de lançamento; não era invocado pelo \`npm run build\` e não deve ser confundido com a nova proteção do consentimento.

**Causa raiz:** controle apenas na fase de testes, sem integração explícita nos scripts de compilação que empacotam a landing. Uma execução comum de \`npm run build\` não garante executar Vitest.

## Correção local

1. \`tools/mentoria-commercial-build-gate-core.mjs\`: verificador Node puro, sem dependências externas, rede, banco ou acesso a segredos. Rejeita import/reexport do formulário ou da fronteira comercial em qualquer código de produção de \`src/\` (exceto os dois módulos ainda isolados e testes), ou em \`index.html\`; rejeita novos endpoints públicos \`api/\` de mentoria/consentimento/OTP e importação do boundary por rotas públicas; rejeita rewrites/redirects/routes do \`vercel.json\` para consentimento.
2. O mesmo verificador rejeita \`enabled=true\` por padrão, fetch/localStorage no formulário, bypass de finalidade escopada, importação de \`_requestGuard\` permissivo ou \`_adminAuth\` e acessos de Twilio/Supabase inseridos diretamente no boundary.
3. Adiciona verificação de **presença do próprio guard** em todos os scripts existentes do \`package.json\` que fazem \`vite build\`. Se um script deixa de chamá-lo, a auditoria rejeita o estado. Quais: \`build\`, \`build:local\`, \`analyze\`, \`seo:validate:fresh\`, \`smoke:console:fresh\`, \`verify:full\`, \`verify:deploy\`, \`prepush\`.
4. \`tools/check-mentoria-commercial-build-gate.mjs\`: CLI para execução automatizada, raiz resolvida a partir do próprio arquivo (não aceita path vindo do usuário). Resultado mínimo PASS ou BLOCKED com apenas IDs genéricos de problema, sem dump de arquivos/credenciais.
5. \`package.json\`: cada ocorrência de \`vite build\` nos oito scripts passou a ser precedida por \`node ./tools/check-mentoria-commercial-build-gate.mjs &&\`. Assim o mesmo comando usado pelo build local pára antes de invocar o bundler se houver violação. Qualquer comando externo arbitrário que chame diretamente \`vite build\` fora desses scripts ainda pode contornar essa validação.
6. \`src/__tests__/mentoriaCommercialBuildGate.test.js\`: 9 cenários reais do verificador em diretórios temporários criados pelos testes, incluindo imports diretos/indiretos, endpoint público novo sem dependência, handler público que importa boundary, rewrite, default-enabled, browser fetch, reutilização do guard permissivo, remoção de proteção dos scripts e JSON de configuração inválido. O teste não toca arquivos rastreados do repositório durante simulações de ataques.

## Evidências e limites

- Revalidado antes da execução: repo \`almeidawg/00-site-wgalmeida\`, worktree na branch esperada e limpo em \`2cae3fe\`, Vercel project ID certo, checkout operacional distinto com WIP, lease sem conflito. Nenhum estado de produção foi alterado.
- Novo scanner executado diretamente: \`[mentoria-commercial-build-gate] PASS: consent/OTP still unmounted\`.
- Testes novos do build gate e release gate: **14/14 PASS**; suíte completa do site: **62 arquivos / 295/295 testes PASS**; ESLint geral: **PASS**.
- \`npm run build\`: **PASS, exit=0**. Saída da execução comprova \`[mentoria-commercial-build-gate] PASS\` **antes da execução do \`vite build\`**. Isso confirma o controle no script local real, não apenas nos testes.
- Scripts de build geram alterações transitórias em \`public/sitemap.xml\`, \`public/sitemap-index.xml\` e \`src/__tests__/__snapshots__/example.test.jsx.snap\`. Os artefatos devem ser copiados para \`dist/\` ignorado e restaurados seletivamente; backups automáticos dos edits devem ser preservados igualmente. Não enviar esses arquivos ao commit.
- O site já possui outras suítes com avisos de React \`fetchPriority\` e erros de rede sintéticos esperados nos testes negativos; nenhum teste falhou nesta sessão.
- A consulta anterior às variáveis do projeto Vercel continuou **bloqueada por HTTP 403**, e \`get_project\` não forneceu um \`buildCommand\` explícito. Portanto, a proteção foi **verificada em \`npm run build\` local**, mas **não foi homologada no pipeline de deploy Vercel** e não constitui autorização para publicar. Verificar a configuração de build e o fluxo CI/preview com permissões adequadas antes do gate de release.
- Essa análise estática não é um controle irrompível: um desenvolvedor pode criar uma rota dinâmica sem palavras-chave reconhecidas, fazer um build por comando externo, ou alterar o próprio guard. O objetivo é prevenir montagem **acidental** enquanto todo fluxo segue não montado. Não substitui revisão formal de segurança, origem HTTPS, CSP, política LGPD ou E2E.

## Decisões e próximos gates

**RESOLVIDO:** diferença entre "teste que bloquearia" e "build que efetivamente executa o bloqueio"; guard serverless-independent integrado a oito scripts do site, com regressões de bypass acidental.

**PENDENTE:** política comercial aprovada, backend de consentimento separado e autenticado, OTP real e contrato/custos aprovados, conta/env verificados, revogação real, e transação autorizada/idempotente no WGEasy. Confirmar CI e comando exato executado pela Vercel com acesso autorizado; só então tratar publicação como protegida.

**RISCO VISTO:** scripts próprios cobertos, mas executores externos podem ignorá-los; acesso às variáveis da Vercel negado; a operação com leads permanece bloqueada. Não usar WhatsApp pessoal em Baileys, nem confundir Pixel Meta com opt-in de lead.

**Classificação: PARCIAL / FAIL-CLOSED para ativação real.** Sem push, merge, deploy, restart, DNS/env, SMS/OTP, WhatsApp, Supabase/WGEasy writes ou alteração da landing pública nesta rodada.
