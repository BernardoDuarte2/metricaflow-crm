

## Igualar altura dos cards "Performance do Time" e "Receita por Vendedor"

### Problema
O card "Performance do Time" tem `max-h-[480px]` fixo, enquanto "Receita por Vendedor" calcula a altura dinamicamente (`sellers * 44px`). Isso faz com que fiquem desalinhados no grid.

### Solução
Usar CSS `h-full` + uma altura mínima/máxima consistente em ambos, e garantir que o grid force alturas iguais via `items-stretch`.

### Mudanças

**`src/components/dashboard/cockpit/SalesRepDetailedPanel.tsx`**
- Trocar `max-h-[480px]` por `h-full` no container principal (linha 59), mantendo scroll interno

**`src/components/dashboard/cockpit/RevenueBySellerChart.tsx`**
- Já tem `h-full` — manter
- Trocar a altura dinâmica do chart (`style={{ height: chartHeight }}`) para usar `flex-1` com `min-h-[280px]`, fazendo o chart preencher o espaço disponível
- Adicionar `flex flex-col` ao container principal para o chart crescer com o card

**`src/pages/Dashboard.tsx`**
- Adicionar `items-stretch` ao grid (linha 580) para forçar ambos os cards a terem a mesma altura: `grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch`

