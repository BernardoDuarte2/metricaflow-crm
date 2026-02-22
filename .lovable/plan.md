

# Corrigir Seletor de Ano Futuro no Kanban

## Problema
O botao de ano futuro nao funciona devido a um bug de fuso horario. `new Date("2027-01-01")` e interpretado como UTC, que no Brasil (UTC-3) vira 31/12/2026, fazendo `getFullYear()` retornar 2026.

## Correcao

### Arquivo: `src/components/leads/KanbanFilters.tsx`

Substituir linhas 36-37:

**De:**
```typescript
const currentDate = new Date(selectedMonth + '-01');
const currentYear = currentDate.getFullYear();
```

**Para:**
```typescript
const [currentYearStr, currentMonthStr] = selectedMonth.split('-');
const currentYear = parseInt(currentYearStr, 10);
const currentMonth = parseInt(currentMonthStr, 10) - 1;
const currentDate = new Date(currentYear, currentMonth, 1);
```

Isso usa `new Date(year, month, day)` que cria a data no fuso local, eliminando o problema de UTC. O `currentYear` e extraido direto da string, garantindo valor correto.

**Impacto:** 2 linhas substituidas por 4 linhas, em 1 unico arquivo.

