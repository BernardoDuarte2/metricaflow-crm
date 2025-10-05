-- Fix lead_observations RLS policies to use get_user_primary_role instead of profiles.role

-- Drop existing policies
DROP POLICY IF EXISTS "Usuários podem criar observações em leads acessíveis" ON public.lead_observations;
DROP POLICY IF EXISTS "Usuários veem observações de leads acessíveis" ON public.lead_observations;

-- Recreate SELECT policy with correct role check
CREATE POLICY "Usuários veem observações de leads acessíveis"
ON public.lead_observations
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM leads l
    WHERE l.id = lead_observations.lead_id
      AND l.company_id = get_user_company_id()
      AND (
        get_user_primary_role(auth.uid()) IN ('gestor', 'gestor_owner')
        OR (get_user_primary_role(auth.uid()) = 'vendedor' AND l.assigned_to = auth.uid())
      )
  )
);

-- Recreate INSERT policy with correct role check
CREATE POLICY "Usuários podem criar observações em leads acessíveis"
ON public.lead_observations
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM leads l
    WHERE l.id = lead_observations.lead_id
      AND l.company_id = get_user_company_id()
      AND (
        get_user_primary_role(auth.uid()) IN ('gestor', 'gestor_owner')
        OR (get_user_primary_role(auth.uid()) = 'vendedor' AND l.assigned_to = auth.uid())
      )
  )
);