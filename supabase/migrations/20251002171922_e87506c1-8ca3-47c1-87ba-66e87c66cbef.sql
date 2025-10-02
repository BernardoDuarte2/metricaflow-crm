-- Add active column to profiles for user deactivation
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Create index for active column
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(active);

-- Create function to check email uniqueness within company
CREATE OR REPLACE FUNCTION public.is_email_unique_in_company(
  _email TEXT,
  _company_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM auth.users u
    INNER JOIN public.profiles p ON u.id = p.id
    WHERE u.email = _email
      AND p.company_id = _company_id
  )
$$;

-- Create function to count active users in company (excluding owners)
CREATE OR REPLACE FUNCTION public.count_additional_users(_company_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.id = ur.user_id
  WHERE p.company_id = _company_id
    AND p.active = true
    AND ur.role != 'gestor_owner'
$$;

-- Add RLS policy for owners to update profile active status
CREATE POLICY "Owners can update profile active status"
ON public.profiles FOR UPDATE
USING (
  is_owner(auth.uid())
  AND company_id = get_user_company_id()
  AND id != auth.uid()
)
WITH CHECK (
  is_owner(auth.uid())
  AND company_id = get_user_company_id()
  AND id != auth.uid()
);

-- Enable realtime for profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for user_roles table
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;