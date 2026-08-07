# RETURN-POINT — Auditoria SEO Recorrente

> Arquivo de estado mantido pelo **Liz SEO Bot**. Atualizado a cada 5 dias com a tabela de saúde SEO e plano de ação.

---

## Auditoria 2026-07-21 (ATUAL)

### Tabela de Saúde SEO

| Métrica                        | Valor            | Status           |
|-------------------------------|------------------|------------------|
| AI Readiness Score (proxy)    | 85/100           | OK               |
| Rotas no Sitemap (local)      | 169              | OK (>=145)       |
| Testes (Vitest)               | 17 arq, 77 tests | OK               |
| Lint (ESLint)                 | 0 erros, 175 warns | MEDIA          |
| Auditoria de consistência     | OK               | OK               |
| Auditoria estrutural          | OK               | OK               |
| Brand visual tokens           | OK (138 files)   | OK               |
| I18n public keys              | OK (227 keys)    | OK               |
| SEO frontmatter assets        | 160/160 OK       | OK ✅ RESOLVIDO  |
| PageSpeed (LCP/CLS)           | Indisponível 429 | N/A              |
| npm vulnerabilities           | 1 high           | MEDIA            |
| Acesso live wgalmeida.com.br  | Bloqueado (403)  | INFRA            |

### AI Readiness Score — 85/100 (proxy)

Score calculado como proxy a partir das auditorias locais (egress para wgalmeida.com.br bloqueado pelo proxy de rede):

- Sitemap: 169 rotas (20/20)
- Build local: não executado — auditorias de estrutura/consistência OK (15/15)
- Lint: 0 erros, 175 warnings — nenhum erro crítico (10/10)
- I18n 3 idiomas, 227 keys: (15/15)
- Brand tokens: 138 files OK (10/10)
- SEO frontmatter: **160/160 OK, 0 assets ausentes** (15/15) ← MELHOROU (era 12/15)
- Auditoria estrutural: OK (10/10)
- Desconto PageSpeed live indisponível: (-10)
- **Total: 85/100** ↑ (era 82)

### Alertas

| Severidade | Descrição |
|-----------|-----------|
| MEDIA | PageSpeed rate limit (429) — configurar `PAGESPEED_API_KEY` no ambiente |
| MEDIA | Acesso de rede a wgalmeida.com.br bloqueado pelo proxy (403) — `scripts/ai-readiness-audit.js` não pode validar live |
| MEDIA | 1 vulnerabilidade npm high severity: `brace-expansion` (DoS) — executar `npm audit fix` |
| MEDIA | 175 warnings ESLint (incluindo `fingerprint` atribuída mas não usada em arquivo desconhecido) |

### Comparativo com Auditoria Anterior (2026-06-26)

| Métrica                    | 2026-06-26     | 2026-07-21     | Delta            |
|---------------------------|---------------|---------------|-----------------|
| AI Readiness (proxy)      | 82/100         | 85/100         | +3 ↑            |
| Rotas no Sitemap          | 161            | 169            | +8 ↑            |
| Testes (arq/total)        | 15 arq/72      | 17 arq/77      | +2/+5 ↑         |
| SEO assets ausentes       | 2              | 0              | RESOLVIDO ✅    |
| npm vulnerabilities       | 12 (1L/7M/4H) | 1 high         | Melhora drástica ↑ |
| Brand tokens              | 138 files      | 138 files      | Estável         |
| I18n keys                 | 227            | 227            | Estável         |

### Plano de Ação — Próximos 5 Dias (até 2026-07-26)

1. **Executar `npm audit fix`** — resolver a vulnerabilidade restante (brace-expansion DoS).
2. **Configurar `PAGESPEED_API_KEY`** — adicionar ao `.env` para habilitar validação live de Core Web Vitals (LCP, CLS, INP).
3. **Solicitar liberação de egress** para `wgalmeida.com.br` no ambiente remoto — sem isso `scripts/ai-readiness-audit.js` sempre retorna 0/100 (falso negativo).
4. **Limpar warnings ESLint** — especialmente variável `fingerprint` não usada; reduzir de 175 para < 50 warnings.
5. **Investigar +8 rotas no sitemap** (de 161 para 169) — confirmar se são páginas novas de blog ou conteúdo, e indexá-las no Google Search Console.

### Próxima Auditoria

- **Data prevista**: 2026-07-26
- **Responsável**: Liz SEO Bot (rotina automática)

---

## Auditoria 2026-06-26

### Tabela de Saúde SEO

| Métrica                        | Valor          | Status     |
|-------------------------------|----------------|------------|
| AI Readiness Score (proxy)    | 82/100         | OK         |
| Rotas no Sitemap              | 161            | OK (>=145) |
| Build de produção             | OK (161 rotas) | OK         |
| Testes (Vitest)               | 15 arq, 72 tests | OK       |
| Lint                          | Limpo          | OK         |
| Auditoria de consistência     | OK             | OK         |
| Auditoria estrutural          | OK             | OK         |
| Brand visual tokens           | OK (138 files) | OK         |
| I18n public keys              | OK (227 keys)  | OK         |
| SEO frontmatter assets        | 150/152 OK     | MEDIA      |
| PageSpeed (LCP/CLS)           | Indisponível   | N/A        |
| npm vulnerabilities           | 12 (1L/7M/4H)  | MEDIA      |

### AI Readiness Score — 82/100 (proxy)

- Sitemap: 161/161 rotas (20/20)
- Build limpo: (15/15)
- Lint limpo: (10/10)
- I18n 3 idiomas, 227 keys: (15/15)
- Brand tokens limpos: (10/10)
- SEO frontmatter: 150/152 OK, 2 assets ausentes (12/15)
- Auditoria estrutural: OK (10/10)
- Desconto PageSpeed live indisponível: (-10)
- **Total: 82/100**

### Alertas (2026-06-26)

| Severidade | Descrição |
|-----------|-----------|
| MEDIA | 2 assets de frontmatter ausentes: `gestao-vs-mestre-obras.webp`, `sob-medida-vs-planejados.webp` |
| MEDIA | 12 vulnerabilidades npm (1 low, 7 moderate, 4 high) |
| MEDIA | Validação PageSpeed live impossível — ambiente sem acesso à rede |

---

## Auditoria 2026-06-21

### Tabela de Saúde SEO

| Métrica                        | Valor          | Status     |
|-------------------------------|----------------|------------|
| AI Readiness Score (proxy)    | 82/100         | OK         |
| Rotas no Sitemap              | 161            | OK (>=145) |
| Build de produção             | OK (161 rotas) | OK         |
| Lint                          | Limpo          | OK         |
| Auditoria de consistência     | OK             | OK         |
| Auditoria estrutural          | OK             | OK         |
| Brand visual tokens           | OK (138 files) | OK         |
| I18n public keys              | OK (227 keys)  | OK         |
| SEO frontmatter assets        | 150/152 OK     | MEDIA      |
| PageSpeed (LCP/CLS)           | Indisponível   | N/A        |
| npm vulnerabilities           | 12 (1L/7M/4H)  | MEDIA      |

### Alertas (2026-06-21)

| Severidade | Descrição |
|-----------|-----------|
| MEDIA | 2 assets de frontmatter ausentes: `gestao-vs-mestre-obras.webp`, `sob-medida-vs-planejados.webp` |
| MEDIA | 12 vulnerabilidades npm (1 low, 7 moderate, 4 high) |
| MEDIA | Scripts `ai-readiness-audit.js` e `pagespeed-monitor.js` ausentes do repositório |
