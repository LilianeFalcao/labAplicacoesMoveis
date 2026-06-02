-- Migration: Fix Announcements RLS
-- Description: Enable inserting and managing announcements for admins and monitors.

-- 1. Drop existing policies if they exist to allow clean recreation
DROP POLICY IF EXISTS "Admins have full access to announcements" ON public.announcements;
DROP POLICY IF EXISTS "Monitors can insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Monitors can update their own announcements" ON public.announcements;
DROP POLICY IF EXISTS "Monitors can delete their own announcements" ON public.announcements;

-- 2. Create policy for Admins (Full access)
CREATE POLICY "Admins have full access to announcements"
ON public.announcements
FOR ALL
USING (public.is_admin());

-- 3. Create policy for Monitors to INSERT announcements
-- They must be authenticated, have the 'monitor' role, and set themselves as the author_id.
CREATE POLICY "Monitors can insert announcements"
ON public.announcements
FOR INSERT
WITH CHECK (
    auth.uid() = author_id 
    AND EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'monitor'
    )
);

-- 4. Create policies for Monitors to UPDATE and DELETE their own announcements
CREATE POLICY "Monitors can update their own announcements"
ON public.announcements
FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Monitors can delete their own announcements"
ON public.announcements
FOR DELETE
USING (auth.uid() = author_id);
