# Evidências — PostgreSQL local isolado, sem Supabase Cloud

Data: 2026-10-19. Modo: SQL executado em instância **PostgreSQL 17 Alpine efêmera no Docker**, NÃO na base WGEasy, NÃO em Supabase remoto.
Projeto final pretendido: `almeidawg/01-wgeasy-core-hub`, fonte `main`/layout `wgeasy/frontend`. O repo WGEasy estava sob governança de outro agente; nenhum arquivo lá foi editado.

## Identidade e isolamento
- Contêiner exclusivo `wg-mentoria-postgres-qa-20261019`, image preexistente `postgres:17-alpine`, ID `cd1e50334b0309bb44de0b60e513bf0e42d81621d890ca0e1e5a5e7fe40c9336`.
- `docker inspect` confirmou `NetworkMode=none`, `PortBindings={}`, `AutoRemove=true`, memória temporária via `tmpfs`; não fez pull de imagens e não tocou em containers ou bancos existentes.
- Database de teste `mentoria_qa`; cria `public.saas_tenants` como **stub estrutural** com 2 pares de UUID fictícios e papéis `anon`, `authenticated` nologin. Não recebeu dados reais.
- Descoberta de execução: `psql` aceitou arquivos copiados via `docker cp` e executados por `psql -f`; o pipeline de entrada padrão no PowerShell repassou a marca BOM do arquivo e foi rejeitado. Isso foi corrigido sem reconfigurar o banco.

## Verificações concluídas
1. `node audit-proposta.mjs`: **10/10 checks estáticos PASS** — private schema, table allowlist, deny grants, forced RLS, digest SHA256, unique tenant/canal/evento, trigger tenant-org security invoker, estados, sem colunas PII e sem comandos externos.
2. `LOCAL_POSTGRES_FIXTURE_ONLY.sql`: PG17 executou `CREATE ROLE` x2, `CREATE TABLE` e `INSERT 0 2` fictício sem erro.
3. `PROPOSTA_receipts_staging_v1.sql`: **BEGIN → COMMIT concluído**, schema, tabela, UNIQUE, índices, trigger `verify_tenant_org_scope`, privilégios revogados, `ENABLE RLS`, `FORCE RLS`.
4. `VERIFICAR_STAGING_READONLY.sql`: retornou **1 linha** com todos os controles verdadeiros: `rls_enabled=t`, `rls_forced=t`, `anon_schema_denied=t`, `authenticated_schema_denied=t`, `anon_table_denied=t`, `authenticated_table_denied=t`, `scoped_unique_index_exists=t`, `no_public_policies=t`.
5. `LOCAL_POSTGRES_E2E_ONLY.sql`: `BEGIN / DO / COMMIT` sem erro. Testou primeira reserva válida, duplicate `ON CONFLICT DO NOTHING`, segundo tenant com digest idêntico sem choque cruzado, tenant A + org de B rejeitado pelo trigger, completude indevida rejeitada, estado needs_review sem reason_code rejeitado, estado needs_review com code fixo aceito; não houve tabela ou gravação CRM.
6. `LOCAL_POSTGRES_REPLAY_ONLY.sql`: **DO PASS em nova conexão**; evento repetido não inseriu nova linha e contagem permaneceu 2 registros fictícios de recibo.
7. `SET ROLE anon; SELECT count(*) FROM wg_mentoria_private.inbound_receipts;`: **permission denied for schema wg_mentoria_private**, saída esperada com exit=1. Mesma negação comprovada para `authenticated`.
8. Nenhum provider, WhatsApp, CRM, HTTP, banco remoto, PII, migration Supabase ou deploy de app foi usado no ensaio.

## Limitações que impedem declarar staging real
- O esquema de `public.saas_tenants` da QA foi propositalmente simplificado. A migração real deve ser aplicada **somente após** conferir catálogo/migrations exatas em uma branch Supabase isolada e um port de backend WGEasy canônico.
- Testes SQL locais não reproduzem Supabase Auth, Data API, grants customizados, RLS de `pessoas`/`contact_interactions` e a identidade do worker provider. A tabela de recibos ainda não cria CRM real. Teste real de concorrência com dois workers e read-back do CRM é pendente.
- O owner ainda não concordou com cobrança da branch. `create_branch` foi rejeitado antes de criar recursos: exige `confirm_cost_id`; cotação Supabase: **0.01344/h** para a organização `cfjugytsailvoumqhzgn`. Não emitir `confirm_cost` sem concordância.
- Branch cloud `mentoria-crm-staging-20261019` **não foi criada**, e `xkvuhixxpfonfcwrvknm` não foi modificado. Nenhuma migração deve ser mesclada a produção sem gates separados.

## Atualização pós-GO: branch Supabase não suportada neste plano
Após apresentar US$ 0,01344/hora, foi recebido **Go** do owner; a confirmação de custo foi solicitada e obtida. A criação da branch `mentoria-crm-staging-20261019` foi então rejeitada com `PaymentRequiredException: Branching is supported only on the Pro plan or above`. A anotação histórica anterior sobre aceite pendente descreve apenas a tentativa inicial. **Nenhuma branch de nuvem foi criada; não houve migração ou cobrança da tentativa.** Upgrade de plano ou projeto separado exige decisão específica de custo e escopo. A prova em Docker/Pg17 permanece válida exclusivamente como QA local.

## Encerramento do laboratório
O contêiner foi criado com `--rm` e encerrado após os testes. Verificação posterior de `docker ps --filter name=wg-mentoria-postgres-qa-20261019` retornou vazio. O diretório guarda apenas proposta e provas, sem dados pessoais. Não reutilizar a fixture em produção.

## Aprendizado WG
**Contexto**: evolução de CRM sem staging, produção em schema que não fornece dedup transacional. **Causa raiz**: projeto único e vínculo tenant/org frágil; checkout WGEasy antigo fora da fonte canônica. **Correção**: proposta de recibo privado, índice único composto, trigger scope `SECURITY INVOKER`, RLS forçado, NO PUBLIC grants e prova SQL em PG17 isolado. **Prevenção**: validar billing e parent ref de branch, 2 tenants fictícios, grant negativo e SQL em contêiner sem rede antes de qualquer Cloud. **Validação**: 10/10 gate estático, DDL real local, read-only t em 8 controles, replay e negações. **Regra**: sem aprovação de custo, sem criação remota; sem QA de autenticação/CRM, sem coleta real.
