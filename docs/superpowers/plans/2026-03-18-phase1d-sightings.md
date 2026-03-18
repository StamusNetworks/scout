# Phase 1d: Sightings Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate sightings from `features/analytics/sightings/` to `features/events/sightings/`, create entities with typed props, and migrate routes to thin orchestrators.

**Architecture:** Same pattern as Phase 1c (beaconing): move common layer, create table definition, build entities, rewrite routes, delete old pages.

**Tech Stack:** TanStack Router, RTK Query, Zod, React 19, Tailwind CSS, vitest, MSW.

**Spec:** `docs/superpowers/specs/2026-03-18-phase1d-sightings-design.md`

---

## File Structure

### New Files

```
src/features/events/sightings/
├── common/
│   ├── sighting-event.model.ts
│   ├── sightings.api.ts
│   ├── hooks/
│   │   ├── use-get-sighting-by-id.ts
│   │   └── use-get-sighting-events-tail.ts
│   ├── utils/
│   │   └── get-sighting-qfilter.ts
│   └── molecules/
│       ├── sightings-metadata.tsx
│       ├── patient-zero-details.tsx
│       ├── events-counts-timeline.tsx
│       ├── events-tail-flow.tsx
│       ├── events-stream.tsx
│       └── events-stream-expanded-row.tsx
│
└── use-cases/
    ├── sightings-list/
    │   ├── sightings-list.table.tsx
    │   └── entities/
    │       ├── sightings-table.tsx
    │       └── sightings-table.test.tsx
    └── sighting-details/
        └── entities/
            ├── sighting-details.tsx
            └── sighting-details.test.tsx
```

### Modified Files

```
src/features/analytics/sightings/           # Becomes re-exports
src/routes/_enterprise/analytics/sightings/index.tsx    # Thin orchestrator
src/routes/_enterprise/analytics/sightings/$sightingId.tsx  # Thin orchestrator
```

### Deleted Files

```
src/pages/analytics/sightings/index.tsx
src/pages/analytics/sightings/[id]/index.tsx
```

---

## Task 1: Move sightings common layer

Move API, models, hooks, utils, and molecules from `features/analytics/sightings/` to `features/events/sightings/common/`.

**Files:** All files in `src/features/analytics/sightings/` → `src/features/events/sightings/common/`

- [ ] **Step 1: Read ALL source files** in `src/features/analytics/sightings/`

- [ ] **Step 2: Create new directory structure and move files**

For each file:
- Copy to new location under `common/`
- Convert relative imports to `@/` absolute paths
- The `events-stream.tsx` imports 24+ related event tab components from `@/features/hunt/events/` — keep those imports as-is

Files to create:
- `common/sightings.api.ts` (from `api/sightings.api.ts`)
- `common/sighting-event.model.ts` (from `models/sighting-event.model.ts`)
- `common/hooks/use-get-sighting-by-id.ts` (from `hooks/`)
- `common/hooks/use-get-sighting-events-tail.ts` (from `hooks/`)
- `common/utils/get-sighting-qfilter.ts` (from `utils/`)
- `common/molecules/sightings-metadata.tsx` (from `components/metadata/`)
- `common/molecules/patient-zero-details.tsx` (from `components/patient-zero-details/`)
- `common/molecules/events-counts-timeline.tsx` (from `components/events-counts-timeline/`)
- `common/molecules/events-tail-flow.tsx` (from `components/events-tail-flow/`)
- `common/molecules/events-stream.tsx` (from `components/events-stream/events-stream.tsx`)
- `common/molecules/events-stream-expanded-row.tsx` (from `components/events-stream/events-stream.expanded-row.tsx`)

- [ ] **Step 3: Make old files re-export from new locations**

- [ ] **Step 4: Run tests, lint, type check**

Existing tests (like `sighting-events-tail-flow.test.tsx`) should pass via re-exports.

Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor(sightings): move common layer to features/events/sightings/common"
```

---

## Task 2: Create sightings-list table definition

Extract columns, export columns, and filter tools.

**Files:**
- Create: `src/features/events/sightings/use-cases/sightings-list/sightings-list.table.tsx`

- [ ] **Step 1: Read existing columns and tools**

Read:
- `src/features/analytics/sightings/components/sightings-table/sightings-table.columns.tsx`
- `src/features/analytics/sightings/components/sightings-table/sightings-table.tools.ts`

- [ ] **Step 2: Create table definition**

Combine `allSightingsTableColumns`, `hostSightingTableColumns`, `allSightingsExport`, and filter tool definitions into `sightings-list.table.tsx`. Update imports to use `@/features/events/sightings/common/` paths.

- [ ] **Step 3: Run lint and type check**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(sightings): add sightings-list table definition"
```

---

## Task 3: Create SightingsTable entity

Full wired table with typed props, filter toolbar (text search + role dropdown).

**Files:**
- Create: `src/features/events/sightings/use-cases/sightings-list/entities/sightings-table.tsx`
- Create: `src/features/events/sightings/use-cases/sightings-list/entities/sightings-table.test.tsx`

- [ ] **Step 1: Read existing SightingsTable**

Read `src/features/analytics/sightings/components/sightings-table/sightings-table.tsx`. Understand:
- How it manages text search filter and role filter internally
- How it builds qfilter from filters
- How it uses `useServerTableState`

