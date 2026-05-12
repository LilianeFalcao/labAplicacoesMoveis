-- Migration: Add Incidents Table
-- Description: Supports incident reporting from monitors with emergency flags and photo evidence.

-- 1. Incidents Table
CREATE TABLE public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    is_emergency BOOLEAN DEFAULT FALSE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.children(id) ON DELETE SET NULL,
    monitor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Incident Photos (supporting multiple photos per incident)
CREATE TABLE public.incident_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS Policies
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_photos ENABLE ROW LEVEL SECURITY;

-- Monitors can insert their own reports
CREATE POLICY "Monitors can insert incidents" ON public.incidents
    FOR INSERT WITH CHECK (auth.uid() = monitor_id);

-- Monitors can see incidents from their classes
CREATE POLICY "Monitors can see incidents from their classes" ON public.incidents
    FOR SELECT USING (
        class_id IN (
            SELECT class_id FROM public.monitor_activities WHERE monitor_id = auth.uid()
        )
    );

-- Admins can see everything
CREATE POLICY "Admins can see all incidents" ON public.incidents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Similar policies for incident_photos
CREATE POLICY "Incident photos visibility" ON public.incident_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.incidents WHERE id = incident_id
        )
    );

CREATE POLICY "Monitors can upload incident photos" ON public.incident_photos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.incidents WHERE id = incident_id AND monitor_id = auth.uid()
        )
    );
