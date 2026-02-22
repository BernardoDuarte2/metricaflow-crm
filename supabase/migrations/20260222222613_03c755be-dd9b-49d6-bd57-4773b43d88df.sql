
CREATE OR REPLACE FUNCTION public.update_kpi_on_sale()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_month DATE;
  v_company_id UUID;
  v_user_id UUID;
  v_value NUMERIC;
BEGIN
  IF (NEW.status = 'ganho' OR NEW.status = 'fechado')
     AND (OLD.status IS NULL OR (OLD.status != 'ganho' AND OLD.status != 'fechado')) THEN
    v_month := date_trunc('month', now())::DATE;
    v_company_id := NEW.company_id;
    v_user_id := NEW.assigned_to;
    
    SELECT COALESCE(SUM(amount), 0) INTO v_value
    FROM public.lead_values
    WHERE lead_id = NEW.id;
    
    IF v_value = 0 THEN
      v_value := COALESCE(NEW.estimated_value, 0);
    END IF;
    
    INSERT INTO public.seller_kpi_monthly (company_id, user_id, month, actual_revenue, actual_deals)
    VALUES (v_company_id, v_user_id, v_month, v_value, 1)
    ON CONFLICT (company_id, user_id, month)
    DO UPDATE SET
      actual_revenue = seller_kpi_monthly.actual_revenue + v_value,
      actual_deals = seller_kpi_monthly.actual_deals + 1,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_gamification_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  points_earned integer;
  event_type_text text;
  observation_count integer;
  company_id_var uuid;
BEGIN
  IF TG_TABLE_NAME = 'leads' THEN
    company_id_var := NEW.company_id;
    
    IF TG_OP = 'INSERT' AND NEW.assigned_to IS NOT NULL THEN
      event_type_text := 'lead_created';
      points_earned := get_gamification_points(company_id_var, event_type_text);
      
      INSERT INTO public.gamification_events (user_id, event_type, points, lead_id, metadata)
      VALUES (
        NEW.assigned_to,
        event_type_text,
        points_earned,
        NEW.id,
        jsonb_build_object('lead_name', NEW.name)
      );
      
    ELSIF TG_OP = 'UPDATE' AND NEW.assigned_to IS NOT NULL THEN
      IF (NEW.status IN ('ganho', 'fechado')) AND (OLD.status NOT IN ('ganho', 'fechado')) THEN
        event_type_text := 'sale_closed';
        points_earned := get_gamification_points(company_id_var, event_type_text) + 
                        COALESCE(FLOOR(COALESCE(NEW.estimated_value, 0) / 1000), 0);
        
        INSERT INTO public.gamification_events (user_id, event_type, points, lead_id, metadata)
        VALUES (
          NEW.assigned_to,
          event_type_text,
          points_earned,
          NEW.id,
          jsonb_build_object(
            'lead_name', NEW.name, 
            'estimated_value', COALESCE(NEW.estimated_value, 0)
          )
        );
        
      ELSIF NEW.status = 'proposta' AND OLD.status != 'proposta' THEN
        event_type_text := 'proposal_sent';
        points_earned := get_gamification_points(company_id_var, event_type_text);
        
        INSERT INTO public.gamification_events (user_id, event_type, points, lead_id, metadata)
        VALUES (
          NEW.assigned_to,
          event_type_text,
          points_earned,
          NEW.id,
          jsonb_build_object('lead_name', NEW.name)
        );
      END IF;
    END IF;
    
  ELSIF TG_TABLE_NAME = 'lead_observations' THEN
    SELECT l.company_id INTO company_id_var
    FROM public.leads l
    WHERE l.id = NEW.lead_id;
    
    SELECT COUNT(*) INTO observation_count
    FROM public.lead_observations
    WHERE user_id = NEW.user_id
      AND lead_id = NEW.lead_id
      AND created_at > now() - INTERVAL '24 hours';
    
    IF observation_count <= 5 THEN
      event_type_text := 'observation_added';
      points_earned := get_gamification_points(company_id_var, event_type_text);
      
      INSERT INTO public.gamification_events (user_id, event_type, points, lead_id, metadata)
      VALUES (
        NEW.user_id,
        event_type_text,
        points_earned,
        NEW.lead_id,
        jsonb_build_object('observation_count', observation_count)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
