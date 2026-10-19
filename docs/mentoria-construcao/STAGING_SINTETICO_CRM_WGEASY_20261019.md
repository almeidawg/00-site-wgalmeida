# Mentoria Construção — ensaio sintético CRM/WhatsApp (sem staging real)

Data: 2026-10-19
Projeto: `almeidawg/00-site-wgalmeida` / `feat/mentoria-preview-qa-20261018`.
WGEasy pretendido: `almeidawg/01-wgeasy-core-hub`; Supabase de produção: `xkvuhixxpfonfcwrvknm`, consultado **somente por catálogo SQL**. Nenhuma credencial de serviço, tabela real ou webhook de provedor foi usado.

## Status e escopo de evidência
**PASS somente como simulação in-memory isolada; NÃO é staging CRM real e NÃO autoriza produção.**

- `api/_mentoriaSyntheticCrmPorts.js`: ports falsos de pessoa, interação e recibo, específicos para `testOnly:true`. Não importa Supabase, não lê env, não usa rede, não grava arquivos e não envia mensagens. Identidades de pessoa e interação são UUIDs sintéticos apenas em memória; snapshot exporta somente contagens e estados, jamais identificadores sensíveis. `discard()` remove os objetos em RAM ao fim.
- `tools/audit-mentoria-staging-synthetic.mjs`: assina payloads falsos com HMAC de teste e passa pelo `ingestMentoriaWhatsAppReceipt` já existente. **O indicador falso `providerVerified:true` é parte do teste, não validação real de WhatsApp ou Meta**. Execução: `node tools/audit-mentoria-staging-synthetic.mjs`. Saída com contadores e status, zero PII, zero rede.
- `src/__tests__/mentoriaSyntheticCrmStaging.test.js`: nove testes de fail-closed, porteiro `testOnly`, reserva de idempotência simultânea, isolamento tenant/org, recusa de telefone sem pseudonimização, proteção de relacionamento, falha parcial e descarte. Testes antigos do bridge seguem cobrindo validação HMAC/timestamp/payload e contrato CRM (12 testes).
- Ensaio local **8/8 checagens PASS**: (1) gravação simulada após recibo, (2) replay duplicate, (3) concorrência somente uma interação, (4) dois tenants isolados, (5) HMAC adulterado rejeitado, (6) tenant cruzado rejeitado, (7) falha injetada com estado needs_review e sem retry cego, (8) zero escritas externas/envios. Ao final tudo descartado, sem persistência.
- `npm run verify:fast`: **52/52 suítes, 232/232 testes PASS**. Lint, import, i18n, marca, estrutura e auditoria de consistência PASS.
- O `/api/mentoria-interest` público permanece AUSENTE, HTTP 404 no preview; captação real não habilitada. Não associar clique no CTA ou preenchimento do formulário a `conversation_received`.

## Evidência read-only atual do Supabase
Em 2026-10-19, listado um único projeto WG `xkvuhixxpfonfcwrvknm` ACTIVE_HEALTHY e uma única branch `main` do projeto; nenhum estágio CRM WGEasy dedicado ativo e isolado identificado. O projeto denominado `propostas-staging` está INACTIVE e não deve ser reutilizado sem decisão formal de identidade/escopo.

Consultas `pg_class`, `pg_index`, `pg_policy` e `information_schema.columns` confirmaram:
- `public.contact_interactions`: RLS ligado, não forçado; colunas `id`, `pessoa_id`, `oportunidade_id`, `source`, `source_ref`, `channel`, `direction`, `sanitized_payload`; **não tem tenant_id nem org_id próprios**, nem UNIQUE por evento. Apenas chave PK id. Políticas `contact_interactions_core_insert` e `contact_interactions_core_select` são permissivas de equipe interna; a relação multi-tenant requer auditoria aprofundada.
- `public.pessoas`: tem `org_id`, RLS não forçado e múltiplas policies permissivas e restritivas, incluindo roles diferenciadas; não assumir isolamento do conjunto sem teste negativo com duas orgs.
- `public.saas_tenants`: possui `id`, `org_id`, RLS ligado e forçado. O slug `wg-almeida` no contrato do site NÃO é UUID de tenant e exige resolução autenticada.
- `public.wg_control_plane_execution_ledger`: RLS ligado, mas índices não fornecem UNIQUE por `request_id`. **Não usar consulta seguida de INSERT como dedup transacional**.
- Nenhuma mutação ou leitura de linhas comerciais/pessoais efetuada. O catálogo da versão corrente confirma as lacunas previamente registradas.

