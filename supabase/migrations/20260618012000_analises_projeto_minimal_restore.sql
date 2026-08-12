-- ============================================================================
-- MIGRATION: Analises Projeto Minimal Restore
-- Projeto: WGEasy Core Hub
-- Data: 2026-06-18
-- Objetivo:
--   Restaurar compatibilidade do modulo Analise de Projeto com frontend atual.
--   REST readiness indicou ausencia de public.analises_projeto no schema cache.
--
-- Escopo:
--   Cria tabelas minimas usadas por frontend/src/lib/analiseProjetoApi.ts.
--   Nao importa dados, nao promove lead, nao altera propostas.
-- ============================================================================

BEGIN;
CREATE TABLE IF NOT EXISTS public.analises_projeto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE RESTRICT,
  oportunidade_id UUID NULL REFERENCES public.oportunidades(id) ON DELETE SET NULL,
  proposta_id UUID NULL REFERENCES public.propostas(id) ON DELETE SET NULL,

  numero TEXT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NULL,

  tipo_projeto TEXT NOT NULL DEFAULT 'reforma',
  tipo_imovel TEXT NULL,
  area_total NUMERIC(12,2) NULL,
  pe_direito_padrao NUMERIC(6,2) NOT NULL DEFAULT 2.70,
  endereco_obra TEXT NULL,
  padrao_construtivo TEXT NULL,

  plantas_urls TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  memorial_descritivo TEXT NULL,
  contrato_texto TEXT NULL,

  estilo_conceito TEXT NULL,
  intervencao_principal TEXT NULL,
  proximos_passos TEXT[] NULL,
  perfil_cliente TEXT NULL,

  analise_ia JSONB NULL,
  prompt_utilizado TEXT NULL,
  provedor_ia TEXT NULL,
  modelo_ia TEXT NULL,
  confiabilidade_analise NUMERIC(5,4) NOT NULL DEFAULT 0,
  tempo_processamento_ms INTEGER NULL,

  total_ambientes INTEGER NOT NULL DEFAULT 0,
  total_area_piso NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_area_paredes NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_perimetro NUMERIC(12,2) NOT NULL DEFAULT 0,

  status TEXT NOT NULL DEFAULT 'rascunho',
  criado_por UUID NULL,
  atualizado_por UUID NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT analises_projeto_status_check CHECK (status IN ('rascunho','analisando','analisado','aprovado','vinculado')),
  CONSTRAINT analises_projeto_tipo_check CHECK (tipo_projeto IN ('reforma','obra_nova','ampliacao'))
);
CREATE TABLE IF NOT EXISTS public.analises_projeto_ambientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analise_id UUID NOT NULL REFERENCES public.analises_projeto(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NULL,
  codigo TEXT NULL,
  largura NUMERIC(12,2) NULL,
  comprimento NUMERIC(12,2) NULL,
  pe_direito NUMERIC(6,2) NOT NULL DEFAULT 2.70,
  area_piso NUMERIC(12,2) NULL,
  area_teto NUMERIC(12,2) NULL,
  perimetro NUMERIC(12,2) NULL,
  area_paredes_bruta NUMERIC(12,2) NULL,
  area_paredes_liquida NUMERIC(12,2) NULL,
  portas JSONB NOT NULL DEFAULT '[]'::jsonb,
  janelas JSONB NOT NULL DEFAULT '[]'::jsonb,
  vaos JSONB NOT NULL DEFAULT '[]'::jsonb,
  envidracamentos JSONB NOT NULL DEFAULT '[]'::jsonb,
  area_vaos_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  tomadas_110v INTEGER NOT NULL DEFAULT 0,
  tomadas_220v INTEGER NOT NULL DEFAULT 0,
  tomadas_especiais JSONB NOT NULL DEFAULT '[]'::jsonb,
  pontos_iluminacao INTEGER NOT NULL DEFAULT 0,
  interruptores_simples INTEGER NOT NULL DEFAULT 0,
  interruptores_paralelo INTEGER NOT NULL DEFAULT 0,
  interruptores_intermediario INTEGER NOT NULL DEFAULT 0,
  circuitos JSONB NOT NULL DEFAULT '[]'::jsonb,
  pontos_agua_fria INTEGER NOT NULL DEFAULT 0,
  pontos_agua_quente INTEGER NOT NULL DEFAULT 0,
  pontos_esgoto INTEGER NOT NULL DEFAULT 0,
  pontos_gas INTEGER NOT NULL DEFAULT 0,
  tubulacao_seca JSONB NOT NULL DEFAULT '[]'::jsonb,
  piso_tipo TEXT NULL,
  piso_area NUMERIC(12,2) NULL,
  parede_tipo TEXT NULL,
  parede_area NUMERIC(12,2) NULL,
  teto_tipo TEXT NULL,
  teto_area NUMERIC(12,2) NULL,
  rodape_tipo TEXT NULL,
  rodape_ml NUMERIC(12,2) NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  observacoes TEXT NULL,
  alertas TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  origem TEXT NOT NULL DEFAULT 'manual',
  editado_manualmente BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.analises_projeto_elementos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analise_id UUID NOT NULL REFERENCES public.analises_projeto(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  descricao TEXT NULL,
  quantidade NUMERIC(12,2) NOT NULL DEFAULT 1,
  largura NUMERIC(12,2) NULL,
  altura NUMERIC(12,2) NULL,
  origem TEXT NOT NULL DEFAULT 'manual',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.analises_projeto_acabamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analise_id UUID NOT NULL REFERENCES public.analises_projeto(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  ambiente TEXT NULL,
  material TEXT NULL,
  descricao TEXT NULL,
  area_m2 NUMERIC(12,2) NULL,
  area NUMERIC(12,2) NULL,
  metragem_linear NUMERIC(12,2) NULL,
  quantidade NUMERIC(12,2) NULL,
  origem TEXT NOT NULL DEFAULT 'manual',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.analises_projeto_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analise_id UUID NOT NULL REFERENCES public.analises_projeto(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL DEFAULT 'geral',
  tipo TEXT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  unidade TEXT NOT NULL DEFAULT 'un',
  quantidade NUMERIC(12,2) NULL,
  area NUMERIC(12,2) NULL,
  metragem_linear NUMERIC(12,2) NULL,
  especificacoes JSONB NOT NULL DEFAULT '{}'::jsonb,
  termo_busca TEXT NULL,
  palavras_chave TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  categoria_sugerida TEXT NULL,
  ambiente_nome TEXT NULL,
  ambientes_nomes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ordem INTEGER NOT NULL DEFAULT 0,
  origem TEXT NOT NULL DEFAULT 'manual',
  selecionado BOOLEAN NOT NULL DEFAULT TRUE,
  importado_para_proposta BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_analises_projeto_cliente ON public.analises_projeto(cliente_id);
CREATE INDEX IF NOT EXISTS idx_analises_projeto_oportunidade ON public.analises_projeto(oportunidade_id);
CREATE INDEX IF NOT EXISTS idx_analises_projeto_status ON public.analises_projeto(status);
CREATE INDEX IF NOT EXISTS idx_analises_ambientes_analise ON public.analises_projeto_ambientes(analise_id);
CREATE INDEX IF NOT EXISTS idx_analises_elementos_analise ON public.analises_projeto_elementos(analise_id);
CREATE INDEX IF NOT EXISTS idx_analises_acabamentos_analise ON public.analises_projeto_acabamentos(analise_id);
CREATE INDEX IF NOT EXISTS idx_analises_servicos_analise ON public.analises_projeto_servicos(analise_id);
CREATE OR REPLACE VIEW public.vw_analises_projeto_completas AS
SELECT
  a.*,
  p.nome AS cliente_nome,
  p.email AS cliente_email,
  p.telefone AS cliente_telefone,
  o.titulo AS oportunidade_titulo,
  pr.titulo AS proposta_titulo,
  pr.numero AS proposta_numero
FROM public.analises_projeto a
LEFT JOIN public.pessoas p ON p.id = a.cliente_id
LEFT JOIN public.oportunidades o ON o.id = a.oportunidade_id
LEFT JOIN public.propostas pr ON pr.id = a.proposta_id;
COMMENT ON TABLE public.analises_projeto IS
  'Analise tecnica pre-proposta. Restauracao minima para compatibilidade do modulo WGEasy.';
COMMENT ON VIEW public.vw_analises_projeto_completas IS
  'View de compatibilidade para listagem de analises com cliente/oportunidade/proposta.';
COMMIT;
