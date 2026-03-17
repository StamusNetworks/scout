# Phase 1a: Events Common + Detection Events Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure `features/events/` to follow Phase 0 conventions, create detection-events entities, and refactor all detection-events routes to thin orchestrators. Migrate the event detail page.

**Architecture:** Bottom-up approach: consolidate columns into `.table.tsx` files, move core code from `features/hunt/events/` to `features/events/`, create self-contained entities (DetectionEventsTable, EventsTimeline, EventsCounter, EventDetail), then rewrite routes as thin orchestrators that compose entities with layout.

**Tech Stack:** TanStack Router (file-based), TanStack React Table v8, RTK Query, Zod, React 19, Tailwind CSS, vitest, react-testing-library, MSW.

**Spec:** `docs/superpowers/specs/2026-03-17-phase1a-events-common-design.md`

---

## File Structure

### New Files

```
src/features/events/
├── common/
│   ├── events.model.ts                                    # Move real types here (hunt re-exports back)
│   ├── events.api.ts                                      # Move real API here (hunt re-exports back)
│   ├── events.table.tsx                                   # Consolidated shared columns
│   ├── atoms/
│   │   └── scrollable.tsx                                 # Already exists
│   ├── molecules/
│   │   └── expanded-event-row.tsx                         # Move from hunt
│   └── event-detail/
│       ├── event-detail-tabs.tsx                           # Move from hunt
│       ├── event-detail-tabs.types.ts                     # Move from hunt
│       ├── use-event-detail-data.ts                       # Move from hunt
│       ├── tabs/                                          # Move from hunt
│       │   ├── detection-method-tab.tsx
│       │   ├── synthetic-tab.tsx
│       │   ├── json-tab.tsx
│       │   ├── meta-view-tab.tsx
│       │   ├── related-events-tabs.tsx
│       │   ├── pcap-tab.tsx
│       │   ├── files-tab.tsx
│       │   └── index.ts
│       ├── index.ts                                       # Barrel export
│       └── entities/
│           ├── event-detail.tsx                            # EventDetail entity
│           └── event-detail.test.tsx
│
├── detection-events/
│   ├── detection-events.table.tsx                         # Consolidated alert columns
│   └── entities/
│       ├── detection-events-table.tsx                     # Full wired table entity
│       ├── detection-events-table.test.tsx
│       ├── events-timeline.tsx                            # Tags/Probes chart entity
│       ├── events-timeline.test.tsx
│       ├── events-counter.tsx                             # Pie chart entity
│       └── events-counter.test.tsx
│
└── network-events/
    └── network-events.table.tsx                           # Consolidated protocol columns
```

### Modified Files

```
src/features/hunt/events/api/events.api.ts                 # Becomes re-export FROM features/events/common
src/features/hunt/events/model/event.schema.ts             # Becomes re-export FROM features/events/common
src/features/hunt/events/components/events-table/events.expanded-row.tsx  # Becomes re-export
src/features/hunt/events/components/event-detail-tabs/     # Becomes re-exports

src/routes/detection-events/index.tsx                      # Thin orchestrator
src/routes/detection-events/event.tsx                      # Thin orchestrator + EventDetail entity
src/routes/_enterprise/hosts/$hostId/detection-events.tsx   # Thin orchestrator
```

### Deleted Files

```
src/features/events/common/columns/                        # Individual column files → events.table.tsx
src/features/events/alerts/columns/                        # Individual column files → detection-events.table.tsx
src/features/events/protocol/columns/                      # Individual column files → network-events.table.tsx
src/features/events/common/api/events.api.ts               # Replaced by common/events.api.ts (at root)
src/features/events/common/model/event.schema.ts           # Replaced by common/events.model.ts (at root)
src/pages/events/:eventId/index.tsx                        # Replaced by EventDetail entity
src/routes/detection-events/index.test.tsx                 # Replaced by entity tests
src/routes/_enterprise/hosts/$hostId/detection-events.test.tsx  # Replaced by entity tests
```

---

## Task 1: Consolidate column files into `.table.tsx` definitions

Merge 18 individual column files into 3 table definition files.

**Files:**
- Create: `src/features/events/common/events.table.tsx`
- Create: `src/features/events/detection-events/detection-events.table.tsx`
- Create: `src/features/events/network-events/network-events.table.tsx`
- Delete: `src/features/events/common/columns/` (entire directory)
- Delete: `src/features/events/alerts/columns/` (entire directory)
- Delete: `src/features/events/protocol/columns/` (entire directory)

