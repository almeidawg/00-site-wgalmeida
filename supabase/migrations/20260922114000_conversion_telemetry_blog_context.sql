-- Allow the Conversion Lab blog funnel to persist privacy-safe telemetry.
ALTER TABLE public.site_conversion_events
  DROP CONSTRAINT IF EXISTS site_conversion_events_context_check;

ALTER TABLE public.site_conversion_events
  ADD CONSTRAINT site_conversion_events_context_check
  CHECK (context IN ('moodboard', 'buildtech', 'contact', 'blog', 'other'));
