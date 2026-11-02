# Return point — Mentoria / gate de publicação fail-closed e bloqueios externos

Data: 2026-11-01. Repositório: almeidawg/00-site-wgalmeida, branch isolada feat/mentoria-consent-site-20261101, worktree E:\01_WG_Ecosystem\09_TMP\mentoria-site-consent-lab-20261101. Commit-base local: 41c8c59b2c104b183e10e13661179b767910768b. Projeto de produção Vercel site-wgalmeida (prj_uNqhTiNaZx3O1CxDlBXhNVKdIIOM); domínio mentoria.wgalmeida.com.br. Nenhuma alteração no checkout operacional sujo, no deploy atual, DNS ou WhatsApp pessoal.

## Descoberta e evidência

- O guard site-wide em api/_requestGuard.js aceita origens localhost e *.vercel.app, e checkRateLimit persiste contagens apenas em Map no processo (não persiste entre invocações/hosts). **Não usar como antifraude OTP**.
- O login admin existente em api/_adminAuth.js verifica autorização do próprio site via Supabase. Seu comentário de implementação informa desativação da administração em produção por decisão do owner (2026-10-22) salvo SITE_ADMIN_ENABLED=true. Isso **não constitui sessão de interessado consentindo** nem autorização de login do fundador na mentoria.
- O contrato api/_mentoriaCommercialConsentBoundary.js continua sem autenticação HTTP real e sem transportes; as dependências de sessão, challenge e confirmação são callbacks ainda não ligados. A interface comercial permanece não montada na página.
- A consulta à lista de variáveis do projeto Vercel site-wgalmeida (decrypt=false) retornou HTTP **403 forbidden / permission denied**. Logo, **não foi possível verificar** existência nem ausência de configuração Twilio/OTP, serviço de consentimento, sessões ou chaves no Vercel. Não inferir nem afirmar que o produto tenha provedor ativo ou inexistente.
- A consulta ao inventário de custom environments não retornou ambiente customizado associado no escopo consultado. Isso não estabelece inexistência de outros serviços.
- Documentação oficial Vercel (Configuring Functions / Advanced Configuration, atualizada em maio/2025): arquivos em /api iniciados por underscore não viram Vercel Functions automaticamente, apesar de importáveis como utilitários. URL de referência: https://vercel.com/docs/functions/configuring-functions/advanced-configuration. Não substituir isso por inferência a partir do nome do arquivo: detectar regressão caso alguém remova o underscore ou adicione rota pública.
- O consentimento do Pixel Meta wg_mentoria_consent_v1 permanece separado de qualquer autorização para contato comercial ou gravação no WGEasy.

## Correção preventiva nesta sessão

Novo teste src/__tests__/mentoriaCommercialReleaseGate.test.js (sem alterações em App, landing, api routes, cookies, provider, backend ou secrets):
1. Verifica que o módulo React de opt-in e o boundary HTTP não foram importados nos entrypoints públicos src/main.jsx, src/App.jsx e src/pages/MentoriaConstrucaoLanding.jsx.
2. Varre a raiz da pasta api/ e falha se surgir uma rota pública de consentimento/OTP/Verify com nome de arquivo sem prefixo underscore.
3. Audita as regras de rewrites/redirects/routes do vercel.json e falha se adicionarem rota de consentimento.
4. Falha se o boundary passar a importar o guard amplo _requestGuard ou login administrativo _adminAuth, ou incluir acesso direto fetch/Twilio/Supabase nessa camada.
5. Confirma que o formulário segue disabled-by-default, não usa localStorage nem faz fetch por conta própria, e continua recebendo o texto do aviso de política como configuração, não como redação fictícia hardcoded.

Essas provas são regressões de segurança em arquivos-fonte. Não substituem auditoria de Vercel, análise de dependências transitivas ou E2E real; qualquer ativação futura exige revisão e alteração explícita do gate com autorização do owner.

## QA

- Primeira execução do teste falhou antes de rodar asserts: Vitest transforma import.meta.url em URL não-file nesta configuração; ajustado para projectRoot=resolve(process.cwd()) no executor do projeto. Backups de edit_file preservados separadamente.
- Testes do release gate **5/5 PASS**; testes específicos do boundary + front + gate **28/28 PASS**.
- Suíte completa Vitest do site **61 arquivos / 286 testes PASS**.
- ESLint global **PASS**.
- Build do site Vite + SEO **PASS**. Gerou alterações transitórias em public/sitemap.xml, public/sitemap-index.xml e snapshot example.test.jsx.snap, que precisam de cópia antes de restaurar seletivamente.
- Git diff --check e estado final limpo após commit local devem ser verificados no fechamento.

## Gates / regra de aplicação futura

**RESOLVIDO:** bloqueio automatizado contra montagem acidental de consentimento comercial no site e separação da origem/consentimento de marketing do Pixel.

**PENDENTE:** identidade canônica do provedor de OTP, conta aprovada, custos/limites em moeda, política jurídica do interessado aprovada, serviço independente HTTPS com sessão e CSRF real, contador de abuso em backend distribuído, registro auditável/revogável de consentimento, controle de revisão do fundador e integração idempotente WGEasy.

**RISCO VISTO:** Vercel env API retorna 403; sem permissão não é possível concluir se há qualquer credential/provider. O admin do site e o Map de rate limit são inadequados para a operação de consentimento; falsos positivos de um teste offline não equivalem a controle produtivo.

**Status:** PARCIAL / FAIL-CLOSED. No push, merge, deploy, restart, DNS, mudança env, envio externo, leitura de WhatsApp pessoal, QR, ou escrita em WGEasy.

Regra WG aplicável: revalidar domínio + ID do projeto + origem Git/branch, identificar credenciais por metadados sem ler/mostrar segredos, e bloquear publicação se a identidade real do consentimento ou do emissor não puder ser comprovada.
