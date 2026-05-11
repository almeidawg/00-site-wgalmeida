# Governanca Comercial Editorial

## Objetivo
- Centralizar faixas, prazos e pacotes publicos em uma fonte unica de verdade.
- Impedir publicacao de preco solto sem vinculo com base oficial.
- Padronizar a regua comercial em `Essencial / Equilibrado / Superior / Exclusivo`.

## Arquivos centrais
- `src/data/editorialThemes.js`
- `src/data/commercialGovernance.js`
- `src/data/commercialGovernance.generated.js`
- `tools/build-commercial-governance-snapshot.mjs`
- `src/components/blog/CommercialGovernancePanel.jsx`
- `src/components/blog/EditorialThemeBadge.jsx`
- `src/components/Admin/EditorialCmsWorkbench.jsx`

## Fluxo de dados
1. `tools/build-commercial-governance-snapshot.mjs` carrega `.env` local.
2. O script consulta Supabase para snapshot real de:
   - `pricelist_itens`
   - `iccri_servicos`
   - `iccri_indice`
3. O resultado e salvo em `src/data/commercialGovernance.generated.js`.
4. `src/data/commercialGovernance.js` faz merge entre:
   - camada base editorial/comercial versionada no repo;
   - snapshot gerado com valores vivos.
5. Blog, CMS e paginas publicas consomem essa camada via:
   - `getCommercialService`
   - `getCommercialPackages`
   - `getCommercialPackageNumericRange`
   - `getCommercialPublicationValidation`
   - `resolveCommercialTokens`

## Servicos cobertos nesta rodada
- `iccri-reforma-civil-sp`
- `marcenaria-sob-medida`
- `cacamba-residuos-sp`
- `reforma-cozinha-planejada`
- `reforma-banheiro-moderno`
- `reforma-apartamento-turn-key-sp`

## Tokens editoriais
- `{{COMMERCIAL_RANGE:serviceId:packageKey}}`
- `{{COMMERCIAL_TIMELINE:serviceId:packageKey}}`
- `{{COMMERCIAL_TIMELINE_BASE:serviceId:packageKey}}`
- `{{COMMERCIAL_SUMMARY:serviceId:packageKey}}`
- `{{COMMERCIAL_IDEAL_FOR:serviceId:packageKey}}`
- `{{COMMERCIAL_LABEL:serviceId:packageKey}}`
- `{{COMMERCIAL_SOURCE:serviceId}}`
- `{{COMMERCIAL_MATERIAL_RANGE:serviceId:materialKey}}`
- `{{COMMERCIAL_DEFAULT_RANGE:packageKey}}`

## Publication guard
- Bloqueia publicacao quando:
  - existe preco no conteudo sem `serviceId` central;
  - o servico vinculado nao existe;
  - o pacote foco nao existe;
  - o servico esta `pending_source`;
  - o conteudo ainda usa nomenclatura legada.

## Checklist para novas publicacoes
- Definir `editorialThemeId` quando o auto-match nao for suficiente.
- Vincular `commercialProfile.serviceId` se houver preco, prazo ou escopo comercial.
- Definir `commercialProfile.packageFocus` quando o post enfatizar uma faixa.
- Preferir tokens em Markdown em vez de valores hardcoded.
- Rodar:
  - `npm run commercial:governance:build`
  - `npm run lint`
  - `npm run build`
- Validar visualmente a rota publica e, quando houver admin tocado, validar o preview autenticado.
