# Return point — Candidato integrado ICCRI, custos e prazos

**Data de referência:** 9/10 de novembro de 2026 (horário Brasil/UTC)  
**Projeto:** site institucional WG Almeida, repo `almeidawg/00-site-wgalmeida`  
**Status:** PARCIAL — integração local validada; deployment ainda não realizado.

## Identidade comprovada
- Worktree base: `site-estimativas-governadas-20261109`, branch `fix/site-estimativas-governadas-20261109`, commits anteriores `b26060c`, `45c34ff`, `0bdaaa3`.
- Worktree candidata: `site-iccri-release-candidate-20261109`, branch `fix/site-iccri-release-candidate-20261109`, criada pelo MCP com sucesso sobre `origin/main`, que apontava para `8ea940f` na criação.
- Vercel de produção: projeto `site-wgalmeida`, id `prj_uNqhTiNaZx3O1CxDlBXhNVKdIIOM`, team `team_PZqrfArEACLjprLuIKVVA7Ch`. Produção foi confirmada em deployment READY `dpl_5E1BfTz4iRd5k1KAjxdFAmpqeyZ1`, Git SHA `8ea940f05d99abe905c179fe311a4e2f0a8b4e3c` antes desta etapa.
- A pasta/worktree não possui link Vercel local; resolver deploy exclusivamente contra projeto id confirmado, com staging/E2E antes da promoção, não inferir pelo diretório.
- ICCRI standalone `07-iccri-motor-custo`: não é Git deployável identificado. Dados do Supabase WGEasy canônico `xkvuhixxpfonfcwrvknm` continuam sem snapshot público homologado.

## Trabalho integrado e rastreabilidade
- Bloqueio antigo de lease Git expirou e foi reconciliado com `resource_lease_reconcile`; nova worktree criada em novo diretório pelo gate oficial, sem sobrescrever a origem.
- Foram transportados seletivamente 16 arquivos (código, testes e return point) do worktree de auditoria para o candidato baseado no main atual; os arquivos existentes foram copiados antes para `_AUDIT_BACKUPS_ICCRI_20261110`. Não copiaram backups antigos nem alterações de projetos externos.
- `api/wgeasy-public-estimate.js` — proteção fail-closed também no servidor. Endpoint não consulta mais faixas históricas `iccri_padroes_canonicos` nem tabela regional legada para formar resposta pública. Exige view exclusiva `iccri_public_estimate_v1`, atualmente ausente no projeto canônico, e confere status homologado, projeto, UF/padrão, unidade BRL/m², código de escopo/versão, referências de aprovação e calibração, hash de snapshot com forma SHA256, amostra mínima e datas de aprovação/validade. Fonte ausente ou contrato divergente -> HTTP 503 sem preço nem informações sobre banco/credenciais. O hash é verificado **quanto ao formato, não à assinatura criptográfica**: a aprovação da publicação ainda requer governança na origem.
- UI `WGEasyEstimateCalculator`, `OrcadorInteligente`, páginas `Process`, `ICCRI`, `ReformaApartamentoSP`, `ICCRILinksBlock` e painel editorial protegem contra preço, prazo e texto não homologado e melhoram acessibilidade.
- Os testes de API incluem 404, ausência de aprovação, campos inconsistentes, parâmetros inválidos e caso simulado homologado. O sucesso simulado NÃO implica existência de snapshot real.

## Evidências da worktree candidata
- `npm ci`: OK, 838 pacotes instalados, lockfile aplicado. Dependências auditadas apontaram **11 vulnerabilidades (9 moderadas, 2 altas, incluindo dependências de desenvolvimento)**.
- `npm audit --omit=dev`: FAIL por **2 vulnerabilidades moderadas em react-router / react-router-dom**; ferramenta sugere upgrade major para v7.18.5. NÃO usar `npm audit fix --force` sem projeto de migração, testes de rotas, CSRF/open-redirect e critérios de aceite. Estas vulnerabilidades não foram introduzidas pelos arquivos ICCRI, mas continuam risco para release.
- `npm run lint`: PASS.
- `npm run verify:fast`: PASS, **71 arquivos de teste, 351 testes**; os erros simulados 502/503 e warnings de testes React são esperados nos casos exercitados.
- `npm run build`: PASS, 2.077 módulos transformados, dist e rotas SEO geradas.
- Artefatos incidentais de build (sitemaps e snapshot Vitest) copiados como backup e restaurados seletivamente; nenhum código de SEO atual do main foi sobrescrito.
- `git diff --check`: PASS antes da compilação; repetir antes do commit.

## Gates remanescentes antes de publicação
1. Criar commit **local seletivo** apenas dos arquivos fonte e testes verificados; confirmar SHA, branch e status Git.
2. Executar integração/QA com esse SHA em preview real e conferir `/iccri`, `/processo`, `/solicite-proposta`, `/reforma-apartamento-sp` em 320/375/390 px e desktop; console, acessibilidade, layout, rede e API, com evidência.
3. Revisar advisories React Router com plano técnico de atualização/migração e avaliar política de aceitação de risco. Sem inventar que vulnerabilidades estão corrigidas.
4. Confrontar o snapshot de publicação ICCRI ausente com a versão esperada na API; em produção essa API deverá permanecer 503 até conteúdo homologado. Não criar dado fictício nem importar Pricelist RAW.
5. Confirmar IAM e projeto Vercel por ID, variável de segurança VITE_INTERNAL_API_KEY somente por nome mascarado, checar diff entre SHA testado e remoto, validar rollback com deployment anterior.
6. Push, PR, preview e promoção apenas com gates de governança do owner e evidências do mesmo SHA. Sem alterar produção para forçar entrega.

## Estado final
**RESOLVIDO:** worktree main atual criada, 16 arquivos integrados, backup, API/UX fail-closed testados, 351 testes e build.  
**PENDENTE:** commit de release, revisão de segurança, preview, E2E, homologação do motor ICCRI e promoção de produção.  
**RISCO VISTO:** advisories 2 moderados runtime + 2 high dev, ausência do snapshot ICCRI, Vercel link local ausente, Turnstile E2E humano pendente.  
**Classificação:** PARCIAL / RISCO.
