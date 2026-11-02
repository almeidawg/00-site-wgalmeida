# Return point — Validação de origem HTTPS do consentimento (2026-11-02)

## Identidade e estado inicial
- Produto: Mentoria Estratégica Individual WG Almeida; domínio `mentoria.wgalmeida.com.br`.
- Repo `almeidawg/00-site-wgalmeida`, branch isolada `feat/mentoria-consent-site-20261101`, worktree `E:\01_WG_Ecosystem\09_TMP\mentoria-site-consent-lab-20261101`.
- HEAD confirmado no início `862d339ab7829c1b99ba557d3e0ad3ddcc23d4d7`; árvore Git limpa, sem lock.
- Projeto remoto previamente confirmado `site-wgalmeida` na equipe `grupo-wg-almeida-vercel-projects`. Vínculo de projeto da worktree local permanece `INCERTO` (`vercel: null`), publicação `FAIL_CLOSED`.
- Nenhum serviço de autenticação, OTP, consentimento comercial ou CRM foi montado nem acionado.

## Achado e causa raiz
O contrato server-only privado `api/_mentoriaCommercialConsentBoundary.js` validava HTTPS e bloqueava literalmente `localhost` e `*.vercel.app`, mas aceitava como `expectedOrigin` URLs HTTPS de endereços IP literais, hosts `*.localhost`, `*.local`, nomes com ponto terminal e portas HTTPS não padrão. Logo, o predicado de configuração não era equivalente à intenção documentada de origem pública, canônica e não local.

## Correção local
- Na função `isValidOrigin`, adicionar verificação `isIP` de `node:net`, incluindo host IPv6 entre colchetes.
- Bloquear IPs literais, aliases localhost e .local, nomes sem domínio pontuado, nomes com ponto inicial/final, o host `vercel.app` e portas não padrão.
- Preservar verificações anteriores de esquema HTTPS, origem exata, ausência de credenciais e bloqueio de previews Vercel.
- No teste `mentoriaCommercialConsentBoundary.test.js`, acrescentar uma regressão com 10 configurações inválidas. Exigir `503/unavailable` **antes** de invocar autenticação e o port de challenge.
- Primeira execução negativa: `https://127.0.0.1` retornava 403 (configuração aceita, requisição rejeitada depois) em vez de 503, demonstrando a lacuna; após o patch, teste passou.

## Evidência de validação
- Testes direcionados de boundary, build e opt-in: **37/37 PASS**, três arquivos.
- Suite completa: **62/62 arquivos, 300/300 testes PASS**, exit=0. Avisos anteriores de React `act(...)`, `fetchPriority` e falhas simuladas de testes negativos apareceram, sem testes reprovados.
- `npm run lint`: PASS, exit 0.
- `npm run build`: PASS, exit 0. Gates `mentoria-commercial-build-gate` e `mentoria-commercial-vite-gate` ambos PASS, antes do bundling. SEO pós-processado ao final.
- Backups originais e artefatos gerados preservados em `dist-mentoria-origin-hardening-evidence-20261102/` (ignorado por Git). Mudanças rastreadas geradas em sitemap e snapshot restauradas seletivamente. Nenhum outro arquivo do checkout original foi alterado.
- `git diff --check`: sem erros. Commit seletivo local e liberação da reserva devem ser verificados no fechamento.

## Limites explícitos
- **Sem endpoint comercial implantado:** a função apenas protege uma configuração futura; matching de cabeçalhos não comprova domínio ou sessão assinada, e um reverse proxy confiável continua obrigatório para sanitizar `x-forwarded-*`.
- **Sem OTP real:** portas injetadas continuam não implementadas para fornecedor, persistência atômica, controle de tentativas, replay, expiração e antifraude.
- **Sem prova jurídica:** consentimento de Pixel/Meta não substitui texto comercial aprovado `mentoria_commercial_contact`, recibo assinado e revogação durável.
- **Sem WGEasy:** escrita idempotente e autorização do fundador seguem pendentes.
- **Sem validação remota do novo commit:** `npm run build` local não equivale a um deploy Vercel com o código atual, e a worktree não está vinculada ao projeto no mecanismo local.
- `npm audit` permaneceu bloqueado pela allowlist MCP na sessão anterior. Não houve alteração da configuração de segurança para contornar essa restrição.

## Aprendizado do ecossistema
- Contexto: uma configuração de endpoint de consentimento poderia parecer HTTPS e ainda apontar para infraestrutura local/privada.
- Causa raiz: validação por duas exclusões de string em vez de política explícita sobre host público e porta.
- Evidência: teste negativo `https://127.0.0.1` antes do patch; a validação retornava `403` em vez de `503`.
- Correção: bloquear endereços IP e aliases locais no momento da configuração, antes de executar quaisquer portas.
- Prevenção: usar tabela de testes negativos de URLs canônicas e loopback, testar configuração fail-closed separadamente da validação de headers da requisição.
- Validação: regressão completa, lint, build e revisão de diff.

**RESOLVIDO:** hardening offline de origem canônica HTTPS e cobertura negativa, com regressões locais verdes.
**PENDENTE:** sessão assinada, proxy e serviço HTTPS reais, OTP, texto/recibo jurídico, revogação, controle antifraude, WGEasy, triagem npm e comprovação remota de release.
**RISCO VISTO:** validação de origem por sintaxe não substitui prova de controle DNS, proxy, autenticação ou publicação governada.
**Status:** PARCIAL / FAIL_CLOSED. Nenhum push, merge, deploy, restart, SMS, WhatsApp pessoal ou gravação no WGEasy.