- [ ] **Step 1: Read all existing column files**

Read every file in:
- `src/features/events/common/columns/` (7 columns: expander, timestamp, source, destination, protocol, host, hostname-host)
- `src/features/events/alerts/columns/` (5 columns: tag, method, category, lateral, outlier)
- `src/features/events/protocol/columns/` (5 columns: tls-sni, http-url, http-request, http-response, payload)

Also read `src/features/events/common/atoms/scrollable.tsx` (used by protocol columns).

- [ ] **Step 2: Create `events.table.tsx`**

Consolidate the 7 common column files into a single file. Export:
- `EXPANDER_COLUMN`
- `TIMESTAMP_COLUMN`
- `SOURCE_COLUMN`
- `DESTINATION_COLUMN`
- `PROTOCOL_COLUMN`
- `HOST_COLUMN`
- `HOSTNAME_HOST_COLUMN`

Preserve every column's exact cell renderer, imports, visibility, and meta.

- [ ] **Step 3: Create `detection-events.table.tsx`**

Consolidate the 5 alert column files. Export:
- `TAG_COLUMN`
- `METHOD_COLUMN`
- `CATEGORY_COLUMN`
- `LATERAL_COLUMN`
- `OUTLIER_COLUMN`

Also add export columns for CSV export (reference the existing `exportColumns` in `src/routes/detection-events/index.tsx`).

- [ ] **Step 4: Create `network-events.table.tsx`**

Consolidate the 5 protocol column files. Export:
- `TLS_SNI_COLUMN`
- `HTTP_URL_COLUMN`
- `HTTP_REQUEST_COLUMN`
- `HTTP_RESPONSE_COLUMN`
- `PAYLOAD_COLUMN`

- [ ] **Step 5: Update all imports**

Find all files that import from the old column barrel exports:
- `@/features/events/common/columns`
- `@/features/events/alerts/columns`
- `@/features/events/protocol/columns`

Update imports to the new `.table.tsx` files:
- `@/features/events/common/events.table`
- `@/features/events/detection-events/detection-events.table`
- `@/features/events/network-events/network-events.table`

These imports exist in `src/routes/detection-events/index.tsx` and `src/routes/_enterprise/hosts/$hostId/detection-events.tsx`.

- [ ] **Step 6: Delete old column directories**

Remove:
- `src/features/events/common/columns/` (entire directory)
- `src/features/events/alerts/columns/` (entire directory with the `alerts` parent if empty)
- `src/features/events/protocol/columns/` (entire directory with the `protocol` parent if empty)

Keep `src/features/events/alerts/` and `src/features/events/protocol/` directories only if they contain other files. If they're empty after column deletion, remove them (they're now `detection-events/` and `network-events/`).

- [ ] **Step 7: Run tests, lint, type check**

Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`
Expected: All tests pass, no errors

- [ ] **Step 8: Commit**

```bash
git commit -m "refactor: consolidate event column files into .table.tsx definitions"
```

---

## Task 2: Move events API and model to `features/events/common/`

Move the real source files and make hunt re-export back.

**Files:**
- Create: `src/features/events/common/events.model.ts` (real types, moved from hunt)
- Create: `src/features/events/common/events.api.ts` (real API, moved from hunt)
- Modify: `src/features/hunt/events/api/events.api.ts` (becomes re-export)
- Modify: `src/features/hunt/events/model/event.schema.ts` (becomes re-export)
- Delete: `src/features/events/common/api/events.api.ts` (old re-export file)
- Delete: `src/features/events/common/model/event.schema.ts` (old re-export file)

- [ ] **Step 1: Read the source files**

Read:
- `src/features/hunt/events/api/events.api.ts` (the real API — 257 lines)
- `src/features/hunt/events/model/event.schema.ts` (the real model)
- `src/features/events/common/api/events.api.ts` (current re-export)
- `src/features/events/common/model/event.schema.ts` (current re-export)

- [ ] **Step 2: Move the events API**

Copy `src/features/hunt/events/api/events.api.ts` to `src/features/events/common/events.api.ts`.

Update its internal imports — it imports from `@/store/api` (the base API) and `@/common/fetching/buildQueryParams`. These stay the same. Update any relative imports within the file to use `@/` paths.

Then replace `src/features/hunt/events/api/events.api.ts` with a re-export:
```ts
export * from '@/features/events/common/events.api';
```

Delete the old `src/features/events/common/api/events.api.ts` re-export (the `api/` subdirectory). Remove the `api/` directory if empty.

- [ ] **Step 3: Move the events model**

Same pattern. Copy `src/features/hunt/events/model/event.schema.ts` to `src/features/events/common/events.model.ts`.

Replace `src/features/hunt/events/model/event.schema.ts` with a re-export:
```ts
export * from '@/features/events/common/events.model';
```

Delete the old `src/features/events/common/model/event.schema.ts` re-export. Remove the `model/` directory if empty.

**Note:** The event model file may import from protocol-specific schema files that remain in `features/hunt/events/model/`. Keep those where they are and ensure the moved file imports them correctly.

- [ ] **Step 4: Verify no broken imports**

Run: `pnpm run check`

All existing consumers import from either:
- `@/features/hunt/events/api/events.api` — now a re-export, still works
- `@/features/events/common/api/events.api` — now deleted, need to check if anything imports from this path

The following files import from the old `api/` and `model/` subdirectory paths and MUST be updated:
- `src/routes/detection-events/index.tsx` — imports from `@/features/events/common/api/events.api` → change to `@/features/events/common/events.api`
- `src/routes/_enterprise/hosts/$hostId/detection-events.tsx` — same change
- Any other files importing from `@/features/events/common/api/` or `@/features/events/common/model/`

Search to confirm: `grep -r "events/common/api" src/` and `grep -r "events/common/model" src/`

- [ ] **Step 5: Run tests, lint, type check**

Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git commit -m "refactor: move events API and model to features/events/common"
```

