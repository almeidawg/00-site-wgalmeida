# Google SEO e PageSpeed Round - 2026-04-25

## Escopo

Rodada executada em 25/04/2026 para o dominio publico `https://wgalmeida.com.br`.

Fontes usadas:

- Google Search Console API, propriedade `https://wgalmeida.com.br/`.
- Sitemap publico `https://wgalmeida.com.br/sitemap.xml`.
- URL Inspection API para 158 URLs do sitemap.
- Search Analytics API, periodo atual `2026-01-24..2026-04-23`.
- Search Analytics API, comparativo anterior `2025-10-25..2026-01-23`.
- PageSpeed Insights API em 11 rotas prioritarias, mobile e desktop.

Evidencias brutas locais, nao commitadas: `.codex/tmp/google-strategy-20260425/`.

## Resultado executivo

- Sitemap valido no Search Console: 158 URLs enviadas, 0 erros, 0 avisos.
- Home indexada: `Submitted and indexed`, `robotsTxtState=ALLOWED`, `indexingState=INDEXING_ALLOWED`, `pageFetchState=SUCCESSFUL`.
- Cobertura das 158 URLs do sitemap:
  - 105 `Submitted and indexed`.
  - 44 `Discovered - currently not indexed`.
  - 5 `Crawled - currently not indexed`.
  - 3 `URL is unknown to Google`.
  - 1 `Duplicate, Google chose different canonical than user`.
- SEO tecnico no PageSpeed das 11 rotas testadas: 100 em todas.
- Gargalo principal de performance: mobile LCP/TBT/JS, principalmente home, blog e paginas de estilos.
- Ganho de alcance organico: 23.629 impressoes e 220 cliques no periodo atual contra 1.196 impressoes e 36 cliques no periodo anterior.
- CTR caiu de 3,01% para 0,93% porque o site passou a aparecer para muito mais termos, mas varios snippets ainda nao convertem bem.

## Indexacao

### Situacao validada

O problema atual nao e bloqueio tecnico global. O Google consegue acessar o dominio, o sitemap, o robots e a home. As pendencias sao de processamento, qualidade/canonical e priorizacao de crawl.

Validacao HTTP adicional em producao:

- `https://wgalmeida.com.br/robots.txt`: 200.
- `https://wgalmeida.com.br/sitemap.xml`: 200.
- `https://wgalmeida.com.br/revista-estilos`: 200.
- `https://wgalmeida.com.br/estilos/maximalista`: 200.
- `https://wgalmeida.com.br/blog/closet-planejado-organizacao-otimizacao`: 200, canonical proprio correto.
- `https://wgalmeida.com.br/blog/onboarding-processo-wg-almeida`: 200, canonical proprio correto.

### Crawled - currently not indexed

Estas URLs ja foram rastreadas, mas o Google ainda nao decidiu indexar. A acao correta e reforcar valor unico, links internos e recrawl:

- `https://wgalmeida.com.br/blog/iluminacao-residencial-guia-completo`
- `https://wgalmeida.com.br/blog/marcas-luxo-nacionais-moveis-decoracao`
- `https://wgalmeida.com.br/blog/quanto-custa-reformar-apartamento-2026`
- `https://wgalmeida.com.br/blog/sistema-easy-metodologia-wg-almeida`
- `https://wgalmeida.com.br/estilos/art-deco`

### URL is unknown to Google

Estas URLs existem e respondem, mas ainda nao entraram no indice conhecido. Prioridade para recrawl via Search Console UI e reforco de links internos:

- `https://wgalmeida.com.br/estilos/maximalista`
- `https://wgalmeida.com.br/estilos/transitional`
- `https://wgalmeida.com.br/revista-estilos`

### Duplicate canonical

URL marcada:

- `https://wgalmeida.com.br/blog/closet-planejado-organizacao-otimizacao`

Google canonical escolhido no relatorio:

- `https://wgalmeida.com.br/blog/onboarding-processo-wg-almeida`

Estado atual verificado em producao: ambas as paginas respondem 200 e possuem canonical proprio correto. O ultimo crawl reportado para a URL duplicada foi `2026-04-06T10:30:18Z`, entao o sinal pode estar defasado. Acao imediata: solicitar recrawl manual. Se persistir na proxima rodada, reescrever a abertura, H2s e blocos finais da pagina de closet para aumentar unicidade sem alterar a URL.

### Discovered - currently not indexed

Padrao predominante: paginas novas ou profundas, especialmente estilos, blog e produtos do ecossistema. Acoes:

- Fortalecer hubs de links internos para `revista-estilos`, paginas `estilos/*`, blog e paginas de produtos.
- Garantir que cada pagina descoberta tenha pelo menos 2 a 4 links internos editoriais a partir de paginas ja indexadas.
- Reenviar sitemap apos cada lote de melhoria editorial.
- Evitar publicar muitos slugs novos sem cluster/hub de suporte.

