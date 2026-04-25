# Auditoria WGEasy x Site WG Almeida — 25/04/2026

## Objetivo

Auditar conteúdo público do site que depende de dados vivos do ecossistema WGEasy e corrigir divergências imediatas em preços, planos, páginas de produto, blog e regras de validação.

## Fontes de verdade consultadas

- `saas_produtos`: 2 produtos ativos identificados.
- `saas_planos`: 5 planos ativos identificados.
- `pricelist_itens`: 1282 itens ativos identificados.
- `pricelist_categorias`: 39 categorias ativas identificadas.
- `sinapi_composicoes`: 10141 composições identificadas.
- `iccri_servicos`: 1160 serviços ativos identificados.
- `iccri_indice`: 7 índices identificados.
- `evf_estudos`: 4 estudos identificados.
- `evf_estudos_itens`: 72 itens de estudos identificados.
- ObraEasy SSoT local: `03_SaaS/ObraEasy/frontend/src/data/planos.ts`.
- ObraEasy checkout real: `03_SaaS/ObraEasy/api/asaas-create-charge.js` e `api/create-mp-preference.js`.

## Benchmark externo rapido

Fontes consultadas em 2026-04-25:

- ConstruApp (`https://constru.app.br`) publica planos de gestao de obras em `R$ 49,90/mês`, `R$ 79,90/mês` e `R$ 139,90/mês`.
- ImobiBrasil (`https://www.imobibrasil.com.br/planos.php`) publica CRM/site imobiliario a partir de `R$ 54,99/mês`, com plano superior em `R$ 249,99/mês`.
- Leitura estrategica: ObraEasy em `R$ 29,90`/`R$ 59,90` e EasyRealState em `R$ 79,90`/`R$ 149,90` ficam coerentes como precificacao de entrada para escala, aquisição e validação, sem usar a ancoragem inflada `R$ 297`/`R$ 797`.
- O valor `R$ 97,90` nao deve ser aplicado agora: nao foi encontrado em checkout real, SSoT local ou base WGEasy normalizada. Ele pode ser reservado como hipotese futura de teste para upgrade, mas so depois de ajuste coordenado em `saas_planos`, checkout e site.

## Matriz de precificacao validada

### ObraEasy para consumidor/cliente final

- Gratuito: `R$ 0`, entrada de aquisicao para conhecer EVF/metodologia.
- Pro: `R$ 29,90/mês`, plano individual para profissional/autonomo ou cliente final com ate 5 projetos. A estrategia fica abaixo de concorrentes de gestao de obras para reduzir friccao de entrada.
- Business: `R$ 59,90/mês`, plano de escala para escritorio, pequena construtora ou operacao recorrente. Fica competitivo contra faixas de mercado em torno de `R$ 79,90+` sem quebrar o checkout atual.
- Parceiro Solo e Parceiro Completo nao devem aparecer como planos do ObraEasy publico; pertencem a EasyRealState/parceria imobiliaria.

### Easy Real State por modelo

- Calculo Publico: `R$ 0`, aquisicao e demonstracao de valor sem login/cartao.
- Solo: `R$ 79,90/mês`, corretor autonomo com AVM, pipeline, EVF e links rastreaveis.
- Completo: `R$ 149,90/mês`, operacao imobiliaria com clientes ilimitados, site profissional, SEO local e suporte superior.
- Aliases legados `Pro Corretor` e `Imobiliaria` devem continuar apenas como compatibilidade interna enquanto houver historico, sem reaparecer como copia publica antiga.

## Correções imediatas aplicadas

### `/obraeasy`

- Removido o desvio que misturava planos EasyRealState/Parceiro dentro da grade de planos do ObraEasy.
- Planos públicos agora refletem o SSoT operacional do ObraEasy e `saas_planos` normalizado:
  - Gratuito: `R$ 0`
  - Pro: `R$ 29,90/mês`
  - Business: `R$ 59,90/mês`
- Benefícios ajustados conforme a base ativa:
  - Pro: até 5 projetos simultâneos, EVF completo, diário, financeiro básico, cronograma simplificado e suporte por email.
  - Business: projetos ilimitados, tudo do Pro, análise de viabilidade e risco, DRE, cronograma avançado, materiais/quantitativos e suporte prioritário.
- Structured data `SoftwareApplication.offers` agora usa a lista renderizada da página, evitando ofertas antigas no JSON-LD.

### Normalização WGEasy

