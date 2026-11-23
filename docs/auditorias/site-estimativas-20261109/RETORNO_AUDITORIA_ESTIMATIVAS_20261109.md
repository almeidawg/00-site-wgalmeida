# Return point — Auditoria de estimativas e formulários — 2026-11-09

**Status: PARCIAL / RISCO (somente código isolado, sem publicação).**
**Owner:** Grupo WG Almeida / WG Build.tech.
**Produto:** site institucional `wgalmeida.com.br`.
**Repositório canônico:** `E:\03_WG_Operacional\01_Apps\04_WG_Buildtech\00_Produtos_WG_Institucional\00-site-wgalmeida\frontend`.
**Worktree isolado:** `E:\03_WG_Operacional\01_Apps\04_WG_Buildtech\00_Produtos_WG_Institucional\00-site-wgalmeida\_worktrees\site-estimativas-governadas-20261109`.
**Branch:** `fix/site-estimativas-governadas-20261109`; base `origin/main` `fd96825`.
**Vercel:** `site-wgalmeida` / `prj_uNqhTiNaZx3O1CxDlBXhNVKdIIOM`. Worktree sem vínculo Vercel: release bloqueado.
**Operação:** sem push, deploy, edição de produção, migração ou envio real.

## Contexto e causa raiz
1. `src/components/OrcadorInteligente.jsx` tinha valores fixos para Turn Key de R$ 3.500–6.500/m²; com 100 m² reproduz exatamente R$ 350–650 mil da captura. Outras modalidades também tinham tabelas fixas por unidade inadequada para certos escopos. Havia espera artificial de 1,8 s e afirmação de consulta ao ICCRI sem fetch.
2. `src/pages/Process.jsx` somava durações predefinidas por macroetapa multiplicadas por área, sem caminho crítico, paralelismo, capacidade, sequência técnica ou lead time; isso não produz cronograma comercial verificável.
3. Múltiplas réguas não reconciliadas: `src/data/commercialGovernance.js`, `src/data/commercialGovernance.generated.js`, `api/wgeasy-public-estimate.js`, orçador e página de processo. `/iccri` usa réguas editoriais e uma calculadora via API; `/solicite-proposta` não reutilizava essa API.
4. Endpoint público testado: GET `/api/wgeasy-public-estimate?area=100&standard=equilibrado&uf=SP` -> HTTP 503, `ESTIMATIVA_INDISPONIVEL`, detalhe `FONTE_INDISPONIVEL_404`. Não foi demonstrada a causa final do 404; auditar projeto Supabase exato e Data API sem expor credenciais.
5. Supabase WGEasy canônico `xkvuhixxpfonfcwrvknm` ACTIVE_HEALTHY. Contagem em consulta somente leitura: `orcamentos=0`, `orcamento_itens=0`, `cronogramas=0`, `cronograma_etapas=0`, `obras=1`, `iccri_composicoes=20`. As tabelas ICCRI de referência existem, RLS ligado e `anon` tem SELECT nas três tabelas consultadas, mas isso não comprova exposição no projeto que a função em produção efetivamente consulta. Última competência do índice: 2026-06. Esta base, isoladamente, não sustenta calibração estatística com histórico realizado.
6. Screenshot registra Turnstile com "Falha na verificação" em navegador de automação; não é evidência conclusiva de falha em navegador humano. Return point anterior de 2026-10-22 ainda indica envio real CAPTCHA não homologado. Testes unitários do widget e de /api/contact não equivalem a envio E2E real.
7. Gate público de experiência: `/processo` em 320 px mostrou overflow horizontal de 14 px e achados de acessibilidade crítica/séria. `/solicite-proposta` teve salto de níveis de heading. Sobreposição visual de header nas capturas merece reprodução com scroll.

## Contenção implementada no worktree (não publicada)
- `src/components/OrcadorInteligente.jsx`: retirados coeficientes arbitrários e espera artificial de 1,8s; resultado numérico suprimido quando não existe base homologada; textos e CTA deixam claro que orçamento só após revisão técnica; CAPTCHA e POST de contato preservados.
- `src/pages/Process.jsx`: retiradas todas as 12 durações `baseWeeks`, o somatório e as durações individuais fictícias; UI e WhatsApp passam a indicar prazo pendente de cronograma técnico e mantém macroetapas ilustrativas.
- `src/__tests__/orcadorTurnstile.test.jsx`: CTA ajustado e teste de regressão confirmando ausência do preço não calibrado no fluxo final; testes de token continuam.

