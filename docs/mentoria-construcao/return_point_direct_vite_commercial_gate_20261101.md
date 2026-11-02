# Return point — Proteção do consentimento em Vite direto (2026-11-01)

## Identidade e baseline

- Produto: Mentoria Estratégica Individual; domínio público: mentoria.wgalmeida.com.br; projeto Vercel: site-wgalmeida, ID prj_uNqhTiNaZx3O1CxDlBXhNVKdIIOM.
- Repo: almeidawg/00-site-wgalmeida. Branch isolada: feat/mentoria-consent-site-20261101. Worktree: E:\01_WG_Ecosystem\09_TMP\mentoria-site-consent-lab-20261101.
- Commit-base desta sessão: 8a036490f46c6243717c4fe7c51d7e5ac4e4cbcb. Checkout operacional original de frontend, com alterações concorrentes, não foi editado. Nenhuma integração de WhatsApp pessoal, Twilio, CRM ou consentimento real foi ativada.
- A leitura de Vercel get_project confirmou ID/framework Vite, mas não forneceu buildCommand explícito. Permissão de listar envs foi negada anteriormente (403). Não afirmar que o pipeline externo executa o mesmo comando.

## Causa e evidência

- O controle anterior executava pelo script npm run build, mas uma execução direta de Vite (vite build) poderia ignorar por completo o package.json e os scripts protegidos.
- Este risco foi comprovado por leitura do package.json e do vite.config.js: o segundo não importava nem aplicava um guard próprio.
- O release gate anterior em Vitest e o checklist humano de publicação permanecem defesas separadas; não são autorizações operacionais.

## Correção seletiva local

1. Novo tools/mentoria-commercial-vite-plugin.mjs: plugin Vite aplicável somente em build; no hook configResolved verifica o mesmo inspector fail-closed já usado no npm. Emite erro genérico se houver montagem da UI, nova rota pública, bypass dos scripts ou mudança de guards.
2. vite.config.js passa a importar o plugin e inseri-lo como primeira etapa da lista de plugins para configuração de build, sem alterar dev server ou comportamento de UI.
3. tools/mentoria-commercial-build-gate-core.mjs exige que o vite.config.js mantenha a importação e invocação do plugin. Assim, remover acidentalmente o plugin também falha no check dos scripts.
4. src/__tests__/mentoriaCommercialBuildGate.test.js amplia regressões (2 novas): build direto é aceito no estado isolado, recusado com importação indevida em entrada de app, e remoção do plugin do vite.config.js aciona falha do inspector.
5. Nenhuma rota real, cadastro, integração HTTP, consentimento jurídico, conta OTP, cookie, serviço de sessão, DNS, Supabase/WGEasy, WhatsApp pessoal ou ambiente Vercel foi alterado.

## Validação da sessão

- Node check-mentoria-commercial-build-gate.mjs PASS.
- Testes específicos do build gate + release gate: 16/16 PASS.
- Suíte global Vitest: 62 arquivos, 297/297 PASS; avisos antigos de React fetchPriority/act e falhas simuladas nos testes negativos ainda presentes.
- ESLint global: PASS.
- Chamada direta ao Vite, sem script npm, com output em dist-mentoria-direct-vite-gate-20261101 (ignorado): PASS, exit=0, log de [mentoria-commercial-vite-gate] PASS antes da etapa de bundling.
- npm run build: PASS, exit=0, com ambos os logs [mentoria-commercial-build-gate] PASS e [mentoria-commercial-vite-gate] PASS antes do bundle, e geração SEO ao final.
- Houve erro transitório na infraestrutura de execução MCP durante a primeira tentativa de suíte geral, sem retorno confiável; a retomada com o mesmo comando concluiu 297/297.
- Artefatos rastreados de sitemap/snapshot regenerados pelo build foram identificados para backup e restauração seletiva; devem permanecer fora do commit.
- Git diff check, estado limpo, commit local e liberação de lease: validar no fechamento.

## Limites e próximos gates

- Este plugin só protege builds que carregam o vite.config.js do repositório. Um operador com controle de build pode usar outro --config, remover arquivos ou alterar o próprio plugin; não é barreira contra sabotagem. A camada é preventiva contra ativação acidental.
- O buildCommand efetivo Vercel, permissões de envs, homologação do serviço HTTPS e provedor OTP não foram comprovados. Não publicar ou ativar com base apenas nos testes locais.
- A criação de lead depende de consentimento comercial realmente iniciado pelo titular, prova OTP independente, recibo assinado e revogável, autenticação do fundador e gravação idempotente no WGEasy.
- Push, merge, deploy, restart, DNS, mudanças de produção/credenciais, envio real e ação irreversível precisam de aprovação específica do owner.

RESOLVIDO: proteção do build npm e da execução Vite direta do projeto. PENDENTE: homologação do pipeline Vercel, consentimento jurídico/identidade/OTP reais e WGEasy. RISCO VISTO: configuração de build alternativa pode contornar a proteção local; ambiente externo não homologado. Status: PARCIAL — FAIL-CLOSED para ativação comercial.
