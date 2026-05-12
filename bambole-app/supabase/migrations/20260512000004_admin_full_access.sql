-- Cleanup existing policies and function before recreation
DROP POLICY IF EXISTS "Admins have full access to children" ON public.children;
DROP POLICY IF EXISTS "Admins have full access to guardians" ON public.guardians;
DROP POLICY IF EXISTS "Admins have full access to guardian_children" ON public.guardian_children;
DROP POLICY IF EXISTS "Admins have full access to classes" ON public.classes;
DROP POLICY IF EXISTS "Admins have full access to attendance_records" ON public.attendance_records;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP FUNCTION IF EXISTS public.is_admin();

-- Function to safely check if the current user is an admin without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. CHILDREN
CREATE POLICY "Admins have full access to children" 
ON public.children FOR ALL 
USING (public.is_admin());

-- 2. GUARDIANS
CREATE POLICY "Admins have full access to guardians" 
ON public.guardians FOR ALL 
USING (public.is_admin());

-- 3. GUARDIAN_CHILDREN (The Link Table)
CREATE POLICY "Admins have full access to guardian_children" 
ON public.guardian_children FOR ALL 
USING (public.is_admin());

-- 4. CLASSES
CREATE POLICY "Admins have full access to classes" 
ON public.classes FOR ALL 
USING (public.is_admin());

-- 5. ATTENDANCE RECORDS
CREATE POLICY "Admins have full access to attendance_records" 
ON public.attendance_records FOR ALL 
USING (public.is_admin());

-- 6. USERS (Allow admins to see other users for linking)
CREATE POLICY "Admins can view all users" 
ON public.users FOR SELECT 
USING (public.is_admin());
