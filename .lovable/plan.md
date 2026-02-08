

## Reestruturacao Completa do Dashboard - Novo Layout Comercial

### Visao Geral

Substituir o layout atual do Dashboard por uma estrutura mais objetiva e orientada a acao, com 7 blocos claros: Placar do Negocio, Funil Unico End-to-End, Marketing vs Vendas, Pipeline de Dinheiro, Alertas Clicaveis com redirecionamento para Leads, e Evolucao no Tempo. Inclui tambem integracoes com a pagina de Leads para filtros via URL.

---

### Estrutura do Novo Dashboard

```text
+------------------------------------------------------+
| FILTRO DE PERIODO: Hoje / Semana / Mes               |
+------------------------------------------------------+
| 1. PLACAR DO NEGOCIO (4 cards em grid)               |
|  [Leads no Periodo] [SQL Gerados] [Oport. R$] [Rec.] |
|   cada um com comparacao vs periodo anterior          |
+------------------------------------------------------+
| 2. FUNIL UNICO END-TO-END                            |
|  Leads > MQL > SQL > Proposta > Negociacao > Fechado  |
|  Cada etapa: quantidade + tempo parado + cor dinamica |
+------------------------------------------------------+
| 3. MARKETING vs VENDAS (2 colunas)                   |
|  [Leads por Origem - barras] | [SQL->Fechado % KPI]  |
|  "Mktg converteu X%..."     | "Vendas acima/abaixo"  |
+------------------------------------------------------+
| 4. PIPELINE DE DINHEIRO                               |
|  Barras horizontais: Propostas R$ | Negoc. R$ | Fech  |
|  "Pipeline cobre X vezes a meta mensal"               |
+------------------------------------------------------+
| 5. ONDE ESTAMOS PERDENDO DINHEIRO (Alertas clicaveis) |
|  Propostas paradas +14d | Negociacoes +10d           |
|  Leads sem contato +3d  | SQL sem follow-up           |
|  -> Clique redireciona para /leads?filtros            |
+------------------------------------------------------+
| 6. EVOLUCAO NO TEMPO (Menor destaque)                 |
|  Grafico de linha dupla: Gerados vs Fechados          |
+------------------------------------------------------+
```

---

### Detalhes Tecnicos

#### Arquivo 1: `supabase/functions/get-dashboard-stats/index.ts`

**Novas queries necessarias no backend:**

1. **Tempo medio parado por etapa**: Para cada etapa do funil, calcular `now() - updated_at` dos leads naquele status. Retornar como `avgStaleDays` por stage.

2. **Alertas com contagem**: 
   - Propostas paradas ha +14 dias: `status IN ['proposta'] AND updated_at < now() - 14 days`
   - Negociacoes paradas ha +10 dias: `status IN ['negociacao'] AND updated_at < now() - 10 days`
   - Leads sem contato ha +3 dias: `status IN ['novo'] AND updated_at < now() - 3 days`
   - SQL sem tarefa vinculada: leads com status qualificado que NAO tem registro na tabela `tasks`

3. **Pipeline de dinheiro**: Somar `lead_values.amount` agrupado por status (`proposta`, `negociacao`, `ganho+fechado`).

4. **Conversao Marketing**: Total leads vs SQL (status qualificado) = taxa de conversao marketing.

5. **Conversao Vendas**: SQL (qualificado) vs Fechado (ganho+fechado) = taxa de conversao vendas.

6. **Dados mensais para grafico de evolucao**: Leads gerados por mes vs Leads fechados por mes (ja existe parcialmente em `monthlyLeadsConversion`).

**Novo formato de resposta** (campos adicionados ao `response.stats`):
```text
stalledProposals14d: number
stalledNegotiations10d: number  
leadsNoContact3d: number
sqlNoFollowUp: number
pipelineProposalsValue: number
pipelineNegotiationsValue: number
pipelineClosedValue: number
marketingConversionRate: number (leads -> SQL %)
salesConversionRate: number (SQL -> Fechado %)
funnelStageDays: { stage: string, avgDays: number, count: number }[]
```

#### Arquivo 2: Novo componente `src/components/dashboard/cockpit/BusinessScoreCards.tsx`

4 cards em grid (2x2 mobile, 4x1 desktop):
- **Leads no Periodo**: `stats.totalLeads` com `% vs previousTotalLeads`
- **SQL Gerados**: contagem de leads com status `qualificado` com comparacao
- **Oportunidades Abertas (R$)**: soma de `lead_values` para status `proposta + negociacao`  
- **Receita Fechada (R$)**: `stats.totalConvertedValue` com comparacao

Cada card mostra:
- Numero grande em destaque
- Seta verde (positiva) ou vermelha (negativa) com `% vs periodo anterior`

#### Arquivo 3: Novo componente `src/components/dashboard/cockpit/UnifiedFunnel.tsx`

Funil horizontal end-to-end com 6 etapas:
- Leads (todos) -> MQL (contato_feito + contato + contatado) -> SQL (qualificado) -> Proposta -> Negociacao -> Fechado (ganho + fechado)