URLs nesse estado:

- `https://wgalmeida.com.br/arquitetura-interiores-vila-nova-conceicao`
- `https://wgalmeida.com.br/blog/arquitetura-alto-padrao`
- `https://wgalmeida.com.br/blog/calculadora-preco-m2-corretores-imobiliarias`
- `https://wgalmeida.com.br/blog/como-calcular-custo-de-obra`
- `https://wgalmeida.com.br/blog/custo-construcao-reforma-2026-guia-tecnico-completo`
- `https://wgalmeida.com.br/blog/custo-reforma-apartamento-alto-padrao-sp`
- `https://wgalmeida.com.br/blog/custo-reforma-m2-sao-paulo`
- `https://wgalmeida.com.br/blog/etapas-reforma-completa`
- `https://wgalmeida.com.br/blog/marcenaria-sob-medida`
- `https://wgalmeida.com.br/blog/o-que-e-turn-key`
- `https://wgalmeida.com.br/blog/obraeasy-como-funciona-para-clientes-finais`
- `https://wgalmeida.com.br/blog/obraeasy-para-parceiros-imobiliarias-corretores`
- `https://wgalmeida.com.br/blog/quanto-custa-reforma-apartamento-100m2`
- `https://wgalmeida.com.br/blog/quanto-tempo-leva-reforma-completa-alto-padrao`
- `https://wgalmeida.com.br/blog/quanto-valoriza-apartamento-apos-reforma`
- `https://wgalmeida.com.br/blog/reforma-saiu-mais-caro-o-que-fazer`
- `https://wgalmeida.com.br/blog/tabela-precos-reforma-2026-iccri`
- `https://wgalmeida.com.br/buildtech`
- `https://wgalmeida.com.br/construtora-brooklin`
- `https://wgalmeida.com.br/easy-real-state`
- `https://wgalmeida.com.br/easylocker`
- `https://wgalmeida.com.br/estilos/coastal`
- `https://wgalmeida.com.br/estilos/contemporaneo`
- `https://wgalmeida.com.br/estilos/cottage`
- `https://wgalmeida.com.br/estilos/ecletico`
- `https://wgalmeida.com.br/estilos/escandinavo`
- `https://wgalmeida.com.br/estilos/farmhouse`
- `https://wgalmeida.com.br/estilos/glam`
- `https://wgalmeida.com.br/estilos/hampton`
- `https://wgalmeida.com.br/estilos/hollywood-regency`
- `https://wgalmeida.com.br/estilos/mediterraneo`
- `https://wgalmeida.com.br/estilos/mid-century`
- `https://wgalmeida.com.br/estilos/neoclassico`
- `https://wgalmeida.com.br/estilos/provencal`
- `https://wgalmeida.com.br/estilos/rustico`
- `https://wgalmeida.com.br/estilos/southwest`
- `https://wgalmeida.com.br/estilos/tropical`
- `https://wgalmeida.com.br/estilos/tulum`
- `https://wgalmeida.com.br/estilos/urban-modern`
- `https://wgalmeida.com.br/estilos/vintage`
- `https://wgalmeida.com.br/estilos/wabi-sabi`
- `https://wgalmeida.com.br/moodboard`
- `https://wgalmeida.com.br/obraeasy`
- `https://wgalmeida.com.br/room-visualizer`

## Posicionamento organico

Comparativo por paginas:

| Periodo | Paginas | Cliques | Impressoes | CTR | Posicao media ponderada |
|---|---:|---:|---:|---:|---:|
| 2025-10-25..2026-01-23 | 20 | 36 | 1.196 | 3,01% | 6,5 |
| 2026-01-24..2026-04-23 | 227 | 220 | 23.629 | 0,93% | 7,7 |

Paginas com mais impressoes e CTR baixo:

| Pagina | Cliques | Impressoes | CTR | Posicao |
|---|---:|---:|---:|---:|
| `/blog/steel-frame-vs-alvenaria-qual-escolher` | 48 | 6.157 | 0,78% | 5,2 |
| `/estilos/japandi` | 10 | 2.274 | 0,44% | 8,9 |
| `/blog/paleta-cores-2026-cor-do-ano` | 7 | 793 | 0,88% | 7,7 |
| `/blog/tendencias-decoracao-interiores-2026` | 1 | 704 | 0,14% | 5,7 |
| `/marcenaria` | 8 | 649 | 1,23% | 10,1 |
| `/blog/quanto-tempo-dura-reforma-apartamento` | 7 | 648 | 1,08% | 3,9 |
| `/blog/tendencias-construcao-civil-2026` | 0 | 523 | 0,00% | 6,3 |
| `/construtora-alto-padrao-sp` | 6 | 447 | 1,34% | 15,9 |

