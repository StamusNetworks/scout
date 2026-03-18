# Phase 1c: Beaconing Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate beaconing from `features/analytics/beaconing/` to `features/events/beaconing/`, reorganize into sub-domains, and migrate all beaconing routes to thin orchestrators.

**Architecture:** Move beaconing feature code to its new home under events, convert table components to entities with typed props, convert detail pages to entities, move tab layout to route level, then rewrite all routes as thin orchestrators.

**Tech Stack:** TanStack Router, RTK Query, Zod, React 19, Tailwind CSS, vitest, react-testing-library, MSW.

**Spec:** `docs/superpowers/specs/2026-03-18-phase1c-beaconing-design.md`

---

## File Structure

### New Files

```
src/features/events/beaconing/
├── common/
│   ├── beaconing-event.model.ts
│   ├── beaconing.api.ts
│   ├── utils/
│   │   └── format-beacon-metric.ts
│   ├── hooks/
│   │   └── use-beacon-report.ts
│   └── molecules/
│       ├── report-summary.tsx
│       ├── beaconing-metadata.tsx
│       └── beaconing-table.tsx            # generic beacon table (used by host tab)
│
├── beaconing-ips/
│   ├── molecules/
│   │   └── beaconing-ips-table.tsx        # internal IPs table
│   └── use-cases/
│       ├── ips-list/
│       │   ├── ips-list.table.tsx
│       │   ├── entities/
│       │   │   ├── serving-ips-table.tsx
│       │   │   └── serving-ips-table.test.tsx
│       └── ip-details/
│           └── entities/
│               ├── beaconing-ip-details.tsx
│               └── beaconing-ip-details.test.tsx
│
└── beaconing-ja3s/
    └── use-cases/
        ├── ja3s-list/
        │   ├── ja3s-list.table.tsx
        │   ├── entities/
        │   │   ├── ja3s-hash-table.tsx
        │   │   └── ja3s-hash-table.test.tsx
        └── ja3s-details/
            ├── molecules/
            │   └── ips-serving-ja3s-table.tsx
            └── entities/
                ├── beaconing-ja3s-details.tsx
                └── beaconing-ja3s-details.test.tsx
```

### Modified Files

```
src/features/analytics/beaconing/                          # Becomes re-exports
src/routes/_enterprise/analytics/beaconing/route.tsx        # Tab layout + Page/PageHeader
src/routes/_enterprise/analytics/beaconing/ips/index.tsx    # Thin orchestrator
src/routes/_enterprise/analytics/beaconing/ips/$ip.tsx      # Thin orchestrator
src/routes/_enterprise/analytics/beaconing/ja3s/index.tsx   # Thin orchestrator
src/routes/_enterprise/analytics/beaconing/ja3s/$ja3s.tsx   # Thin orchestrator
```

### Deleted Files

```
src/pages/analytics/beaconing/index.tsx
src/pages/analytics/beaconing-ips/index.tsx
src/pages/analytics/beaconing-ips/[ip]/index.tsx
src/pages/analytics/beaconing-ja3s/index.tsx
src/pages/analytics/beaconing-ja3s/[ja3s]/index.tsx
```

---

## Task 1: Move beaconing feature — common layer

Move API, models, hooks, utils, and shared molecules from `features/analytics/beaconing/` to `features/events/beaconing/common/`.

**Files:**
- Create: `src/features/events/beaconing/common/beaconing-event.model.ts`
- Create: `src/features/events/beaconing/common/beaconing.api.ts`
- Create: `src/features/events/beaconing/common/hooks/use-beacon-report.ts`
- Create: `src/features/events/beaconing/common/utils/format-beacon-metric.ts`
- Create: `src/features/events/beaconing/common/molecules/report-summary.tsx`
- Create: `src/features/events/beaconing/common/molecules/beaconing-metadata.tsx`
- Create: `src/features/events/beaconing/common/molecules/beaconing-table.tsx`
- Modify: `src/features/analytics/beaconing/` files (become re-exports)

- [ ] **Step 1: Read ALL source files**

Read every file in `src/features/analytics/beaconing/`:
- `api/beaconing.api.ts`
- `models/beaconing-event.model.ts`, `models/tls-tail.model.ts`
- `hooks/use-beacon-report.ts`
- `utils/format-beacon-metric.ts`
- `components/report-summary/report-summary.tsx` + `report-summary.columns.tsx`
- `components/metadata/beaconing-metadata.tsx` + `beaconing-metadata.columns.tsx`
- `components/beaconing-table/beaconing-table.tsx` + `beaconing-table.columns.tsx`

- [ ] **Step 2: Move API**

