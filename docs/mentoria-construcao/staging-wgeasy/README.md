# WGEasy Mentoria — SQL validado em PostgreSQL isolado, branching Supabase bloqueado

Data: 2026-10-19. Status **DDL TESTADA LOCALMENTE EM PG17 / NÃO APLICADA NO SUPABASE**.

## Identidade canônica e bloqueio
Produto alvo: `almeidawg/01-wgeasy-core-hub` / Git `main` / layout `wgeasy/frontend` e backend no MESMO repositório. O checkout operacional plano `01-app-wgeasy-core-hub/frontend` está **banido para release** desde a governança de 2026-07-28; fonte atual deve ser reconciliada com Vercel SHA/aliases e `90_Governanca/STATUS_CANONICO_ATUAL.md`. Há trabalho concorrente de reconciliação WGEasy com lease própria; nada foi editado nesse repo.

Supabase WG existente: `xkvuhixxpfonfcwrvknm`, organização `cfjugytsailvoumqhzgn`, status ACTIVE_HEALTHY; `list_branches` mostrou somente `main`. O projeto não é staging. Um projeto de nome `propostas-staging` está INACTIVE e não equivale a staging CRM WGEasy.

## Custo e bloqueio de plano — conferido depois do GO
O owner recebeu cotação Supabase para branch na organização correta de **US$ 0,01344/hora** (cerca de US$ 0,32256 por 24h, além de possíveis recursos extras) e respondeu **Go**. O `confirm_cost` foi obtido; a tentativa subsequente de `create_branch` falhou com `PaymentRequiredException: Branching is supported only on the Pro plan or above`. **Nenhuma branch foi criada e esta tentativa não iniciou cobrança.** O bloqueio atual é elegibilidade do plano, não consentimento de valor. Uma nova opção (upgrade/novo projeto) exige avaliação própria de custo, identidade e aprovação; não efetuar fallback silencioso. A branch planejada `mentoria-crm-staging-20261019` continua inexistente.

## Artefatos preparados (apenas no branch isolado do site WG)
- `PROPOSTA_receipts_staging_v1.sql`: DDL de proposta exclusivamente para staging, cria schema `wg_mentoria_private` e tabela `inbound_receipts`. Inclui UNIQUE por tenant+canal+digest de evento, estado fail-closed, RLS forçado, revoke a PUBLIC/anon/authenticated, sem policy pública, sem campos brutos de mensagem, telefone, nome ou e-mail. Inclui gatilho de validação tenant↔org `SECURITY INVOKER` (nunca DEFINER) e não dá grant para serviço. Depende de `saas_tenants` da branch.
- `audit-proposta.mjs`: prova **estática** 10/10 de estrutura/destinatários/constraints e ausência de aberturas públicas. Além do teste estático, foi executado em PostgreSQL 17 isolado (ver `EVIDENCIAS_POSTGRES_LOCAL_20261019.md`); não comprova RLS no Supabase, Auth nem concorrência de dois processos reais.
- `VERIFICAR_STAGING_READONLY.sql`: SELECT de pós-migração em branch comprovada; exige RLS, grants negados e UNIQUE. Nunca executar contra `main`.

## Sequência para staging cloud DEPOIS da regularização do plano e nova autorização de infraestrutura
1. Confirmar acesso ao plano Pro ou superior; obter nova cotação e confirmação de custo se necessário antes de chamar `create_branch` no projeto base esperado. Confirmar `branch.project_ref != xkvuhixxpfonfcwrvknm`, nome correto, status saudável e zero dados de produção. Se falhar custo/acesso, parar sem fallback para projeto atual.
2. Antes da DDL, auditar no novo ref o schema, migrations e identidade de `saas_tenants`. Verificar em fonte canônica WGEasy e submeter DDL à revisão de schema (necessário compatibilizar `public.saas_tenants`, RLS e serviço). **Não** promover esta proposta sem revisão — guardar versão/cópia em migration do backend canônico após reconciliação de código.
3. Aplicar **somente na branch** via `Supabase.apply_migration(project_id=BRANCH_REF)` e observar resultados. Executar `VERIFICAR_STAGING_READONLY.sql` na mesma branch. Provar Data API anon/authenticated 403, escopo de organização, tenant real resolvido por serviço, hash de id externo e acesso autorizado.
4. Criar somente tenants/contatos fictícios na branch; demonstrar duas orgs isoladas, reserva transacional simultânea (único winner), replay após restart, falha parcial `needs_review`, read-back e descarte auditado. Registrar resultado sem PII.
5. Integrar WGEasy via backend autenticado em branch Git ISOLADA, definindo ports duráveis e grants mínimos. HMAC da ponte interna não autentica sozinho o WhatsApp real. Não usar o provider enquanto inexistirem conta/segredo oficial, contrato e autorização.
6. Revisar com segurança, privacidade/LGPD, jurídico e owner; não mesclar migrações ao `main` do Supabase nem alterar produção WGEasy ou campanhas sem GO separado. Apagar ou pausar branch de ensaio ao fim para evitar custo contínuo, mediante governança.

## Bloqueadores de release real
- Falta staging cloud: Supabase informou que branching exige plano Pro ou superior; nenhum branch/project foi criado. O custo por hora cotado não autoriza mudança de plano nem um projeto alternativo.
- `contact_interactions` da produção tem RLS não forçado, não tem `tenant_id` e não tem índice UNIQUE por `source_ref` com escopo; `wg_control_plane_execution_ledger` não tem UNIQUE por request_id. São achados read-only de 2026-10-19.
- `saas_tenants.org_id` não pode ser substituído pelo slug `wg-almeida`; associação autenticada tem de ser comprovada. Sem caller/grants e sem receipt real, o CRM continua desconectado.
- Nenhum dado pessoal ou mensagem foi captado/enviado; SQL executado apenas em contêiner PostgreSQL local e fictício, nenhum SQL executado no Supabase; nenhum webhook criado, nenhuma produção alterada. Preview da landing permanece SSO + noindex + captação desabilitada.

## Aprendizado WG aplicável
Contexto: projeto WG com banco único de produção e múltiplas frentes concorrentes. Causa: ausência de staging isolado, chave de deduplicação transacional, e confusão entre repo WGEasy antigo e `main` atual. Correção preventiva: staging com parent ref validado e custo aceito, schema privado deny-all e testes em dois tenants, contrato de escrita validado antes de webhook. Evidência: `list_branches`, catálogo PostgreSQL somente leitura, governança local, gate SQL estático 10/10 e SQL E2E em contêiner isolado. Validação futura: migração aplicada, RLS/índices verificados, E2E autenticado com dados sintéticos e limpeza comprovada. Regra: a anuência sobre uma cotação específica não autoriza upgrade, novo projeto, execução de SQL em produção nem mudança de infraestrutura de outra classe.
