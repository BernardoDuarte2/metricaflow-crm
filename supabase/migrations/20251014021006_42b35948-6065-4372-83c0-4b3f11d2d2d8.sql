-- Replace restrictive insert policies with a single permissive one allowing owner, gestor and vendedor
DROP POLICY IF EXISTS "Vendedores podem criar reuniões" ON public.meetings;
DROP POLICY IF EXISTS "Owners and gestores can create meetings" ON public.meetings;

CREATE POLICY "Usuários autorizados podem criar reuniões"
ON public.meetings
FOR INSERT
TO authenticated
WITH CHECK (
  company_id = get_user_company_id() AND
  created_by = auth.uid() AND
  (
    is_owner(auth.uid()) OR
    has_role(auth.uid(), 'gestor'::app_role) OR
    has_role(auth.uid(), 'vendedor'::app_role)
  )
);