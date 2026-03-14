

## Problem

The "Receita por Vendedor" chart uses a stacked AreaChart with 10 sellers, making it extremely hard to read -- colors overlap, areas blend together, and it's impossible to distinguish individual seller performance.

## Proposed Solution: Switch to a Grouped BarChart

Replace the AreaChart with a **horizontal bar chart** showing each seller's total revenue as a single bar, sorted from highest to lowest. This is far more readable with 10 sellers.

**Why this is better:**
- Each seller gets their own distinct bar -- no overlap
- Sorted by revenue so ranking is immediately visible
- Hover tooltip shows the seller's exact revenue value
- Monthly breakdown can be shown via a small sparkline or simply in the tooltip
- Clean, scannable layout

## Alternative considered
A vertical grouped bar chart per month would still be cluttered with 10 sellers per month. The horizontal ranked bar approach is the clearest.

## Technical Changes

**File: `src/components/dashboard/cockpit/RevenueBySellerChart.tsx`**
- Replace `AreaChart` with a horizontal `BarChart` (recharts `layout="vertical"`)
- Aggregate each seller's total revenue from the monthly data
- Sort sellers by revenue descending
- Each bar shows the seller name on the Y-axis and revenue on X-axis
- Custom tooltip on hover shows: seller name, total revenue, and monthly breakdown
- Keep the same card styling, header, and color palette
- Add percentage labels or value labels at the end of each bar for quick reading