- [ ] **Step 2: Write tests**

Mock `GET */appliances/es_discovery_events/*`. Test: renders table with mock sighting data, renders empty state.

- [ ] **Step 3: Implement entity**

Props:
```ts
interface SightingsTableProps {
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
  onRowClick: (sightingId: string) => void;
}
```

The entity:
- Reads global params via `useGlobalQueryParams(['tenant', 'dates'])`
- Manages text search + role filter as internal state (these are toolbar filters, not URL state)
- Calls `useGetSightingEventsQuery` with assembled params
- Uses `allSightingsTableColumns` from `sightings-list.table`
- Uses `useTablePreferences({ tableId: 'sightingsTable' })`
- Renders toolbar with text search `TextFilter` + role `CommandFilterSingle`
- Renders `Table` + `PaginationFooter` + empty state + export
- Calls `onRowClick(row.original._id)` on row click

- [ ] **Step 4: Run tests, lint, type check**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(sightings): add SightingsTable entity with typed props"
```

---

## Task 4: Create SightingDetails entity

Detail page entity.

**Files:**
- Create: `src/features/events/sightings/use-cases/sighting-details/entities/sighting-details.tsx`
- Create: `src/features/events/sightings/use-cases/sighting-details/entities/sighting-details.test.tsx`

- [ ] **Step 1: Read existing detail page**

Read `src/pages/analytics/sightings/[id]/index.tsx` thoroughly. Understand stats section, all sub-components, and the Flow Chart / Table tab toggle.

- [ ] **Step 2: Write tests**

Mock sightings API. Test: renders discovery key/value when data loads.

- [ ] **Step 3: Implement entity**

Props: `{ sightingId: string }`

The entity:
- Calls `useGetSightingById(sightingId)` from `@/features/events/sightings/common/hooks/`
- Renders stats: discovery key label + EventValue, probe, timestamp
- Renders PatientZeroDetails molecule
- Renders SightingsMetadata molecule (scrollable)
- Renders EventsCountsTimeline molecule
- Renders tabbed view: Flow Chart (SightingEventsTailFlow) / Table (EventsStream)
- Handles loading/error/empty states

All molecules imported from `@/features/events/sightings/common/molecules/`.

- [ ] **Step 4: Run tests, lint, type check**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(sightings): add SightingDetails entity"
```

---

## Task 5: Migrate sightings routes

Rewrite both routes as thin orchestrators.

**Files:**
- Modify: `src/routes/_enterprise/analytics/sightings/index.tsx`
- Modify: `src/routes/_enterprise/analytics/sightings/$sightingId.tsx`

- [ ] **Step 1: Read current routes and pages**

Read:
- `src/routes/_enterprise/analytics/sightings/index.tsx`
- `src/routes/_enterprise/analytics/sightings/$sightingId.tsx`
- `src/pages/analytics/sightings/index.tsx` (for title/description)
- `src/pages/analytics/sightings/[id]/index.tsx` (for detail page structure)

- [ ] **Step 2: Rewrite list route**

```tsx
const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-timestamp'),
});

function SightingsPage() {
  usePageTitle('Sightings');
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
            <PageTitle>Sightings</PageTitle>
            <PageDescription>{/* exact text from current page */}</PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <SightingsTable
          page={page} pageSize={pageSize} sorting={sorting}
          onPageChange={setPage} onPageSizeChange={setPageSize} onSortingChange={onSortingChange}
          onRowClick={(id) => tanstackNavigate({ to: '/analytics/sightings/$sightingId', params: { sightingId: id } })}
        />
      </PageContainer>
    </Page>
  );
}
```

Wrap in PageBoundary. Handle navigate type wrapper.

- [ ] **Step 3: Rewrite detail route**

```tsx
function SightingDetailPage() {
  const { sightingId } = Route.useParams();
  return <SightingDetails sightingId={sightingId} />;
}
```

Wrap in PageBoundary.

- [ ] **Step 4: Run lint and type check**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(sightings): migrate sightings routes to thin orchestrators"
```

---

## Task 6: Delete old pages and verify

**Files to delete:**
- `src/pages/analytics/sightings/index.tsx`
- `src/pages/analytics/sightings/[id]/index.tsx`

- [ ] **Step 1: Check for remaining imports**

Search: `grep -r "pages/analytics/sightings" src/`

- [ ] **Step 2: Delete confirmed unused files and empty directories**

- [ ] **Step 3: Run full test suite, lint, type check**

Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(sightings): delete old sightings pages"
```

---

## Post-Migration Notes

Phase 1d and all of Phase 1 is complete. The events domain is fully migrated:
- **Phase 1a**: Events common + detection events
- **Phase 1b**: Network events + events flow
- **Phase 1c**: Beaconing
- **Phase 1d**: Sightings

**What remains in `features/hunt/events/`:**
- 40+ related event protocol tables (used by event detail tabs and events-stream)
- PCAP/files components
- Specialized views (meta-view, synthetic-view)
- These are imported by the moved event-detail tabs and events-stream molecule

**What remains in `features/analytics/`:**
- `beaconing/` — re-exports only
- `sightings/` — re-exports only
- `hosts/` — untouched (Phase 2)

**Next phase:** Phase 2 (host-insights).
