-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Gestores podem criar tarefas" ON public.tasks;
DROP POLICY IF EXISTS "Gestores veem todas as tarefas da empresa" ON public.tasks;
DROP POLICY IF EXISTS "Gestores podem atualizar tarefas da empresa" ON public.tasks;
DROP POLICY IF EXISTS "Gestores and creators can delete tasks" ON public.tasks;

-- Create updated policies that include gestor_owner
CREATE POLICY "Gestores e owners podem criar tarefas"
ON public.tasks
FOR INSERT
WITH CHECK (
  company_id = get_user_company_id() 
  AND created_by = auth.uid() 
  AND (get_user_role() = 'gestor' OR get_user_role() = 'gestor_owner')
);

CREATE POLICY "Gestores e owners veem todas as tarefas da empresa"
ON public.tasks
FOR SELECT
USING (
  company_id = get_user_company_id() 
  AND (get_user_role() = 'gestor' OR get_user_role() = 'gestor_owner')
);

CREATE POLICY "Gestores e owners podem atualizar tarefas da empresa"
ON public.tasks
FOR UPDATE
USING (
  company_id = get_user_company_id() 
  AND (get_user_role() = 'gestor' OR get_user_role() = 'gestor_owner')
);

CREATE POLICY "Gestores, owners e criadores podem deletar tarefas"
ON public.tasks
FOR DELETE
USING (
  (company_id = get_user_company_id() 
   AND (get_user_role() = 'gestor' OR get_user_role() = 'gestor_owner'))
  OR created_by = auth.uid()
);