Copy `src/features/analytics/beaconing/api/beaconing.api.ts` to `src/features/events/beaconing/common/beaconing.api.ts`. Update relative imports to `@/` paths. Replace original with re-export: `export * from '@/features/events/beaconing/common/beaconing.api';`

- [ ] **Step 3: Move models**

Copy both model files and consolidate into `src/features/events/beaconing/common/beaconing-event.model.ts`. Update imports. Replace originals with re-exports.

- [ ] **Step 4: Move hooks and utils**

Copy `use-beacon-report.ts` to `src/features/events/beaconing/common/hooks/use-beacon-report.ts`. Copy `format-beacon-metric.ts` to `src/features/events/beaconing/common/utils/format-beacon-metric.ts`. Update imports. Replace originals with re-exports.

- [ ] **Step 5: Move shared molecules**

Copy report-summary (tsx + columns), beaconing-metadata (tsx + columns), and beaconing-table (tsx + columns) to `src/features/events/beaconing/common/molecules/`. For each:
- Combine the component + columns into a single file (following `.table.tsx` convention for table definitions, inline for report-summary)
- Update internal imports to `@/` paths
- Replace originals with re-exports

- [ ] **Step 6: Verify no broken imports**

Run: `pnpm run check`

All existing consumers import from `@/features/analytics/beaconing/...` — those paths now re-export from the new locations.

- [ ] **Step 7: Run tests, lint, type check**

Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`

- [ ] **Step 8: Commit**

```bash
git commit -m "refactor: move beaconing common layer to features/events/beaconing"
```

---

## Task 2: Move beaconing-ips components

Move IPs-related tables and create the sub-domain structure.

**Files:**
- Create: `src/features/events/beaconing/beaconing-ips/use-cases/ips-list/ips-list.table.tsx`
- Create: `src/features/events/beaconing/beaconing-ips/molecules/beaconing-ips-table.tsx`
- Modify: `src/features/analytics/beaconing/components/serving-ips-table/` (re-export)
- Modify: `src/features/analytics/beaconing/components/ips-table/` (re-export)

- [ ] **Step 1: Read source files**

Read:
- `src/features/analytics/beaconing/components/serving-ips-table/serving-ips-table.tsx` + `serving-ips-table.columns.tsx`
- `src/features/analytics/beaconing/components/ips-table/beaconing-ips-table.tsx` + `beaconing-ips-table.columns.tsx`

- [ ] **Step 2: Create ips-list table definition**

Create `src/features/events/beaconing/beaconing-ips/use-cases/ips-list/ips-list.table.tsx` with columns and export columns from `serving-ips-table.columns.tsx`.

- [ ] **Step 3: Move beaconing-ips-table molecule**

Copy `ips-table/beaconing-ips-table.tsx` + columns to `src/features/events/beaconing/beaconing-ips/molecules/beaconing-ips-table.tsx`. This is the internal IPs table shown on both IP and JA3S detail pages. Update imports. Replace original with re-export.

- [ ] **Step 4: Run lint and type check**

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor: move beaconing-ips components to events/beaconing sub-domain"
```

---

## Task 3: Move beaconing-ja3s components

Move JA3S-related tables.

**Files:**
- Create: `src/features/events/beaconing/beaconing-ja3s/use-cases/ja3s-list/ja3s-list.table.tsx`
- Create: `src/features/events/beaconing/beaconing-ja3s/use-cases/ja3s-details/molecules/ips-serving-ja3s-table.tsx`
- Modify: `src/features/analytics/beaconing/components/tls-ja3s-table/` (re-export)
- Modify: `src/features/analytics/beaconing/components/ips-serving-ja3s-table/` (re-export)

- [ ] **Step 1: Read source files**

Read:
- `src/features/analytics/beaconing/components/tls-ja3s-table/tls-ja3s-table.tsx` + columns
- `src/features/analytics/beaconing/components/ips-serving-ja3s-table/ips-serving-ja3s-table.tsx` + columns

- [ ] **Step 2: Create ja3s-list table definition**

Create `ja3s-list.table.tsx` with columns and export columns from `tls-ja3s-table.columns.tsx`.

- [ ] **Step 3: Move ips-serving-ja3s-table**

Copy to `src/features/events/beaconing/beaconing-ja3s/use-cases/ja3s-details/molecules/ips-serving-ja3s-table.tsx`. This is only used on the JA3S detail page. Update imports. Replace original with re-export.

