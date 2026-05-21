-- Migration: Allow administrators to fully manage user profiles and class-monitor assignments
-- Chronological timestamp: 2026-05-20

-- =========================================================================
-- Part 1: Users Table RLS Updates
-- =========================================================================

-- Clean up existing users policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;

-- Create the full management policy for administrators on users
CREATE POLICY "Admins have full access to users"
ON public.users FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- =========================================================================
-- Part 2: Monitor Activities Table RLS Updates
-- =========================================================================

-- Clean up existing monitor_activities policies
DROP POLICY IF EXISTS "Admins have full access to monitor_activities" ON public.monitor_activities;
DROP POLICY IF EXISTS "Anyone authenticated can view monitor_activities" ON public.monitor_activities;

-- 1. Grant Administrators full access (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admins have full access to monitor_activities"
ON public.monitor_activities FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2. Grant Authenticated users read-only access to view assignments
CREATE POLICY "Anyone authenticated can view monitor_activities"
ON public.monitor_activities FOR SELECT
USING (auth.role() = 'authenticated');
