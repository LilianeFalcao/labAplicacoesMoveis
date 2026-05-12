-- Script to ensure the Admin user exists in public.users and has the correct metadata
-- Run this in the Supabase SQL Editor

-- 1. Update metadata for the admin user in auth.users
-- Replace 'seu-email@admin.com' with the actual admin email
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
WHERE email = 'seu-email@admin.com';

-- 2. Force the trigger to sync the user to public.users (or insert manually)
INSERT INTO public.users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'seu-email@admin.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