---

## Task 3: Move ExpandedEventRow and event detail tabs

Move from hunt to the new events feature structure.

**Files:**
- Create: `src/features/events/common/molecules/expanded-event-row.tsx` (move from hunt)
- Create: `src/features/events/common/event-detail/` (move from hunt)
- Modify: hunt source files to re-export from new locations

- [ ] **Step 1: Move ExpandedEventRow**

Read `src/features/hunt/events/components/events-table/events.expanded-row.tsx`.

Copy to `src/features/events/common/molecules/expanded-event-row.tsx`. Update internal imports to use `@/` paths.

Replace the hunt file with a re-export:
```ts
export { ExpandedEventRow } from '@/features/events/common/molecules/expanded-event-row';
```

- [ ] **Step 2: Move event detail tabs**

Copy the entire `src/features/hunt/events/components/event-detail-tabs/` directory to `src/features/events/common/event-detail/`.

Files to copy:
- `event-detail-tabs.tsx`
- `event-detail-tabs.types.ts`
- `use-event-detail-data.ts`
- `index.ts`
- `tabs/` (all tab files)

Update internal imports in the moved files. The tabs that reference components from `features/hunt/events/` (related events, PCAP, files, meta-view, synthetic-view, detection-method) should continue importing from `features/hunt/events/` using `@/` paths — those components stay in hunt for now.

Replace the hunt files with re-exports:
```ts
// src/features/hunt/events/components/event-detail-tabs/index.ts
export * from '@/features/events/common/event-detail';
```

- [ ] **Step 3: Verify no broken imports**

Run: `pnpm run check`

- [ ] **Step 4: Run tests, lint, type check**

Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor: move ExpandedEventRow and event detail tabs to features/events"
```

---

## Task 4: Create `EventsTimeline` entity

Self-contained entity that fetches timeline data and renders the Tags/Probes chart toggle.

**Files:**
- Create: `src/features/events/detection-events/entities/events-timeline.tsx`
- Create: `src/features/events/detection-events/entities/events-timeline.test.tsx`

- [ ] **Step 1: Read the existing inline implementation**

Read `src/routes/detection-events/index.tsx` lines 142-179 — the `EventsCountTimeline` function. Also read `src/features/hunt/timeline/api/hooks/useTimeline.tsx` to understand the data hook.

- [ ] **Step 2: Write tests**

Test:
- Renders timeline chart when data is available
- Shows Tags/Probes toggle when enterprise flag is true
- Hides toggle when enterprise flag is false

- [ ] **Step 3: Implement the entity**

The entity:
- Uses `useFeatureFlags()` for enterprise check
- Uses `useTimeline(target)` hook from `@/features/hunt/timeline/api/hooks/useTimeline`
- Manages Tags/Probes toggle state internally (`useState`)
- Renders `BarChartTimeline` from `@/common/design-system/graphs/bar-chart-timeline`
- Accepts optional `hostId` prop — when provided, passes host-scoped qfilter via `extendQfilter` option

- [ ] **Step 4: Run tests, lint, type check**

Run: `pnpm vitest run src/features/events/detection-events/entities/events-timeline.test.tsx && pnpm run lint --fix && pnpm run check`

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add EventsTimeline entity"
```

