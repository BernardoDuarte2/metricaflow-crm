

## Problema

O gráfico "Evolução Mensal por Fonte" usa AreaChart com áreas sobrepostas, o que torna difícil distinguir cada fonte individualmente. As áreas se misturam e confundem a leitura.

## Solução: Trocar para BarChart agrupado

Substituir o AreaChart por um **BarChart vertical agrupado**, onde cada mês mostra barras lado a lado para cada fonte. Isso elimina sobreposição e torna a comparação entre fontes imediata.

**Vantagens:**
- Cada fonte tem sua própria barra separada -- sem sobreposição
- Fácil comparar fontes dentro do mesmo mês
- Fácil ver a evolução de cada fonte ao longo dos meses
- Tooltip mostra o detalhe de todas as fontes no mês

## Mudanças Técnicas

**Arquivo: `src/components/dashboard/cockpit/SourceEvolutionChart.tsx`**
- Trocar `AreaChart` + `Area` por `BarChart` + `Bar` (vertical, agrupado -- não empilhado)
- Remover gradients/defs que não se aplicam a barras
- Cada fonte vira um `<Bar>` com sua cor, `barSize` controlado para ficarem legíveis
- Manter o mesmo header, legenda estática e tooltip customizado
- Manter as mesmas cores sincronizadas com o gráfico de Conversão por Fonte

