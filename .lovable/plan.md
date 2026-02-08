

## QA Pre-Launch Report - WorkFlow360

### Summary of Findings

After thorough code review and live testing across all tabs (Dashboard, Leads, Prospecting, Kanban, Agenda, Tasks, Goals, KPI), I found **8 bugs** and **4 improvements** needed before launch.

---

### BUGS FOUND (Critical / Medium / Low)

#### BUG-01 [CRITICAL] - Double Sidebar on Prospecting page
- **File:** `src/pages/Prospecting.tsx`
- **Issue:** The page imports and renders its own `<Sidebar />` component, but it's already wrapped in `ProtectedRoute` which renders the Sidebar. This causes **two navigation bars** stacked on top of each other.
- **Fix:** Remove the `import Sidebar` and `<Sidebar />` from Prospecting.tsx. Remove the wrapping `<div className="min-h-screen bg-background">` and `<main className="pt-20 pb-8 px-4 sm:px-6">` since ProtectedRoute already provides this layout structure.

#### BUG-02 [CRITICAL] - Double Sidebar on KPI page
- **File:** `src/pages/KPI.tsx`
- **Issue:** Same as BUG-01 - the KPI page imports and renders its own `<Sidebar />` component, plus wraps content in `<div className="min-h-screen bg-background"><Sidebar /><div className="pt-16">`. This creates a double sidebar and extra nested layout.
- **Fix:** Remove the `import Sidebar`, `<Sidebar />`, and the redundant wrapper divs from KPI.tsx, using the same pattern as other pages (Leads, Tasks, etc.) that simply return content.

#### BUG-03 [CRITICAL] - Kanban status mismatch with database
- **File:** `src/pages/Kanban.tsx`
- **Issue:** The database contains statuses: `novo`, `contato_feito`, `contato`, `contatado`, `qualificado`, `proposta`, `negociacao`, `fechado`, `ganho`, `perdido`. However, the Kanban only defines columns for: `novo`, `contato_feito`, `proposta`, `negociacao`, `fechado`, `perdido`. This means:
  - Leads with status `ganho` do NOT appear in the "Fechado" column (different status values)
  - Leads with status `contato` or `contatado` do NOT appear in "Contato Feito"
  - Leads with status `qualificado` have NO column at all
  - These "orphan" leads are invisible to users
- **Fix:** 
  1. Add a `qualificado` column to the Kanban
  2. Map `ganho` to display in the `fechado` column (or vice versa - standardize)
  3. Map `contato` and `contatado` to display in the `contato_feito` column
  4. Consider a database migration to standardize status values

#### BUG-04 [MEDIUM] - Agenda layout conflicts with ProtectedRoute
- **File:** `src/pages/Agenda.tsx`
- **Issue:** The page uses `flex h-screen overflow-hidden` which conflicts with ProtectedRoute's `pt-16` wrapper and `min-h-[calc(100vh-4rem)]` layout. The navigation bar overlaps the top of the calendar sidebar. The calendar area height calculation doesn't account for the 64px nav bar.
- **Fix:** Change the root div to use `h-[calc(100vh-4rem)]` instead of `h-screen`, and remove the redundant `-mt-6 -mx-6` or adjust padding to account for the ProtectedRoute wrapper.

#### BUG-05 [MEDIUM] - MonthlyComparisonCard selector is purely cosmetic
- **File:** `src/components/dashboard/cockpit/MonthlyComparisonCard.tsx` and `src/pages/Dashboard.tsx`
- **Issue:** The "Mes x Mes" and "Ano x Ano" selectors change labels and call `onCompareModeChange`, but Dashboard.tsx doesn't pass this callback nor does it re-fetch comparison data when the selection changes. The displayed data is always `current` vs `previous` from the default query.
- **Fix:** Either connect the `onCompareModeChange` callback in Dashboard.tsx to actually fetch comparison data for the selected periods, or simplify the component to show only the current comparison without the selectors (to avoid misleading users).

#### BUG-06 [MEDIUM] - Goals page has no sidebar navigation link
- **File:** `src/components/layout/Sidebar.tsx`
- **Issue:** The `/goals` route exists in App.tsx and the page works, but there is no menu item in the Sidebar for "Metas" / "Goals". Users can only reach it via the "Editar meta" button on the Dashboard's TeamGoalProgressCard. This makes the Goals feature essentially hidden.
- **Fix:** Add a navigation item for Goals in the Sidebar (e.g., with Target icon, label "Metas", before or after "Desempenho & KPI").

#### BUG-07 [LOW] - Console.log in production code
- **File:** `src/pages/LeadDetail.tsx`
- **Issue:** Lines with `console.log("Notas carregadas:", data)` and `console.error` statements leak data to the browser console in production.
- **Fix:** Remove or replace with conditional debug logging.

#### BUG-08 [LOW] - Dashboard monthlyClosedData filters by status "ganho" but GoalHeroCard uses "totalConvertedValue"
- **File:** `src/pages/Dashboard.tsx`
- **Issue:** The `monthlyClosedData` query on line 195 filters `eq("status", "ganho")` while the Kanban uses "fechado" as the won status. If the system has inconsistent status naming between dashboard edge function and frontend, revenue data could be inaccurate.
- **Fix:** Verify that the `get-dashboard-stats` edge function correctly counts both "ganho" and "fechado" as won leads, or standardize statuses.

