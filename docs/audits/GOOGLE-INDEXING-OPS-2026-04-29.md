# Google Indexing Ops - 2026-04-29

## Baseline

- Fonte: URL Inspection API sobre `public/sitemap.xml`.
- Propriedade: `sc-domain:wgalmeida.com.br`.
- Autenticacao: ADC/OAuth de `william@wgalmeida.com.br`.
- Sitemap avaliado: `https://wgalmeida.com.br/sitemap.xml`.
- URLs no sitemap: 158.
- URLs inspecionadas: 158.

## Resultado por estado

- `Submitted and indexed`: 105.
- `Discovered - currently not indexed`: 44.
- `Crawled - currently not indexed`: 5.
- `URL is unknown to Google`: 3.
- `Duplicate, Google chose different canonical than user`: 1.

## Estrategia aplicada no codigo

- Criado `tools/google-indexing-ops.mjs` para auditar URLs do sitemap via URL Inspection API e submeter sitemap via Search Console API.
- Adicionados scripts:
  - `npm run google:indexing:audit`
  - `npm run google:indexing:submit-sitemap`
- `build-seo-routes.mjs` passou a inserir preview real do Markdown em HTML pre-gerado para rotas de blog e estilos.
- `build-seo-routes.mjs` passou a atualizar tambem `sitemap-index.xml` com `lastmod` do dia do build.
- `public/robots.txt` teve metadado de atualizacao alinhado para 2026-04-29.

## Estrategia por tipo de problema

### Discovered - currently not indexed

Acao principal: reforcar sinais de descoberta e prioridade de crawl.

- Manter URLs canonicas no sitemap atualizado.
- Aumentar conteudo estatico pre-gerado para reduzir dependencia de renderizacao client-side.
- Fortalecer links internos a partir de hubs ja indexados: `/blog`, `/revista-estilos`, paginas de servico e paginas locais.
- Priorizar URLs comerciais e hubs antes de artigos long-tail.

### Crawled - currently not indexed

Acao principal: aumentar utilidade percebida e diferenciacao.

- Revisar conteudo fino, repeticao editorial, interlinking e sinais de autoria/metodologia.
- Garantir que HTML inicial contenha conteudo especifico da pagina.
- Evitar apenas reenviar URL sem melhoria real.

### URL is unknown to Google

Acao principal: descoberta.

- Confirmar HTTP 200, canonical proprio, links internos e inclusao no sitemap.
- Submeter sitemap apos deploy.
- Considerar pedido manual no URL Inspection Tool apenas para URLs prioritarias.

### Duplicate, Google chose different canonical than user

Acao principal: consolidar sinal canonico.

- Conferir canonical proprio e links internos apontando para a URL preferida.
- Diferenciar conteudo estatico pre-gerado para evitar fallback generico semelhante entre paginas.
- Manter somente a URL canonica no sitemap.

## URLs prioritarias para acompanhamento

- `https://wgalmeida.com.br/buildtech`
- `https://wgalmeida.com.br/obraeasy`
- `https://wgalmeida.com.br/easy-real-state`
- `https://wgalmeida.com.br/revista-estilos`
- `https://wgalmeida.com.br/blog/custo-reforma-m2-sao-paulo`
- `https://wgalmeida.com.br/blog/closet-planejado-organizacao-otimizacao`
- `https://wgalmeida.com.br/estilos/neoclassico`
- `https://wgalmeida.com.br/estilos/southwest`
- `https://wgalmeida.com.br/estilos/art-deco`

## Referencias Google

- Sitemaps ajudam descoberta, mas nao garantem indexacao.
- Para muitas URLs, submeter sitemap e o caminho correto.
- Para poucas URLs prioritarias, usar URL Inspection Tool; pedido de recrawl tem quota e nao acelera repetindo a mesma URL.
- Canonical, redirects e sitemap devem apontar para a mesma URL preferida.
