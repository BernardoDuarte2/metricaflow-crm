-- Permitir que vendedores criem reuniões
CREATE POLICY "Vendedores podem criar reuniões"
ON public.meetings
FOR INSERT
TO authenticated
WITH CHECK (
  company_id = get_user_company_id() AND
  created_by = auth.uid() AND
  has_role(auth.uid(), 'vendedor'::app_role)
);