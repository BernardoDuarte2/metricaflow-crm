-- 1. Atualizar get_user_role() para buscar de user_roles (fonte segura)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 2. Criar função auxiliar para obter role primário (caso usuário tenha múltiplos roles)
CREATE OR REPLACE FUNCTION public.get_user_primary_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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
  LIMIT 1;
$$;

-- 3. Criar trigger para manter profiles.role sincronizado com user_roles
CREATE OR REPLACE FUNCTION public.sync_profile_role()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles 
  SET role = NEW.role 
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_role_on_user_roles_change ON public.user_roles;
CREATE TRIGGER sync_role_on_user_roles_change
AFTER INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_role();

-- 4. Habilitar Realtime na tabela leads
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;