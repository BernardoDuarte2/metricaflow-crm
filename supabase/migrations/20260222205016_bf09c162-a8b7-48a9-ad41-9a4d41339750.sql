
-- Recriar a função para AFTER trigger (retorna NULL em vez de NEW)
CREATE OR REPLACE FUNCTION public.create_task_assignment_on_insert()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.assignment_type = 'individual' AND NEW.assigned_to IS NOT NULL THEN
    INSERT INTO task_assignments (task_id, user_id, company_id, status)
    VALUES (NEW.id, NEW.assigned_to, NEW.company_id, 'pendente')
    ON CONFLICT DO NOTHING;

    UPDATE public.tasks SET total_assigned = 1 WHERE id = NEW.id;
  END IF;
  RETURN NULL;
END;
$function$;

-- Recriar o trigger como AFTER INSERT
DROP TRIGGER IF EXISTS create_task_assignment_on_insert ON public.tasks;

CREATE TRIGGER create_task_assignment_on_insert
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.create_task_assignment_on_insert();