## Validação
- `npm run lint`: PASS.
- `npm run verify:fast`: PASS, 66 arquivos e 336 testes, auditorias de imports, i18n, identidade visual, estrutura e consistência estrita.
- `npm run build`: PASS no worktree após remoção final das 12 durações `baseWeeks`.
- QA de produção: somente leitura, com falhas documentadas; não significa que o código isolado foi publicado ou testado contra produção.
- Snapshot e sitemaps gerados nos testes/build devem ser restaurados seletivamente se não forem alterações intencionais; backups originais preservados em `_AUDIT_BACKUPS_20261109` e arquivos `.bak-*` isolados.
- `frontend` canônico tem WIP concorrente na branch `feat/mentoria-construcao-landing-20261012`; não tocar.

## Próxima execução governada
1. Identificar **qual Supabase a função Vercel consulta de verdade**, checar /rest/v1 tabelas com health seguro, role e visibilidade, e diferenciar 404 por source mismatch vs. schema cache vs. nome, sem expor secrets.
2. Conciliar históricos reais em sistemas de obra/orçamento, precificação e planejamento (WGEasy, ObraEasy e legados), com evidência de fonte, versionamento, competência e amostra. O banco consultado está praticamente sem registros realizados.
3. Implantar um serviço canônico de estimativas com contratos por serviço e unidade, escopo, exclusões, região, insumos/composições e preços reais, referência de data, qualidade e `confidence`; faixa técnica estreita somente quando evidenciada; caso contrário, `sem estimativa automática`.
4. Implantar motor de prazo por tarefas e dependências DAG, frentes paralelas, produtividade validada, equipe, calendário de obra/condomínio, compras e marcenaria, folga e caminho crítico; não somar etapas sequencialmente.
5. Inventariar e reconectar consumidores `/iccri`, `/processo`, `/solicite-proposta`, `/calculo`, artigos/editoriais e integrações ObraEasy/EVF/AVM, com regressão cruzada e bloqueio de drift.
6. Testar Turnstile no navegador humano em ambiente controlado, sitekey/domínio/secret, e POST real `/api/contact` com persistência e read-after-write no WGEasy; sem desativar anti-spam nem criar leads de teste em produção sem gate.
7. Corrigir acessibilidade e header/scroll no desktop/mobile com evidência visual comparada. Só depois abrir PR, CI, homologação e aprovação explícita do owner para deploy.

**Regra preventiva:** nenhuma página poderá apresentar custo ou prazo como "calculado de dados reais" sem registro verificável da fonte, escopo e competência, contrato unitário validado, motor versionado e evidências E2E dos consumidores. Na ausência, apresentar "a confirmar após análise técnica".

## Continuação técnica — GO de 2026-11-09 (código local, sem publicação)

### Constatações read-only adicionais
- O Supabase WGEasy `xkvuhixxpfonfcwrvknm` contém as tabelas `iccri_padroes_canonicos`, `iccri_precos_regionais` e `iccri_indice`; o projeto separado de staging do site `ayhcldffqadlbfjhkrmg` não contém nenhuma das três. A presença dos dois projetos NÃO prova qual URL está configurada no runtime Vercel. A tentativa pela API de configuração do projeto Vercel retornou 403; a inspeção CLI de metadados não revelou valores. Não alterar env até validação owner/projeto.
- Recontagem em WGEasy: 0 orçamentos, 0 itens, 0 cronogramas, 0 etapas, 1 obra, 20 composições ICCRI; último índice 2026-06-01. Essas tabelas não demonstram histórico realizado suficiente para calibração.
- Divergência objetiva para faixa ESSENCIAL: `commercialGovernance.js` registra R$ 900–1.400/m², `commercialGovernance.generated.js` R$ 1.500–2.500/m², e tabela `iccri_padroes_canonicos` do Supabase R$ 3.000–4.800/m². A equivalência de escopo e unidade não foi demonstrada. Para EQUILIBRADO, Supabase registra R$ 4.800–7.200/m² e fator SP 1,00 com vigência desde junho/2026.
- O endpoint `/api/wgeasy-public-estimate` continua pendente de diagnóstico conclusivo em runtime; ausência de dados reais e potencial mismatch impedem liberação como orçamento.
- `/calculo` no site é link para produto Easy Real Estate externo, e não rota de calculadora própria. `/iccri` e `/wgeasy` consomem `WGEasyEstimateCalculator`; `/solicite-proposta` consumia fórmula fixa independente; `/processo` tinha motor de prazo próprio. `CommercialGovernancePanel` alimenta artigos; `ReformaApartamentoSP.jsx` também consome `getCommercialPackages`. Consumidores externos ObraEasy/EVF/AVM e texto livre de artigos requerem auditoria própria.
- Auditoria Vercel, apenas nomes de variáveis, apontou `VITE_INTERNAL_API_KEY` como `public_secret_risk_names` no projeto `site-wgalmeida`. Tratar como potencial exposição de segredo empacotado no frontend e realizar triagem de bundle/uso/rotação mediante gate explícito, sem consultar ou publicar o valor. Não confundir alerta com comprovação de vazamento.

