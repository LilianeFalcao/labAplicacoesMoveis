-- Initial Schema for Bambolê App

-- 1. Identity & Users
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('parent', 'monitor', 'admin')) NOT NULL,
    push_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Activity & Enrollment
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    age_range TEXT,
    weekly_schedule JSONB, -- { "days": ["MON", "WED"], "start_time": "14:00", "end_time": "17:00" }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    photo_url TEXT,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    image_consent BOOLEAN DEFAULT FALSE,
    image_consent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.guardian_children (
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    PRIMARY KEY (guardian_id, child_id)
);

CREATE TABLE public.monitor_activities (
    monitor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (monitor_id, class_id)
);

-- 3. Schedules & Photos
CREATE TABLE public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    category TEXT NOT NULL, -- 'Esporte' | 'Arte' | ...
    recurrence TEXT DEFAULT 'none', -- 'none' | 'weekly'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.activity_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Attendance
CREATE TABLE public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    monitor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT CHECK (status IN ('present', 'absent', 'pre_justified', 'justified')) NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    justification_note TEXT,
    justified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Communication
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    audience_type TEXT CHECK (audience_type IN ('class', 'all')) NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Access Requests
CREATE TABLE public.class_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    reason TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to handle sync from auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'role', 'parent'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Basic RLS Policies (Draft)
CREATE POLICY "Users can see their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Parents can see their children's attendance" ON public.attendance_records FOR SELECT USING (
    id IN (
        SELECT ar.id FROM public.attendance_records ar
        JOIN public.guardian_children gc ON ar.child_id = gc.child_id
        JOIN public.guardians g ON gc.guardian_id = g.id
        WHERE g.user_id = auth.uid()
    )
);
