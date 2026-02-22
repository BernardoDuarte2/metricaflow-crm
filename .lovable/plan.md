

# Simplificacao Total do Sistema de Tarefas

## Conceito
Reescrever o sistema de tarefas do zero, bem mais simples:
- **Apenas gestor/owner cria tarefas** (vendedor nao cria)
- **Sem vinculo obrigatorio com leads** (campo removido)
- **Sugestoes pre-cadastradas** + opcao de digitar titulo livre
- **Notificacao via sininho no Header** com contagem de tarefas pendentes
- **Vendedor da check** na tarefa e ela sai da notificacao; gestor ve quem concluiu

---

## Arquivos que serao REESCRITOS (simplificados)

### 1. `src/components/tasks/TaskDialog.tsx` - Formulario simplificado
- Remover campo de lead_id
- Remover validacao Zod complexa (usar validacao simples inline)
- Adicionar lista de **sugestoes pre-cadastradas**:
  - "Verificar leads em aberto"
  - "Atualizar status dos leads"
  - "Conferir cartao ponto"
  - "Focar em vendas em aberto"
  - "Fazer follow-up com clientes"
  - "Atualizar planilha de vendas"
- Ao clicar numa sugestao, preenche o titulo automaticamente
- Campo de titulo livre (pode digitar qualquer coisa)
- Selector: vendedor especifico OU todos
- Campo de prazo (data) opcional
- Descricao opcional
- Apenas gestores/owners podem abrir (esconder botao para vendedores)

### 2. `src/components/tasks/TaskCard.tsx` - Simplificar card
- Remover toda logica de lead (link, drawer, notas)
- Remover `TaskLeadNotesDrawer` 
- Botao "Concluir" simples: atualiza `task_assignments.status` para "concluida"
- Gestor ve progresso (quem concluiu / quem nao)

### 3. `src/pages/Tasks.tsx` - Pagina simplificada
- Remover filtros complexos (TaskFilters)
- Manter Kanban simplificado (Abertas, Atrasadas, Concluidas)
- Botao "Nova Tarefa" so aparece para gestores
- Manter TaskStats

### 4. `src/components/layout/Header.tsx` - Sininho de tarefas
- Vendedores: sininho mostra suas tarefas pendentes (da `task_assignments` onde status = "pendente")
- Cada tarefa mostra titulo, prazo e botao de check para concluir
- Ao dar check, tarefa sai da lista
- Gestores: sininho mostra tarefas que criou com progresso (X/Y concluidos)

### 5. `src/components/tasks/TaskKanban.tsx` - Manter simples
- Sem alteracoes estruturais, apenas recebe os novos dados

### 6. `src/components/tasks/TaskFilters.tsx` - Simplificar
- Remover filtro de lead
- Manter apenas busca por texto e filtro por status

### 7. `src/components/tasks/LinkedTasks.tsx` - Simplificar
- Manter funcional mas sem o botao "Nova Tarefa" (ja que tarefas nao vinculam a leads)
- Ou remover completamente e tirar referencia do LeadDetail

### 8. `src/lib/validation.ts` - Atualizar taskSchema
- Remover campo `lead_id` do schema
- Simplificar campos

---

## Detalhes Tecnicos

### TaskDialog - Sugestoes pre-cadastradas
```typescript
const TASK_SUGGESTIONS = [
  "Verificar leads em aberto",
  "Atualizar status dos leads",
  "Conferir cartao ponto",
  "Focar em vendas em aberto",
  "Fazer follow-up com clientes",
  "Atualizar planilha de vendas",
];
```
UI: chips/botoes clicaveis que preenchem o titulo. Abaixo, input livre para digitar outro titulo.

### Header - Notificacao de tarefas para vendedores
Query: buscar de `task_assignments` onde `user_id = auth.uid()` e `status = 'pendente'`, join com `tasks` para pegar titulo e prazo.

Para gestores: buscar `tasks` onde `created_by = auth.uid()` e `status != 'concluida'`, com contagem de assignments.

Ao clicar no check:
```typescript
await supabase
  .from("task_assignments")
  .update({ status: "concluida", completed_at: new Date().toISOString() })
  .eq("id", assignmentId);
```

### Fluxo de criacao (simplificado)
1. Gestor abre dialog
2. Escolhe sugestao ou digita titulo
3. Escolhe vendedor ou "todos"
4. (Opcional) define prazo e descricao
5. Salva: insere na tabela `tasks` + cria `task_assignments`
6. Vendedor ve no sininho do Header

### O que NAO muda
- Tabelas `tasks` e `task_assignments` no banco - mesma estrutura
- RLS policies - sem mudancas
- Trigger `create_task_assignment_on_insert` - continua funcionando
- Trigger `update_task_progress` - continua funcionando
- `TaskLeadNotesDrawer` - sera removido das importacoes do TaskCard mas o arquivo pode ficar (nao quebra nada)

### O que REMOVE
- Campo `lead_id` do formulario de criacao (coluna fica no banco, apenas nao e usada no novo fluxo)
- Logica de vendedor criar tarefas
- Logica de abrir drawer de notas ao concluir
- Filtro por lead nos filtros de tarefa

---

## Resumo de arquivos
- **Reescritos**: TaskDialog.tsx, TaskCard.tsx, Tasks.tsx, Header.tsx, TaskFilters.tsx
- **Atualizado**: validation.ts (taskSchema simplificado)
- **Removido de uso**: LinkedTasks.tsx (remover do LeadDetail ou simplificar)
- **Sem alteracao**: TaskKanban.tsx, TaskStats.tsx, banco de dados

