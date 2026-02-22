

# Correcao: "null value in column assigned_to violates not-null constraint"

## Problema
A coluna `assigned_to` na tabela `tasks` tem constraint `NOT NULL`. Quando o tipo de atribuicao e "Todos os vendedores", o codigo define `assigned_to: null` (linha 128 do TaskDialog), causando o erro.

Este bug ja existia antes da minha correcao anterior. A correcao anterior apenas tornou o caminho mais visivel ao normalizar strings vazias para `null`.

## Causa Raiz
- O `createTaskMutation` (linha 128) faz: `assigned_to: data.assignment_type === "individual" ? data.assigned_to : null`
- Quando "Todos os vendedores" e selecionado, `assigned_to` vira `null`
- Mas a coluna `assigned_to` no banco e `NOT NULL`

## Solucao
Quando `assignment_type === "todos"`, usar o ID do usuario criador como `assigned_to` (ja que a tarefa pertence a todos, o criador e o "dono" principal). Isso respeita a constraint NOT NULL sem mudar o schema.

### Arquivo: `src/components/tasks/TaskDialog.tsx`

**Linha 128** - Mudar de:
```typescript
assigned_to: data.assignment_type === "individual" ? data.assigned_to : null,
```

**Para:**
```typescript
assigned_to: data.assignment_type === "individual" ? data.assigned_to : session.session.user.id,
```

**Linha 273 (onSubmit)** - Garantir que `assigned_to` nunca e null na criacao:
```typescript
const cleanData = {
  ...finalData,
  lead_id: finalData.lead_id || null,
  due_date: finalData.due_date || null,
  assigned_to: finalData.assigned_to || currentUserId,
};
```

Isso garante que `assigned_to` sempre tem um UUID valido, usando o usuario atual como fallback.

## O que nao muda
- Fluxo de edicao de tarefas (update) - nao e afetado
- LinkedTasks - correcao anterior continua funcionando
- TaskLeadNotesDrawer - nao usa TaskDialog
- Comportamento do tipo "Todos os vendedores" - continua criando `task_assignments` para todos

