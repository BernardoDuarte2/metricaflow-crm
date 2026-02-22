

# Correcao do Sistema de Tarefas (sem quebrar nada)

## Bugs identificados

### Bug 1 (Critico - erro da screenshot)
**Arquivo:** `LinkedTasks.tsx` linha 100
**Problema:** Passa `task={{ lead_id: leadId }}` para o TaskDialog. Como `task` e truthy, o dialog entra em modo "editar", mas `task.id` e `undefined`. Ao salvar, executa `.eq("id", undefined)` causando "invalid input syntax for type uuid".
**Correcao:** Adicionar prop `defaultLeadId` ao TaskDialog e parar de passar `task` falso.

### Bug 2 (UUID vazio)
**Arquivo:** `TaskDialog.tsx` linhas 268-272
**Problema:** `assigned_to` nao e normalizado para `null` quando vazio. String vazia `""` nao e UUID valido.
**Correcao:** Adicionar `assigned_to: finalData.assigned_to || null` na limpeza.

### Bug 3 (Update envia campos extras)
**Arquivo:** `TaskDialog.tsx` linhas 274-275
**Problema:** O update envia todos os campos do formulario (incluindo `assignment_type`, `assigned_to` vazio) direto ao Supabase, podendo causar conflitos.
**Correcao:** Filtrar apenas campos editaveis no update.

---

## Alteracoes (2 arquivos, mudancas cirurgicas)

### Arquivo 1: `src/components/tasks/TaskDialog.tsx`

**a) Interface (linhas 26-30)** - Adicionar prop opcional:
```typescript
interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: any;
  defaultLeadId?: string;  // NOVO
}
```

**b) Destructuring (linha 32)** - Receber nova prop:
```typescript
export function TaskDialog({ open, onOpenChange, task, defaultLeadId }: TaskDialogProps)
```

**c) useEffect (linhas 243-259)** - Usar defaultLeadId para criacao:
```typescript
useEffect(() => {
  if (task) {
    setValue("title", task.title);
    setValue("description", task.description || "");
    setValue("assigned_to", task.assigned_to || "");
    setValue("assignment_type", task.assignment_type || "individual");
    setValue("lead_id", task.lead_id || "");
    setValue("due_date", task.due_date ? task.due_date.split("T")[0] : "");
  } else {
    reset();
    if (defaultLeadId) {
      setValue("lead_id", defaultLeadId);
    }
    if (isVendedor && currentUserId) {
      setValue("assigned_to", currentUserId);
      setValue("assignment_type", "individual");
    }
  }
}, [task, setValue, reset, isVendedor, currentUserId, defaultLeadId]);
```

**d) onSubmit (linhas 261-278)** - Normalizar assigned_to e filtrar update:
```typescript
const onSubmit = (data: any) => {
  const finalData = isVendedor && !task
    ? { ...data, assigned_to: currentUserId, assignment_type: "individual" }
    : data;

  const cleanData = {
    ...finalData,
    lead_id: finalData.lead_id || null,
    due_date: finalData.due_date || null,
    assigned_to: finalData.assigned_to || null,
  };

  if (task) {
    const updateData: any = {
      title: cleanData.title,
      description: cleanData.description || null,
      due_date: cleanData.due_date,
      lead_id: cleanData.lead_id,
    };
    if (cleanData.assigned_to) {
      updateData.assigned_to = cleanData.assigned_to;
    }
    updateTaskMutation.mutate(updateData);
  } else {
    createTaskMutation.mutate(cleanData);
  }
};
```

### Arquivo 2: `src/components/tasks/LinkedTasks.tsx`

**Linha 97-101** - Usar defaultLeadId em vez de task falso:
```tsx
<TaskDialog
  open={isDialogOpen}
  onOpenChange={setIsDialogOpen}
  defaultLeadId={leadId}
/>
```

---

## O que NAO muda (garantia de nao quebrar)

- **`Tasks.tsx`** (linha 164-168): Continua passando `task={selectedTask}` normalmente. A nova prop `defaultLeadId` e opcional e nao afeta esse uso.
- **`TaskCard.tsx`**: Nenhuma alteracao.
- **`TaskKanban.tsx`**: Nenhuma alteracao.
- **`TaskLeadNotesDrawer.tsx`**: Cria tarefas direto no Supabase, sem usar TaskDialog. Nao e afetado.
- **`LeadDetail.tsx`**: Cria tarefas direto no Supabase. Nao e afetado.
- **Criacao de tarefas**: O `createTaskMutation` nao muda, apenas recebe `assigned_to: null` em vez de `""`.
- **Edicao de tarefas**: Agora envia apenas campos relevantes, evitando conflitos.

## Resumo: 2 arquivos, 4 pontos de mudanca, zero impacto nos fluxos existentes.

