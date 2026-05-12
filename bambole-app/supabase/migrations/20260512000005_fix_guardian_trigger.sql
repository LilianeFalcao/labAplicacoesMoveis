-- Update handle_new_user trigger to automatically create guardians for parents
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
BEGIN
    user_role := COALESCE(new.raw_user_meta_data->>'role', 'parent');
    
    -- Insert into public.users
    INSERT INTO public.users (id, email, role, full_name, avatar_url)
    VALUES (
        new.id, 
        new.email, 
        user_role,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );

    -- If role is 'parent', also create a record in public.guardians
    IF user_role = 'parent' THEN
        INSERT INTO public.guardians (user_id)
        VALUES (new.id)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- REPAIR SCRIPT: Create guardians for existing parent users who don't have one
INSERT INTO public.guardians (user_id)
SELECT id FROM public.users
WHERE role = 'parent'
AND id NOT IN (SELECT user_id FROM public.guardians)
ON CONFLICT DO NOTHING;
