-- Criar enum para perfis de usuário
CREATE TYPE public.app_role AS ENUM ('gestor', 'vendedor');

-- Tabela de empresas
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabela de perfis (complementa auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'vendedor',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabela de leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'novo',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabela de observações dos leads
CREATE TABLE public.lead_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabela de lembretes
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reminder_date TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tabela de tarefas
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'aberta',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Função auxiliar para pegar company_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Policies para companies
CREATE POLICY "Usuários podem ver sua própria empresa"
  ON public.companies FOR SELECT
  USING (id = public.get_user_company_id());

-- Policies para profiles
CREATE POLICY "Usuários podem ver perfis da mesma empresa"
  ON public.profiles FOR SELECT
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Policies para leads
CREATE POLICY "Gestores veem todos os leads da empresa"
  ON public.leads FOR SELECT
  USING (
    company_id = public.get_user_company_id() 
    AND public.get_user_role() = 'gestor'
  );

CREATE POLICY "Vendedores veem apenas seus leads"
  ON public.leads FOR SELECT
  USING (
    assigned_to = auth.uid() 
    AND public.get_user_role() = 'vendedor'
  );

CREATE POLICY "Gestores podem criar leads"
  ON public.leads FOR INSERT
  WITH CHECK (
    company_id = public.get_user_company_id() 
    AND public.get_user_role() = 'gestor'
  );

CREATE POLICY "Gestores podem atualizar leads da empresa"
  ON public.leads FOR UPDATE
  USING (
    company_id = public.get_user_company_id() 
    AND public.get_user_role() = 'gestor'
  );

CREATE POLICY "Vendedores podem atualizar seus próprios leads"
  ON public.leads FOR UPDATE
  USING (
    assigned_to = auth.uid() 
    AND public.get_user_role() = 'vendedor'
  );

-- Policies para lead_observations
CREATE POLICY "Usuários veem observações de leads que têm acesso"
  ON public.lead_observations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_observations.lead_id 
      AND (
        (leads.company_id = public.get_user_company_id() AND public.get_user_role() = 'gestor')
        OR (leads.assigned_to = auth.uid() AND public.get_user_role() = 'vendedor')
      )
    )
  );

CREATE POLICY "Usuários podem criar observações em leads que têm acesso"
  ON public.lead_observations FOR INSERT
  WITH CHECK (
    user_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = lead_observations.lead_id 
      AND (
        (leads.company_id = public.get_user_company_id() AND public.get_user_role() = 'gestor')
        OR (leads.assigned_to = auth.uid() AND public.get_user_role() = 'vendedor')
      )
    )
  );

-- Policies para reminders
CREATE POLICY "Gestores veem todos os lembretes da empresa"
  ON public.reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE leads.id = reminders.lead_id 
      AND leads.company_id = public.get_user_company_id() 
      AND public.get_user_role() = 'gestor'
    )
  );

CREATE POLICY "Vendedores veem apenas seus lembretes"
  ON public.reminders FOR SELECT
  USING (user_id = auth.uid() AND public.get_user_role() = 'vendedor');

CREATE POLICY "Usuários podem criar lembretes"
  ON public.reminders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seus próprios lembretes"
  ON public.reminders FOR UPDATE
  USING (user_id = auth.uid());

-- Policies para tasks
CREATE POLICY "Gestores veem todas as tarefas da empresa"
  ON public.tasks FOR SELECT
  USING (
    company_id = public.get_user_company_id() 
    AND public.get_user_role() = 'gestor'
  );

CREATE POLICY "Vendedores veem suas tarefas atribuídas"
  ON public.tasks FOR SELECT
  USING (
    assigned_to = auth.uid() 
    AND public.get_user_role() = 'vendedor'
  );

CREATE POLICY "Gestores podem criar tarefas"
  ON public.tasks FOR INSERT
  WITH CHECK (
    company_id = public.get_user_company_id() 
    AND created_by = auth.uid() 
    AND public.get_user_role() = 'gestor'
  );

CREATE POLICY "Gestores podem atualizar tarefas da empresa"
  ON public.tasks FOR UPDATE
  USING (
    company_id = public.get_user_company_id() 
    AND public.get_user_role() = 'gestor'
  );

CREATE POLICY "Vendedores podem marcar suas tarefas como concluídas"
  ON public.tasks FOR UPDATE
  USING (
    assigned_to = auth.uid() 
    AND public.get_user_role() = 'vendedor'
  );

-- Trigger para atualizar updated_at em leads
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, company_id, name, role)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'company_id')::uuid,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'vendedor'::public.app_role)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();