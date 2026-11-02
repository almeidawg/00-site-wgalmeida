# Return point — Verificação criptográfica e revogação do recibo de consentimento (2026-11-02)

## Identidade e baseline
- Produto: Mentoria Estratégica Individual WG Almeida, domínio `mentoria.wgalmeida.com.br`.
- Repo `almeidawg/00-site-wgalmeida`, branch isolada `feat/mentoria-consent-site-20261101`, worktree `E:\01_WG_Ecosystem\09_TMP\mentoria-site-consent-lab-20261101`.
- HEAD no início `823cf1594aa9b78b3a0e2d96255a18331d977da6`; Git limpo sem lock; projeto Vercel remoto previamente identificado `site-wgalmeida` mas vínculo local `vercel:null` permanece INCERTO.
- Execução exclusivamente local com lease governada `mentoria-offline-otp-receipt-20261102`, sem push/deploy/uso de SMS/OTP real ou WGEasy.

## Causa raiz e risco
- O boundary HTTP privado admite, por contrato, um futuro `confirmChallenge` que retorna `status: accepted` de porta confiável. Essa resposta isolada não comprova assinatura criptográfica, identidade, histórico do OTP nem vigência da autorização jurídica; é insuficiente para habilitar CRM.
- O estado `wg_mentoria_consent_v1` é somente do Pixel Meta e não pode ser reinterpretado como aceite de contato comercial.
- Sem consulta de revogação, uma prova anteriormente válida poderia ser indevidamente reutilizada após retirada de consentimento.

## Mudança seletiva
1. Novo `api/_mentoriaCommercialReceiptVerifier.js`: verificador estritamente PRIVADO, não montado em rota. `enabled` é falso por padrão. Não emite OTP, não assina recibo, não lê conversas nem escreve CRM.
2. Recebe apenas de backend autorizado chave pública Ed25519, issuer, keyId, texto e versão do aviso aprovado, relógio e porta `readConsentStatus`. Configuração incompleta/algoritmo não Ed25519 retorna `unavailable`.
3. Rejeita assinaturas malformadas, campos extras, evidências futuras/cronologia inconsistente, divergência de titular, identificador do desafio, finalidade `mentoria_commercial_contact`, hash SHA-256 do aviso e emissor. Assinatura cobre JSON canônico em ordem de campos predefinida.
4. Só retorna `{status:verified}` após verificação criptográfica e leitura de status `active` do armazenamento AUTORITATIVO, com vínculo exato a recibo/titular/aviso. `revoked`, `pending`, `missing`, falhas e exceções retornam `denied`; nunca expõe dados sensíveis no browser. `phoneFingerprint` requer HMAC com chave de serviço (não SHA simples de número), mas a prova de uso real de HMAC é responsabilidade do emissor ainda inexistente.
5. Proteção de build ampliada: `tools/mentoria-commercial-build-gate-core.mjs` passa a exigir o novo arquivo e a bloquear importação/reexport em código `src` e rotas `api/` públicas. Fixture e teste negativo novos em `mentoriaCommercialBuildGate.test.js`.
6. Teste `src/__tests__/mentoriaCommercialReceiptVerifier.test.js` cobre 10 cenários com chaves temporárias Ed25519 e status sintetizado em memória, incluindo sucesso, revogação, adulteração, titular/política divergentes, timestamp, falha de datastore, dados extras, chave e algoritmo inválidos.

## Validação real nesta sessão
- Testes específicos de recibo e build: 24/24 PASS.
- Suíte completa de Vitest: **63/63 arquivos, 311/311 testes PASS**, exit 0. Avisos históricos de React act/fetchPriority e falhas simuladas de testes negativos permaneceram sem reprovação.
- `npm run lint`: exit 0.
- `npm run build`: exit 0, com `[mentoria-commercial-build-gate] PASS` e `[mentoria-commercial-vite-gate] PASS`, pós-processamento SEO ao final.
- Backups prévios, intermediários e saídas geradas guardados em `dist-mentoria-receipt-evidence-20261102/` (ignorado); restaurados somente `public/sitemap.xml`, `public/sitemap-index.xml` e `src/__tests__/__snapshots__/example.test.jsx.snap` após comprovar backups. `git diff --check` sem erros.
- Commit seletivo local, Git limpo e lease liberada: conferir no fechamento da execução.

## Dependências não satisfeitas / gates de produção
- **G0 criptografia offline parcial:** somente o VERIFICADOR está pronto e testado, não o emissor jurídico nem sua confiança externa.
- **G1 jurídico BLOQUEADO:** versão aprovada do texto `mentoria_commercial_contact`, finalidade, controlador, retenção, revogação, auditoria de consentimento e termo por revisão formal.
- **G2 HTTPS/autenticação BLOQUEADO:** backend independente implantado sob proxy confiável, sessão assinada HttpOnly, CSRF e vínculo com titular autenticamente autenticado.
- **G3 OTP BLOQUEADO:** conta/provedor real, Verified SID, expiração, antifraude, rate-limit distribuído, budget, política de tentativas, replay/consumo transacional e logs auditáveis. O verificador apenas confere CLAIMS assinadas; NÃO verifica OTP em provedor.
- **G4 recibo/ledger BLOQUEADO:** emissor Ed25519 confiável protegido por gestão de chaves; assinatura após OTP real + aceite explícito; persistência durável, sincronização da revogação, key rotation e auditoria. Testes usam chaves efêmeras sintéticas, sem chave de produção.
- **G5 CRM BLOQUEADO:** autorização do fundador, rechecagem atômica de consentimento vigente e gravação idempotente tenant-scoped no WGEasy. Resposta `verified` isolada não autoriza gravação por si só.
- **G6 release BLOQUEADO:** antes de push/merge/deploy/DNS/OTP externo, owner deve aprovar ação e identidade exatas; commit local não é deploy.
- Triagem dos 2 alertas high do log npm remoto ainda pendente; `npm audit` foi bloqueado pela allowlist do MCP em execução anterior, sem bypass.

## Aprendizado do ecossistema
- Contexto: resposta `accepted` de porta futura não equivale a consentimento comercial vigente.
- Causa raiz: ausência de prova assinada que vincule titular, verificação OTP, versão do aviso e estado de revogação.
- Evidência: contrato atual é privado e devolve `accepted` quando porta de teste sintética o afirma; testes negativos de assinatura/estado comprovam que alterar qualquer claim impede `verified`.
- Correção: verificador Ed25519 fail-closed e consulta obrigatória de status. Nunca compartilhar chaves em frontend ou comparar apenas `status` do browser.
- Prevenção: exigir signatário protegido, store de revogação autoritativo sem cache permissivo, assinatura canônica, versão jurídica, identidade e transaction gate CRM antes da liberação.
- Validação: 311 testes, lint, build e Git; não houve homologação externa.

**RESOLVIDO:** verificador privado de recibo com assinatura, titular/aviso e revogação; cobertura negativa e travamento da exposição pública.
**PENDENTE:** emissor real, OTP, identidade/HTTPS, jurídico, ledger/revogação durável, WGEasy, triagem dependências, deployment autorizado.
**RISCO VISTO:** mocks com assinatura sintética NÃO representam verificação OTP ou aceite jurídico verdadeiro; `verified` só tem valor se as portas forem genuínas e auditadas.
**Status: PARCIAL / FAIL_CLOSED.**
