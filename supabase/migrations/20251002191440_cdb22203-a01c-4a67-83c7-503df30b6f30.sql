-- Permite que vendedores criem leads atribuídos a si mesmos
CREATE POLICY "Vendedores podem criar seus próprios leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (
  assigned_to = auth.uid() 
  AND has_role(auth.uid(), 'vendedor'::app_role)
  AND company_id = get_user_company_id()
);