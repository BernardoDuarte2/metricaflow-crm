

## Problem

The MonthlyComparisonCard selectors (Mês x Mês, Ano x Ano, month/year dropdowns) are purely cosmetic. Changing them updates local state but never triggers a new data fetch. The `comparisonData` in Dashboard.tsx is computed from a single `stats` object (the main dashboard query), so the card always shows the same data regardless of selector changes.

## Solution

Make MonthlyComparisonCard self-sufficient: it will fetch its own data using two parallel calls to `get-dashboard-stats` (one per selected period), then compute and display the comparison internally.

## Changes

### 1. Refactor `MonthlyComparisonCard.tsx`

- **New props**: Replace `metrics`/`currentPeriod`/`previousPeriod` with `userRole` and `userId` (from session)
- **Add `useQuery`** with two parallel fetches to `get-dashboard-stats`:
  - Period A: derived from selectedMonth1/selectedYear1 (or full year if Ano x Ano)
  - Period B: derived from selectedMonth2/selectedYear2
  - Query key includes compareMode + all selected values, so React Query auto-refetches on any change
- **Compute metrics internally** from the two responses: totalLeads, wonLeads, conversionRate, avgTimeInFunnel
- **Add loading skeleton** while fetching
- **Wire up selectors**: each `onValueChange` now also updates state which triggers the query key change

### 2. Update `Dashboard.tsx`

- Remove the `comparisonData` useMemo (lines 312-320)
- Change the `<MonthlyComparisonCard>` call to pass `userRole` and `userId` instead of `metrics`/`currentPeriod`/`previousPeriod`
- Keep everything else untouched

### Data Flow
```text
User changes selector → state updates → useQuery key changes →
two parallel get-dashboard-stats calls → compute diff → render
```

No backend changes needed -- reuses the existing edge function with different date ranges.

