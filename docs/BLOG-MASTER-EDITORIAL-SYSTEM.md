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
