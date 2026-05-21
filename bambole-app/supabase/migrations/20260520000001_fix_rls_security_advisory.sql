-- =============================================================================
-- Migration: Fix RLS security advisory — remove any user_metadata references
-- from monitor_activities policies and harden the is_admin() function.
--
-- Root cause: Previous iterations of RLS policies may have used
--   auth.jwt() -> 'user_metadata' ->> 'role' which is editable by end users.
-- Fix: All admin checks go through public.is_admin() which reads directly from
--   the server-side public.users table, never from JWT user_metadata.
-- =============================================================================

-- Step 1: Harden the is_admin() helper function.
-- Add SET search_path to prevent search_path injection attacks and ensure
-- the function always reads from the correct schema.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 2: Drop ALL existing policies on monitor_activities to ensure a clean slate.
-- This removes any legacy policies that might reference user_metadata from JWT.
DROP POLICY IF EXISTS "Admins have full access to monitor_activities" ON public.monitor_activities;
DROP POLICY IF EXISTS "Anyone authenticated can view monitor_activities" ON public.monitor_activities;
DROP POLICY IF EXISTS "Monitors can manage their assignments" ON public.monitor_activities;
DROP POLICY IF EXISTS "Admin full access monitor_activities" ON public.monitor_activities;

-- Step 3: Recreate policies using only the secure public.is_admin() function.

-- Policy 1: Admins can do anything (SELECT, INSERT, UPDATE, DELETE)
-- Uses SECURITY DEFINER function — never reads user_metadata.
CREATE POLICY "Admins have full access to monitor_activities"
ON public.monitor_activities FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policy 2: Monitors can only see their own assignments (read-only)
CREATE POLICY "Monitors can view their own assignments"
ON public.monitor_activities FOR SELECT
TO authenticated
USING (monitor_id = auth.uid());

-- Step 4: Harden other SECURITY DEFINER functions in the same migration
-- to ensure consistent security posture across the codebase.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'role', 'parent'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
