-- Migration: Allow parents to view their own links and profiles
-- This ensures that linked children appear in the Parent Dashboard

-- 1. Allow parents to view their own guardian record
CREATE POLICY "Parents can view their own guardian profile" 
ON public.guardians FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Allow parents to view their own child links
CREATE POLICY "Parents can view their own child links" 
ON public.guardian_children FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.guardians
        WHERE id = guardian_id AND user_id = auth.uid()
    )
);
