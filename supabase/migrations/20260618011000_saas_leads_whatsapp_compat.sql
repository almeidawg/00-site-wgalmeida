-- ============================================================================
-- MIGRATION: SaaS Leads WhatsApp Compatibility
-- Projeto: WGEasy Core Hub
-- Data: 2026-06-18
-- Objetivo:
--   Corrigir divergencia entre frontend e schema REST em saas_leads_landing.
--   O frontend usa campo whatsapp para captura e contato.
--   Esta migration adiciona a coluna se ela nao existir, sem apagar dados.
-- ============================================================================

BEGIN;
ALTER TABLE public.saas_leads_landing
  ADD COLUMN IF NOT EXISTS whatsapp TEXT DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_saas_leads_landing_whatsapp
  ON public.saas_leads_landing(whatsapp)
  WHERE whatsapp IS NOT NULL;
COMMENT ON COLUMN public.saas_leads_landing.whatsapp IS
  'Telefone/WhatsApp informado na landing page. Campo de compatibilidade com frontend SaaSLeadsPage/LandingPageDinamica.';
COMMIT;
