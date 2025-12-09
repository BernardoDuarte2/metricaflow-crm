
-- Tabela: Guias de etapas do pipeline (Manual Vivo)
CREATE TABLE public.pipeline_stage_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  objective TEXT NOT NULL,
  mindset TEXT,
  what_to_say TEXT,
  mental_triggers JSONB DEFAULT '[]'::jsonb,
  common_mistakes JSONB DEFAULT '[]'::jsonb,
  ideal_time_days INTEGER DEFAULT 7,
  how_to_advance TEXT,
  how_not_to_advance TEXT,
  order_index INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: Critérios de avanço por etapa
CREATE TABLE public.stage_advancement_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  description TEXT NOT NULL,
  check_type TEXT NOT NULL DEFAULT 'manual',
  mandatory BOOLEAN DEFAULT false,
  blocking BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela: Violações detectadas
CREATE TABLE public.stage_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  violation_type TEXT NOT NULL,
  stage_from TEXT,
  stage_to TEXT,
  message TEXT,
  severity TEXT DEFAULT 'warning',
  detected_at TIMESTAMPTZ DEFAULT now(),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id)
);

-- Tabela: Scripts prontos para cada etapa
CREATE TABLE public.stage_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  title TEXT NOT NULL,
  situation TEXT,
  script_content TEXT NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_pipeline_guides_company_stage ON public.pipeline_stage_guides(company_id, stage_id);
CREATE INDEX idx_stage_criteria_company_stage ON public.stage_advancement_criteria(company_id, stage_id);
CREATE INDEX idx_stage_violations_lead ON public.stage_violations(lead_id);
CREATE INDEX idx_stage_violations_user ON public.stage_violations(user_id);
CREATE INDEX idx_stage_violations_company ON public.stage_violations(company_id);
CREATE INDEX idx_stage_scripts_company_stage ON public.stage_scripts(company_id, stage_id);

-- Enable RLS
ALTER TABLE public.pipeline_stage_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_advancement_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_scripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: pipeline_stage_guides
CREATE POLICY "Users can view guides from their company or defaults"
ON public.pipeline_stage_guides FOR SELECT
USING (company_id = get_user_company_id() OR is_default = true);

CREATE POLICY "Gestores e owners podem criar guias"
ON public.pipeline_stage_guides FOR INSERT
WITH CHECK (company_id = get_user_company_id() AND (is_owner(auth.uid()) OR has_role(auth.uid(), 'gestor'::app_role)));

CREATE POLICY "Gestores e owners podem atualizar guias"
ON public.pipeline_stage_guides FOR UPDATE
USING (company_id = get_user_company_id() AND (is_owner(auth.uid()) OR has_role(auth.uid(), 'gestor'::app_role)));

CREATE POLICY "Gestores e owners podem deletar guias"
ON public.pipeline_stage_guides FOR DELETE
USING (company_id = get_user_company_id() AND is_default = false AND (is_owner(auth.uid()) OR has_role(auth.uid(), 'gestor'::app_role)));

-- RLS Policies: stage_advancement_criteria
CREATE POLICY "Users can view criteria from their company or defaults"
ON public.stage_advancement_criteria FOR SELECT
USING (company_id = get_user_company_id() OR is_default = true);

CREATE POLICY "Gestores e owners podem criar critérios"
ON public.stage_advancement_criteria FOR INSERT
WITH CHECK (company_id = get_user_company_id() AND (is_owner(auth.uid()) OR has_role(auth.uid(), 'gestor'::app_role)));

CREATE POLICY "Gestores e owners podem atualizar critérios"
ON public.stage_advancement_criteria FOR UPDATE
USING (company_id = get_user_company_id() AND (is_owner(auth.uid()) OR has_role(auth.uid(), 'gestor'::app_role)));

CREATE POLICY "Gestores e owners podem deletar critérios"
ON public.stage_advancement_criteria FOR DELETE
USING (company_id = get_user_company_id() AND is_default = false AND (is_owner(auth.uid()) OR has_role(auth.uid(), 'gestor'::app_role)));

-- RLS Policies: stage_violations
CREATE POLICY "Gestores e owners veem violações da empresa"
ON public.stage_violations FOR SELECT
USING (company_id = get_user_company_id() AND (is_owner(auth.uid()) OR has_role(auth.uid(), 'gestor'::app_role)));

CREATE POLICY "Vendedores veem suas próprias violações"
ON public.stage_violations FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Sistema pode criar violações"
ON public.stage_violations FOR INSERT
WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Gestores podem resolver violações"
ON public.stage_violations FOR UPDATE
USING (company_id = get_user_company_id() AND (is_owner(auth.uid()) OR has_role(auth.uid(), 'gestor'::app_role)));

-- RLS Policies: stage_scripts
CREATE POLICY "Users can view scripts from their company or defaults"
ON public.stage_scripts FOR SELECT
USING (company_id = get_user_company_id() OR is_default = true);

CREATE POLICY "Gestores e owners podem criar scripts"
ON public.stage_scripts FOR INSERT
WITH CHECK (company_id = get_user_company_id() AND (is_owner(auth.uid()) OR has_role(auth.uid(), 'gestor'::app_role)));

CREATE POLICY "Gestores e owners podem atualizar scripts"
ON public.stage_scripts FOR UPDATE
USING (company_id = get_user_company_id() AND (is_owner(auth.uid()) OR has_role(auth.uid(), 'gestor'::app_role)));

CREATE POLICY "Gestores e owners podem deletar scripts"
ON public.stage_scripts FOR DELETE
USING (company_id = get_user_company_id() AND is_default = false AND (is_owner(auth.uid()) OR has_role(auth.uid(), 'gestor'::app_role)));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pipeline_guides_updated_at
BEFORE UPDATE ON public.pipeline_stage_guides
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stage_scripts_updated_at
BEFORE UPDATE ON public.stage_scripts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
