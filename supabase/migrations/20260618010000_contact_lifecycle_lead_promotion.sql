-- ============================================================================
-- MIGRATION: Contact Lifecycle + Lead Promotion
-- Projeto: WGEasy Core Hub
-- Data: 2026-06-18
-- Objetivo:
--   Separar contato importado/sincronizado de lead ativo.
--   Um contato so entra na jornada comercial quando houver solicitacao real,
--   instrucao humana ou intencao detectada pela Liz/ecossistema.
--
-- Idempotente: usa IF NOT EXISTS e objetos substituiveis.
-- Nao importa contatos, nao promove registros existentes automaticamente.
-- ============================================================================

BEGIN;
-- -----------------------------------------------------------------------------
-- 1) Pessoa continua sendo a base de contato, mas ganha lifecycle comercial.
-- -----------------------------------------------------------------------------
ALTER TABLE public.pessoas
  ADD COLUMN IF NOT EXISTS contact_stage TEXT DEFAULT 'contato',
  ADD COLUMN IF NOT EXISTS lead_promoted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lead_promoted_by UUID DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lead_source TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lead_source_ref TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lead_promotion_reason TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lead_confidence NUMERIC(5,4) DEFAULT NULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'pessoas'
      AND constraint_name = 'pessoas_contact_stage_check'
  ) THEN
    ALTER TABLE public.pessoas
      ADD CONSTRAINT pessoas_contact_stage_check CHECK (
        contact_stage IN ('contato','lead_potencial','lead_ativo','cliente','arquivado')
      );
  END IF;
END;
$$;
COMMENT ON COLUMN public.pessoas.contact_stage IS
  'Lifecycle comercial do contato: contato, lead_potencial, lead_ativo, cliente, arquivado.';
COMMENT ON COLUMN public.pessoas.lead_promoted_at IS
  'Data/hora em que o contato foi promovido para lead ativo.';
COMMENT ON COLUMN public.pessoas.lead_source IS
  'Origem da promocao para lead: manual, liz, whatsapp, email, formulario, google_contacts, outro.';
COMMENT ON COLUMN public.pessoas.lead_promotion_reason IS
  'Motivo sanitizado que justificou a promocao do contato para lead.';
COMMENT ON COLUMN public.pessoas.lead_confidence IS
  'Confianca da classificacao automatica quando a promocao veio da Liz/ecossistema.';
-- -----------------------------------------------------------------------------
-- 2) Interacoes de contato: trilha auditavel antes de virar lead.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  oportunidade_id UUID NULL REFERENCES public.oportunidades(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  source_ref TEXT NULL,
  channel TEXT NULL,
  direction TEXT NOT NULL DEFAULT 'inbound',
  summary TEXT NULL,
  sanitized_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  intent TEXT NULL,
  intent_confidence NUMERIC(5,4) NULL,
  detected_by TEXT NOT NULL DEFAULT 'liz',
  requires_human_review BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT contact_interactions_direction_check CHECK (direction IN ('inbound','outbound','internal')),
  CONSTRAINT contact_interactions_confidence_check CHECK (intent_confidence IS NULL OR (intent_confidence >= 0 AND intent_confidence <= 1))
);
COMMENT ON TABLE public.contact_interactions IS
  'Interacoes e sinais detectados antes/depois de um contato virar lead. Nao deve armazenar payload bruto sensivel.';
COMMENT ON COLUMN public.contact_interactions.sanitized_payload IS
  'Payload higienizado. Nao salvar segredos, tokens, cookies ou conteudo bruto sensivel.';
-- -----------------------------------------------------------------------------
-- 3) Promocoes para lead: quem/por que/quando um contato entrou na jornada.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  oportunidade_id UUID NOT NULL REFERENCES public.oportunidades(id) ON DELETE CASCADE,
  source_interaction_id UUID NULL REFERENCES public.contact_interactions(id) ON DELETE SET NULL,
  promotion_mode TEXT NOT NULL DEFAULT 'manual',
  reason TEXT NOT NULL,
  confidence NUMERIC(5,4) NULL,
  promoted_by UUID NULL,
  promoted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT lead_promotions_mode_check CHECK (promotion_mode IN ('manual','liz_detected','formulario','whatsapp','email','api','outro')),
  CONSTRAINT lead_promotions_confidence_check CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1))
);
COMMENT ON TABLE public.lead_promotions IS
  'Auditoria de promocoes: contato conhecido so vira lead quando houver solicitacao/instrucao/intencao valida.';
-- -----------------------------------------------------------------------------
-- 4) Indices para deduplicacao, fila de revisao e jornada.
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pessoas_contact_stage
  ON public.pessoas(contact_stage);
