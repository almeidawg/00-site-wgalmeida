# Return point — Vínculo autoritativo do recibo comercial pós-publicação (2026-11-02)

## Identidade canônica e baseline
- Produto: Mentoria Estratégica Individual WG Almeida, https://mentoria.wgalmeida.com.br/mentoria-construcao.
- Repositório: `almeidawg/00-site-wgalmeida`, branch isolada NOVA `fix/mentoria-consent-receipt-binding-20261102`, worktree `E:\01_WG_Ecosystem\09_TMP\mentoria-postlaunch-security-20261102`.
- Base Git confirmada após fetch `origin/main`: `6858d862d7545ed1e71cae546f92297c87835aec` (merge #161 já publicado).
- Projeto Vercel confirmado por API `site-wgalmeida`, ID `prj_uNqhTiNaZx3O1CxDlBXhNVKdIIOM`, equipe `team_PZqrfArEACLjprLuIKVVA7Ch`. Link local IGNORADO `.vercel/project.json` usa somente esses IDs; não contém credenciais.
- Produção preservada: deployment `dpl_DgY4Ch2A2xAMZHUDtmHtcdDEEsbt`, `READY`, `main` SHA `6858d862...`; anterior `dpl_DHh9xiR7SzEUg9S6YWsGRykY3xBV` é referência de rollback. Nenhum redeploy foi feito.

## Achado e causa raiz
- O verificador privado `api/_mentoriaCommercialReceiptVerifier.js` exigia assinatura Ed25519 e status autoritativo ativo, mas a leitura do ledger confirmava **apenas** `state`, `receiptId`, `principalId` e `noticeDigest`.
- Isso não provava que o desafio OTP, `phoneFingerprint` (HMAC telefônico), finalidade `mentoria_commercial_contact`, versão do aviso e horários de verificação e registro correspondiam ao recibo assinado.
- O cenário de ledger incompleto foi demonstrado em teste negativo: antes da correção, um registro somente com status ativo e os três identificadores antigos retornou `verified` quando deveria negar. O teste positivo com DTO completo também falhou no código antigo por contrato estrito de quatro campos. **Esses testes falharam primeiro por razões esperadas** (2 de 12); após correção, 12 de 12 passaram.

## Correção
- Introduzido `LEDGER_CLAIM_FIELDS` explícito e `LEDGER_KEYS` incluindo `state`.
- Verificação de registro `active` **somente** com DTO autoritativo normalizado e sem campos extras, contendo os vínculos exatos de `receiptId`, `principalId`, `challengeId`, `phoneFingerprint`, `purpose`, `noticeVersion`, `noticeDigest`, `otpVerifiedAtMs` e `consentRecordedAtMs` comparados aos claims já assinados.
- O port `readConsentStatus` agora recebe também `challengeId`, exigindo implementação de armazenamento efetivamente confiável e de leitura forte antes da futura montagem. O componente permanece `enabled:false` por padrão, PRIVATE, sem handler exportado nem chamada de SMS/OTP ou CRM.
- Testes sintéticos ampliados: ledger completo positivo, revogado/pending/missing, divergências em desafio, impressão telefônica, finalidade, versão do aviso e dois timestamps; recusa ledger incompleto; assinaturas reemitidas em fixtures locais não autorizam um recibo sem equivalência do ledger.

## Evidência de validação
- Worktree criado a partir da `main` real sob leases exatas segundo `mutationLeasePolicy`. O checkout operacional principal e a worktree do release #161 não foram editados.
- `npm ci`: PASS; 838 pacotes instalados em 49 s. Reproduziu **19 vulnerabilidades: 17 moderate, 2 high**, mas não identifica os pacotes afetados nem confirma explorabilidade em produção.
- `node ./tools/run-vitest.mjs run src/__tests__/mentoriaCommercialReceiptVerifier.test.js`: pré-correção 2 testes falharam de 12; pós-correção 12/12 PASS.
- Testes direcionados com build gate: **27/27 PASS em 2 arquivos**.
- `npm run verify:fast`: **314/314 PASS em 63 arquivos**, ESLint, auditoria de imports, i18n, visual, estrutural e consistência strict PASS.
- `npm run build`: PASS, ambos `mentoria-commercial-build-gate` e `mentoria-commercial-vite-gate` PASS; SEO pós-processado.
- Backups anteriores/gerados preservados no diretório ignorado `dist-mentoria-security-evidence-20261102/`. Sitemaps e snapshot de testes restaurados seletivamente ao estado original. `git diff --check`: PASS.
- Documentação e commit local seletivo devem ser registrados e verificados no fechamento; **sem push, PR, merge ou deployment nesta etapa**.

## Riscos e pendências
- O backend futuro deve produzir um DTO de status autoritativo da leitura durável, não passar linhas de tabela cruas ou dados do browser. O emissor deve registrar o mesmo desafio e telefone realmente verificado pelo provedor OTP, assinando apenas após aceite jurídico explícito e persistência atômica.
- Os testes usam assinaturas/chaves temporárias e HMAC sintético, não provam infraestrutura OTP, autenticação de titular, session HttpOnly, CSRF, proxy confiável, armazenamento transacional, rotatividade de chaves, revogação instantânea, antirreplay nem escrita idempotente tenant-scoped no WGEasy.
- O novo vínculo **não elimina** possibilidade de TOCTOU entre status `active` e uma futura gravação CRM. A operação real deve revalidar/consumir autorização na mesma transação governada.
- O comando de diagnóstico `npm audit` e `npm ls` permanecem bloqueados pela allowlist do executor; nenhum bypass ou `npm audit fix --force`. `npm ci` apenas reproduz a contagem, sem separar dependências dev/prod ou identificar advisories. **A triagem dos 2 high continua PENDENTE** e demanda acesso de segurança aprovado ou relatório oficial de dependências/CI.
- Consentimento jurídico `mentoria_commercial_contact` e revogação aprovados formalmente, backend HTTPS e provedor OTP real e custos/antifraude seguem gates de owner/legal antes de ativar fluxo comercial.
- Novo push/PR/merge/deploy exigem aprovação específica posterior e confirmação da identidade do artefato SHA.

## Aprendizado generalizável
- Contexto: uma assinatura digital garante integridade do que foi assinado, não validade do histórico OTP nem vigência da autorização.
- Causa raiz: a verificação de revogação checava só status e ID, sem exigir dados independentes de prova.
- Evidência: teste negativo do registro parcial demonstrou aceitação indevida; testes negativos para divergências com status sintético e teste positivo sobre o contrato novo passaram após hardening.
- Correção: projeção estrita e comparações campo a campo de ledger autoritativo contra claims assinados, com checagem de estado `active` em todas as verificações.
- Prevenção: testar explicitamente parcial, divergências assinadas e estados revogados; exigir validação atômica junto a qualquer uso sensível.
- Validação: CI local 314 PASS, lint e build; isolamento Git e backups.

**RESOLVIDO:** contrato de verificação criptográfica com vínculo autoritativo OTP/telefone/aviso/tempo reforçado offline.
**PENDENTE:** triagem de vulnerabilidades por pacote e ambiente, dependências externas reais, jurídico, e autorização de release desta nova branch.
**RISCO VISTO:** 2 alertas high de npm não triados; código permanece privado e não montado.
**STATUS:** PARCIAL / FAIL_CLOSED para ativação comercial. Produção do site anterior permanece OK.
