# Phase 2a: Host Insights Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `features/host-insights/` domain, move host code from `features/analytics/hosts/`, create HostsTable entity with typed props, migrate `/hosts` list route to thin orchestrator, and update HostHeader import paths.

**Architecture:** Move common host code (API, models, molecules) to new feature domain. Create hosts-list table definition and entity. The existing HostHeader entity moves from `features/hosts/entities/` to `features/host-insights/use-cases/host-details/entities/`. Routes become thin orchestrators with typed props.

**Tech Stack:** TanStack Router, RTK Query, Zod, React 19, Tailwind CSS, vitest, MSW.

**Spec:** `docs/superpowers/specs/2026-03-18-phase2a-host-insights-design.md`

---

## File Structure

### New Files

```
src/features/host-insights/
├── common/
│   ├── host.model.ts
│   └── host-insights.api.ts
│
└── use-cases/
    ├── hosts-list/
    │   ├── hosts-list.api.ts                  # List-specific (getHosts, fetchHostsCounts)
    │   ├── hosts-list.table.tsx               # Columns, export columns
    │   └── entities/
    │       ├── hosts-table.tsx                # Typed props entity
    │       └── hosts-table.test.tsx
    │
    └── host-details/
        ├── host-details.api.ts                # Detail-specific (getHostWithAlerts)
        ├── molecules/
        │   ├── host-summary.tsx
        │   ├── host-detections-radar.tsx
        │   ├── host-profile.tsx
        │   └── ... (host-details templates)
        └── entities/
            ├── host-header.tsx                # Moved from features/hosts/
            └── host-header.test.tsx
```

### Modified Files

```
src/features/analytics/hosts/                   # Becomes re-exports
src/features/hosts/                             # Deleted after HostHeader moves
src/routes/_enterprise/hosts/index.tsx          # Thin orchestrator
src/routes/_enterprise/hosts/$hostId/route.tsx  # Update HostHeader import
```

---

## Task 1: Move host common layer (API + model)

Move the shared API and model from `features/analytics/hosts/` to `features/host-insights/common/`.

**Files:**
- Create: `src/features/host-insights/common/host.model.ts`
- Create: `src/features/host-insights/common/host-insights.api.ts`
- Modify: `src/features/analytics/hosts/` files (become re-exports)

- [ ] **Step 1: Read source files**

Read:
- `src/features/analytics/hosts/api/hosts.api.ts` (full API with 5 endpoints)
- `src/features/analytics/hosts/model/host.ts` (Host type + HostRoles)
- `src/features/analytics/hosts/api/hooks/` (useHostsList, useHostsCounts)

- [ ] **Step 2: Move model**

Copy `src/features/analytics/hosts/model/host.ts` to `src/features/host-insights/common/host.model.ts`. Update imports to `@/` paths. Replace original with re-export.

- [ ] **Step 3: Move API**

Copy `src/features/analytics/hosts/api/hosts.api.ts` to `src/features/host-insights/common/host-insights.api.ts`. Update imports. Replace original with re-export.

Also move the hooks (`useHostsList`, `useHostsCounts`) to `src/features/host-insights/use-cases/hosts-list/hosts-list.api.ts` since they're list-specific. Replace originals with re-exports.

- [ ] **Step 4: Verify no broken imports**

Run: `pnpm run check`

- [ ] **Step 5: Run tests, lint**

Run: `pnpm vitest run && pnpm run lint --fix`

- [ ] **Step 6: Commit**

```bash
git commit -m "refactor(host-insights): move host API and model to features/host-insights"
```

---

## Task 2: Move host-details molecules

Move HostSummary, HostDetectionsRadar, HostProfile, and host-details templates.

**Files:**
- Create: `src/features/host-insights/use-cases/host-details/molecules/` (multiple files)
- Modify: `src/features/analytics/hosts/components/` (become re-exports)

- [ ] **Step 1: Read source files**

Read all files in:
- `src/features/analytics/hosts/components/host-summary/`
- `src/features/analytics/hosts/components/host-detections-radar/`
- `src/features/analytics/hosts/components/hostProfile/`
- `src/features/analytics/hosts/components/host-details/` (hostname, network, roles, username templates)
- `src/features/analytics/hosts/components/host-insights/` (hostBlock config and components)

