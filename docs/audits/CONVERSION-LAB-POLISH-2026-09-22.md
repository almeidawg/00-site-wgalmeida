# Conversion Lab Polish — 2026-09-22

## Contexto
Após ativar o Conversion Lab e o Turnstile, o artigo `/blog/como-calcular-custo-de-obra` mantinha um erro de rede `ERR_BLOCKED_BY_ORB` e carregava duas instâncias completas do Turnstile antes de qualquer intenção de conversão.

## Causa raiz
1. O hero editorial vinha de `unsplash.com/photos/.../download`, endpoint de download/página que o Chrome bloqueia como imagem por ORB em vez de um asset CDN próprio.
2. As duas capturas do artigo montavam `TurnstileWidget` imediatamente, disparando challenges Cloudflare ainda no topo da página.

## Correção
- Hero/card do artigo passam a usar assets `images.unsplash.com` estáveis através do manifesto principal de runtime.
- O manifesto gerado e a seleção editorial permanecem intactos; o override local tem precedência sem ampliar código gerado.
- Turnstile só monta quando a captura entra em viewport ou recebe foco. O backend continua exigindo token em Production.

## Prevenção
- Não usar URLs `/download` como `src` de imagem pública.
- Manifests gerados não devem ser usados para hotfix quando uma camada de override canônica já existe.
- Controles anti-bot pesados devem ser carregados por intenção/visibilidade, não no carregamento inicial de páginas editoriais longas.

## Validação
- `verify:fast`: 35 arquivos / 145 testes / 0 falhas.
- Build de produção: OK.
- Produção atual, antes do patch: 15–16 requests Cloudflare no carregamento inicial, 2 widgets Turnstile e 1 falha Unsplash `ERR_BLOCKED_BY_ORB`.
- Branch nova local: 0 requests Cloudflare no carregamento inicial, 0 widgets e 0 falhas Unsplash.
- Após a primeira captura entrar em viewport: 1 widget é ativado e começam as requests Cloudflare.
- Recursos iniciais observados: 44 → 35.
- Transferência inicial observada: ~1.122 MB → ~1.003 MB.
- O DCL local do preview Vite não é comparável ao edge de produção e foi excluído como critério de melhoria.

## Regra futura
Assets editoriais precisam usar endpoints de imagem; integrações de segurança de terceiros devem preservar o gate server-side, mas carregar no cliente apenas quando a intenção de conversão estiver próxima.
