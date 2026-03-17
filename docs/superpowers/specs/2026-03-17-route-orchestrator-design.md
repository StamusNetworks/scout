# Route Orchestrator Design

## Overview

Migrate from legacy `/pages` components to route-as-orchestrator pattern using TanStack Router's file-based routing. Routes become fat orchestrators that define search params, fetch data, and build the full page layout inline. Reusable domain logic lives in `/features` organized by atom/molecule/entity hierarchy.

Two pattern routes are migrated first (`/detection-events` and `/hosts/$hostId`) to validate the architecture before a full migration.

## Architecture Decisions

### Route as Fat Orchestrator

Every route file is self-contained. It defines its Zod search schema, calls RTK Query hooks, picks column constants from features, and builds toolbar + table + pagination inline. If something is purely page-specific, it goes in the route file. If it's reusable or domain-meaningful, it goes in a feature.

```ts
// routes/detection-events/index.tsx
const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-timestamp'),
})

export const Route = createFileRoute('/detection-events')({
  validateSearch: searchSchema,
  component: DetectionEventsPage,
})

function DetectionEventsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const globals = useGlobalQueryParams(['dates', 'tenant', 'qfilter'])

  const { page, pageSize, sorting, setPage, setPageSize, setSorting } =
    usePaginatedSearch(Route, {
      resetOn: [globals.start_date, globals.end_date, globals.tenant],
    })

  const { data, isFetching } = useGetEventsQuery({
    page, page_size: pageSize, ordering: sorting, ...globals,
  })

  const columns = [TIMESTAMP_COLUMN, METHOD_COLUMN, SOURCE_COLUMN, DEST_COLUMN, PROTOCOL_COLUMN]

  return (
    <Page>
      <PageHeader title="Detection Events" count={data?.count} />
      <BarChartTimeline data={timeline} />
      <div>
        <FilterInput ... />
        <ColumnVisibilityToggle columns={columns} ... />
        <ExportButton columns={exportColumns} data={data} />
      </div>
      <Table data={data?.results} columns={columns} isLoading={isFetching}
        sorting={sorting} onSortingChange={setSorting}
      />
      <PaginationFooter
        page={page} pageSize={pageSize} total={data?.count}
        onPageChange={setPage} onPageSizeChange={setPageSize}
      />
    </Page>
  )
}
```

### Complex Routes: hosts/$hostId

The parent layout route renders the host summary entity and inline tab navigation. Each tab is a separate fat orchestrator route.

```ts
// routes/_enterprise/hosts/$hostId/route.tsx
function HostDetailLayout() {
  const { hostId } = Route.useParams()

  return (
    <Page>
      <HostSummary hostId={hostId} />
      <Tabs>
        <TabLink to="/hosts/$hostId" params={{ hostId }}>Insights</TabLink>
        <TabLink to="/hosts/$hostId/detection-events" params={{ hostId }}>Detection Events</TabLink>
        <TabLink to="/hosts/$hostId/incidents" params={{ hostId }}>Incidents</TabLink>
        ...
      </Tabs>
      <Outlet />
    </Page>
  )
}
```

`HostSummary` is an entity from `features/hosts/entities/` that fetches its own data based on `hostId`.

### Search Params Ownership

- **Route search params (URL)**: `page`, `page_size`, `sort`, route-specific filters. Defined via Zod schema in `validateSearch`.
- **Global state (Redux)**: `tenant`, `start_date`, `end_date`, `qfilter`. These are cross-cutting concerns shared by all routes, displayed in the header toolbar.

Routes do NOT own global params. Global params stay in Redux and are read via `useGlobalQueryParams()`.

### Page Reset on Global Param Changes

A common utility hook `usePaginatedSearch` bridges route search params and Redux global state. It:

1. Reads `page`, `page_size`, `sort` from the route's search params.
2. Accepts a `resetOn` dependency array of external values (e.g., dates, tenant).
3. Resets page to 1 **synchronously** (before the query fires) when any `resetOn` dep changes.
4. Syncs the URL via `navigate({ replace: true })`.
5. Returns `{ page, pageSize, sorting, setPage, setPageSize, setSorting }`.

This prevents duplicate RTK Query calls — the query only fires once with the correct page number.

```
Redux (global)                    Route search params (URL)
  tenant, dates, qfilter            page, page_size, sort
          │                                  │
          └──────────┬───────────────────────┘
                     ▼
          usePaginatedSearch(Route, { resetOn })
            - resets page synchronously when resetOn deps change
            - returns { page, pageSize, sorting, setters }
                     │
                     ▼
          RTK Query (single query, no duplicates)
                     │
                     ▼
          Route renders: Table + PaginationFooter
```

## Feature Organization

Features follow the atom/molecule/entity hierarchy with colocated columns, models, and APIs. Sub-features nest inside their parent.

### Component Hierarchy

- **Atoms**: Primitive components. Single component or composable from multiple primitives.
- **Molecules**: Components built from atoms. Data and handlers passed as props (to context or component).
- **Entities**: Molecules that include data fetching or store read/write directly embedded.

### Feature Structure

