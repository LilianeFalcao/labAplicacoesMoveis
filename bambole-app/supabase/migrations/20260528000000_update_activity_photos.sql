-- =============================================================================
-- Migration: Update activity_photos table
--
-- Adds:
--  - class_id UUID: allows linking photos directly to classes instead of being
--                   strictly coupled to schedules.
--  - caption TEXT: description/caption of the moment.
--
-- Sets up secure RLS policies for activity_photos.
-- =============================================================================

ALTER TABLE public.activity_photos 
ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS caption TEXT;

-- Enable RLS (already enabled in initial, but safe to guarantee)
ALTER TABLE public.activity_photos ENABLE ROW LEVEL SECURITY;

-- Policy 1: Any authenticated user can view activity photos
DROP POLICY IF EXISTS "Anyone authenticated can view activity photos" ON public.activity_photos;
CREATE POLICY "Anyone authenticated can view activity photos"
ON public.activity_photos FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Authenticated monitors and admins can insert activity photos
DROP POLICY IF EXISTS "Monitors and admins can insert activity photos" ON public.activity_photos;
CREATE POLICY "Monitors and admins can insert activity photos"
ON public.activity_photos FOR INSERT
TO authenticated
WITH CHECK (true);