---

## Task 5: Create `EventsCounter` entity

Self-contained entity wrapping the existing EventsCounter from dashboard.

**Files:**
- Create: `src/features/events/detection-events/entities/events-counter.tsx`
- Create: `src/features/events/detection-events/entities/events-counter.test.tsx`

- [ ] **Step 1: Read the existing component**

Read `src/features/hunt/dashboard/components/events-counter.tsx`.

- [ ] **Step 2: Write tests**

Test: renders without crashing (mock the API).

- [ ] **Step 3: Implement the entity**

This can simply re-export or wrap the existing `EventsCounter` from `@/features/hunt/dashboard/components/events-counter`. If the existing component is already self-contained (fetches its own data), just re-export it. If it needs props, wrap it.

- [ ] **Step 4: Run tests, lint, type check**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add EventsCounter entity"
```

---

## Task 6: Create `DetectionEventsTable` entity

Full wired table entity following the same pattern as `DetectionMethodsTable` from Phase 0.

**Files:**
- Create: `src/features/events/detection-events/entities/detection-events-table.tsx`
- Create: `src/features/events/detection-events/entities/detection-events-table.test.tsx`

- [ ] **Step 1: Read the current fat orchestrator**

Read `src/routes/detection-events/index.tsx` — extract the data fetching, column assembly, table preferences, and Table wiring logic.

Also read the `DetectionMethodsTable` entity from Phase 0 at `src/features/detection-methods/use-cases/detection-methods-list/entities/detection-methods-table.tsx` as the reference pattern.

- [ ] **Step 2: Write tests**

Test:
- Renders table with mock event data
- Renders empty state when no results
- Renders export button

- [ ] **Step 3: Implement the entity**

Props:
```ts
interface DetectionEventsTableProps {
  search: { page: number; page_size: number; sort: string };
  navigate: (opts: { search: (prev: Record<string, unknown>) => Record<string, unknown>; replace?: boolean }) => void;
  hostId?: string;  // Optional: scopes events to a host
}
```

The entity:
- Reads global params via `useGlobalQueryParams`
- Uses `usePaginatedSearch({ search, navigate }, { resetOn: [...] })`
- Builds qfilter (when `hostId` provided: `(src_ip:"..." OR dest_ip:"...")`)
- Calls `useGetEventsQuery()` with assembled params
- Assembles columns from `events.table.tsx` + `detection-events.table.tsx` + `network-events.table.tsx`
- Conditionally includes enterprise columns via `useFeatureFlags()`
- Uses `useTablePreferences({ tableId })` — `tableId` depends on `hostId` presence
- Renders toolbar (export, column visibility reset), `Table`, `PaginationFooter`, `ExpandedEventRow`
- Row click navigates to event detail (only when no `hostId`)

- [ ] **Step 4: Run tests, lint, type check**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add DetectionEventsTable entity"
```

---

## Task 7: Create `EventDetail` entity

For the event detail page.

**Files:**
- Create: `src/features/events/common/event-detail/entities/event-detail.tsx`
- Create: `src/features/events/common/event-detail/entities/event-detail.test.tsx`

- [ ] **Step 1: Read the current event detail page**

Read `src/pages/events/:eventId/index.tsx` thoroughly. Understand `EventByIdPage`, `EventDetails`, `HostsInfos`.

- [ ] **Step 2: Write tests**

Test:
- Renders loading state
- Renders event header with signature when data loads
- Renders event detail tabs

- [ ] **Step 3: Implement the entity**

Props:
```ts
interface EventDetailProps {
  eventId: string;
}
```

The entity:
- Fetches event via `useGetEventsQuery({ _id: eventId })`
- Fetches host info for source/dest IPs via `useGetHostWithAlertsQuery`
- Fetches impacted entity via `useGetImpactedEntitiesQuery`
- Renders event header (signature, MITRE, timestamp, IPs, host enrichment)
- Renders `EventDetailTabs` with all 7 tabs (from `features/events/common/event-detail/`)
- Handles loading/error/not-found states

Reference the current `EventByIdPage` faithfully — preserve all UI sections.

