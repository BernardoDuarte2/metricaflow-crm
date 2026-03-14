

## Evolução Mensal por Fonte

### What
A line chart showing the monthly trend of leads per source (e.g., Indicação, Site, WhatsApp). Each source gets its own colored line, making it easy to spot which channels are growing or declining over time. Placed side-by-side with "Conversão por Fonte".

### Backend Change
**`supabase/functions/get-dashboard-stats/index.ts`**
- After the existing `monthlyLeadsConversion` computation, add a new aggregation: group `monthlyLeadsData` by month AND source, producing an array like:
```json
[
  { "month": "Jan", "Indicação": 12, "Site": 8, "WhatsApp": 5 },
  { "month": "Fev", "Indicação": 15, "Site": 10, "WhatsApp": 3 }
]
```
- Also return a `sources` array with `{ name, color }` for each unique source.
- Add both to the response object as `monthlyLeadsBySource` and `sourcesList`.

### Frontend Changes

1. **New component: `src/components/dashboard/cockpit/SourceEvolutionChart.tsx`**
   - Recharts `LineChart` with one `Line` per source
   - Custom tooltip showing all source values for the hovered month
   - Same card styling as `SourceConversionChart`
   - Header with TrendingUp icon and title "Evolução Mensal por Fonte"

2. **`src/pages/Dashboard.tsx`**
   - Import `SourceEvolutionChart`
   - Place it in the existing grid alongside `SourceConversionChart` (section 8), filling the empty second column
   - Map `dashboardData.monthlyLeadsBySource` and `dashboardData.sourcesList` to the component props

3. **`src/components/dashboard/cockpit/index.ts`**
   - Export the new component

