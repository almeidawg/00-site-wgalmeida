# RETURN-POINT — Histórico de Auditorias SEO Recorrentes

> Arquivo mantido pelo Liz SEO Bot. Cada auditoria é adicionada ao topo, mantendo as últimas 3.

---

## Auditoria SEO — 2026-07-11

### Tabela de Saúde SEO

| Métrica                        | Valor                    | Status     |
|-------------------------------|--------------------------|------------|
| AI Readiness Score (proxy)    | 79/100                   | OK         |
| Rotas no Sitemap (local)      | 161                      | OK (>=145) |
| Rotas no Sitemap (live)       | Indisponível (403)       | N/A        |
| Testes (Vitest)               | 15 arquivos, 72 testes   | OK         |
| ESLint                        | 175 warnings, 0 erros    | MEDIA ⚠️   |
| Auditoria de consistência     | OK                       | OK         |
| Auditoria estrutural          | OK                       | OK         |
| Brand visual tokens           | OK (138 files)           | OK         |
| I18n public keys              | OK (227 keys)            | OK         |
| OG frontmatter assets         | 8/8 OK                   | OK         |
| PageSpeed (LCP/CLS)           | Indisponível (429)       | N/A        |
| npm vulnerabilities           | 11 (1L/6M/4H)            | MEDIA      |
| Scripts AI Readiness criados  | Sim (criados pós-06-26)  | OK ✅      |

### AI Readiness Score — 79/100 (proxy)

Score calculado localmente (ambiente remoto bloqueia egress para wgalmeida.com.br):

| Item                                   | Pontos  |
|----------------------------------------|---------|
| Sitemap: 161/161 rotas                 | 20/20   |
| Consistência, estrutural, imports: OK  | 15/15   |
| Lint: 175 warnings, 0 erros (regress.)| 7/10    |
| I18n 3 idiomas, 227 keys              | 15/15   |
| Brand tokens: 138 files OK             | 10/10   |
| OG frontmatter: 8/8 OK                | 12/15   |
| Estrutural: OK                         | 10/10   |
| PageSpeed live: indisponível           | -10     |
| **Total**                              | **79/100** |

### Alertas

| Severidade | Descrição |
|------------|-----------|
| MEDIA | **Nova regressão ESLint**: 175 warnings detectados (0 errors). Anterior era "Limpo". Principal: `no-unused-vars` em `fingerprint`. Requer triagem e correção. |
| MEDIA | 11 vulnerabilidades npm (1 low, 6 moderate, 4 high) — ligeira melhora de 12→11 desde 2026-06-26; recomendado `npm audit fix`. |
| MEDIA | Validação PageSpeed live impossível (429 rate limit, sem `PAGESPEED_API_KEY`). |
| MEDIA | Validação sitemap live impossível — ambiente remoto bloqueado pela política de rede (HTTP 403). |
| INFO | 2 assets de frontmatter de blog (webp) pendentes desde 2026-06-21 — impossível verificar sem build de produção. |

### Progresso vs. Plano Anterior (2026-06-26)

| Item do Plano Anterior                        | Status        |
|-----------------------------------------------|---------------|
| Scripts AI Readiness e PageSpeed criados       | ✅ Concluído  |
| 2 assets de frontmatter ausentes corrigidos    | ❓ Sem dados  |
| `npm audit fix` executado                      | ⚠️ Parcial (12→11) |
| Configurar egress no ambiente remoto           | ❌ Pendente   |
| Configurar `PAGESPEED_API_KEY`                | ❌ Pendente   |

### Comparativo com Auditorias Anteriores

| Métrica                    | 2026-06-21 | 2026-06-26 | 2026-07-11 | Delta      |
|----------------------------|-----------|-----------|------------|------------|
| AI Readiness (proxy)       | 82        | 82        | 79         | -3 (ESLint)|
| Rotas no Sitemap           | 161       | 161       | 161        | Estável    |
| Testes                     | 72        | 72        | 72         | Estável    |
| I18n keys                  | 227       | 227       | 227        | Estável    |
| Brand tokens files         | 138       | 138       | 138        | Estável    |
| ESLint warnings            | 0         | 0         | 175        | ⚠️ Regress.|
| npm vulnerabilities        | 12        | 12        | 11         | -1 (melhora)|

### Notas da Execução

- **Ambiente**: Remote container (Claude Code on the web). Egress para `wgalmeida.com.br` bloqueado pela política de rede (HTTP 403 em todas as requisições live).
- **Scripts ai-readiness-audit.js e pagespeed-monitor.js**: executados com sucesso localmente. O score 0 retornado pelo script é artefato do bloqueio de rede, não reflete o estado real.
- **Sitemap local**: `public/sitemap.xml` — 161 rotas (estável).
- **Todas as auditorias locais passaram**: consistência, estrutural, brand visual tokens, i18n, imports, testes.
- **Regressão ESLint**: 175 warnings detectados com `--max-warnings=0`. São todos warnings (sem erros), mas representam drift técnico. Triagem necessária.