- [ ] **Step 2: Move host-details templates**

Copy the template components (hostname, network, roles, username, details.variants) to `src/features/host-insights/use-cases/host-details/molecules/`. Update imports. Replace originals with re-exports.

- [ ] **Step 3: Move HostSummary, HostDetectionsRadar, HostProfile**

Copy each to `src/features/host-insights/use-cases/host-details/molecules/`. Update imports. Replace originals with re-exports.

- [ ] **Step 4: Move host-insights blocks**

Copy hostBlock config and components to `src/features/host-insights/use-cases/host-details/molecules/`. These are used by the expanded row in the hosts table.

- [ ] **Step 5: Run tests, lint, type check**

Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`

- [ ] **Step 6: Commit**

```bash
git commit -m "refactor(host-insights): move host detail molecules to features/host-insights"
```

---

## Task 3: Move HostHeader entity

Move from `features/hosts/entities/` to the new location.

**Files:**
- Create: `src/features/host-insights/use-cases/host-details/entities/host-header.tsx` (move)
- Create: `src/features/host-insights/use-cases/host-details/entities/host-header.test.tsx` (move)
- Modify: `src/routes/_enterprise/hosts/$hostId/route.tsx` (update import)
- Delete: `src/features/hosts/` (entire directory)

- [ ] **Step 1: Move HostHeader and test**

Copy both files to new location. Update internal imports:
- HostSummary, HostDetectionsRadar, HostProfile → import from `../molecules/`
- API hooks → import from `@/features/host-insights/common/host-insights.api` or use-case API
- Other feature imports (beaconing, sightings, threats, signatures) → keep `@/` absolute paths

- [ ] **Step 2: Update route import**

In `src/routes/_enterprise/hosts/$hostId/route.tsx`, change:
```ts
// Before:
import { HostHeader } from '@/features/hosts/entities/host-header';
// After:
import { HostHeader } from '@/features/host-insights/use-cases/host-details/entities/host-header';
```

- [ ] **Step 3: Delete old `features/hosts/` directory**

Verify no remaining imports: search for `@/features/hosts/` in src/. Delete the entire directory.

- [ ] **Step 4: Run tests, lint, type check**

The existing HostHeader tests should pass from the new location.

Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor(host-insights): move HostHeader entity, delete features/hosts/"
```

---

## Task 4: Create hosts-list table definition

Extract columns and export columns for the hosts table.

**Files:**
- Create: `src/features/host-insights/use-cases/hosts-list/hosts-list.table.tsx`

- [ ] **Step 1: Read existing columns**

Read `src/features/analytics/hosts/components/hostsTable/hostsTable.columns.tsx`. Understand all column definitions and export columns.

- [ ] **Step 2: Create table definition**

Combine all column definitions into `hosts-list.table.tsx`:
- `EXPANDER_COLUMN`
- `HOST_COLUMN` (IP + hostname)
- `HOST_INFO_COLUMN` (usernames + network)
- `ROLES_COLUMN`
- `SERVICES_COUNT_COLUMN`
- `FIRST_SEEN_COLUMN`
- `LAST_SEEN_COLUMN`
- `HITS_COLUMN` (conditional)
- `HOSTS_BASE_COLUMNS` (all except hits)
- `HOSTS_EXPORT_COLUMNS`

Update imports to use `@/features/host-insights/` paths for molecules (hostname, network, roles templates).

