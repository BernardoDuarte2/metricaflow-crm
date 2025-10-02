-- Corrigir política de SELECT na tabela lead_observations
DROP POLICY IF EXISTS "Usuários veem observações de leads que têm acesso" ON public.lead_observations;

-- Criar nova política de SELECT consistente com INSERT
CREATE POLICY "Usuários veem observações de leads acessíveis"
ON public.lead_observations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.leads l
    INNER JOIN public.profiles p ON p.id = auth.uid()
    WHERE l.id = lead_observations.lead_id
    AND l.company_id = p.company_id
    AND (
      -- Gestor ou owner pode ver notas de qualquer lead da empresa
      p.role IN ('gestor', 'gestor_owner')
      OR 
      -- Vendedor pode ver notas apenas de seus leads
      (p.role = 'vendedor' AND l.assigned_to = auth.uid())
    )
  )
);