---

### IMPROVEMENTS NEEDED

#### IMP-01 - Standardize lead statuses across the system
- The system uses multiple status values that mean similar things: `ganho`/`fechado`, `contato`/`contato_feito`/`contatado`. A database migration should consolidate these to a single canonical set.

#### IMP-02 - Input autocomplete attributes
- Browser console warns about missing `autocomplete` attributes on password inputs in Auth.tsx (e.g., `autocomplete="current-password"` for login, `autocomplete="new-password"` for signup).

#### IMP-03 - Bulk Import and Diagnostics pages have no visible links
- `/bulk-import` and `/diagnostics` routes exist but have no sidebar navigation.

#### IMP-04 - Agenda sidebar hidden behind nav
- The CalendarSidebar (left panel on Agenda) starts at position 0 but the top nav is 64px tall, causing the top of the sidebar to be hidden behind the navigation bar.

---

### IMPLEMENTATION PLAN (Priority Order)

#### Phase 1 - Critical Fixes (must do before launch)

**Step 1:** Fix BUG-01 (Double Sidebar - Prospecting)
- Edit `src/pages/Prospecting.tsx`:
  - Remove `import Sidebar from "@/components/layout/Sidebar"`
  - Remove `<Sidebar />` from the JSX
  - Remove the wrapper `<div className="min-h-screen bg-background">` 
  - Replace `<main className="pt-20 pb-8 px-4 sm:px-6">` with `<div className="space-y-4 sm:space-y-6">`
  - Adjust structure so the content uses the standard layout provided by ProtectedRoute

**Step 2:** Fix BUG-02 (Double Sidebar - KPI)
- Edit `src/pages/KPI.tsx`:
  - Remove `import Sidebar from "@/components/layout/Sidebar"`
  - Remove `<Sidebar />`
  - Remove outer `<div className="min-h-screen bg-background">` and `<div className="pt-16">`
  - Return only the `<main>` content like other pages do

**Step 3:** Fix BUG-03 (Kanban status mismatch)
- Edit `src/pages/Kanban.tsx`:
  - Update the column filtering logic to map equivalent statuses:
    - `contato_feito` column also shows `contato` and `contatado`
    - `fechado` column also shows `ganho`
  - Add a `qualificado` column between `contato_feito` and `proposta`
  - Update the `closedLeads` filter to also include `status === 'ganho'`
  - Update the `lostLeads` filter exclusion to also exclude `ganho`

**Step 4:** Fix BUG-06 (Goals link in Sidebar)
- Edit `src/components/layout/Sidebar.tsx`:
  - Add a new nav item: `{ to: "/goals", icon: Target, label: "Metas", requiresOwnerOrGestor: false, requiresSuperAdmin: false }`
  - Add `Target` to the lucide-react imports

#### Phase 2 - Medium Priority Fixes

**Step 5:** Fix BUG-04 (Agenda layout)
- Edit `src/pages/Agenda.tsx`:
  - Change root div from `h-screen` to `h-[calc(100vh-4rem)]`
  - The `-6` margin/padding adjustments from ProtectedRoute's `p-6` wrapper need to be counteracted

**Step 6:** Fix BUG-05 (MonthlyComparison selector)
- Either wire up the `onCompareModeChange` callback in Dashboard.tsx to trigger actual data re-fetching, or remove the selectors from MonthlyComparisonCard to avoid misleading the user

#### Phase 3 - Low Priority

**Step 7:** Fix BUG-07 (Console.log cleanup)
- Remove `console.log("Notas carregadas:", data)` from LeadDetail.tsx

**Step 8:** Fix BUG-08 (Status consistency verification)
- Review the `get-dashboard-stats` edge function to ensure it handles both `ganho` and `fechado` statuses correctly

---

### REGRESSION TEST PLAN

After implementing fixes, verify:
1. **LEAD-01**: Create a new lead - verify it appears in Leads list, Kanban, and Dashboard counters
2. **KAN-02**: Drag a lead across Kanban columns - verify status persists in database and updates everywhere
3. **AGEN-02**: Create a task linked to a lead - verify it appears in Tasks page and Lead detail
4. **KPI-03**: Verify funnel counts in Dashboard match Kanban column counts
5. **SIS-02**: Login as vendedor - verify they only see their data; login as gestor - verify they see team data
6. **DASH-01**: Load dashboard with no data - verify no crashes

---

### VERDICT: NO-GO (Pending 3 Critical Fixes)

The system cannot launch until BUG-01, BUG-02, and BUG-03 are resolved:
- **BUG-01/02** cause broken UI with duplicate navigation bars on Prospecting and KPI pages
- **BUG-03** causes leads with certain statuses to be completely invisible on the Kanban board, leading to data loss perception

After these 3 critical fixes + BUG-06 (Goals navigation), the system can be marked **GO** for launch.

