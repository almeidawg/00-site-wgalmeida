# Return point — Mentoria: boundary HTTP de consentimento comercial (2026-11-01)

## Identidade canônica e contexto
- Produto: Mentoria Estratégica Individual, domínio de produção confirmado \`mentoria.wgalmeida.com.br\`, projeto Vercel \`site-wgalmeida\` (\`prj_uNqhTiNaZx3O1CxDlBXhNVKdIIOM\`), repositório \`almeidawg/00-site-wgalmeida\`.
- Branch local isolada \`feat/mentoria-consent-site-20261101\`, checkout \`E:\01_WG_Ecosystem\09_TMP\mentoria-site-consent-lab-20261101\`, base do deploy consultado \`b68cb89b570d1be933cd53ad138771c4b48425e0\`. Commit anterior \`1b2a171dc4eeaf9ac70520ec6dea554f730b5bf3\`.
- Checkout operacional do site em \`E:\03_WG_Operacional\01_Apps\04_WG_Buildtech\00_Produtos_WG_Institucional\00-site-wgalmeida\frontend\` tem WIP não relacionado; não foi editado.
- O domínio e o WhatsApp pessoal da landing não foram alterados. Worker institucional Liz e WGEasy permanecem separados; sem produção, push, deploy, restart, DNS, OAuth ou OTP.

## Motivo concreto
O site possui \`api/_requestGuard.js\` genérico com \`isOriginAllowed\` que autoriza localhost, \`*.vercel.app\` e origem ausente em alguns fluxos. Isto não é adequado para consentimento comercial que envolve telefone e código OTP. A \`api/_mentoriaInboundAdapter.js\` existente é laboratório de ponte WhatsApp, não uma prova de aceite do próprio lead e não pode ser reaproveitada para ler a caixa pessoal do fundador.

## Alterações isoladas
- Novo \`api/_mentoriaCommercialConsentBoundary.js\`, arquivo interno **não registrado em rotas** e sem export de handler público.
- \`createMentoriaCommercialConsentBoundary(deps)\` produz um contrato de avaliação server-side com estado desativado por padrão, sem chamadas HTTP, Twilio, Supabase ou CRM.
- Quando e **somente quando** um futuro serviço confiável configurar explicitamente o contrato: origem HTTPS exata e não-local/preview, hostname coincidente, POST, \`content-type=application/json\`, \`x-forwarded-proto=https\`, \`sec-fetch-site=same-origin\` e CSRF na requisição. **Cabe ao reverse proxy confiável sobrescrever os headers de forwarding**; cabe ao backend real validar a sessão HttpOnly assinada. Esses headers sozinhos não provam identidade.
- O corpo deve conter JSON estrito e canônico (tamanho máximo 1024 bytes), sem duplicatas de chave/variações ambíguas, com chaves exatas por ação e sem campos extras com mensagem, histórico, mídia ou dados de outros contatos.
- A finalidade é \`mentoria_commercial_contact\`, decisão obrigatoriamente \`agree\`; versão e SHA-256 do aviso são derivados **do texto configurado no servidor**, não do hash ou do consentimento Meta \`wg_mentoria_consent_v1\` fornecido pelo navegador.
- O backend futuro deve implementar \`authenticateLeadSession(req)\` que comprove sessão real e forneça um CSRF independente e válido. O boundary compara CSRF com \`timingSafeEqual\`, valida expiração e subject sem aceitar identidade de request body.
- Portas futuras \`beginChallenge\` e \`confirmChallenge\` devem implementar respectivamente persistência atômica de sessão/telefone/challenge/VerificationSid/aviso e verificação do OTP/registro de consentimento assinado, com revogação. Apenas elas podem determinar o resultado; uma resposta \`accepted\` do port não constitui, isoladamente, gravação em WGEasy.
- As respostas ao browser são mínimas e sem PII: \`unavailable\`, \`denied\`, \`invalid_request\`, \`pending\` com ID opaco, ou \`accepted\`. Exceções de provider são sanitizadas.

## Testes e governança
- Novo \`src/__tests__/mentoriaCommercialConsentBoundary.test.js\`: 12 testes cobrindo default fail-closed, origem cruzada/localhost/preview, host/protocolo/Fetch Metadata, POST, corpo canônico, limites/extra fields, aceite escopado, CSRF, sessão real injetada, expiração, erro sanitizado, e portas que não expõem dados.
- Validação direcionada: 29/29 PASS (12 novos + 9 opt-in front + 6 Pixel + 2 WhatsApp); ESLint global PASS.
- Primeira bateria encontrou 1 divergência apenas no status de JSON vazio: era 403, teste esperava 400. Corrigido com checagem de tipo e presença de \`action\`; bateria de 29/29 reexecutada.
- Suíte completa Vitest: **60 arquivos / 279 testes PASS (exit=0) na repetição**. Primeira execução retornou exit=1 com falha transitória não conclusivamente diagnosticada; a segunda completou 60/60 sem falhas. Não afirmar estabilidade perfeita; manter nota de flakiness nos testes da base. Avisos antigos de `act(...)`, `fetchPriority` e erros esperados de testes negativos apareceram em stderr.
- `npm run build`: PASS (Vite, SEO/sitemap). `npm run lint`: PASS. Regressão direcionada do consentimento, landing e Pixel: **29/29 PASS**.
- Build e Vitest modificaram apenas sitemaps e um snapshot rastreados; todos foram copiados para `dist/mentoria-boundary-build-backups-20261101/` ignorado e restaurados seletivamente por `git restore --` para preservar o escopo. Backup de edit_file guardado em `dist/mentoria-boundary-original-backups-20261101/`.
- O diff final deve conter apenas `api/_mentoriaCommercialConsentBoundary.js`, teste dedicado e este return point. Nenhuma rota pública, `App.jsx`, landing, Pixel ou WhatsApp foi alterado. Checar Git limpo após commit, sem deploy.
- Não executar \`liz_session_claim_create\` do monorepo Liz no site, pois falta \`ops/scripts/session-claim.mjs\`. A lease por caminho foi obtida como mecanismo de exclusividade e \`liz_git_commit_safe\` protege branch/remote e faz commit seletivo.

## Limitações e próximos gates
1. **G0 técnico parcial:** boundary HTTP estrito offline criado, sem URL pública nem dependência nova.
2. **G1 jurídico bloqueado:** texto comercial aprovado com hash, versão, data, finalidade, responsabilidade e retirada/revogação.
3. **G2 identidade/HTTPS bloqueado:** serviço independente/tenant e proxy confiável, sessão assinada HttpOnly, CSRF derivado do servidor, armazenagem durável centralizada, monitoramento auditável.
4. **G3 verificação bloqueada:** homologação Twilio (ou alternativa), número/challenge/SID, OTP real, antifraude/rate-limit distribuído, orçamento e Brasil.
5. **G4 CRM bloqueado:** autorização do fundador, consentimento vigente rechecado junto à gravação, atomicidade ou compensação com idempotência e segregação de tenants.
6. **G5 publicação bloqueada:** push/deploy/ambiente/produção exigem aprovação explícita do owner, além de QA mobile/URL/console.

**Aprendizado generalizável:** não reutilizar guards de origem genéricos e permissivos para dados sensíveis; headers HTTP/booleanos do navegador não são prova de sessão/autorização; ligar hash do aviso à fonte aprovada pelo backend, nunca apenas à alegação do cliente. Evidência: código de \`api/_requestGuard.js\`, regressões e contrato novo.

**RESOLVIDO:** controle HTTP server-only offline e testes de segurança. **PENDENTE:** sessão real, proxy, opt-in legal, OTP, recibo e transação WGEasy. **RISCO VISTO:** componentes não montados e mocks não constituem autenticação real nem consentimento. **Status: PARCIAL / FAIL_CLOSED.**