### Correções desta continuação (somente worktree)
- `src/pages/Process.jsx`: rótulo associado ao controle de metragem; layout de grade e cards com `min-w-0`, padding responsivo e texto de etapas com quebra; remover zoom de card em 320px; links CTA com alvo de toque mínimo.
- `src/components/OrcadorInteligente.jsx`: títulos de etapas `h2` em sequência hierárquica do `h1`; labels acessíveis para área, prazo e contato; limites básicos no input de metragem; mensagem explícita de erro ou timeout do Turnstile com limpeza após token válido; texto de contato evita promessa de proposta técnica imediata.
- `src/pages/ICCRI.jsx` e `src/components/blog/CommercialGovernancePanel.jsx`: contenção de faixas/prazos estáticos não reconciliados da reforma civil, sem remover categorias técnicas. Afirmações de dados reais foram condicionadas à homologação; CMS/editorial de outros serviços ainda pendente.
- `src/__tests__/orcadorTurnstile.test.jsx`: regressão de erro e recuperação do challenge sem permitir POST sem token. Novo `src/__tests__/iccriEditorialFailClosed.test.jsx`: garante que panel não exibe faixa e prazo estáticos ICCRI em revisão.

### Validações finais
- `npm run lint`: exit=0.
- `npm run build` (após correções de ICCRI/painel): exit=0, páginas `/processo` e `/solicite-proposta` geradas.
- `npm run verify:fast`: exit=0, **67 arquivos e 338 testes** aprovados (com avisos preexistentes de React em outros testes, não bloqueantes).
- Backups automáticos de todas as edições (`.bak-*`) e cópias dos três artefatos de build/teste em `_AUDIT_BACKUPS_20261109`; sitemap e snapshot restaurados seletivamente de HEAD após backup.
- Não realizado teste visual da build isolada em navegador humano, nem POST real contra produção, nem alteração de env, Supabase, push/deploy ou reinício.

### Gate remanescente
1. Comprovar env/server reference da função Vercel e resolver o 404 com teste de conectividade sob identidade canônica.
2. Conciliar tabelas comerciais, índice ICCRI, medidas, escopos e competência; adquirir amostra de obras finalizadas de fonte confiável para benchmark custo/prazo.
3. Auditar preço/prazo em `ReformaApartamentoSP`, conteúdos blog e sistemas externos (ObraEasy, EVF, AVM), sem substituir mais números sem escopo.
4. Homologar Turnstile e envio real controlado, UI mobile 320px/scroll e leitura pós-envio no WGEasy; aprovar por owner antes de produção.

**Status da continuação: PARCIAL / RISCO — contenção local validada; sistema de cálculo real e integrações não homologados.**

## GO2 — 9 de novembro de 2026, código local não publicado

**Identidade:** site institucional `wgalmeida.com.br`; worktree `site-estimativas-governadas-20261109`; branch `fix/site-estimativas-governadas-20261109`; Vercel project `site-wgalmeida` (`prj_uNqhTiNaZx3O1CxDlBXhNVKdIIOM`), deploy mais recente READY. Worktree não tem link Vercel. `PROJECT_ACCESS_MANIFEST.json` não possui entrada autoritativa `site-wgalmeida`, logo release bloqueado. Nenhuma credencial consultada ou alterada.

