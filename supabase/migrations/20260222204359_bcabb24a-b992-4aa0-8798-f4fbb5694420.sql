
-- Table for custom task suggestions per company
CREATE TABLE public.task_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.task_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores e owners veem sugestões da empresa"
ON public.task_suggestions FOR SELECT
USING (company_id = get_user_company_id());

CREATE POLICY "Gestores e owners podem criar sugestões"
ON public.task_suggestions FOR INSERT
WITH CHECK (
  company_id = get_user_company_id()
  AND created_by = auth.uid()
  AND (get_user_role() = 'gestor' OR get_user_role() = 'gestor_owner')
);

CREATE POLICY "Gestores e owners podem deletar sugestões"
ON public.task_suggestions FOR DELETE
USING (
  company_id = get_user_company_id()
  AND (get_user_role() = 'gestor' OR get_user_role() = 'gestor_owner')
);
