
# Remover "Progresso do Time Comercial" do Dashboard

## Motivo
O painel "Progresso do Time Comercial" (`TeamProgressPanel`) exibe informacoes redundantes que ja aparecem em outros componentes do Dashboard (como o GoalHeroCard e o SalesRepDetailedPanel).

## Alteracao

### Arquivo: `src/pages/Dashboard.tsx`
- Remover a importacao do `TeamProgressPanel` (linha 37)
- Remover o bloco de renderizacao do componente (linhas 566-573)

Nenhum outro arquivo sera alterado. O componente `TeamProgressPanel.tsx` sera mantido no codigo (pode ser util futuramente), apenas deixara de ser exibido no Dashboard.
