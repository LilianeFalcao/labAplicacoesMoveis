-- Migration: Add UPDATE policy for activity_photos
-- Description: Allows authenticated users to toggle likes and post comments on activity photos.

DROP POLICY IF EXISTS "Allow authenticated users to update activity photos" ON public.activity_photos;

CREATE POLICY "Allow authenticated users to update activity photos"
ON public.activity_photos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
