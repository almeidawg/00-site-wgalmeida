# Return point — Mentoria: contrato interface/backend de opt-in alinhado (2026-11-01)

## Identidade canônica e escopo
- Produto: Mentoria Estratégica Individual, domínio \`mentoria.wgalmeida.com.br\`, Vercel \`site-wgalmeida\` (\`prj_uNqhTiNaZx3O1CxDlBXhNVKdIIOM\`), repositório \`almeidawg/00-site-wgalmeida\`.
- Worktree exclusivo: \`E:\01_WG_Ecosystem\09_TMP\mentoria-site-consent-lab-20261101\`, branch \`feat/mentoria-consent-site-20261101\`; base da implementação: commit \`3113ddcb0a3b71ad36d6da605608b0b8e250466b\`. O checkout operativo original, com WIP concorrente, não foi tocado.
- A landing pública, o CTA com o WhatsApp pessoal do fundador, \`src/App.jsx\`, o consentimento do Pixel Meta e o PM2 institucional da Liz permanecem intocados. Sem push, merge, deploy, DNS, secrets, OTP, CRM ou coleta de contatos reais.

## Falha verificada (pré-correção)
- \`src/components/MentoriaCommercialLeadOptInForm.jsx\` chamava \`requestChallenge\` sem \`action\` e \`consentDecision\`. O servidor \`api/_mentoriaCommercialConsentBoundary.js\` exige \`action="begin"\`, \`consentDecision="agree"\` e o conjunto exato de seis chaves. Para confirmação, a UI enviava \`consentDecision="agree"\`, mas sem \`action="confirm"\`, exigido no conjunto de sete chaves.
- As suites separadas de UI (com callbacks sintéticos que sempre retornavam \`pending/accepted\`) e boundary servidor (com payloads escritos manualmente) passavam, mas não havia teste da mesma carga produzida pela UI atravessando o avaliador do backend. Resultado real, se conectados como estavam: **falha de integração por payload incompatível**.
- O fixture da UI usava digest fictício \`'a'.repeat(64)\`, enquanto o servidor deriva SHA-256 do texto jurídico aprovado. Essa diferença impediria o processamento e mascarava a divergência em suites separadas.

## Correção mínima e testes
- UI agora passa \`action: 'begin'\` e \`consentDecision: 'agree'\` ao callback de solicitação, e \`action: 'confirm'\` no callback de confirmação. Nenhuma nova rota, cliente HTTP ou função de produção foi criada.
- O teste \`mentoriaCommercialLeadOptIn.test.jsx\` passa a derivar o SHA-256 do texto de aviso sintético usado no teste, e valida os campos novos em ambas as etapas.
- Teste novo **de composição real de contratos, mas offline**: DOM React executa ação explícita; callbacks passam \`Buffer.from(JSON.stringify(payload))\` diretamente ao boundary \`createMentoriaCommercialConsentBoundary\` com contexto de sessão/CSRF **sintético em memória**, e confirma que as portas de \`beginChallenge\` e \`confirmChallenge\` recebem desafio, finalidade e hash idênticos ao esperado. Sem cliente HTTP, provedor SMS, backend implantado ou banco real.
- Teste negativo: texto de aviso com hash diferente é recusado antes da porta de desafio, mesmo com callbacks, sem solicitar OTP. Os testes preservam isolamento do \`wg_mentoria_consent_v1\` (Pixel), resposta mínima sem PII e nenhum envio/CRM.

## Evidências
- Revalidação do início: Git do worktree limpo em \`3113ddc\`, remote \`almeidawg/00-site-wgalmeida\`; lease sem conflito; Vercel ID do site confirmado e release operacional separado.
- Testes direcionados (opt-in, boundary, Pixel, WhatsApp): **31/31 PASS**.
- Suíte global de site: **60 arquivos e 281/281 PASS**; existem avisos anteriores de \`fetchPriority\` e \`act(...)\`, além de erros simulados de testes negativos.
- \`npm run lint\`: PASS. \`npm run build\`: PASS. Compilação local não implica deploy.
- Sitemaps e snapshot regenerados foram identificados e devem ser copiados para \`dist/\` (ignorado) antes de serem restaurados seletivamente. Backups gerados por \`edit_file\` devem ser preservados fora da área stage, também em \`dist/\`. Confirmar \`git diff --check\` e árvore limpa após commit.

## Aprendizado de governança
- **Contexto:** frontend e boundary de consentimento foram construídos como contratos opcionais, não montados, em incrementos separados.
- **Causa raiz:** validação apenas de cada módulo isoladamente; faltava teste de composição do payload verdadeiro e uso do mesmo aviso versionado.
- **Evidência:** corpo de \`requestChallenge/confirmConsent\` não continha campos exigidos por \`hasExactFields\` e o digest de fixture era arbitrário.
- **Correção:** alinhar chaves e hash do contrato, mais teste UI → boundary no mesmo processo, rejeição de divergência de política.
- **Prevenção:** nenhum gate de integração de opt-in/CRM pode considerar suites separadas suficientes; exigir teste com payload efetivamente emitido pela UI, mesmo em ambiente offline, além de E2E real autorizado quando houver serviço/conta.
- **Validação:** 281 testes e build/lint passam em laboratório; a homologação real permanece bloqueada.

## Dependências ainda não resolvidas
- Emissor real de consentimento e política jurídica aprovada (identidade do responsável, finalidade, versão, revogação).
- Backend independente com sessão autenticada HttpOnly, CSRF originado no servidor, host/origem HTTPS confiáveis, transportes reais e identificação canônica do ambiente.
- Conta OTP/SMS/voz e custos aprovados, segurança antiabuso distribuída, identificação do VerificationSid do telefone e recibo Ed25519 por emissor confiável.
- Revisão do fundador com autenticação real e revalidação no commit transacional do WGEasy. Sem parear WhatsApp pessoal e sem transformar rastreamento Meta em consentimento comercial.
- Aprovação específica do owner para qualquer push/merge/deploy, mudanças env, restart, DNS ou envio externo.

**RESOLVIDO:** incompatibilidade local frontend/servidor e cobertura do contrato real de campos. **PENDENTE:** serviços e identidade/consentimento genuínos, publicação e WGEasy real. **RISCO VISTO:** mocks e testes locais podem passar enquanto a integração no fio falha; agora coberta pela regressão de composição, ainda sem E2E de produção. **Classificação: PARCIAL / FAIL_CLOSED.**
