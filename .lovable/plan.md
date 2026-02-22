

# Ajuste Final: LinkedTasks.tsx

## O que falta
Apenas 1 item pendente do plano original: o componente `LinkedTasks.tsx` ainda mostra um botao "Nova Tarefa" e busca tarefas por `lead_id`, mas no novo fluxo tarefas nao sao mais vinculadas a leads.

## Solucao
Simplificar o `LinkedTasks.tsx` para:
- Remover o botao "Nova Tarefa" (tarefas agora sao criadas apenas pela pagina de Tarefas ou pelo gestor)
- Remover o import do `TaskDialog` (nao e mais necessario)
- Manter a listagem de tarefas que porventura ja estejam vinculadas ao lead (dados historicos), mas sem permitir criar novas

### Alteracoes no arquivo `src/components/tasks/LinkedTasks.tsx`
- Remover estado `isDialogOpen` e import de `TaskDialog`
- Remover botao "Nova Tarefa" do header
- Manter query de tarefas por `lead_id` (para exibir tarefas historicas ja vinculadas)
- Se nao houver tarefas, mostrar mensagem simples

### Detalhes tecnicos

```text
ANTES:
- Botao "Nova Tarefa" visivel
- Import de TaskDialog e Plus icon
- Estado isDialogOpen

DEPOIS:
- Sem botao de criacao
- Sem dialog
- Apenas listagem read-only das tarefas existentes vinculadas ao lead
```

Nenhuma outra alteracao e necessaria. Os demais itens do plano ja foram todos implementados.

