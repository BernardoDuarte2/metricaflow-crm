-- Criar tabela para custos de marketing e vendas
CREATE TABLE IF NOT EXISTS public.marketing_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  marketing_cost NUMERIC(12, 2) DEFAULT 0,
  sales_cost NUMERIC(12, 2) DEFAULT 0,
  average_retention_months INTEGER DEFAULT 12,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  CONSTRAINT unique_company_period UNIQUE (company_id, period_start, period_end)
);

COMMENT ON TABLE public.marketing_costs IS 'Custos de marketing e vendas por período para cálculo de CAC, LTV e Payback';
COMMENT ON COLUMN public.marketing_costs.marketing_cost IS 'Custo total de marketing no período';
COMMENT ON COLUMN public.marketing_costs.sales_cost IS 'Custo total de vendas (salários, comissões, etc) no período';
COMMENT ON COLUMN public.marketing_costs.average_retention_months IS 'Tempo médio de retenção de clientes em meses';

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_marketing_costs_company_period ON public.marketing_costs(company_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_marketing_costs_period ON public.marketing_costs(period_start, period_end);

-- Habilitar RLS
ALTER TABLE public.marketing_costs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Gestores e owners podem ver custos da empresa"
  ON public.marketing_costs
  FOR SELECT
  USING (
    company_id = get_user_company_id() 
    AND (is_owner(auth.uid()) OR has_role(auth.uid(), 'gestor'::app_role))
  );

CREATE POLICY "Gestores e owners podem criar custos"
  ON public.marketing_costs
  FOR INSERT
  WITH CHECK (
    company_id = get_user_company_id() 
    AND created_by = auth.uid()
    AND (is_owner(auth.uid()) OR has_role(auth.uid(), 'gestor'::app_role))
  );

CREATE POLICY "Gestores e owners podem atualizar custos"
  ON public.marketing_costs
  FOR UPDATE
  USING (
    company_id = get_user_company_id() 
    AND (is_owner(auth.uid()) OR has_role(auth.uid(), 'gestor'::app_role))
  );

CREATE POLICY "Owners podem deletar custos"
  ON public.marketing_costs
  FOR DELETE
  USING (
    company_id = get_user_company_id() 
    AND is_owner(auth.uid())
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_marketing_costs_updated_at
  BEFORE UPDATE ON public.marketing_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();