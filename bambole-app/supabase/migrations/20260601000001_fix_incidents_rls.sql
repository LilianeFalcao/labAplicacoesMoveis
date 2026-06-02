-- Migration: Fix Incidents RLS Select
-- Description: Allow monitors to view their own submitted incidents, permitting photo uploads for global/class-less incidents.

-- 1. Drop old SELECT policy
DROP POLICY IF EXISTS "Monitors can see incidents from their classes" ON public.incidents;

-- 2. Recreate SELECT policy allowing monitors to see their own reports or reports from their classes
CREATE POLICY "Monitors can see incidents from their classes or they created" 
ON public.incidents
FOR SELECT USING (
    monitor_id = auth.uid()
    OR class_id IN (
        SELECT class_id FROM public.monitor_activities WHERE monitor_id = auth.uid()
    )
);