```
features/
├── events/
│   ├── common/
│   │   ├── api/              # shared RTK Query endpoints (same elastic index)
│   │   ├── model/            # base Event type + discriminated unions
│   │   ├── columns/          # shared column constants (TIMESTAMP, SOURCE_IP, etc.)
│   │   ├── atoms/            # SeverityBadge, EventIcon
│   │   └── molecules/        # ExpandedEventRow base, EventValue
│   │
│   ├── alerts/
│   │   ├── columns/          # alert-specific: METHOD, CATEGORY, TAG
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── model/            # alert-specific types if needed
│   │
│   ├── protocol/
│   │   ├── columns/
│   │   ├── atoms/
│   │   └── molecules/
│   │
│   ├── sightings/
│   │   ├── api/              # sighting-specific queries if needed
│   │   ├── columns/
│   │   ├── atoms/
│   │   └── molecules/
│   │
│   └── stamus/
│       ├── columns/
│       ├── atoms/
│       └── molecules/
│
├── hosts/
│   ├── api/
│   ├── model/
│   ├── columns/
│   ├── atoms/
│   ├── molecules/
│   └── entities/             # HostSummary
│
├── threats/
│   ├── api/
│   ├── model/
│   ├── columns/
│   └── ...
```

### Column Constants

Each column is a single named export, one file per column:

```ts
// features/events/common/columns/timestamp.tsx
export const TIMESTAMP_COLUMN: CustomColumnDef<Event> = {
  id: 'timestamp',
  accessorKey: '@timestamp',
  header: ({ column }) => <DataTableColumnHeader column={column} title="Timestamp" />,
  cell: ({ row }) => <DateTime value={row.original['@timestamp']} />,
}
```

The route orchestrator picks and orders columns:

```ts
const columns = [TIMESTAMP_COLUMN, METHOD_COLUMN, SOURCE_COLUMN, DEST_COLUMN, PROTOCOL_COLUMN]
```

### Events Sub-Feature Rationale

Events are a family of related types from the same Elasticsearch index, discriminated by `event_type`:
- **protocol** — `event_type: "protocol"`
- **alerts** — `event_type: "alert"`
- **sightings** — `event_type: "alert"` with `discovery:*`
- **stamus** — `event_type: "stamus"` (technically also alerts)

They share base columns, models, and components but have type-specific extensions. The `common/` subfolder holds shared code; sub-feature folders hold type-specific code.

## Table Architecture

### New `Table` Component

A new dumb `Table` component replaces the current `DataTable`. Created alongside the existing component — old `DataTable` stays until migration is complete.

**Location**: `common/design-system/molecules/table/`

**Props**:

```ts
interface TableProps<T> {
  data: T[]
  columns: CustomColumnDef<T>[]
  isLoading: boolean
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  ExpandedRow?: ComponentType<{ row: T }>
  columnOrder?: string[]
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
}
```

No toolbar. No pagination. No server-side hooks. Just renders rows.

### Error Handling

Routes use TanStack Router's built-in `errorComponent` option instead of the current `PageBoundary` wrapper:

```ts
export const Route = createFileRoute('/detection-events')({
  validateSearch: searchSchema,
  component: DetectionEventsPage,
  errorComponent: RouteErrorBoundary,
})
```

### PaginationFooter

A standalone dumb molecule in common.

**Location**: `common/design-system/molecules/pagination-footer/`

**Props**:

```ts
interface PaginationFooterProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}
```

### Three Data Modes

The route decides which mode to use:

1. **Server-side** (most tables): route maps search params to API queries, passes `sorting`/`onSortingChange` that update URL via `usePaginatedSearch`.
2. **State-driven** (nested/dynamic tables): route uses `useState` instead of search params for pagination/sorting.
3. **Client-side** (rare): route passes all data, `Table` uses TanStack Table's built-in sorting/pagination internally.

## Migration Strategy

### Approach: Pattern-First

Migrate two representative routes end-to-end to establish the pattern, then migrate the rest incrementally.

- **Simple list page**: `/detection-events`
- **Complex detail page with tabs**: `/hosts/$hostId`

Delete corresponding `/pages` entries as each route is migrated.

### Order of Work

#### Step 1: Common Infrastructure

- Create `Table` component (new, alongside old `DataTable`)
- Create `PaginationFooter` molecule
- Create `usePaginatedSearch` hook

#### Step 2: Feature Reorganization for Events

- Create `features/events/` with `common/`, `alerts/`, `protocol/`, `sightings/`, `stamus/` structure
- Extract column constants from current monolithic columns file — one file per column
- Move shared atoms/molecules (EventValue, SeverityBadge, DateTime, etc.)
- Move models and API layer

#### Step 3: Migrate `/detection-events` Route

- Add Zod search schema (`page`, `page_size`, `sort`)
- Inline the full page: toolbar, `Table`, `PaginationFooter`
- Use `usePaginatedSearch` with `resetOn: [dates, tenant, qfilter]`
- Pick columns from feature constants
- Delete corresponding `/pages/events/` files

#### Step 4: Feature Reorganization for Hosts

- Create `features/hosts/entities/HostSummary`
- Extract host-specific columns as constants
- Move/reorganize related features (beaconing, sightings, incidents)

#### Step 5: Migrate `/hosts/$hostId` Route

- `route.tsx`: `HostSummary` entity + inline tab nav + `<Outlet />`
- Each tab route: fat orchestrator with its own search schema, data fetching, table
- Delete corresponding `/pages/hosts/` files

### Nuqs Removal

Nuqs is removed incrementally. As each route is migrated, its nuqs usage is replaced by TanStack Router search params + `usePaginatedSearch`. Once all routes are migrated, the `nuqs` dependency is removed entirely.
