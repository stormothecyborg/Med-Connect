-- Create allowed_users table for pre-registration
CREATE TABLE public.allowed_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role app_role NOT NULL DEFAULT 'receptionist',
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can view all allowed users
CREATE POLICY "Admins can view allowed users"
ON public.allowed_users
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS: Admins can insert allowed users
CREATE POLICY "Admins can insert allowed users"
ON public.allowed_users
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS: Admins can update allowed users
CREATE POLICY "Admins can update allowed users"
ON public.allowed_users
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS: Admins can delete allowed users
CREATE POLICY "Admins can delete allowed users"
ON public.allowed_users
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Pre-populate admin.hms@gmail.com
INSERT INTO public.allowed_users (email, role) 
VALUES ('admin.hms@gmail.com', 'admin');

-- Migrate existing users to allowed_users so they can continue to log in
INSERT INTO public.allowed_users (email, role)
SELECT p.email, ur.role 
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id
ON CONFLICT (email) DO NOTHING;

-- Update handle_new_user function with pre-registration check
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  allowed_record RECORD;
  assigned_role app_role;
BEGIN
  -- Special case: admin.hms@gmail.com always gets admin
  IF NEW.email = 'admin.hms@gmail.com' THEN
    assigned_role := 'admin';
  ELSE
    -- Check if user is pre-registered in allowed_users
    SELECT * INTO allowed_record FROM public.allowed_users WHERE email = NEW.email;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'User not registered. Contact admin for access.';
    END IF;
    
    assigned_role := allowed_record.role;
  END IF;
  
  -- Create profile
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$$;