- [ ] **Step 4: Run tests, lint, type check**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add EventDetail entity for event detail page"
```

---

## Task 8: Refactor `/detection-events` to thin orchestrator

Replace the 338-line fat orchestrator with a thin route composing entities.

**Files:**
- Modify: `src/routes/detection-events/index.tsx`
- Delete: `src/routes/detection-events/index.test.tsx` (tests move to entity level)

- [ ] **Step 1: Rewrite as thin orchestrator**

```tsx
const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-timestamp'),
});

function DetectionEventsPage() {
  usePageTitle('Events');
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Events</PageTitle>
            <PageDescription>...</PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <EventsCounter />
        <EventsTimeline />
        <DetectionEventsTable search={search} navigate={navigate} />
      </PageContainer>
    </Page>
  );
}
```

Use the exact title and description from the current route. Replace `DefaultPage` with composable `Page`/`PageHeader`.

Handle the navigate type wrapper pattern (same as detection-methods route).

- [ ] **Step 2: Delete old route tests**

The route tests (`src/routes/detection-events/index.test.tsx`) are replaced by entity-level tests created in Tasks 4-6.

- [ ] **Step 3: Verify parent route and sibling routes still work**

Check `src/routes/detection-events/route.tsx` (breadcrumbs + Outlet) and `src/routes/detection-events/event.tsx` (event detail) still work.

- [ ] **Step 4: Run tests, lint, type check**

Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`

- [ ] **Step 5: Commit**

```bash
git commit -m "refactor: rewrite /detection-events as thin orchestrator"
```

---

## Task 9: Refactor `/hosts/$hostId/detection-events` to thin orchestrator

Replace with a thin route that uses the same entities with host scoping.

**Files:**
- Modify: `src/routes/_enterprise/hosts/$hostId/detection-events.tsx`
- Delete: `src/routes/_enterprise/hosts/$hostId/detection-events.test.tsx`

- [ ] **Step 1: Rewrite as thin orchestrator**

```tsx
const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-timestamp'),
});

function HostDetectionEventsTab() {
  const { hostId } = useParams({ strict: false }) as { hostId: string };
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <>
      <EventsTimeline hostId={hostId} />
      <DetectionEventsTable search={search} navigate={navigate} hostId={hostId} />
    </>
  );
}
```

No `Page`/`PageContainer` — this renders inside the parent layout's `<Outlet />`.

- [ ] **Step 2: Delete old route tests**

Replaced by entity-level tests.

- [ ] **Step 3: Run tests, lint, type check**

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor: rewrite hosts/$hostId/detection-events as thin orchestrator"
```

---

## Task 10: Migrate `/detection-events/event` to thin orchestrator

Migrate the event detail page to use the `EventDetail` entity.

**Files:**
- Modify: `src/routes/detection-events/event.tsx`
- Delete: `src/pages/events/:eventId/index.tsx`

- [ ] **Step 1: Read the current route and page**

Read:
- `src/routes/detection-events/event.tsx` — current thin wrapper importing `EventByIdPage`
- `src/pages/events/:eventId/index.tsx` — the page to replace

- [ ] **Step 2: Rewrite as thin orchestrator**

```tsx
const searchSchema = z.object({
  _id: z.string(),
});

function EventDetailPage() {
  const { _id } = Route.useSearch();

  return (
    <Page>
      <PageContainer>
        <EventDetail eventId={_id} />
      </PageContainer>
    </Page>
  );
}
```

- [ ] **Step 3: Check for remaining imports of the old page**

Search for imports of `@/pages/events` in all files. Only delete the page file if no remaining imports exist.

- [ ] **Step 4: Delete old page file**

Remove `src/pages/events/:eventId/index.tsx`.

- [ ] **Step 5: Run full test suite, lint, type check**

Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: migrate /detection-events/event to thin orchestrator with EventDetail entity"
```

---

## Post-Migration Notes

Phase 1a is complete. The events common infrastructure is in place and all detection-events routes use the thin orchestrator pattern.

**What's ready for Phase 1b (network events + events flow):**
- `events.table.tsx` shared columns
- `network-events.table.tsx` protocol columns
- `events.api.ts` shared API (includes `useGetEventsTailQuery`, `useGetEventsAggregationQuery`, etc.)
- Event detail tabs and ExpandedEventRow

**What stays in `features/hunt/events/` until later phases:**
- 40+ related event protocol tables
- PCAP/files components
- Specialized views (meta-view internals, synthetic-view internals)
- These are imported directly by event detail tabs
