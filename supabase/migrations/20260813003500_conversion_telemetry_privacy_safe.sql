-- Privacy-safe durable telemetry for site conversion outcomes.
-- No PII, raw payload, IP, user-agent, email, phone, message or fingerprint is stored.
BEGIN;

CREATE TABLE IF NOT EXISTS public.site_conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  event TEXT NOT NULL DEFAULT 'contact_result',
  outcome TEXT NOT NULL,
  reason TEXT NOT NULL,
  promotion TEXT NOT NULL DEFAULT 'promotion_skipped',
  context TEXT NOT NULL DEFAULT 'other',
  status_code INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT site_conversion_events_outcome_check CHECK (outcome IN ('saved','duplicate','rejected','ignored')),
  CONSTRAINT site_conversion_events_promotion_check CHECK (promotion IN ('promotion_skipped','promotion_queued','promotion_completed','promotion_already_done','promotion_failed')),
  CONSTRAINT site_conversion_events_context_check CHECK (context IN ('moodboard','buildtech','contact','other')),
  CONSTRAINT site_conversion_events_status_check CHECK (status_code BETWEEN 100 AND 599),
  CONSTRAINT site_conversion_events_duration_check CHECK (duration_ms >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_site_conversion_events_request_id
  ON public.site_conversion_events(request_id);
CREATE INDEX IF NOT EXISTS idx_site_conversion_events_created
  ON public.site_conversion_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_conversion_events_outcome_created
  ON public.site_conversion_events(outcome, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_conversion_events_reason_created
  ON public.site_conversion_events(reason, created_at DESC);

ALTER TABLE public.site_conversion_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.site_conversion_events FROM anon, authenticated;

COMMENT ON TABLE public.site_conversion_events IS
  'Telemetria agregavel de conversao sem PII. Escrita server-side via service role; sem acesso direto anon/authenticated.';

CREATE OR REPLACE FUNCTION public.prune_site_conversion_events(p_retention_days INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
  v_days INTEGER := LEAST(365, GREATEST(7, COALESCE(p_retention_days, 90)));
BEGIN
  DELETE FROM public.site_conversion_events
  WHERE created_at < now() - make_interval(days => v_days);
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.prune_site_conversion_events(INTEGER) FROM PUBLIC, anon, authenticated;

COMMIT;
