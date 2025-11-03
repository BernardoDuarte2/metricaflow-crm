-- FASE 1: Corrigir funções de segurança para evitar recursão infinita em RLS

-- 1. Corrigir has_role() - função crítica usada em múltiplas policies
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

-- 2. Corrigir is_owner() - função usada em muitas policies
CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'gestor_owner'::app_role
  )
$$;

-- 3. Corrigir get_user_company_id() - função crítica para isolamento de dados
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id 
  FROM public.profiles 
  WHERE id = auth.uid()
$$;

-- 4. Corrigir get_user_role() - função para obter role do usuário
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

-- 5. Corrigir get_user_role() sem parâmetro - versão simplificada
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY 
    CASE role
      WHEN 'gestor_owner' THEN 1
      WHEN 'gestor' THEN 2
      WHEN 'vendedor' THEN 3
    END
  LIMIT 1
$$;

-- 6. Corrigir get_user_primary_role() - função para obter role principal
CREATE OR REPLACE FUNCTION public.get_user_primary_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 7. Adicionar índices para melhorar performance das consultas de role
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);