## Projeto de migração — proposta NÃO EXECUTADA
Sem criar tabela ou tentar migrar produção, o backend WGEasy precisa definir e revisar:
1. **Ambiente**: branch Supabase separada/isolada para staging, identificada por ref/URL/owner, com dataset inteiramente fictício; sem copiar PII da produção. Revisão de configuração Auth, RLS, grants e secrets.
2. **Resolução de tenant**: identidade server-to-server do worker corporativo, canal oficial vinculável a tenantId UUID e orgId UUID em tabela de configuração autenticada. Nunca aceitar org/tenant da requisição pública. Verificar membership real, RLS e autorização serviço por tenant.
3. **Ledger de recibos**: tabela interna isolada do Data API ou esquema privado com `tenant_id UUID`, `org_id UUID`, `provider`, `source_event_id`, `state`, `received_at`, `completed_at`, `review_reason`; impor **UNIQUE (tenant_id, provider, source_event_id)** com transação de reserva que garante concorrência. Falhas parciais persistem `needs_review`, sem repetir criação de contato.
4. **Relação com `contact_interactions`**: associar tenant/org por FK verificável em `pessoas` e/ou coluna nova após desenho aprovado; `UNIQUE (tenant_id, source, source_ref)` ou chave derivada privada; RLS restritiva testada para anon, authenticated, core e service role. `source_ref` deve ser hash de ID do evento/canal; preservar PII fora da telemetria.
5. **Verificação de provedor**: HMAC da ponte interna não substitui assinatura oficial do WhatsApp. Validar autenticidade Meta/worker, conta, entrega inbound real, replay, skew, body-limit e identificação de remetente pseudonimizada antes de assinar bytes exatos para o adapter.
6. **Operações**: retenção/legal LGPD, acesso restrito, expurgo, auditoria redigida, recuperação DLQ, rotação de chave, rate-limiting durável, observabilidade sem PII, monitoramento, rollback e exclusão de fixtures.
7. **Comprovação**: testar 2 orgs reais de QA sem registros reais, duas mensagens simultâneas, replay após restart em duas instâncias, rollback de transação interrompida, tentativa de cruzamento org/tenant (403), leitura posterior, expurgo comprovado, falha de provedor, idempotência e reconciliação.
8. **Aprovação**: auditoria de SECURITY DEFINER (incluindo `fn_promover_contato_para_lead`) e grants; verificação na documentação atual Supabase para comportamento de RLS, grants e Data API. Nenhum merge, SQL migration, webhook real ou chave pode ser autorizado apenas com esta prova em memória.

## Gates remanescentes
Staging verdadeiro: BLOQUEADO até provisionamento/aprovação de ambiente e acesso governado, proposta SQL revisada e identidade WhatsApp oficial. Lançamento real: NO-GO (histórico 1/12 aprovações). Não habilitar leads reais, pixel/campanha, CRM, WGEasy mutante, webhook, cobrança, WhatsApp ou DNS por este bloco.

## Aprendizado WG obrigatório
**Contexto:** desejo de ligar landing da mentoria ao WGEasy sem staging isolado; **causa raiz:** ausência de recibo único transacional e limites de escopo tenant/org na tabela de interações; **evidências:** índices/catálogo RLS reais, 21 testes direcionados, 8 cenários sintéticos, suíte 232 PASS; **correção:** ports exclusivamente em memória e contrato de reserva concorrente fail-closed, nunca publicados como endpoint; **prevenção:** migração em branch staging, RLS/grants, validação de provedor e idempotência transacional; **validação futura:** E2E real com dados sintéticos após ambiente isolado; **regra:** testes in-memory não comprovam RLS nem persistência real, e clique/formulário não equivale a conversa recebida.