Consultas com oportunidade imediata:

| Query | Pagina principal | Impressoes | CTR | Posicao |
|---|---|---:|---:|---:|
| `japandi` | `/estilos/japandi` | 924 | 0,11% | 9,2 |
| `estilo japandi` | `/estilos/japandi` | 255 | 0,39% | 8,6 |
| `grupo wg` | `/` | 146 | 0,68% | 7,5 |
| `steel frame valor m2 2026` | `/blog/steel-frame-vs-alvenaria-qual-escolher` | 123 | 4,07% | 5,0 |
| `decoracao japandi` | `/estilos/japandi` | 99 | 0,00% | 11,9 |
| `evf` | `/blog/evf-estudo-viabilidade-financeira` | 74 | 0,00% | 4,4 |
| `empresa de reformas em campo belo sao paulo` | `/campo-belo` | 61 | 0,00% | 12,4 |
| `marcenaria sob medida` | `/marcenaria` | 40 | 0,00% | 10,4 |

## PageSpeed

Scores por rota:

| Rota | Mobile | Desktop | SEO | Observacao |
|---|---:|---:|---:|---|
| `/` | 60 | 68 | 100 | Pior LCP mobile: 4,8s; TBT 760ms |
| `/estilos/minimalismo` | 65 | 71 | 100 | LCP mobile 4,5s |
| `/blog` | 70 | 66 | 100 | Speed Index mobile 6,5s; JS 2,2s |
| `/reforma-apartamento-sp` | 73 | 73 | 100 | TBT mobile 640ms |
| `/arquitetura` | 75 | 64 | 100 | Desktop TBT 1.040ms |
| `/marcenaria` | 77 | 81 | 100 | TBT mobile 520ms |
| `/iccri` | 78 | 67 | 100 | TBT mobile 530ms |
| `/projetos` | 81 | 78 | 100 | LCP mobile 3,6s |
| `/engenharia` | 88 | 76 | 100 | Melhor mobile entre servicos |
| `/solicite-proposta` | 88 | 68 | 100 | Desktop TBT 1.000ms |
| `/blog/arquitetos-brasileiros-famosos-legado` | 90 | 71 | 100 | Melhor mobile do lote |

Gargalos recorrentes:

- LCP mobile acima do alvo em home, blog, minimalismo, arquitetura, projetos, marcenaria e reforma.
- TBT/execucao JS alto em home, ICCRI, marcenaria, reforma, solicite proposta e desktop de arquitetura.
- CSS nao usado recorrente, economia estimada de 21 a 24 KiB por rota.
- JS nao usado identificado em `/blog/arquitetos-brasileiros-famosos-legado` e `/solicite-proposta`.
- Blog tem maior trabalho de main thread no mobile: 3,6s.

## Prioridades de correcao

### P0 - Indexacao

1. Solicitar recrawl manual no Search Console para:
   - `/blog/closet-planejado-organizacao-otimizacao`
   - `/estilos/maximalista`
   - `/estilos/transitional`
   - `/revista-estilos`
   - as 5 URLs `Crawled - currently not indexed`.
2. Reforcar links internos de paginas ja indexadas para `revista-estilos` e paginas `estilos/*`.
3. Revisar title/meta description das paginas com CTR baixo e posicao boa: Japandi, tendencias 2026, steel frame, EVF e marcenaria.

### P1 - PageSpeed

1. Home: reduzir LCP do hero e peso JS inicial; manter video com poster leve e carregar midia pesada depois do primeiro paint.
2. Blog: code splitting/lazy loading de componentes de listagem e cards, reduzir trabalho de main thread.
3. Estilos: otimizar imagem/hero de LCP e links internos do hub.
4. CSS: revisar Tailwind/content purge e dependencias globais que entram em todas as rotas.
5. JS: auditar bibliotecas carregadas no bundle inicial, principalmente admin/editorial/search que nao devem impactar paginas publicas.

### P2 - Conteudo e estrategia

1. Criar cluster editorial forte para `japandi`, com FAQ, exemplos reais, links para arquitetura/interiores e imagens proprietarias.
2. Reposicionar snippets de buscas transacionais: `marcenaria sob medida`, `turn key sp`, `empresa de reformas em campo belo sao paulo`.
3. Separar conteudo institucional de conteudo informacional para evitar canibalizacao.
4. Monitorar semanalmente as 53 URLs nao indexadas ate estabilizar.

## Proxima rodada recomendada

1. Implementar P0 de links internos e meta descriptions.
2. Rodar nova URL Inspection para as 53 URLs pendentes.
3. Executar PageSpeed depois das otimizacoes de LCP/JS.
4. Comparar CTR dos snippets apos 7 a 14 dias de dados.

