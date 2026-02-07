

## Reestruturação do Dashboard - Novo Layout

### Visao Geral das Mudanças

O dashboard será reorganizado com foco em clareza e hierarquia visual. O topo terá um unico componente de impacto (Meta vs Realizado), métricas intermediárias serão removidas ou reposicionadas, e dois funis visuais reais serão criados.

---

### 1. TOPO - Novo componente "GoalHeroCard" (largura total)

**Criar:** `src/components/dashboard/cockpit/GoalHeroCard.tsx`

Componente que ocupa 100% da largura exibindo:
- Meta mensal (R$) - valor grande e destaque
- Realizado (R$) - com barra de progresso visual
- **Valor que falta para bater a meta (R$)** - destaque principal em cor de alerta
- Ritmo necessário por dia (R$/dia) - calculado com base nos dias úteis restantes no mês
- Barra de progresso animada conectando meta e realizado
- Visual limpo, premium, futurístico (seguindo o design system existente)

Esse componente substitui o GoalGauge atual na posição do topo. O GoalGauge será removido dessa posição.

---

### 2. REMOVER do topo (linhas 556-604 do Dashboard)

**Remover da seção Hero:**
- GoalGauge (coluna 1/3) - substituído pelo GoalHeroCard
- CommandKPI "Receita Realizada" 
- CommandKPI "Taxa de Conversão"
- CommandKPI "Ticket Médio"
- CommandKPI "Ciclo do Funil"

**Remover completamente:**
- QuickStats (CAC, LTV, Payback, Follow-up Rate, Taxa de Perda, Atividades) - esses dados vão para Métricas Avançadas no final

**Remover da seção Secondary KPIs (linhas 612-642):**
- Os 4 CommandKPIs secundários (Total de Leads, Em Andamento, Leads Qualificados, Win Rate) - removidos do corpo principal

---

### 3. CENTRAL DE ALERTAS - Manter como está

Posição: logo abaixo do GoalHeroCard. Sem alterações no componente CriticalAlertsPanel.

---

### 4. FUNIS - Criar componente "VisualFunnel" lado a lado

**Criar:** `src/components/dashboard/cockpit/VisualFunnel.tsx`

Componente de funil com formato visual real (trapézio invertido), nao barras horizontais.

Cada etapa será representada como uma faixa que vai diminuindo de largura, criando o efeito visual de funil real:

```text
+----------------------------------+
|           Leads (150)            |  <- Mais largo
+----------------------------------+
    +------------------------+
    |       MQL (90)         |       <- Medio
    +------------------------+
        +----------------+
        |    SQL (45)    |           <- Menor
        +----------------+
```

A linha exibirá dois funis lado a lado:
- **Funil de Marketing** (azul): Leads -> MQL -> SQL
- **Funil de Vendas** (verde): SQL -> Propostas -> Negociações -> Fechados

Cada etapa mostra quantidade absoluta e percentual de conversão entre etapas.

---

### 5. VELOCIDADE DO FUNIL - Manter como está

VelocityMeter permanece sem alterações, posicionado logo abaixo dos funis.

---

### 6. META COLETIVA DO TIME - Manter + botão editar

TeamGoalProgressCard permanece como está (já tem cálculo automático). Não há alteração necessária - o componente já exibe meta, realizado, gap e ritmo diário. Nota: o botão "Editar meta" será adicionado para gestores/donos, abrindo um dialog para edição rápida da meta.

---

### 7. COMPARATIVO MENSAL - Adicionar seletor de período

**Modificar:** `src/components/dashboard/cockpit/MonthlyComparisonCard.tsx`

Adicionar seletor no header com dois modos:
- **Mês x Mês**: selecionar dois meses para comparar (ex: Jan vs Dez)
- **Ano x Ano**: comparar mesmo período entre anos (ex: Jan 2025 vs Jan 2024)

**Modificar:** `src/pages/Dashboard.tsx` - passar props de seleção de período ao componente.

---

### 8. PROGRESSO COMERCIAL (TeamProgressPanel) - Manter

Sem alterações.

---

### 9. EVOLUÇÃO DE RECEITA (TrendChart) - Manter

Sem alterações.

---

### 10. MÉTRICAS AVANÇADAS - Colapsadas por padrão

**Modificar:** `src/pages/Dashboard.tsx`

Envolver o bloco de AdvancedMetricsCard + LossWaterfallChart em um componente Collapsible (já existe no projeto via Radix), fechado por padrão, com botão "Métricas Avançadas" para expandir.

Conteúdo colapsado:
- CAC, LTV, Payback (AdvancedMetricsCard)
- Análise de Perdas (LossWaterfallChart)
- QuickStats (movido do topo para aqui)

---

### Detalhes Técnicos

#### Novo layout do Dashboard (ordem dos blocos):

```text
1. [GoalHeroCard]                    <- NOVO (largura total)
2. [CriticalAlertsPanel]             <- Mantido
3. [VisualFunnel Marketing | VisualFunnel Vendas]  <- NOVO (2 colunas)
4. [VelocityMeter]                   <- Mantido (largura total)
5. [TeamGoalProgressCard + Edit]     <- Mantido + botão editar
6. [MonthlyComparisonCard + seletor] <- Modificado
7. [SalesRepDetailedPanel]           <- Mantido (gestores)
8. [ActivityBreakdownPanel]          <- Mantido (gestores)
9. [TeamProgressPanel]               <- Mantido
10. [TrendChart | SourceConversion]  <- Mantido (2 colunas)
11. [RevenueBySellerChart | LeadsConversionMonthlyChart] <- Mantido
12. [Collapsible: Métricas Avançadas] <- Modificado (colapsado)
13. [GoalsProgressCard]              <- Mantido
```

#### Arquivos a criar:
1. `src/components/dashboard/cockpit/GoalHeroCard.tsx` - Meta vs Realizado full-width
2. `src/components/dashboard/cockpit/VisualFunnel.tsx` - Funil visual real (trapézio)

#### Arquivos a modificar:
1. `src/pages/Dashboard.tsx` - Reorganizar layout, remover KPIs do topo, adicionar novos componentes, envolver métricas avançadas em Collapsible
2. `src/components/dashboard/cockpit/MonthlyComparisonCard.tsx` - Adicionar seletor de período (mês x mês / ano x ano)
3. `src/components/dashboard/cockpit/TeamGoalProgressCard.tsx` - Adicionar botão "Editar meta" para gestores
4. `src/components/dashboard/cockpit/index.ts` - Exportar novos componentes

#### Arquivos mantidos sem alteração:
- CriticalAlertsPanel, VelocityMeter, SalesRepDetailedPanel, ActivityBreakdownPanel, TeamProgressPanel, TrendChart, SourceConversionChart, RevenueBySellerChart, LeadsConversionMonthlyChart, GoalsProgressCard