### Plano de Ação — Próximos 5 Dias (até 2026-07-16)

1. **[ALTA] Corrigir regressão ESLint** — investigar e eliminar os 175 warnings (foco em `no-unused-vars`). Meta: retornar ao estado "Limpo".
2. **[MEDIA] Corrigir 2 assets de frontmatter ausentes** — pendente desde 2026-06-21. Verificar `gestao-vs-mestre-obras.webp` e `sob-medida-vs-planejados.webp`.
3. **[MEDIA] Executar `npm audit fix`** — resolver as 11 vulnerabilidades npm restantes.
4. **[MEDIA] Configurar `PAGESPEED_API_KEY`** — variável de ambiente no Vercel e no ambiente de CI para habilitar auditoria PageSpeed.
5. **[INFO] Configurar egress** — adicionar `wgalmeida.com.br` ao allowlist de rede do ambiente remoto.

### Próxima Auditoria

- **Data prevista**: 2026-07-16
- **Responsável**: Liz SEO Bot (rotina automática)

---

## Auditoria SEO — 2026-06-26

### Tabela de Saúde SEO

| Métrica                        | Valor          | Status     |
|--------------------------------|----------------|------------|
| AI Readiness Score (proxy)     | 82/100         | OK         |
| Rotas no Sitemap               | 161            | OK (>=145) |
| Build de produção              | OK (161 rotas) | OK         |
| Testes (Vitest)                | 15 arquivos, 72 testes | OK |
| Lint                           | Limpo          | OK         |
| Auditoria de consistência      | OK             | OK         |
| Auditoria estrutural           | OK             | OK         |
| Brand visual tokens            | OK (138 files) | OK         |
| I18n public keys               | OK (227 keys)  | OK         |
| SEO frontmatter assets         | 150/152 OK     | MEDIA      |
| PageSpeed (LCP/CLS)            | Indisponível   | N/A        |
| npm vulnerabilities            | 12 (1L/7M/4H)  | MEDIA      |

### Alertas

| Severidade | Descrição |
|------------|-----------|
| MEDIA | 2 assets de frontmatter ausentes: `arquiteto-vs-mestre-de-obras-direto.md` -> `/images/blog/gestao-vs-mestre-obras.webp`, `marcenaria-sob-medida-vs-planejados.md` -> `/images/blog/sob-medida-vs-planejados.webp` |
| MEDIA | 12 vulnerabilidades npm (1 low, 7 moderate, 4 high) |
| MEDIA | Scripts de auditoria AI Readiness e PageSpeed Monitor não criados |
| MEDIA | Validação PageSpeed live impossível — ambiente sem acesso de rede |

### Plano de Ação — 2026-06-26 a 2026-07-01

1. Criar `scripts/ai-readiness-audit.js`
2. Criar `scripts/pagespeed-monitor.js`
3. Corrigir 2 assets de frontmatter ausentes
4. Executar `npm audit fix`
5. Configurar egress no ambiente remoto

---

## Auditoria SEO — 2026-06-21

### Tabela de Saúde SEO

| Métrica                        | Valor          | Status     |
|--------------------------------|----------------|------------|
| AI Readiness Score (proxy)     | 82/100         | OK         |
| Rotas no Sitemap               | 161            | OK (>=145) |
| Build de produção              | OK (161 rotas) | OK         |
| Lint                           | Limpo          | OK         |
| Auditoria de consistência      | OK             | OK         |
| Auditoria estrutural           | OK             | OK         |
| Brand visual tokens            | OK (138 files) | OK         |
| I18n public keys               | OK (227 keys)  | OK         |
| SEO frontmatter assets         | 150/152 OK     | MEDIA      |
| PageSpeed (LCP/CLS)            | Indisponível   | N/A        |
| npm vulnerabilities            | 12 (1L/7M/4H)  | MEDIA      |

### Alertas

| Severidade | Descrição |
|------------|-----------|
| MEDIA | 2 assets de frontmatter ausentes: `gestao-vs-mestre-obras.webp`, `sob-medida-vs-planejados.webp` |
| MEDIA | 12 vulnerabilidades npm |
| MEDIA | Scripts AI Readiness e PageSpeed não existiam no repo |
| MEDIA | Validação PageSpeed live impossível |

### Plano de Ação — 2026-06-21 a 2026-06-26

1. Criar scripts AI Readiness e PageSpeed Monitor
2. Corrigir assets de frontmatter ausentes
3. Executar `npm audit fix`
4. Configurar egress no ambiente remoto

---

## Histórico Resumido

| Data       | AI Readiness | Sitemap | Alertas Críticos | Alertas Médios | ESLint |
|------------|-------------|---------|------------------|----------------|--------|
| 2026-07-11 | 79 (proxy)  | 161     | 0                | 4              | 175w   |
| 2026-06-26 | 82 (proxy)  | 161     | 0                | 4              | Limpo  |
| 2026-06-21 | 82 (proxy)  | 161     | 0                | 4              | Limpo  |
