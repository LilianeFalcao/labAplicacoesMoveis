-- =============================================================================
-- Migration: Add likes and comments columns to activity_photos
--
-- Adds:
--  - likes UUID[]: Array of user IDs who liked the photo.
--  - comments JSONB: List of comments.
-- =============================================================================

ALTER TABLE public.activity_photos 
ADD COLUMN IF NOT EXISTS likes UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]';