CREATE INDEX IF NOT EXISTS idx_pessoas_lead_promoted_at
  ON public.pessoas(lead_promoted_at)
  WHERE lead_promoted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contact_interactions_pessoa_created
  ON public.contact_interactions(pessoa_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_intent
  ON public.contact_interactions(intent, intent_confidence)
  WHERE intent IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lead_promotions_pessoa
  ON public.lead_promotions(pessoa_id, promoted_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_promotions_oportunidade
  ON public.lead_promotions(oportunidade_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_promotions_source_interaction_unique
  ON public.lead_promotions(source_interaction_id)
  WHERE source_interaction_id IS NOT NULL;
-- -----------------------------------------------------------------------------
-- 5) Views operacionais.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.vw_contact_lifecycle_contatos AS
SELECT
  p.id,
  p.nome,
  p.email,
  p.telefone,
  p.tipo,
  p.contact_stage,
  p.google_contact_id,
  p.google_sync_enabled,
  p.origem_cadastro,
  p.cadastro_automatico,
  p.revisao_pendente,
  p.criado_em,
  p.updated_at
FROM public.pessoas p
WHERE p.ativo = TRUE
  AND COALESCE(p.contact_stage, 'contato') IN ('contato','lead_potencial');
CREATE OR REPLACE VIEW public.vw_contact_lifecycle_leads AS
SELECT
  p.id AS pessoa_id,
  p.nome,
  p.email,
  p.telefone,
  p.contact_stage,
  p.lead_promoted_at,
  p.lead_source,
  p.lead_source_ref,
  p.lead_promotion_reason,
  p.lead_confidence,
  o.id AS oportunidade_id,
  o.titulo AS oportunidade_titulo,
  o.pipeline_status,
  o.status,
  o.estagio
FROM public.pessoas p
LEFT JOIN public.oportunidades o ON o.cliente_id = p.id
WHERE p.ativo = TRUE
  AND COALESCE(p.contact_stage, 'contato') IN ('lead_ativo','cliente');
COMMENT ON VIEW public.vw_contact_lifecycle_contatos IS
  'Contatos conhecidos que ainda nao sao leads ativos.';
COMMENT ON VIEW public.vw_contact_lifecycle_leads IS
  'Contatos promovidos para lead/cliente com oportunidade associada quando existir.';
-- -----------------------------------------------------------------------------
-- 6) Funcao governada de promocao: cria/vincula oportunidade e registra auditoria.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_promover_contato_para_lead(
  p_pessoa_id UUID,
  p_source TEXT DEFAULT 'manual',
  p_reason TEXT DEFAULT 'Solicitacao identificada',
  p_interaction_id UUID DEFAULT NULL,
  p_titulo TEXT DEFAULT NULL,
  p_confidence NUMERIC DEFAULT NULL,
  p_promoted_by UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(pessoa_id UUID, oportunidade_id UUID, promotion_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pessoa public.pessoas%ROWTYPE;
  v_oportunidade_id UUID;
  v_promotion_id UUID;
  v_titulo TEXT;
  v_source TEXT;
BEGIN
  SELECT * INTO v_pessoa
  FROM public.pessoas
  WHERE id = p_pessoa_id
    AND ativo = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pessoa ativa nao encontrada: %', p_pessoa_id;
  END IF;

  v_source := COALESCE(NULLIF(TRIM(p_source), ''), 'manual');
  v_titulo := COALESCE(NULLIF(TRIM(p_titulo), ''), 'Solicitacao - ' || COALESCE(v_pessoa.nome, 'Contato'));

  SELECT o.id INTO v_oportunidade_id
  FROM public.oportunidades o
  WHERE o.cliente_id = p_pessoa_id
    AND COALESCE(o.status, '') NOT IN ('perdida','cancelada','concluida','fechada')
  ORDER BY o.criado_em DESC NULLS LAST
  LIMIT 1;

  IF v_oportunidade_id IS NULL THEN
    INSERT INTO public.oportunidades (
      cliente_id,
      titulo,
      descricao,
      origem,
      briefing_texto,
      pipeline_status,
      pipeline_updated,
      status,
      estagio,
      observacoes
    ) VALUES (
      p_pessoa_id,
      v_titulo,
      p_reason,
      v_source,
      p_reason,
      'lead_novo',
      now(),
      'novo',
      'qualificacao',
      'Criada por fn_promover_contato_para_lead. Revisar antes de proposta.'
    )
    RETURNING id INTO v_oportunidade_id;
  END IF;

  UPDATE public.pessoas
  SET
    contact_stage = CASE
      WHEN contact_stage = 'cliente' THEN 'cliente'
      ELSE 'lead_ativo'
    END,
    lead_promoted_at = COALESCE(lead_promoted_at, now()),
    lead_promoted_by = COALESCE(lead_promoted_by, p_promoted_by),
    lead_source = COALESCE(lead_source, v_source),
    lead_source_ref = COALESCE(lead_source_ref, p_interaction_id::text),
    lead_promotion_reason = COALESCE(lead_promotion_reason, p_reason),
    lead_confidence = COALESCE(lead_confidence, p_confidence),
    updated_at = now()
  WHERE id = p_pessoa_id;

  INSERT INTO public.lead_promotions (
    pessoa_id,
    oportunidade_id,
    source_interaction_id,
    promotion_mode,
    reason,
    confidence,
    promoted_by,
    metadata
  ) VALUES (
    p_pessoa_id,
    v_oportunidade_id,
    p_interaction_id,
    CASE
      WHEN v_source = 'liz' THEN 'liz_detected'
      WHEN v_source IN ('whatsapp','email','formulario','api') THEN v_source
      ELSE 'manual'
    END,
    p_reason,
    p_confidence,
    p_promoted_by,
    COALESCE(p_metadata, '{}'::jsonb)
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_promotion_id;

  IF p_interaction_id IS NOT NULL THEN
    UPDATE public.contact_interactions
    SET oportunidade_id = v_oportunidade_id
    WHERE id = p_interaction_id;
  END IF;

  RETURN QUERY SELECT p_pessoa_id, v_oportunidade_id, v_promotion_id;
END;
$$;
COMMENT ON FUNCTION public.fn_promover_contato_para_lead IS
  'Promove contato para lead ativo quando houver solicitacao real/instrucao/intencao validada. Cria ou vincula oportunidade e registra auditoria.';
COMMIT;
