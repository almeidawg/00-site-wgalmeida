# Return point — Site WG / interface segregada de consentimento comercial (2026-11-01)

## Identidade canônica e limites de execução

- Produto: **Mentoria Estratégica Individual do Grupo WG Almeida**.
- Domínio público identificado: `https://mentoria.wgalmeida.com.br`.
- Projeto Vercel: `site-wgalmeida` / `prj_uNqhTiNaZx3O1CxDlBXhNVKdIIOM`, associado ao domínio verificado.
- Repositório GitHub da landing: `almeidawg/00-site-wgalmeida`; referência de deploy de produção identificada no Vercel: `main`, SHA `b68cb89b570d1be933cd53ad138771c4b48425e0` (`dpl_DHh9xiR7SzEUg9S6YWsGRykY3xBV`, READY).
- Checkout local existente: `E:\03_WG_Operacional\01_Apps\04_WG_Buildtech\00_Produtos_WG_Institucional\00-site-wgalmeida\frontend`, branch `feat/mentoria-construcao-landing-20261012`, com muitas alterações de outras frentes. **Não foi alterado**.
- Worktree **novo e independente**, criado a partir do SHA do deploy: `E:\01_WG_Ecosystem\09_TMP\mentoria-site-consent-lab-20261101`, branch `feat/mentoria-consent-site-20261101`.
- O WhatsApp pessoal do fundador permanece na landing. Nenhuma sessão Baileys pessoal, inbox, WGEasy, Twilio, Supabase ou produção foi acessada ou alterada.

## Descoberta arquitetural

- `src/lib/mentoriaConsent.js` guarda `wg_mentoria_consent_v1` em localStorage e serve **somente para medição/anúncios pelo Pixel Meta**. Esta escolha não autoriza encaminhamento comercial de telefone/lead.
- `src/pages/MentoriaConstrucaoLanding.jsx` usa `COMPANY.ceoWhatsapp || COMPANY.whatsapp` e links WhatsApp; **não foi editado**.
- O checklist de lançamento em `docs/mentoria-construcao/launch-approvals.json` mantém `whatsapp_e2e = pending`: mensagem recebida, atendida, agendada e registrada em CRM não foi homologada. O gate de revisão LGPD aprovado refere-se ao Pixel/política já existentes, não ao novo opt-in.
- O repositório Liz separado `almeidawg/05_Liz-platform` contém contratos offline de consentimento Ed25519, Google founder e desafio OTP; **não constituem um backend operacional integrado à landing**. Nenhuma interface web deve reutilizar a sessão WhatsApp pessoal nem registrar automaticamente contatos.

## Incremento local — sem publicação

1. `src/lib/mentoriaCommercialLeadConsent.js`: contrato independente para a finalidade `mentoria_commercial_contact`, normalização estrita de telefone brasileiro, digest SHA-256 do aviso versionado, exigência de caminho interno de privacidade e checagem de respostas ao desafio/código. Não importa, consulta ou altera `mentoriaConsent.js`.
2. `src/components/MentoriaCommercialLeadOptInForm.jsx`: UI **não montada em nenhuma rota**. `enabled=false` por padrão e renderização `null` sem texto de aviso previamente aprovado, versão, hash, `requestChallenge` e `confirmConsent` definidos.
3. Checkbox comercial desmarcado por padrão; exibição do aviso jurídico fornecido externamente e link para `/privacidade`; número formatado antes da solicitação; etapa de código somente após desafio `pending` com ID opaco; nenhum número é persistido em localStorage e o estado do telefone é limpo depois de um desafio aceito.
4. A confirmação envia ao **callback abstrato** `challengeId`, código, intenção `agree`, finalidade e versão/digest do aviso. Não há cliente HTTP, URL, segredo, OTP, SDK Twilio, banco ou conexão WGEasy. O backend deverá revalidar tudo, inclusive sessão, CSRF, rate limit, telefone, challenge/SID, versão do aviso, OTP, revogação e autorização de gravação.
5. Resposta `accepted` na UI produz apenas mensagem de solicitação recebida para análise, **não** afirma que houve inserção no CRM. Erros exibem mensagens genéricas sem eco de telefone/código/segredo.
6. O componente não está ligado ao `App.jsx` nem à `MentoriaConstrucaoLanding.jsx` e não pode aparecer no site publicado. O CTA pessoal existente e a aceitação/recusa do Pixel seguem inalterados.