Cada etapa mostra:
- Nome da etapa
- Quantidade de leads
- Tempo medio parado (dias) - calculado do `updated_at`
- Cor dinamica:
  - Verde: tempo <= ideal (configuravel, ex: 3 dias)
  - Amarelo: tempo entre ideal e critico
  - Vermelho: tempo > critico (ex: 7+ dias)
- Seta com taxa de conversao entre etapas

#### Arquivo 4: Novo componente `src/components/dashboard/cockpit/MarketingVsSales.tsx`

Duas colunas lado a lado:
- **Esquerda (Marketing)**: Grafico de barras com leads por origem (reusa dados de `sourceData`). Texto automatico: "Marketing converteu X% dos leads em SQL no periodo."
- **Direita (Vendas)**: Numero destacado com SQL -> Fechado %. Texto automatico com comparacao contra benchmark de 18%.

#### Arquivo 5: Novo componente `src/components/dashboard/cockpit/MoneyPipeline.tsx`

Barras horizontais mostrando:
- Propostas: R$ (soma valores leads em proposta)
- Negociacao: R$ (soma valores leads em negociacao)
- Fechados: R$ (totalConvertedValue)

Texto automatico calculando `pipeline total / meta mensal = X vezes`.

#### Arquivo 6: Novo componente `src/components/dashboard/cockpit/MoneyLeakAlerts.tsx`

Card com alertas clicaveis. Cada alerta:
- Icone vermelho + descricao + contagem
- `cursor-pointer` + `hover` effect
- Ao clicar: `navigate('/leads?status=proposta&stalled_days=14')`
- Se contagem = 0: texto "Nenhum lead nessa condicao" com check verde, item desabilitado

#### Arquivo 7: Atualizar `src/pages/Leads.tsx`

Ler filtros da URL com `useSearchParams`:
- `status` -> aplicar filtro de status
- `stalled_days` -> filtrar `updated_at < now() - X days`
- `no_contact_days` -> filtrar leads sem observacoes recentes
- `no_tasks` -> filtrar leads sem tarefas vinculadas

Exibir banner quando filtros vem da URL:
```text
"Filtro aplicado: Propostas paradas ha +14 dias" [X Limpar]
```

Garantir que clique no lead abre `/leads/{id}` diretamente (sem modal).

#### Arquivo 8: Novo componente `src/components/dashboard/cockpit/EvolutionChart.tsx`

Grafico de linha dupla usando Recharts:
- Linha 1 (azul): Leads gerados por mes
- Linha 2 (verde): Leads fechados por mes

Reusa dados de `monthlyLeadsConversion` que ja existe no backend.

#### Arquivo 9: Refatorar `src/pages/Dashboard.tsx`

Substituir o layout atual por:
1. Filtro de periodo simplificado (Hoje / Semana / Mes) - substituir o DashboardFilters complexo
2. BusinessScoreCards (4 cards)
3. UnifiedFunnel (funil unico)
4. MarketingVsSales (2 colunas)
5. MoneyPipeline (barras horizontais)
6. MoneyLeakAlerts (alertas clicaveis)
7. EvolutionChart (grafico de tendencia)
8. Manter secoes de time/performance abaixo (para gestores)
9. Manter metricas avancadas no collapsible

#### Arquivo 10: Atualizar `src/components/dashboard/cockpit/index.ts`

Exportar os novos componentes.

---

### Regras de UX

- Cards brancos com bordas sutis, layout em grid limpo
- Funil como elemento central e mais visualmente proeminente
- Vermelho APENAS para alertas e dados negativos
- Hover + cursor pointer em todos itens clicaveis
- Alertas sem leads mostram "Nenhum lead nessa condicao" com icone de check
- Dados zerados nao quebram o Dashboard (safe checks em todos componentes)

---

### Resumo de Arquivos

| Arquivo | Acao |
|---------|------|
| `supabase/functions/get-dashboard-stats/index.ts` | Adicionar queries para tempo parado, alertas especificos, pipeline por valor |
| `src/components/dashboard/cockpit/BusinessScoreCards.tsx` | NOVO - 4 cards topo |
| `src/components/dashboard/cockpit/UnifiedFunnel.tsx` | NOVO - Funil end-to-end |
| `src/components/dashboard/cockpit/MarketingVsSales.tsx` | NOVO - Mktg vs Vendas |
| `src/components/dashboard/cockpit/MoneyPipeline.tsx` | NOVO - Pipeline R$ |
| `src/components/dashboard/cockpit/MoneyLeakAlerts.tsx` | NOVO - Alertas clicaveis |
| `src/components/dashboard/cockpit/EvolutionChart.tsx` | NOVO - Linha dupla evolucao |
| `src/components/dashboard/cockpit/index.ts` | Atualizar exports |
| `src/pages/Dashboard.tsx` | Refatorar layout completo |
| `src/pages/Leads.tsx` | Adicionar leitura de filtros via URL + banner |