- A tabela viva `saas_planos` estava com ObraEasy Pro `R$ 297` e Business `R$ 797`.
- Esse valor conflitava com o SSoT do ObraEasy (`frontend/src/data/planos.ts`) e com os checkouts reais Asaas/Mercado Pago (`R$ 29,90` e `R$ 59,90`).
- A base WGEasy foi normalizada para:
  - Pro: `valor_mensal=29.9`, `valor_anual=299`, destaque `false`.
  - Business: `valor_mensal=59.9`, `valor_anual=599`, destaque `true`.
- Não foi encontrada evidência local de estratégia ativa em `R$ 97,90`.

### `/easy-real-state`

- Planos públicos ajustados contra `saas_planos`:
  - Cálculo Público: `R$ 0`
  - Solo: `R$ 79,90/mês`
  - Completo: `R$ 149,90/mês`
- Structured data atualizado de `Pro Corretor R$ 49` / `Imobiliária R$ 149` para `Solo R$ 79.90` / `Completo R$ 149.90`.

### Blog EVF

- Corrigido CTA antigo em `src/content/blog/evf-estudo-viabilidade-financeira.md`.
- Texto antigo removido quando ainda podia conflitar com a base divergente.
- Texto atual: plano gratuito para conhecer a experiência e planos pagos do ObraEasy a partir de `R$ 29,90/mês`, conforme SSoT/checkouts/WGEasy normalizado.

## Validação automatizada criada

Novo script:

```powershell
npm run audit:wgeasy:site-sync:strict
```

O script:

- Carrega `src/data/company.js`.
- Consulta Supabase quando existem variáveis locais `SUPABASE_URL`/`VITE_SUPABASE_URL` e chave Supabase.
- Compara preços públicos de ObraEasy e EasyRealState com `saas_planos`.
- Verifica presença de tabelas críticas do ecossistema: SaaS, pricelist, SINAPI, ICCRI e EVF.
- Bloqueia strings antigas/inválidas em arquivos críticos: `R$ 49` isolado para EasyRealState e `R$ 297`/`R$ 797` para ObraEasy.

Resultado local desta rodada:

```text
audit-wgeasy-site-sync: OK
Preços públicos e tabelas críticas conferidos contra WGEasy.
```

## Regras daqui para frente

- Toda alteração em `saas_planos`, `frontend/src/data/planos.ts` do ObraEasy ou checkout Asaas/Mercado Pago deve ser acompanhada de `npm run audit:wgeasy:site-sync:strict` no site antes de PR/deploy.
- ObraEasy e WGEasy devem manter a mesma matriz de preços para cliente final:
  - Gratuito/trial: entrada de aquisição.
  - Pro: `R$ 29,90/mês`.
  - Business: `R$ 59,90/mês`.
  - Pro anual: `R$ 299/ano`.
  - Business anual: `R$ 599/ano`.
- Conteúdo público não pode publicar preço, prazo, ROI, R$/m², comissão, margem, cobertura ou metodologia sem identificar se é:
  - transação real;
  - oferta/listagem;
  - referência editorial;
  - simulação.
- O site pode manter espelhos em `src/data/company.js` apenas se forem auditados por script. O destino ideal é gerar um snapshot público ou endpoint estável a partir do WGEasy/Supabase.
- Páginas de produto devem usar nomes de plano iguais aos nomes ativos em `saas_planos`.
- Blog técnico com números de custo, prazo, precisão, margem ou base de preço deve citar a origem operacional ou ser marcado como referência editorial.

## Pendências estratégicas

- Criar snapshot público versionado de preços e motores (`public/ecosystem-data.json` ou endpoint serverless) para remover espelhos manuais.
- Auditar os artigos técnicos com tabelas de custos contra `pricelist_itens`, `sinapi_composicoes` e `iccri_indice`.
- Mapear cada página do site para sua fonte operacional:
  - ObraEasy: `saas_planos`, `evf_estudos`, `evf_estudos_itens`.
  - EasyRealState: `saas_planos`, motor AVM e dados imobiliários.
  - ICCRI: `iccri_indice`, `iccri_servicos`, `pricelist_itens`.
  - Blog técnico: snapshot editorial com data de referência.
- SEO orgânico: priorizar clusters com maior potencial de captura:
  - `calculadora custo reforma`;
  - `custo reforma m2 sao paulo`;
  - `evf obra`;
  - `simulador custo obra`;
  - `iccri`;
  - `calculadora preco m2`;
  - `avm imobiliario`;
  - `turn key sp`;
  - `marcenaria sob medida`;
  - `empresa de reformas campo belo`.

## Observação operacional

Existem arquivos duplicados antigos não rastreados no repo do site e também no repo WGEasy. Eles não foram removidos nesta rodada para evitar apagar histórico sem auditoria dedicada. A pendência de auditoria futura do repo pai continua aberta.
