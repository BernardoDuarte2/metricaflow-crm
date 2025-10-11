-- Permitir que vendedores criem tarefas para si mesmos
CREATE POLICY "Vendedores podem criar tarefas para si mesmos"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
  (created_by = auth.uid()) AND
  (assigned_to = auth.uid()) AND
  (company_id = get_user_company_id()) AND
  (get_user_role() = 'vendedor'::app_role) AND
  -- Verificar se o lead pertence à mesma empresa
  (lead_id IS NULL OR EXISTS (
    SELECT 1 FROM public.leads 
    WHERE id = tasks.lead_id 
    AND company_id = get_user_company_id()
  ))
);