## Contrato futuro e gates de produção

- **G1 Legal/Produto:** aviso comercial real aprovado (finalidade, base jurídica pertinente, responsáveis, prazo, revogação), versão e SHA-256 calculado da redação autorizada. **Não** reutilizar consentimento de rastreamento do Pixel.
- **G2 Backend independente:** selecionar ambiente e domínio/caminho HTTPS do serviço de coleta, autenticar origem e sessão/CSRF no servidor, não confiar em dados do navegador como prova. Capturar evidências auditáveis da interação e do OTP do próprio lead. Isolamento de credenciais e dados pessoais.
- **G3 Provedor/verificação:** homologar conta de SMS/voz real, autorização de custos Brasil, MFA/antifraude/quotas globais/distribuídas, rate limits por IP/dispositivo, armazenamento de challenge e SID e chave de assinatura em cofre. O contrato do front não gera/verifica OTP sozinho.
- **G4 Consentimento/CRM:** emitir recibo real independente e revogável, vinculado ao contato verificado e finalidade; somente após seleção autorizada do founder, validar revogação no commit transacional do WGEasy. Dados de staging autorizados antes de produção.
- **G5 Publicação:** somente depois de confirmação explícita do owner para alterar repositório/branch/env, push/deploy/DNS e validação E2E em URL/console/mobile.
- Proibir pareamento do WhatsApp pessoal por Baileys para tentar distinguir mensagens privadas por filtro tardio: isso não isola a caixa pessoal na origem.

## QA e dependências locais

- `node tools/run-vitest.mjs run src/__tests__/mentoriaCommercialLeadOptIn.test.jsx`: **9/9 PASS**.
- Regressão `mentoriaConsentBanner.test.jsx`, `mentoriaLandingWhatsapp.test.jsx` e novo teste: **17/17 PASS**. Há aviso de React `fetchPriority` preexistente em teste de landing, não decorrente dos arquivos novos.
- `npm run lint`: PASS.
- `npm run build`: PASS com geração de páginas de SEO e sitemap. Os dois sitemaps regenerados foram copiados para dist/mentoria-build-sitemaps-backup-20261101/ e restaurados seletivamente. O snapshot de exemplo tocado pela suíte também foi copiado para dist/mentoria-test-snap-backup-20261101/ e restaurado. O diff ficou restrito aos quatro arquivos criados.
- Node modules foram disponibilizados no worktree por **junction local** de leitura e uso do `frontend/node_modules` existente; nenhum pacote instalado ou credencial capturada.
- Suíte completa Vitest do site: PASS (exit=0), incluindo os nove cenários novos; ocorreram avisos de componentes preexistentes (`fetchPriority`, `act(...)`) e erros simulados esperados. `git diff --check` e árvore Git limpa exigidos no fecho, com commit apenas dos quatro arquivos novos.

## Aprendizado do ecossistema

- **Causa:** desenvolvimento de contratos no worker antes de confirmar repositório de UI; risco de usar consentimento de ads como autorização comercial.
- **Evidência:** Vercel Project ID/domínio/Git source, origem GitHub, código `mentoriaConsent.js`, checklist `whatsapp_e2e=pending` e checkout físico concorrente sujo.
- **Correção:** worktree independente da árvore WIP, componente fail-closed no projeto correto, sem integração/desvio do WhatsApp pessoal; regressões da landing.
- **Prevenção:** não considerar `enabled=true` do browser como autorização; deixar backend como única autoridade. Nunca publicar texto legal sintético dos testes nem tornar opt-in disponível antes de provedor e serviço real.
- **Validação futura:** testes com provedor autorizado, consentimento do titular, revogação, privacidade e contrato LGPD com contador distribuído e CRM transacional.

**RESOLVIDO:** código da interface de opt-in opcional, isolado, não publicado; identidade do site e proteção do consentimento de ads. **PENDENTE:** aviso jurídico aprovado, backend e IdP canônicos, provedor real, integração CRM e gate de produção. **RISCO VISTO:** frontend pode coletar decisão, mas não é prova verificável por si só. **Status: PARCIAL / FAIL_CLOSED para uso externo.**
