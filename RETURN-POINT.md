# RETURN POINT — Brand Canonical WG Almeida

Atualizado em: 2026-09-15
Owner: William Almeida
Branch: `chore/brand-canonical-20260915`
Base remota validada: `origin/main` em `1938ce7e2229554785179584ebe16a4666fa8fec`
Worktree: `.worktrees/brand-canonical-20260914`

## Objetivo desta frente

Uniformizar a comunicação institucional pública do Grupo WG Almeida e da WG Build.tech com a fonte canônica consolidada: Grupo desde 2011; quatro núcleos ativos (WG Arquitetura, WG Engenharia, WG Marcenaria e WG Build.tech); Turnkey como integração operacional; WG Build.tech criada em 2025 a partir de problemas reais vividos na operação; William Almeida posicionado como Founder + Operator + Builder.

## Alterações principais

- Home e Sobre passaram de três para quatro núcleos.
- Nome público normalizado para `WG Build.tech`; `WG_Build.tech` fica apenas como nomenclatura legada/documentada, nunca como nome oficial público.
- História pública alinhada em PT-BR, EN e ES: desde 2011 -> integração física/Turnkey -> WG Build.tech em 2025.
- William Almeida descrito como Founder + Operator + Builder, conectando operação, produto e tecnologia.
- Fallbacks artificiais de `400 clientes`, `+1 projeto` e pisos equivalentes removidos.
- Claims não reconciliados (`480+ clientes`, `1.000+ propostas`, `284+/285+ clientes` etc.) bloqueados pelo auditor público.
- `15 anos` substituído por `desde 2011` em claims institucionais para evitar envelhecimento e ambiguidade.
- Claim editorial não reconciliado de `mais de 280 obras entregues` removido.
- Build.tech ganhou explicação explícita de origem, método com especialistas e disclaimer de estimativa comercial.
- SEO/schema/propostas/componentes/blogs alinhados à nomenclatura canônica.
- Documentação operacional (`AGENTS.md`, regras de commit/deploy e proposta 360) atualizada para não reintroduzir identidade legada.
- Testes de regressão institucionais adicionados.

## Evidência de validação mais recente

Executado o equivalente ao gate oficial `verify:deploy` após as correções finais:

- Imports: OK
- i18n público: 225 chaves OK (pt-BR/en/es)
- Brand visual: 133 arquivos OK
- Audit estrutural: OK
- Consistency anti-drift: OK
- Consistency strict: OK
- Testes: 31 arquivos / 128 testes / 0 falhas
- Public claims strict: OK
- Vite production build: OK (2055 módulos transformados)
- React production bundle audit: OK
- Sitemap de `dist`: 175 rotas
- Markdown: 160 verificados, 0 assets de frontmatter ausentes
- Dist validation: OK

Auditoria editorial complementar:

- 89 posts rastreados
- 0 fallback genérico
- 31/31 estilos públicos alcançáveis
- 0 duplicidades problemáticas
- `Blog structural closed: YES`
- `Styles structural closed: YES`
- `Editorial structural closed: YES`
- Cobertura de tradução editorial preexistente: 20/89 em EN e 20/89 em ES (não criada por esta frente)

## Estado Git / integração

- Checkout `main` original não foi alterado; continua preservando WIP concorrente.
- Worktree isolada criada diretamente de `origin/main`.
- `git fetch --all --prune` executado e `origin/main` confirmado em `1938ce7` antes da criação da branch.
- Commit principal desta frente: `0d3498e2dbf1876f980104efa070342834a6010e` (`chore(brand): canonicalize WG story and public claims`).
- Após o commit, o gate equivalente a `verify:deploy` foi reexecutado: 31 arquivos / 128 testes / 0 falhas, build Vite OK e `dist validation: ok` com 175 rotas.
- Arquivos gerados apenas por build/auditoria foram retirados do delta do commit; backups e scripts transitórios foram preservados em `tools/tmp/`, que é ignorado pelo Git.

## Próximo gate

1. Fazer commit seletivo dos arquivos desta frente na branch `chore/brand-canonical-20260915`.
2. Reexecutar gate completo sobre o commit.
3. Se GitHub/CI estiver operacional, push da branch e PR contra `main`.
4. Aguardar checks obrigatórios `build-and-test` e `deploy-gate-final`.
5. Só após checks verdes: merge protegido e acompanhar deploy Vercel do projeto `site-wgalmeida`.
6. Smoke público em `https://wgalmeida.com.br` e rotas `/sobre` e `/buildtech`.

## Regras de segurança / claims

Não publicar como fato verificado até reconciliação de fonte operacional: `480+ clientes`, `1.000+ propostas`, `284+/285+ clientes`, `R$10M+`, `mais de 280 obras` ou equivalentes.

A formulação pública preferencial para tempo de mercado é `Desde 2011`. A data exata `28/10/2011` permanece documentada internamente e deve ser tratada como marco histórico até confirmação final no ato societário primário.
