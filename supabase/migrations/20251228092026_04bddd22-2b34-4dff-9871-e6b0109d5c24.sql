-- Allow all authenticated staff to view doctor profiles (for appointment booking)
CREATE POLICY "Staff can view doctor profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = profiles.id 
    AND user_roles.role = 'doctor'
  )
);

-- Allow all authenticated staff to view doctor roles (for appointment booking)
CREATE POLICY "Staff can view doctor roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (role = 'doctor');