- [ ] **Step 4: Run lint and type check**

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor: move beaconing-ja3s components to events/beaconing sub-domain"
```

---

## Task 4: Create ServingIpsTable entity

Full wired table entity with typed props.

**Files:**
- Create: `src/features/events/beaconing/beaconing-ips/use-cases/ips-list/entities/serving-ips-table.tsx`
- Create: `src/features/events/beaconing/beaconing-ips/use-cases/ips-list/entities/serving-ips-table.test.tsx`

- [ ] **Step 1: Read existing table**

Read `src/features/analytics/beaconing/components/serving-ips-table/serving-ips-table.tsx`. Understand how it uses `useServerTableState`, `useGetBeaconingEventsQuery`, and row click navigation.

- [ ] **Step 2: Write tests**

Mock `GET */appliances/es_beaconing_events/*`. Test:
- Renders table with mock beaconing data
- Renders empty state

- [ ] **Step 3: Implement entity**

Props:
```ts
interface ServingIpsTableProps {
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
  onRowClick: (ip: string) => void;
}
```

The entity:
- Reads global params via `useGlobalQueryParams(['tenant', 'dates'])`
- Calls `useGetBeaconingEventsQuery` with `beacon_report.document_type:agg_serving_ip`
- Uses columns from `ips-list.table.tsx`
- Uses `useTablePreferences`
- Renders `Table` + `PaginationFooter` + empty state
- Calls `onRowClick(beacon_report.value)` when row clicked (route handles navigation)

- [ ] **Step 4: Run tests, lint, type check**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add ServingIpsTable entity with typed props"
```

---

## Task 5: Create JA3SHashTable entity

Same pattern as ServingIpsTable but for JA3S hashes.

**Files:**
- Create: `src/features/events/beaconing/beaconing-ja3s/use-cases/ja3s-list/entities/ja3s-hash-table.tsx`
- Create: `src/features/events/beaconing/beaconing-ja3s/use-cases/ja3s-list/entities/ja3s-hash-table.test.tsx`

- [ ] **Step 1: Read existing table**

Read `src/features/analytics/beaconing/components/tls-ja3s-table/tls-ja3s-table.tsx`.

- [ ] **Step 2: Write tests**

- [ ] **Step 3: Implement entity**

Same typed props as ServingIpsTable. Uses `beacon_report.document_type:agg_ja3s_src_only` filter. `onRowClick` passes the JA3S hash value.

- [ ] **Step 4: Run tests, lint, type check**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add JA3SHashTable entity with typed props"
```

---

## Task 6: Create BeaconingIpDetails entity

Detail page entity for a single IP.

**Files:**
- Create: `src/features/events/beaconing/beaconing-ips/use-cases/ip-details/entities/beaconing-ip-details.tsx`
- Create: `src/features/events/beaconing/beaconing-ips/use-cases/ip-details/entities/beaconing-ip-details.test.tsx`

- [ ] **Step 1: Read existing detail page**

Read `src/pages/analytics/beaconing-ips/[ip]/index.tsx`. Understand:
- Stats section (country, IP, score, first/last seen, VirusTotal link)
- ReportSummary, BeaconingMetadata, BeaconingIPsTable composition
- How `useBeaconReport('ip', ip)` is used

- [ ] **Step 2: Write tests**

Mock beaconing API. Test: renders IP and score when data loads.

- [ ] **Step 3: Implement entity**

Props: `{ ip: string }`

The entity:
- Calls `useBeaconReport('ip', ip)` from `@/features/events/beaconing/common/hooks`
- Renders stats section with Page/PageHeader components
- Renders `ReportSummary` molecule (type='ip')
- Renders `BeaconingMetadata` molecule (type='ip')
- Renders `BeaconingIPsTable` molecule (ips from beacon_report.assets)
- Handles loading/error/empty states

- [ ] **Step 4: Run tests, lint, type check**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add BeaconingIpDetails entity"
```

---

## Task 7: Create BeaconingJa3sDetails entity

Detail page entity for a single JA3S hash.

**Files:**
- Create: `src/features/events/beaconing/beaconing-ja3s/use-cases/ja3s-details/entities/beaconing-ja3s-details.tsx`
- Create: `src/features/events/beaconing/beaconing-ja3s/use-cases/ja3s-details/entities/beaconing-ja3s-details.test.tsx`

- [ ] **Step 1: Read existing detail page**

Read `src/pages/analytics/beaconing-ja3s/[ja3s]/index.tsx`.

- [ ] **Step 2: Write tests**

- [ ] **Step 3: Implement entity**

Props: `{ ja3s: string }`

Same pattern as IP details but with 4 sections: ReportSummary, BeaconingMetadata, BeaconingIPsTable, IpsServingJa3sTable.

- [ ] **Step 4: Run tests, lint, type check**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add BeaconingJa3sDetails entity"
```

---

## Task 8: Migrate beaconing tab layout route

Move the tab layout (IPs/JA3S tabs with badge counts) from `BeaconingPage` into the route.

**Files:**
- Modify: `src/routes/_enterprise/analytics/beaconing/route.tsx`

- [ ] **Step 1: Read current files**

Read:
- `src/routes/_enterprise/analytics/beaconing/route.tsx` (current: breadcrumbs + Outlet)
- `src/pages/analytics/beaconing/index.tsx` (BeaconingPage: tabs + badge counts)

- [ ] **Step 2: Implement tab layout in the route**

The route becomes a fat layout (like `/hosts/$hostId/route.tsx`):
- Renders `Page`/`PageContainer`/`PageHeader` with title "Beaconing"
- Fetches IPs and JA3S counts via `useGetBeaconingEventsQuery` (for badge counts)
- Renders tab navigation (IPs / JA3S) with `TabsBadge` counts using `<Link>` components
- Renders `<Outlet />` for child routes
- Keeps breadcrumbs

Read the current `BeaconingPage` (at `src/pages/analytics/beaconing/index.tsx`) for exact tab structure and badge count logic.

- [ ] **Step 3: Run lint and type check**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: migrate beaconing tab layout to route level"
```

---

## Task 9: Migrate beaconing list routes

Rewrite IPs and JA3S list routes as thin orchestrators.

**Files:**
- Modify: `src/routes/_enterprise/analytics/beaconing/ips/index.tsx`
- Modify: `src/routes/_enterprise/analytics/beaconing/ja3s/index.tsx`

- [ ] **Step 1: Rewrite IPs list route**

```tsx
const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-beacon_report.beacon_metric'),
});

function BeaconingIpsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const globals = useGlobalQueryParams(['tenant', 'dates']);

  const { page, pageSize, sorting, setPage, setPageSize, onSortingChange } =
    usePaginatedSearch({ search, navigate }, {
      resetOn: [globals.tenant, globals.start_date, globals.end_date],
    });

  return (
    <ServingIpsTable
      page={page} pageSize={pageSize} sorting={sorting}
      onPageChange={setPage} onPageSizeChange={setPageSize} onSortingChange={onSortingChange}
      onRowClick={(ip) => navigate({ to: '/analytics/beaconing/ips/$ip', params: { ip } })}
    />
  );
}
```

Wrap in PageBoundary. Handle navigate type wrapper.

- [ ] **Step 2: Rewrite JA3S list route**

Same pattern with `JA3SHashTable` entity and navigation to `/analytics/beaconing/ja3s/$ja3s`.

- [ ] **Step 3: Run lint and type check**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: migrate beaconing list routes to thin orchestrators"
```

---

## Task 10: Migrate beaconing detail routes

Rewrite IP detail and JA3S detail routes as thin orchestrators.

**Files:**
- Modify: `src/routes/_enterprise/analytics/beaconing/ips/$ip.tsx`
- Modify: `src/routes/_enterprise/analytics/beaconing/ja3s/$ja3s.tsx`

- [ ] **Step 1: Rewrite IP detail route**

```tsx
function BeaconingIpDetailPage() {
  const { ip } = Route.useParams();
  return <BeaconingIpDetails ip={ip} />;
}
```

Wrap in PageBoundary.

- [ ] **Step 2: Rewrite JA3S detail route**

```tsx
function BeaconingJa3sDetailPage() {
  const { ja3s } = Route.useParams();
  return <BeaconingJa3sDetails ja3s={ja3s} />;
}
```

- [ ] **Step 3: Run lint and type check**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: migrate beaconing detail routes to thin orchestrators"
```

---

## Task 11: Delete old pages and verify

**Files to delete:**
- `src/pages/analytics/beaconing/index.tsx`
- `src/pages/analytics/beaconing-ips/index.tsx`
- `src/pages/analytics/beaconing-ips/[ip]/index.tsx`
- `src/pages/analytics/beaconing-ja3s/index.tsx`
- `src/pages/analytics/beaconing-ja3s/[ja3s]/index.tsx`

- [ ] **Step 1: Check for remaining imports**

Search: `grep -r "pages/analytics/beaconing" src/`

Only delete files with no remaining imports.

- [ ] **Step 2: Delete confirmed unused files**

Remove the 5 page files and their empty parent directories.

- [ ] **Step 3: Run full test suite, lint, type check**

Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: delete old beaconing pages replaced by route orchestrators"
```

---

## Post-Migration Notes

Phase 1c is complete. Beaconing is fully migrated to `features/events/beaconing/`.

**What's ready for Phase 2 (host-insights):**
- `features/events/beaconing/common/molecules/beaconing-table.tsx` — generic beacon table molecule for host beacons tab
- `features/events/beaconing/common/beaconing.api.ts` — shared API

**Next phase:** Phase 1d (sightings) or Phase 2 (host-insights).
