

## Correcao Critica: Edge Function `get-dashboard-stats` - Mapeamento de Status

### Problema Identificado

O Kanban esta correto apos as correções anteriores. Porem, a edge function `get-dashboard-stats` que alimenta o Dashboard **NAO reconhece os status alternativos** do banco de dados.

**Dados reais no banco de dados:**

```text
Status        | Quantidade
--------------|-----------
fechado       | 331
qualificado   | 183
proposta      | 170
contato       | 159
negociacao    | 140
perdido       | 115
novo          | 75
contatado     | 40
ganho         | 13
contato_feito | 9
```

**Impacto:** O Dashboard mostra apenas 13 vendas ganhas quando deveria mostrar 344 (ganho + fechado). A receita, taxa de conversao, ticket medio e todos os KPIs estao drasticamente errados.

---

### Alteracoes Necessarias

#### 1. Edge Function `supabase/functions/get-dashboard-stats/index.ts`

Todas as queries que filtram por status precisam incluir os aliases:

**Won leads (15 ocorrencias de `eq('status', 'ganho')`):**
- Trocar `.eq('status', 'ganho')` por `.in('status', ['ganho', 'fechado'])`
- Afeta: wonLeads, wonLeadValues, closedLeadsWithTime, opportunities, previousPeriodWon, monthlyRevenueBySellerResult
- Afeta tambem: contagem de `status === 'ganho'` no forEach (linhas 280, 291, 371)

**Pending leads (pipeline ativo):**
- Trocar `.in('status', ['novo', 'contato_feito', 'proposta', 'negociacao'])` por `.in('status', ['novo', 'contato_feito', 'contato', 'contatado', 'proposta', 'negociacao'])`
- Afeta: pendingLeads count, forecast pipeline, inactive leads queries

**Funnel data stages (linhas 204-210):**
- Adicionar stage `qualificado` no funil
- Agrupar `contato + contatado + contato_feito` juntos como "Contato Feito"
- Agrupar `ganho + fechado` juntos como "Ganho/Fechado"

**Team performance (linhas 276-296):**
- Trocar `lead.status === 'ganho'` por `['ganho', 'fechado'].includes(lead.status)` nos calculos de receita por vendedor

**Monthly leads conversion chart (linha 371):**
- Trocar `.filter(lead => lead.status === 'ganho')` por `.filter(lead => ['ganho', 'fechado'].includes(lead.status))`

---

#### 2. Dashboard frontend `src/pages/Dashboard.tsx`

**Marketing funnel data (linhas 364-376):**
- Os dados do funil de marketing usam `stats.qualifiedLeads` que vem de `eq('qualificado', true)` - esta query busca um campo booleano `qualificado` e nao o status. Verificar se faz sentido ou trocar para contar status `qualificado`.

**Sales funnel data (linhas 378-391):**
- Calculo usa `Math.round()` sobre `pendingLeads` - apos a correção do backend, esses numeros serao mais precisos.

---

### Detalhes Tecnicos - Edge Function

Mudancas especificas no arquivo `supabase/functions/get-dashboard-stats/index.ts`:

**Linha 95:** Won leads count
```
Antes:  .eq('status', 'ganho')
Depois: .in('status', ['ganho', 'fechado'])
```

**Linha 96:** Pending leads count
```
Antes:  .in('status', ['novo', 'contato_feito', 'proposta', 'negociacao'])
Depois: .in('status', ['novo', 'contato_feito', 'contato', 'contatado', 'proposta', 'negociacao'])
```

**Linha 98:** Won lead values
```
Antes:  .eq('leads.status', 'ganho')
Depois: .in('leads.status', ['ganho', 'fechado'])
```

**Linha 103:** Opportunities
```
Antes:  .in('status', ['proposta', 'negociacao', 'ganho'])
Depois: .in('status', ['proposta', 'negociacao', 'ganho', 'fechado'])
```

**Linha 104:** Closed leads with time
```
Antes:  .eq('status', 'ganho')
Depois: .in('status', ['ganho', 'fechado'])
```

**Linha 106:** Forecast pipeline
```
Antes:  .in('leads.status', ['novo', 'contato_feito', 'proposta', 'negociacao'])
Depois: .in('leads.status', ['novo', 'contato_feito', 'contato', 'contatado', 'proposta', 'negociacao'])
```

**Linhas 112-113:** Inactive leads
```
Antes:  .in('status', ['novo', 'contato_feito', 'proposta', 'negociacao'])
Depois: .in('status', ['novo', 'contato_feito', 'contato', 'contatado', 'proposta', 'negociacao'])
```

**Linha 122:** Previous period won
```
Antes:  .eq('status', 'ganho')
Depois: .in('status', ['ganho', 'fechado'])
```

**Linha 126:** Monthly revenue by seller
```
Antes:  .eq('leads.status', 'ganho')
Depois: .in('leads.status', ['ganho', 'fechado'])
```

**Linha 166:** Probability map (adicionar aliases)
```
Antes:  { 'novo': 0.10, 'contato_feito': 0.20, 'proposta': 0.40, 'negociacao': 0.70 }
Depois: { 'novo': 0.10, 'contato_feito': 0.20, 'contato': 0.20, 'contatado': 0.20, 'proposta': 0.40, 'negociacao': 0.70 }
```

**Linhas 179-182:** Status counts - agrupar aliases no statusData

**Linhas 204-210:** Funnel stages - adicionar qualificado e agrupar contato
```
Antes:
  { stage: 'Novos', status: 'novo' },
  { stage: 'Contato Feito', status: 'contato_feito' },
  ...

Depois: calcular cada stage somando os aliases
  Novos = count(novo)
  Contato Feito = count(contato_feito) + count(contato) + count(contatado)
  Qualificado = count(qualificado)
  Proposta = count(proposta)
  Negociacao = count(negociacao)
  Ganho = count(ganho) + count(fechado)
```

**Linhas 280, 291:** Team performance forEach
```
Antes:  lead.status === 'ganho'
Depois: ['ganho', 'fechado'].includes(lead.status)
```

**Linha 371:** Monthly conversion chart
```
Antes:  lead.status === 'ganho'
Depois: ['ganho', 'fechado'].includes(lead.status)
```

---

### Resumo de Arquivos

| Arquivo | Acao |
|---------|------|
| `supabase/functions/get-dashboard-stats/index.ts` | Atualizar ~20 queries e filtros para incluir status aliases |
| `src/pages/Dashboard.tsx` | Ajustes menores nos dados do funil (se necessario apos backend) |

### Resultado Esperado

Apos as correções:
- Dashboard mostrara 344 vendas ganhas em vez de 13
- Taxa de conversao, receita, ticket medio serao precisos
- Funil do Dashboard tera as mesmas contagens do Kanban
- KPIs de performance do time serao corretos

