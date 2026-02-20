

# Correcoes no Kanban: Fechado, Perdido e Valores

## Bugs Identificados

### Bug 1: Valor "comendo zeros"
**Causa raiz:** No arquivo `ClosedLeadDialog.tsx` (linha 147), o parsing do valor faz:
```
"1.500,00" → remove caracteres → "1.500,00" → troca virgula por ponto → "1.500.00" → parseFloat → 1.5
```
O ponto usado como separador de milhar no formato brasileiro e interpretado como ponto decimal pelo `parseFloat`, transformando R$ 1.500,00 em R$ 1,50.

**Correcao:** Remover os pontos de milhar ANTES de trocar a virgula por ponto:
```
"1.500,00" → remove pontos → "1500,00" → troca virgula → "1500.00" → parseFloat → 1500
```

O mesmo bug existe no `LeadValuesList.tsx` (se houver parsing similar).

### Bug 2: Cards somem ao mover para "Fechado"
**Causa raiz:** Dois problemas combinados:
1. O `ClosedLeadDialog` invalida apenas `["leads"]`, mas NAO invalida `["kanban-leads"]` - entao o Kanban nao recarrega os dados atualizados
2. O filtro `monthLeads` exclui leads fechados que nao foram atualizados no mes/ano selecionado, podendo causar desaparecimento

**Correcao:** Adicionar invalidacao de `["kanban-leads"]` e `["dashboard-stats"]` no `ClosedLeadDialog` apos confirmar o fechamento.

### Bug 3: Cards somem ao ir para "Perdido"
**Causa raiz:** Na linha 280 do `Kanban.tsx`, existe um filtro explicito:
```
if (lead.status === 'perdido') return false;
```
Isso remove TODOS os leads perdidos do Kanban principal, embora a coluna "Perdido" exista. Os leads perdidos so aparecem na secao separada de "inativos" abaixo.

**Correcao:** Remover esse filtro para que leads com status "perdido" aparecam normalmente na coluna "Perdido" do Kanban.

---

## Arquivos Alterados

### 1. `src/components/leads/ClosedLeadDialog.tsx`
- Linha 147: Corrigir parsing do valor - remover pontos de milhar antes de converter
- Linhas 127-129: Adicionar invalidacao de `["kanban-leads"]` e `["dashboard-stats"]`

### 2. `src/pages/Kanban.tsx`
- Linha 280 (monthLeads mensal): Remover `if (lead.status === 'perdido') return false`
- Linha 243 (monthLeads anual): Remover `if (lead.status === 'perdido') return false`
- Linha 452 (onConfirm): Adicionar invalidacao de `["kanban-leads"]`

### 3. `src/components/leads/LeadValuesList.tsx`
- Verificar e corrigir o mesmo bug de parsing de valor, se existir

---

## O que NAO sera alterado
- Nenhuma tabela do banco de dados
- Nenhuma rota
- O fluxo do modal de fechamento (ja funciona corretamente)
- A logica de observacoes e notas (ja esta correta)
- O dashboard (ja recebe os dados corretos, so precisa ser invalidado)

