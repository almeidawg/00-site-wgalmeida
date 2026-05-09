-- Migration: Create site_media_overrides table for dynamic image management
-- Created: 2026-05-08

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.site_media_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id TEXT NOT NULL,
    slot_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(page_id, slot_id)
);

-- 2. Enable RLS
ALTER TABLE public.site_media_overrides ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Allow public read access
CREATE POLICY "Allow public read access" ON public.site_media_overrides
    FOR SELECT USING (true);

-- Allow authenticated users (Admin) to manage overrides
CREATE POLICY "Allow admin to manage overrides" ON public.site_media_overrides
    FOR ALL USING (auth.role() = 'authenticated');

-- 4. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_media_overrides_updated_at
    BEFORE UPDATE ON public.site_media_overrides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_media_page_slot ON public.site_media_overrides(page_id, slot_id);
