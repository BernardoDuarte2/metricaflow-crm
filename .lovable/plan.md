
# Correção: FK Violation ao Criar Tarefa

## Causa Raiz
O trigger `create_task_assignment_on_insert` é executado **ANTES** (BEFORE INSERT) da tarefa ser salva no banco. Ele tenta inserir em `task_assignments` com o `task_id` da tarefa que ainda nao existe, causando a violacao de foreign key.

## Solucao
Alterar o trigger de BEFORE para AFTER INSERT. Assim, a tarefa ja existira no banco quando o trigger tentar criar o assignment.

## Alteracao necessaria (Migration SQL)

Recriar a funcao para nao modificar `NEW` (pois AFTER triggers nao podem alterar a row):

```sql
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
```

Recriar o trigger como AFTER:

```sql
DROP TRIGGER IF EXISTS create_task_assignment_on_insert ON public.tasks;

CREATE TRIGGER create_task_assignment_on_insert
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.create_task_assignment_on_insert();
```

## Resumo
- 1 migration SQL (recriar funcao + trigger)
- 0 alteracoes em codigo frontend
- Corrige o erro de FK para ambos os tipos: individual e todos
