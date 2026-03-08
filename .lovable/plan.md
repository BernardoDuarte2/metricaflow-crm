

# Redesign dos Gráficos do Dashboard — Remover Redundâncias + Visual Enterprise

## Problema Identificado

Analisando o dashboard, há **informações repetidas** entre componentes:

| Dado | Onde aparece (duplicado) |
|---|---|
| Reuniões, Tarefas, Obs. por vendedor | `SalesRepDetailedPanel` (tabela) **E** `ActivityBreakdownPanel` (gráfico) |
| Receita mensal | `TrendChart "Evolução da Receita"` **E** `RevenueBySellerChart` |
| Leads vs Fechados + Conversão | `MonthlyComparisonCard` **E** `LeadsConversionMonthlyChart` |

## Plano

### 1. Remover 3 componentes redundantes

- **Remover `ActivityBreakdownPanel`** do Dashboard — a tabela `SalesRepDetailedPanel` já mostra reuniões, tarefas e observações por vendedor. O gráfico de barras repete os mesmos números.
- **Remover `TrendChart` "Evolução da Receita"** — o `RevenueBySellerChart` já mostra receita mensal, mas detalhada por vendedor (mais útil).
- **Remover `LeadsConversionMonthlyChart`** — o `MonthlyComparisonCard` já mostra leads, vendas, conversão e ciclo comparativos.

### 2. Redesenhar `RevenueBySellerChart` — visual premium

Trocar o BarChart genérico por um **AreaChart empilhado com gradientes suaves**, estilo dashboard financeiro:
- Áreas com gradiente transparente por vendedor (cores do sistema)
- Tooltips elegantes com fundo `#0A1628` (navy) e bordas sutis
- Sem `<Card>` wrapper com bordas duplas — usar o padrão flat `rounded-xl bg-card border-border`
- Remover "Clique para detalhes" do tooltip (visual amador)

### 3. Redesenhar `SourceConversionChart` — barras horizontais modernas

Trocar barras verticais por **barras horizontais com percentual inline**, mais legível:
- Barra de fundo sutil (total leads) com barra interna colorida (convertidos)
- Percentual de conversão à direita de cada barra
- Sem eixos Y/X visíveis — dados integrados nas barras (mais limpo)

### 4. Ajustar layout no `Dashboard.tsx`

- Seções 8 (ActivityBreakdown) e 10 (TrendChart) removidas
- `RevenueBySellerChart` e `SourceConversionChart` ficam lado a lado em grid 2 colunas
- Resultado: dashboard mais enxuto, sem repetição, visual premium

### Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `src/pages/Dashboard.tsx` | Remover 3 renders redundantes, reorganizar grid |
| `src/components/dashboard/cockpit/RevenueBySellerChart.tsx` | Redesenhar com AreaChart + gradientes |
| `src/components/dashboard/cockpit/SourceConversionChart.tsx` | Redesenhar com barras horizontais inline |

