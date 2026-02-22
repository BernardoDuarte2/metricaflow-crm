

# Remover opção "Vendedor específico" da criação de tarefas

## O que muda
Ao criar uma tarefa, o gestor/owner não precisará mais escolher entre "vendedor específico" ou "todos". Toda tarefa criada será automaticamente atribuída a **todos os vendedores** da empresa.

## Alterações

### 1. Migration SQL
Remover o trigger problemático que causa o erro de FK:

```text
DROP TRIGGER IF EXISTS create_task_assignment_on_insert ON public.tasks;
DROP FUNCTION IF EXISTS public.create_task_assignment_on_insert();
```

### 2. TaskDialog.tsx
- Remover o campo "Atribuir para" (select individual/todos)
- Remover o campo "Vendedor" (select de vendedores)
- Remover o state `assignmentType` e `assignedTo`
- Remover a query `company-users` (não é mais necessária)
- Forçar `assignment_type = "todos"` sempre
- Usar o ID do usuário logado como `assigned_to` (campo obrigatório na tabela)
- Manter a lógica de buscar o task ID e criar assignments para todos os vendedores

## Resumo
- 1 migration (remover trigger/funcao)
- 1 arquivo editado (TaskDialog.tsx) - simplificar formulário
- Interface mais simples e sem erro de FK

