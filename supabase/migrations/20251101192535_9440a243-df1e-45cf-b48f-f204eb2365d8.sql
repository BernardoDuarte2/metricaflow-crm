-- Atualizar função has_role com validação de segurança
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validação: usuário só pode verificar seu próprio role ou owner pode verificar qualquer role
  IF auth.uid() != _user_id AND NOT is_owner(auth.uid()) THEN
    RAISE EXCEPTION 'Não autorizado a verificar roles de outros usuários';
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
END;
$$;

-- Atualizar função get_user_role com validação de segurança
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validação: usuário só pode verificar seu próprio role ou owner pode verificar qualquer role
  IF auth.uid() != _user_id AND NOT is_owner(auth.uid()) THEN
    RAISE EXCEPTION 'Não autorizado a verificar roles de outros usuários';
  END IF;

  RETURN (
    SELECT role 
    FROM public.user_roles 
    WHERE user_id = _user_id 
    ORDER BY 
      CASE role
        WHEN 'gestor_owner' THEN 1
        WHEN 'gestor' THEN 2
        WHEN 'vendedor' THEN 3
      END
    LIMIT 1
  );
END;
$$;

-- Adicionar validação extra na função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_company_name TEXT;
  v_role public.app_role;
BEGIN
  -- Validação: garantir que apenas novos usuários possam ser processados
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RAISE EXCEPTION 'Perfil já existe para este usuário';
  END IF;

  -- Check if this is a new company owner or an invited user
  v_company_id := (NEW.raw_user_meta_data->>'company_id')::UUID;
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'gestor_owner');
  
  -- Validação: se company_id for fornecido, garantir que a empresa existe
  IF v_company_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.companies WHERE id = v_company_id) THEN
      RAISE EXCEPTION 'Empresa não encontrada';
    END IF;
  END IF;
  
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
$$;