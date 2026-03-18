# Phase 2c: Attack Surface Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create InventoryTable and NetworkTreeSunburst entities in host-insights, migrate attack surface routes to thin orchestrators.

**Architecture:** Attack surface is a routing layer composing host-insights entities. Tab layout in route, two sub-routes as thin orchestrators.

**Tech Stack:** TanStack Router, RTK Query, Zod, D3/Recharts, React 19, vitest.

**Spec:** `docs/superpowers/specs/2026-03-18-phase2c-attack-surface-design.md`

---

## Task 1: Create HostsInventoryTable entity

**Files:**
- Create: `src/features/host-insights/use-cases/hosts-list/entities/hosts-inventory-table.tsx`
- Create: `src/features/host-insights/use-cases/hosts-list/entities/hosts-inventory-table.test.tsx`

- [ ] **Step 1:** Read `src/features/analytics/hosts/components/hostsTable/inventory-table.tsx` (or find the actual inventory table file) and `src/pages/attack-surface/inventory/index.tsx`. Understand how it differs from the main hosts table.

- [ ] **Step 2:** Write test — mock host API, verify table renders.

- [ ] **Step 3:** Create entity with typed props: `{ page, pageSize, sorting, inHomeNet, onPageChange, onPageSizeChange, onSortingChange, onRowClick }`. Fetches hosts via `useGetHostsQuery` (without alerts). Uses hosts-list columns (base columns, no hits). Uses `useTablePreferences({ tableId: 'inventoryTable' })`. Renders Table + PaginationFooter + expanded row + empty state.

- [ ] **Step 4:** Run: `pnpm run lint --fix && pnpm run check`

- [ ] **Step 5:** Commit: `feat(host-insights): add HostsInventoryTable entity`

---

## Task 2: Create NetworkTreeSunburst entity

**Files:**
- Create: `src/features/host-insights/use-cases/hosts-visualisation/entities/network-tree-sunburst.tsx`
- Create: `src/features/host-insights/use-cases/hosts-visualisation/entities/network-tree-sunburst.test.tsx`

- [ ] **Step 1:** Read `src/features/analytics/hosts/components/network-tree/network-tree-sunburst.tsx` and `src/pages/attack-surface/visualisation/index.tsx`. Understand the sunburst data flow, count type selection, Redux filter dispatching.

- [ ] **Step 2:** Write test — basic render test.

- [ ] **Step 3:** Create entity accepting `{ inHomeNet: 'true' | 'false' | 'all' }`. Manages count type selection internally (IPs/Roles/Hostnames/Usernames/Services). Fetches network tree via `useGetNetworkTreeQuery` from `@/features/host-insights/common/host-insights.api`. Renders the sunburst chart. Handles node click → Redux filter dispatch.

- [ ] **Step 4:** Run quality checks.

- [ ] **Step 5:** Commit: `feat(host-insights): add NetworkTreeSunburst entity`

---

## Task 3: Migrate attack surface routes

**Files:**
- Modify: `src/routes/_enterprise/attack-surface/route.tsx`
- Modify: `src/routes/_enterprise/attack-surface/index.tsx`
- Modify: `src/routes/_enterprise/attack-surface/inventory.tsx`

- [ ] **Step 1:** Read all 3 route files and all 3 page files.

- [ ] **Step 2:** Rewrite `route.tsx` as tab layout:
- Renders Page/PageContainer/PageHeader with title "Attack Surface"
- Renders DiscoveredHosts stats cards (from `@/features/host-insights/` or current location)
- Renders HomeNetPicker tabs (Internal/All/External)
- Renders Tabs (Visualisation / Inventory) with Link components
- Renders Outlet
- Search schema includes `in_home_net`
- Keeps breadcrumbs

- [ ] **Step 3:** Rewrite `index.tsx` (visualisation sub-route):
```tsx
function AttackSurfaceVisualisationPage() {
  const search = Route.useSearch();
  return <NetworkTreeSunburst inHomeNet={search.in_home_net} />;
}
```
No pagination needed. The `in_home_net` comes from parent route search params.

- [ ] **Step 4:** Rewrite `inventory.tsx`:
```tsx
const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().optional(),
  in_home_net: z.enum(['true', 'false', 'all']).default('all'),
});

function AttackSurfaceInventoryPage() {
  // usePaginatedSearch at route level
  // Pass typed props to HostsInventoryTable
  // onRowClick navigates to /hosts/$hostId
}
```

- [ ] **Step 5:** Run quality checks.

- [ ] **Step 6:** Commit: `feat(attack-surface): migrate routes to thin orchestrators`

---

## Task 4: Delete old pages

- [ ] **Step 1:** Check for remaining imports: search for `pages/attack-surface` in src/

- [ ] **Step 2:** Delete:
  - `src/pages/attack-surface/index.tsx`
  - `src/pages/attack-surface/visualisation/index.tsx`
  - `src/pages/attack-surface/inventory/index.tsx`
  - Clean up empty directories

- [ ] **Step 3:** Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`

- [ ] **Step 4:** Commit: `chore: delete old attack surface pages`