- [ ] **Step 3: Run lint and type check**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(host-insights): add hosts-list table definition"
```

---

## Task 5: Create HostsTable entity

Full wired table entity with typed props.

**Files:**
- Create: `src/features/host-insights/use-cases/hosts-list/entities/hosts-table.tsx`
- Create: `src/features/host-insights/use-cases/hosts-list/entities/hosts-table.test.tsx`

- [ ] **Step 1: Read existing implementation**

Read `src/routes/_enterprise/hosts/index.tsx` — the current route that contains all the hosts list logic. Understand:
- How `with_alerts` and `in_home_net` affect the query
- The `DiscoveredHosts` stats cards component
- The `HomeNetPicker` component
- How columns change based on `with_alerts`
- The expanded row (HostsTableExpandedRow)

- [ ] **Step 2: Write tests**

Mock `GET */appliances/host_id*`. Test: renders table with mock host data, renders empty state.

- [ ] **Step 3: Implement entity**

Props:
```ts
interface HostsTableProps {
  page: number;
  pageSize: number;
  sorting: SortingState;
  withAlerts: boolean;
  inHomeNet: 'true' | 'false' | 'all';
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
  onWithAlertsChange: (withAlerts: boolean) => void;
  onInHomeNetChange: (value: 'true' | 'false' | 'all') => void;
  onRowClick: (hostId: string) => void;
}
```

The entity:
- Reads global params via `useGlobalQueryParams`
- Builds query based on `withAlerts` and `inHomeNet` (same logic as current route)
- Calls `useGetHostsQuery` (or `useHostsList` hook) from `@/features/host-insights/`
- Renders `DiscoveredHosts` stats cards (self-contained, fetches own counts)
- Renders `HomeNetPicker` tabs (Internal/All/External) wired to `onInHomeNetChange`
- Renders `with_alerts` toggle
- Renders `Table` with conditional columns (adds HITS_COLUMN when withAlerts)
- Renders `PaginationFooter`
- Renders expanded row with host blocks
- Renders empty state
- Calls `onRowClick(host.ip)` on row click

Default sort: `-hits` (with alerts) or `-host_id.last_seen` (without alerts)

- [ ] **Step 4: Run tests, lint, type check**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(host-insights): add HostsTable entity with typed props"
```

---

## Task 6: Migrate `/hosts` route to thin orchestrator

**Files:**
- Modify: `src/routes/_enterprise/hosts/index.tsx`

- [ ] **Step 1: Read current route**

Read `src/routes/_enterprise/hosts/index.tsx` — the current implementation with all logic inline.

- [ ] **Step 2: Rewrite as thin orchestrator**

```tsx
const searchSchema = z.object({
  page: z.number().min(1).default(1),
  page_size: z.number().min(1).default(10),
  sort: z.string().optional(),
  with_alerts: z.boolean().default(true),
  in_home_net: z.enum(['true', 'false', 'all']).default('all'),
});

function HostsPage() {
  usePageTitle('Hosts');
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const globals = useGlobalQueryParams(['tenant', 'dates']);

  const { page, pageSize, sorting, setPage, setPageSize, onSortingChange } =
    usePaginatedSearch({ search, navigate }, {
      resetOn: [globals.tenant, globals.start_date, globals.end_date],
    });

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Hosts</PageTitle>
            <PageDescription>{/* exact text */}</PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <HostsTable
          page={page} pageSize={pageSize} sorting={sorting}
          withAlerts={search.with_alerts}
          inHomeNet={search.in_home_net}
          onPageChange={setPage} onPageSizeChange={setPageSize} onSortingChange={onSortingChange}
          onWithAlertsChange={(v) => navigate({ search: (prev) => ({ ...prev, with_alerts: v, page: 1 }) })}
          onInHomeNetChange={(v) => navigate({ search: (prev) => ({ ...prev, in_home_net: v, page: 1 }) })}
          onRowClick={(hostId) => tanstackNavigate({ to: '/hosts/$hostId', params: { hostId } })}
        />
      </PageContainer>
    </Page>
  );
}
```

Read current route for exact title/description. Wrap in PageBoundary. Handle navigate type wrapper. Keep breadcrumbs.

- [ ] **Step 3: Run full test suite, lint, type check**

Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(host-insights): migrate /hosts route to thin orchestrator"
```

---

## Post-Migration Notes

Phase 2a is complete. The `features/host-insights/` domain is established.

**What's ready for Phase 2b (host detail tabs):**
- `host-details.api.ts` — detail-specific API
- `molecules/` — HostSummary, HostDetectionsRadar, HostProfile, templates, blocks
- Entity pattern established by HostHeader

**Phase 2b scope:** Create entities for the 7 remaining tabs (insights, incidents, detection-methods, sightings, outlier-events, beacons, timeline), rewrite each tab route as thin orchestrator, delete remaining `pages/hosts/[hostId]/` files.

**Phase 2c scope:** Attack surface (inventory + visualization) using host-insights primitives.
