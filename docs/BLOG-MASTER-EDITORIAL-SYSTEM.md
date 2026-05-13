# Blog Master Editorial System

## Template oficial

- Referência canônica: `/blog/arquitetos-brasileiros-famosos-legado`
- Template ID: `legacy-architects-master-v1`
- Objetivo: padronizar hero, leitura guiada, sumário, blocos com imagem contextual, CTA, tags, mood board e painel de engajamento.

## Contrato de conteúdo

Cada post publicado pelo CMS pode controlar:

- `slug`
- `title`
- `subtitle`
- `excerpt`
- `summary`
- `author`
- `category`
- `tags`
- `seoTitle`
- `metaDescription`
- `date`
- `readTime`
- `featured`
- `status`
- `content`
- `gallery`
- `faq`
- `cta`
- `relatedSlugs`
- `moodboard.projectName`
- `moodboard.clientName`
- `moodboard.palette`
- `moodboard.styleSlugs`
- `moodboard.referenceImages`
- `moodboard.note`

## Publicação

- Fonte versionada gerada: `src/data/blogCms.generated.js`
- Fallback local: `localStorage`
- Endpoint administrativo: `POST /api/blog-cms`
- Página pública lê posts publicados a partir de:
  - markdown versionado existente
  - overrides publicados do CMS
  - posts novos criados apenas no CMS

## Admin

`/admin/blog-editorial` agora possui três frentes:

- `Mesa de Curadoria`: vínculo de imagens por slot
- `Biblioteca Global`: busca de ativos
- `CMS Mestre`: edição, rascunho, duplicação, publicação, mood board e moderação básica

## Interações públicas

O template mestre inclui:

- curtidas
- comentários
- compartilhamento por link
- WhatsApp
- LinkedIn
- X/Twitter
- Facebook
- contadores locais de likes, shares e comments

## Observação operacional

- Comentários e contadores ainda usam persistência local no cliente.
- A publicação editorial de posts já possui trilha versionável via arquivo gerado + API local.
- Para multiusuário real em produção, a próxima etapa recomendada é mover `metrics/comments` para tabela dedicada no Supabase com ACL administrativa.

## Sistema editorial de imagem

### Diagnóstico

- O front já separa hero, card, thumb, SEO e contexto por `blogImageManifest`.
- A fila `blogEditorialQueue.generated.json` já traz plano de hero/card por post.
- O admin tinha curadoria visual, mas misturava fonte de inspiração com fonte publicável.
- Pinterest e Google apareciam no mesmo nível operacional de Unsplash/acervo, criando risco de publicação sem licença clara.
- O post modelo `/blog/arquitetos-brasileiros-famosos-legado` é o padrão funcional: hero e card têm papéis diferentes, mas pertencem à mesma família visual.

### Modelo de dados recomendado

O CMS passa a carregar `imageGovernance` junto do post:

- `theme`
- `subtheme`
- `visualStyle`
- `imageIntent`
- `imageEntity`
- `visualKeywords`
- `editorialTone`
- `desiredDominantColor`
- `orientation`
- `visualPriority`
- `source`
- `originalUrl`
- `credit`
- `licenseType`
- `heroImage`
- `cardImage`
- `alt`
- `cardAlt`
- `focalPoint`
- `desktopCrop`
- `mobileCrop`
- `reviewStatus`
- `semanticPrompt`
- `queryVariants`
- `scoreTitle`
- `scoreCategory`
- `scoreStyle`
- `scoreFinal`
- `aiJustification`
- `automationStatus`

### Fonte de imagem

- `Unsplash API`: publicável com hotlink, crédito, URL da página e `downloadLocation` registrado.
- `Acervo WG`: publicável quando o ativo é próprio, local, Cloudinary ou fonte licenciada aprovada.
- `Fonte externa aprovada`: publicável somente com origem, crédito e revisão.
- `Pinterest`: referência estética, nunca fonte automática de publicação.
- `Google Images`: referência de pesquisa, nunca fonte automática sem licença validada.

### Publicação e acervo

- Seleções do Unsplash ficam em `wg_blog_editorial_unsplash_v1` enquanto são rascunho e passam para `wg_blog_editorial_published_unsplash_v1` ao sincronizar.
- Uploads/acervo WG ficam em `wg_blog_editorial_uploads_v1` enquanto são rascunho e passam para `wg_blog_editorial_published_uploads_v1` ao sincronizar.
- Uploads feitos pelo modal usam Cloudinary via preset configurado e gravam `publicId`, `secureUrl`, alt contextual, crédito e data do vínculo.
- O manifest preserva metadata de hero/card e contexto para que a página pública mantenha alt, caption e origem após a publicação.

### Motor semântico

Implementação central:

- `src/lib/wgVisualSearchProfile.js`: parser do título, categoria e tags para intenção visual.
- `src/lib/editorialImageIntelligence.js`: governança de fonte, modelo de dados, score de candidato e estratégia hero/card.

Saída por post:

- consulta principal de hero;
- consulta principal de card;
- termos auxiliares;
- termos negativos;
- família visual;
- intenção semântica;
- justificativa de seleção;
- score de fonte, título, categoria, estilo e crédito.

### Regras de card e hero

- O hero é a imagem-mãe do conteúdo.
- O card deve ser derivado visualmente do hero ou pertencer à mesma família editorial.
- O hero pode usar plano aberto, retrato ou ambiente com espaço de leitura.
- O card deve priorizar recorte forte, leitura rápida e coerência em grid.
- Hero e card não precisam ser a mesma imagem, mas precisam compartilhar tema, atmosfera e intenção.

### Exemplo aplicado

`Arquitetos Brasileiros Famosos: legado`

- Tipo visual: autoral / retrato editorial / legado.
- Hero sugerido: retrato editorial de arquiteto ou imagem autoral de legado arquitetônico brasileiro.
- Card sugerido: obra icônica, detalhe arquitetônico ou segundo retrato relacionado à narrativa.
- Evitar: prédio genérico, foto turística aleatória, imagem decorativa sem vínculo com autoria.
- Fontes: acervo próprio/Wikipedia com origem clara/fonte aprovada, ou Unsplash apenas quando a imagem representar arquitetura autoral e não pessoa específica sem vínculo.

### UX do admin

- `Mesa de Curadoria` mostra plano semântico de hero e card por post.
- `Biblioteca Global` separa `Unsplash API`, `Acervo WG` e `Referência`.
- `CMS Mestre` possui bloco de direção editorial da imagem com prompt, estilo visual, status e justificativa.
- Modal de seleção permite subir ativo próprio para o acervo WG, com alt e crédito antes de vincular ao slot.
- Modal de seleção bloqueia publicação de Pinterest/Google como fonte direta e exibe motivo.
- Cada candidato recebe score e explicação de vínculo com título/categoria/estilo.

### Prioridades

1. Manter Pinterest/Google como referência apenas.
2. Salvar `imageGovernance` em todos os novos posts.
3. Usar Unsplash via API protegida e registrar `downloadLocation` ao aprovar.
4. Completar hero/card dos posts que ainda usam fallback genérico.
5. Evoluir para crops/focal point visuais com preview desktop/mobile no admin.
