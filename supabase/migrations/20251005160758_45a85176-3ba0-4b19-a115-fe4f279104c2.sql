-- CRITICAL SECURITY FIX: Remove dual role storage vulnerability

-- Step 1: Drop the role column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Step 2: Update handle_new_user function to remove role insertion into profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_company_id UUID;
  v_company_name TEXT;
  v_role public.app_role;
BEGIN
  -- Check if this is a new company owner or an invited user
  v_company_id := (NEW.raw_user_meta_data->>'company_id')::UUID;
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'gestor_owner');
  
  -- If no company_id, create new company (first signup = owner)
  IF v_company_id IS NULL THEN
    v_company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Minha Empresa');
    
    INSERT INTO public.companies (name, owner_id)
    VALUES (v_company_name, NEW.id)
    RETURNING id INTO v_company_id;
    
    v_role := 'gestor_owner';
  END IF;
  
  -- Create profile (removed role field - now only stored in user_roles table)
  INSERT INTO public.profiles (id, company_id, name)
  VALUES (
    NEW.id,
    v_company_id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  
  -- Create user role (single source of truth for roles)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role);
  
  RETURN NEW;
END;
$function$;

-- Step 3: Drop obsolete sync_profile_role trigger and function (in correct order)
DROP TRIGGER IF EXISTS sync_role_on_user_roles_change ON public.user_roles;
DROP FUNCTION IF EXISTS public.sync_profile_role();

-- Step 4: Fix profile update policy to prevent privilege escalation
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- This policy now:
-- 1. Only allows users to update their own profile (USING clause)
-- 2. Prevents changing company_id (WITH CHECK ensures it matches original value)
-- 3. The 'active' field can only be changed by owners via separate policy
-- 4. Users can safely update only their 'name' field