### Descobertas
1. A auditoria institucional existente de 2026-10-21 em `07-iccri-motor-custo/90_Governanca/AUDIT_PRICELIST_20261021/AUDITORIA_360_PRICELIST_ICCRI_20261021.md` contém base Master 2026 de 1.783 itens Pricelist, 1.165 serviços ICCRI, 136 composições e 701 vínculos SINAPI. Também registra 1.180 itens sem descrição, 1.783 sem competência de preço, 1.356 sem evidência de origem, 54 suspeitas taxonômicas, 1.160 serviços pendentes de aprovação e 5 aprovados sem homologação final demonstrada. Dados são fontes brutas/históricas, não preços publicados.
2. Pasta `07-iccri-motor-custo` é canônica para o produto, mas seu `CANONICAL.md` não confirma repo Git, API ou deploy próprio em operação. Não criar motor redundante; reconciliar com WGEasy e ObraEasy antes de promover.
3. Consulta no WGEasy Supabase `xkvuhixxpfonfcwrvknm`: `iccri_public_estimate_v1` ainda NÃO existe. Tabelas de faixas atuais não têm contrato de publicação comprovando calibração, escopo e aprovação. As faixas estáticas discordam entre fontes.
4. Vercel get_project confirmou projeto e deployment. Runtime logs históricos 7d excedem retenção; 30m não trouxe logs relevantes. Referência Supabase efetivamente utilizada na função Vercel continua NÃO comprovada. Risco de `VITE_INTERNAL_API_KEY` permanece investigação de segurança; nenhuma referência ao nome foi encontrada nas fontes `src` e `api` inspecionadas, o que não comprova ausência no bundle.

### Alterações GO2 restritas à worktree
- `src/pages/ReformaApartamentoSP.jsx`: excluídos prazos fixos por etapa e faixas monetárias não homologadas da interface; mantidas categorias e marcos técnicos, com CTA para avaliação individual.
- `api/wgeasy-public-estimate.js`: adicionada validação da origem Supabase canônica `xkvuhixxpfonfcwrvknm` e opção de variáveis dedicadas `WGEASY_ESTIMATE_SUPABASE_URL` / `WGEASY_ESTIMATE_SUPABASE_ANON_KEY`, sem configurar variáveis reais. Rejeita faixas incoerentes `min > provável` ou `provável > max`.
- `src/lib/estimatePublicationGate.js` + `src/components/WGEasyEstimateCalculator.jsx`: UI não publica custo por mera resposta HTTP 200; exige `publication.status=homologated`, referências de aprovação/calibração/escopo/fonte, unidade, período válido e valores monotônicos. API legada não fornece essa prova, então consulta fica fail-closed.
- Testes: `reformaApartamentoPublication.test.jsx`, `wgeasyEstimatePublication.test.jsx` e extensão de `wgeasyPublicEstimate.test.js`.

### Validação GO2
- `npm run lint`: exit=0.
- `npm run verify:fast`: exit=0, **69 arquivos, 343 testes**.
- `npm run build`: exit=0 (transformou 2.077 módulos).
- `git diff --check`: exit=0. Sitemaps e snapshot gerados por build/QA restaurados seletivamente após backup em `_AUDIT_BACKUPS_20261109`.
- E2E local mobile/desktop, verificação Turnstile em navegador humano, POST real e leitura pós-envio não executados; não equivale a homologação.

### Pendências prioritárias
1. Reconciliar Pricelist 2025/2026, ICCRI, WGEasy, ObraEasy e referência SINAPI por código, unidade, escopo, competência, composição e responsável técnico; não importar RAW nem reutilizar UUIDs entre bancos.
2. Criar/validar snapshot público com cálculo de custos e incerteza fundamentados, amostra e aprovação técnico+owner. Contrato backend deve fornecer `publication` auditável; a UI já bloqueia na ausência.
3. Aplicar publicação fail-closed também na API direta; atualmente o gate novo protege os consumidores UI, não libera o endpoint bruto.
4. Diagnosticar a origem real do 404 sem revelar secrets, resolver manifest autoritativo, validar browser mobile/scroll, enviar lead de teste somente com gate e conferir persistência.
5. Só após QA, PR e aprovação expressa: push, deploy, DNS e outras mudanças externas.

**Status GO2: PARCIAL / RISCO. Correções e testes locais concluídos, produção não alterada.**

