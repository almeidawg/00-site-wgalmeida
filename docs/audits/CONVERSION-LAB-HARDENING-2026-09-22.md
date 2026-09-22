# Conversion Lab Hardening — 2026-09-22

## Contexto
O Conversion Lab do blog entrou em produção com captura real de leads, mas o pós-deploy revelou dois riscos independentes: configuração Turnstile com BOM invisível e telemetria de contexto `blog` incompatível com a constraint histórica do banco.

## Causa raiz
1. Valores Turnstile gravados via pipeline PowerShell/Vercel receberam caracteres BOM/whitespace antes da chave.
2. `normalizeConversionContext()` já convertia `blog:...` para `blog`, porém a constraint `site_conversion_events_context_check` ainda não aceitava `blog`.

## Evidências
- Cloudflare Turnstile reportou `Invalid input for parameter "sitekey"` em produção.
- Lead `blog:...` retornou `saved` com `X-WG-Telemetry: failed`.
- A migration original aceitava apenas `moodboard`, `buildtech`, `contact` e `other`.

## Correção
- Sanitizar sitekey no frontend removendo BOM e whitespace antes de `turnstile.render`.
- Sanitizar secret no backend antes de `siteverify`.
- Expandir a constraint de contexto para incluir `blog`.

## Prevenção
- Nunca assumir que env externa chega byte-a-byte limpa.
- Sanitizar valores textuais de configuração na fronteira de consumo.
- Toda nova categoria de telemetria deve atualizar simultaneamente normalizador, schema/constraint, testes e dashboard.

## Validação
- `verify:fast`: 35 arquivos / 144 testes / 0 falhas.
- Build de produção: OK.
- Migration `20260922114000_conversion_telemetry_blog_context.sql` aplicada e sincronizada no Supabase `ahlqzzkxuutwoepirpzr`.
- Lead sintético `blog:...`: HTTP 200, `outcome=saved`, `X-WG-Telemetry=persisted`.

## Regra futura
Configuração externa e schema de observabilidade são um único contrato operacional: alteração em uma ponta exige teste de integração e compatibilidade explícita na outra antes de produção.
