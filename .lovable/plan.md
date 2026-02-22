

# Corrigir: Vendas fechadas de leads antigos nao aparecem no dashboard

## Problema
O dashboard usa `created_at` para filtrar **todos** os leads. Quando um lead foi criado em um mes/ano anterior mas fechado agora, ele nao aparece nas metricas do periodo atual porque o `created_at` esta fora do intervalo.

## Causa raiz
A funcao `buildQuery` aplica `.gte('created_at', start_date).lte('created_at', end_date)` em todas as queries sem distincao. Queries de leads ganhos/receita precisam usar `updated_at` (data do fechamento).

## Solucao
Criar uma segunda funcao `buildWonQuery` que filtra por `updated_at` em vez de `created_at`, e usar essa funcao apenas nas queries relacionadas a vendas concretizadas. As demais queries continuam inalteradas.

## Alteracoes no arquivo `supabase/functions/get-dashboard-stats/index.ts`

### 1. Nova funcao auxiliar
Adicionar `buildWonQuery` ao lado de `buildQuery`:

```text
const buildWonQuery = (baseQuery) => {
  let query = baseQuery
    .gte('updated_at', start_date)
    .lte('updated_at', end_date);
  if (user_role === 'vendedor' && user_id) {
    query = query.eq('assigned_to', user_id);
  }
  return query;
};
```

### 2. Queries que mudam para `buildWonQuery`
Apenas as que medem vendas concretizadas no periodo:

| Query | Motivo |
|---|---|
| `wonLeadsResult` (linha 105) | Conta leads ganhos no periodo |
| `wonLeadValuesResult` (linha 108) | Soma valores de vendas do periodo |
| `closedLeadsWithTimeResult` (linha 114) | Calcula tempo medio de fechamento |

### 3. Queries de receita mensal por vendedor (linhas 134-136)
- `monthlyLeadsDataResult`: continua com `created_at` (mostra leads criados por mes)
- `monthlyRevenueBySellerResult`: muda para usar `updated_at` nos leads, para capturar receita pelo mes de fechamento

### 4. Ajuste no processamento mensal (linha 454)
No loop de `monthlyRevenueData`, usar `updated_at` em vez de `created_at` para determinar o mes da receita.

### 5. Queries que NAO mudam (continuam com `buildQuery` / `created_at`)
Todas as demais, incluindo:
- `totalLeadsResult` - total de leads criados
- `pendingLeadsResult` - pipeline ativo
- `statusDataResult`, `sourceDataResult`, `funnelDataResult` - distribuicoes
- `qualifiedLeadsResult`, `opportunitiesResult` - qualificacao
- `lostLeadsResult` - perdas
- `scheduledMeetingsResult`, `tasksResult`, `observationsResult` - atividades
- `allLeadsWithAssignedResult` - performance do time
- `previousPeriodLeadsResult`, `previousPeriodWonResult` - comparacao

## Resumo
- 1 arquivo editado: `supabase/functions/get-dashboard-stats/index.ts`
- Adiciona `buildWonQuery` (filtro por `updated_at`)
- Altera 3-4 queries especificas de vendas
- Nenhuma query de pipeline/atividade e alterada
- Nenhuma alteracao no frontend

