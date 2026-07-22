# Fonte local e operacional — Easy Real State e Obra Easy

Atualizado em `2026-07-21` após auditoria governada de GitHub, Vercel e produção.

## Regra principal

Os produtos abaixo possuem repositórios próprios. As páginas existentes em `site-wgalmeida` são apenas landings e integrações de aquisição; não são a fonte principal dos SaaS.

Nunca iniciar evolução a partir de cópia histórica, pasta de piloto, build exportado, embed ou diretório encontrado apenas por nome. Antes de editar, validar Git, branch, remote, deployment e domínio.

## Easy Real State

- Repositório canônico atual: `almeidawg/02-easy-real-state`
- Branch principal: `main`
- Domínio oficial: `https://easyrealstate.wgalmeida.com.br`
- Projeto Vercel observado: `easyrealstate`
- Stack observada: Next.js + Supabase + Vercel
- Rotas públicas críticas:
  - `/`
  - `/calculo`
  - `/evf`
  - `/login`
  - `/cadastro`
  - `/planos`
  - `/demo/index.html`

O deployment utiliza o package localizado em `app/`, conforme `vercel.json` da raiz. A pasta aninhada `app/app/` é a árvore de rotas do Next.js, não uma raiz alternativa para comandos Git.

## Obra Easy

- Repositório canônico atual: `almeidawg/03-obra-easy`
- Branch principal: `main`
- Domínio oficial: `https://obraeasy.wgalmeida.com.br`
- Projeto Vercel observado: `obraeasy`
- Stack observada: React + TypeScript + Vite + Supabase + Vercel
- Estrutura:
  - `frontend/`
  - `backend/`
  - `api/`
  - `database/`
- Rotas públicas críticas:
  - `/`
  - `/evf4`
  - `/entrar`
  - `/cadastro`
  - `/parceiro/entrar`
  - `/privacidade`
  - `/termos`

## Pastas antigas

As referências anteriores sob `C:\Users\Atendimento\Documents\...` não existem no host auditado em 2026-07-21 e não devem ser usadas como ponteiro canônico.

Clones temporários criados em `C:\WG_TEMP\...` são ambientes de laboratório e podem ser removidos após merge, validação de produção e preservação das evidências. Eles não substituem o repositório remoto como fonte de verdade.

## Gate obrigatório antes de qualquer ação

Validar e registrar:

1. produto e repositório;
2. root e package realmente implantado;
3. branch e HEAD;
4. remote e divergência com `origin/main`;
5. working tree;
6. domínio e projeto Vercel;
7. deployment associado ao SHA;
8. runtime Node/npm;
9. Supabase e políticas quando houver alteração de dados;
10. return point mais recente.

## Fluxo de entrega

`branch curta -> backup -> patch mínimo -> testes -> auditoria visual -> commit -> push -> PR -> checks -> merge normal -> deployment do SHA -> smoke de produção -> return point`

Não fazer push direto em `main`, não usar bypass, não executar `npm audit fix --force` e não expor segredos.