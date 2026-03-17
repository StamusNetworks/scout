# Phase 0: Conventions & Infrastructure Design

## Overview

Establish the architectural conventions for the full route orchestrator migration, refactor `usePaginatedSearch` to support the entity pattern, and migrate `/detection-methods` as a concrete reference implementation.

This spec defines the rules that all future migration phases follow.

## Migration Phases

The full migration is broken into independent sub-projects:

- **Phase 0** — Conventions, infrastructure, example migration (this spec)
- **Phase 1** — Events domain (`features/events/` with alerts, protocol, sightings, stamus, beaconing)
- **Phase 2** — Host Insights (`features/host-insights/` with hosts-list, host-details, hosts-visualisation)
- **Phase 3** — Threats & Policy Violations
- **Phase 4** — Hunting & Investigation (detection-methods, filter-actions, filter-sets, filtering, investigation, explorer, events-flow, network-events)
- **Phase 5** — Operational Center & Volumetry
- **Phase 6** — Settings & Utilities (deeplinks, ui, user, marketing, share)

Each phase gets its own spec → plan → implementation cycle.

## Feature Structure Conventions

### Domain Slices

Every feature is a **domain slice**. Features can contain nested sub-features (sub-domains) and use-cases.

```
features/<domain>/
├── <domain>.model.ts              # types/schemas (if domain has shared code)
├── <domain>.api.ts                # shared API endpoints
├── <domain>.table.tsx             # shared columns, utils, toolbar config
├── atoms/                         # shared presentational primitives
├── molecules/                     # shared composable components (props-driven)
├── entities/                      # shared components with data fetching
├── use-cases/
│   ├── <use-case-name>/
│   │   ├── <use-case>.api.ts      # use-case specific endpoints
│   │   ├── <use-case>.table.tsx   # use-case specific columns/filters/utils
│   │   ├── molecules/             # use-case specific
│   │   └── entities/              # use-case specific (full wired tables, etc.)
│   └── ...
├── <sub-domain>/                  # nested domain slice (same structure recursively)
│   ├── <sub-domain>.model.ts
│   ├── <sub-domain>.table.tsx
│   └── ...
```

### Rules

- **Model and API** are flat files with dot-notation naming (`host.model.ts`, `detection-methods.api.ts`), not in `api/` or `model/` folders.
- **atoms/molecules/entities** are folders since they can contain multiple files.
- **Shared** code lives at the domain root or in a `common/` folder when the domain has sub-slices. Use-case-specific code nests inside the use-case.
- **`common/` folder** exists at a domain level only when sub-slices need to share code. If a domain has no sub-slices, shared files live at the root.
- **`use-cases/` folder** groups CRUD/read use-cases that have their own API, table definitions, and components.
- **Sub-domains** nest directly in the parent (e.g., `events/alerts/`, `events/protocol/http/`).
- A **domain can be a pure container** (just sub-domain folders, no shared code) when its sub-slices don't share code.

### Component Hierarchy

- **Atoms**: Primitive components. Single component or composable from multiple primitives. Purely presentational.
- **Molecules**: Components built from atoms. Data and handlers passed as props (to context or component). No data fetching.
- **Entities**: Molecules that include data fetching or store read/write directly embedded. Used for:
  - Widgets displaying data not available in the current object (e.g., host insights from an IP)
  - Route sections to avoid unnecessary rerenders and enable isolated testing
  - Full wired tables (toolbar + table + pagination with data fetching)

### Boundary Rule

- **`common/` at project level** (`src/common/`) is strictly presentational — no domain knowledge, no Redux store interactions, no API calls.
- **Feature components** can interact with domain state (Redux stores, domain APIs). Any component that dispatches to stores or calls domain APIs lives in a feature, not in `common/`.

### Table Definition Files

A `.table.tsx` file contains:
- Column constants (all columns for that level)
- Export column definitions (for CSV export)
- Table-specific utility functions
- Toolbar filter configurations

Table entities (in `entities/`) import from the table definition file and wire everything together with data fetching, `Table` component, toolbar, and `PaginationFooter`.

### Examples

**Domain with sub-slices (shared code in `common/`):**
```
features/events/
├── common/
│   ├── events.model.ts
│   ├── events.api.ts
│   ├── events.table.tsx           # shared columns across event types
│   ├── atoms/
│   └── molecules/
├── alerts/
│   ├── alerts.table.tsx           # alert-specific columns
│   └── entities/
├── protocol/
│   ├── http/
│   ├── tls/
│   └── ...
├── sightings/
│   └── entities/                  # page-level entities
├── stamus/
└── beaconing/
    └── entities/
```

**Domain with use-cases (no sub-slices):**
```
features/detection-methods/
├── detection-method.model.ts
├── detection-methods.api.ts
├── detection-methods.table.tsx
├── use-cases/
│   └── detection-methods-list/
│       └── entities/
│           └── detection-methods-table.tsx
```

**Domain with use-cases and shared components:**
```
features/host-insights/
├── common/
│   ├── host.model.ts
│   ├── atoms/
│   │   └── host-badge.tsx
│   └── molecules/
│       └── host-card.tsx
├── use-cases/
│   ├── hosts-list/
│   │   ├── hosts-list.api.ts
│   │   ├── hosts-list.table.tsx
│   │   └── entities/
│   │       ├── hosts-inventory-table.tsx
│   │       └── hosts-all-table.tsx
│   ├── host-details/
│   │   ├── host-details.api.ts
│   │   ├── molecules/
│   │   │   ├── host-summary.tsx
│   │   │   ├── host-roles.tsx
│   │   │   └── host-hostname.tsx
│   │   └── entities/
│   │       ├── host-summary.tsx
│   │       ├── host-outlier-events.tsx
│   │       ├── host-detection-methods.tsx
│   │       ├── host-roles.tsx
│   │       └── host-hostname.tsx
│   └── hosts-visualisation/
│       ├── hosts-visualisation.api.ts
│       └── ...
```

**Pure container domain:**
```
features/analytics/              # no shared code, just grouping
├── beaconing/
│   └── ...
└── sightings/
    └── ...
```

Note: beaconing and sightings are event sub-types and live under `features/events/` instead. `features/analytics/` is not used.

## Route Conventions

### Thin Orchestrator Pattern

Routes are **thin orchestrators**. They provide layout and delegate to feature components.

```tsx
const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-created'),
});

export const Route = createFileRoute('/detection-methods/')({
  validateSearch: searchSchema,
  component: DetectionMethodsPage,
});

function DetectionMethodsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Detection Methods</PageTitle>
            <PageDescription>Manage detection signatures</PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <DetectionMethodsTable search={search} navigate={navigate} />
      </PageContainer>
    </Page>
  );
}
```

### Route Responsibilities

- Define Zod search schema (`validateSearch`)
- Provide layout (`Page`, `PageContainer`, `PageHeader`, cards, modals)
- Call feature atoms, molecules, entities
- Pass route params and search params as props to entities

Routes do **NOT**:
- Fetch data
- Define column arrays
- Wire table state
- Contain domain logic

### Entity Responsibilities (Table Entities)

- Receive `search` params and `navigate` function as props from route
- Own data fetching via RTK Query
- Own toolbar rendering, table rendering, pagination
- Use `usePaginatedSearch` internally with route-provided search/navigate

### Page Components

All routes use the composable `Page`/`PageHeader` system. `DefaultPage` is deprecated.

Components available:
- `Page` — ScrollArea wrapper
- `PageContainer` — layout container with optional `fluid` mode
- `PageHeader` — flex row wrapper
- `PageTitle` — h1 with optional `slot` for icons/badges
- `PageDescription` — descriptive text
- `PageHeaderContent` — left column (grows)
- `PageActions` — right-aligned actions
- `PageAlert` — alert box
- `PageStats` / `PageStat` — stats row

### Search Params Ownership

- **Route search params (URL)**: `page`, `page_size`, `sort`, route-specific filters. Defined via Zod schema.
- **Global state (Redux)**: `tenant`, `start_date`, `end_date`, `qfilter`. Read via `useGlobalQueryParams()`.

Routes define the search schema. Entities receive search params as props and use `usePaginatedSearch` to bridge with global state.

### Error Handling

Routes wrap their component in `PageBoundary` for error boundaries:

```tsx
export const Route = createFileRoute('/detection-methods/')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary>
      <DetectionMethodsPage />
    </PageBoundary>
  ),
});
```

## Table Entity Pattern

A table entity is a self-contained component that owns data fetching, toolbar, table, and pagination.

```tsx
// features/detection-methods/use-cases/detection-methods-list/entities/detection-methods-table.tsx

interface DetectionMethodsTableProps {
  search: { page: number; page_size: number; sort: string };
  navigate: (opts: {
    search: (prev: Record<string, unknown>) => Record<string, unknown>;
    replace?: boolean;
  }) => void;
}

export function DetectionMethodsTable({ search, navigate }: DetectionMethodsTableProps) {
  const globals = useGlobalQueryParams(['tenant', 'dates', 'qfilter']);

  const { page, pageSize, sorting, setPage, setPageSize, onSortingChange } =
    usePaginatedSearch({ search, navigate }, {
      resetOn: [globals.tenant, globals.start_date, globals.end_date],
    });

  const { data, isFetching } = useGetDetectionMethodsQuery({
    page, page_size: pageSize, ...globals,
  });

  const { columnOrder, columnVisibility, onColumnOrderChange, onColumnVisibilityChange } =
    useTablePreferences({ tableId: 'detectionMethodsTable', columns: COLUMNS });

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <ColumnVisibilityToggle ... />
        <ExportButton ... />
      </div>
      {/* Table */}
      <Table
        data={data?.results ?? []}
        columns={COLUMNS}
        isLoading={isFetching}
        sorting={sorting}
        onSortingChange={onSortingChange}
        columnOrder={columnOrder}
        onColumnOrderChange={onColumnOrderChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        Empty={<DataTableEmpty entity="detection methods" />}
      />
      {/* Pagination */}
      {data?.count ? (
        <PaginationFooter
          page={page} pageSize={pageSize} total={data.count}
          onPageChange={setPage} onPageSizeChange={setPageSize}
        />
      ) : null}
    </>
  );
}
```

The `COLUMNS` and export columns are imported from `detection-methods.table.tsx`.

## `usePaginatedSearch` Refactor

The hook changes from accepting a Route object to accepting plain `{ search, navigate }`:

```ts
// Before (coupled to Route):
usePaginatedSearch(Route, { resetOn: [...] })

// After (props-driven):
usePaginatedSearch({ search, navigate }, { resetOn: [...] })
```

Where:
- `search` is the plain search params object (from `Route.useSearch()` in the route, passed as prop)
- `navigate` is the navigate function (from `Route.useNavigate()` in the route, passed as prop)

This decouples entities from the router — they receive search/navigate as props and can be tested in isolation.

The `navigate` function should be `Route.useNavigate()` — the route-scoped version from TanStack Router. This is what the route calls and passes to the entity.

The two existing routes (`/detection-events` and `/hosts/$hostId/detection-events`) are updated to the new signature. They currently call `usePaginatedSearch(Route, ...)` — change to `usePaginatedSearch({ search: Route.useSearch(), navigate: Route.useNavigate() }, ...)`.

### Relationship to `useServerTableState`

The existing `useServerTableState` hook (used by ~24 files) serves a similar purpose but with a different API (`pagination`/`setPagination` vs `page`/`setPage`). It is **not** refactored in Phase 0. Pages that currently use `useServerTableState` will be migrated to `usePaginatedSearch` when their feature is migrated in later phases. Both hooks coexist during the transition.

## Example Migration: `/detection-methods`

### New Feature Structure

```
features/detection-methods/
├── detection-method.model.ts       # types (moved from hunt/detection-methods/signatures/model/)
├── detection-methods.api.ts        # RTK Query endpoints (moved from hunt/detection-methods/signatures/api/)
├── detection-methods.table.tsx     # columns, export columns, utils
├── use-cases/
│   └── detection-methods-list/
│       └── entities/
│           └── detection-methods-table.tsx  # full wired table entity
```

### New Route

```
routes/detection-methods/
├── route.tsx                       # breadcrumbs + Outlet
└── index.tsx                       # thin orchestrator with Page/PageHeader + entity
```

### Scope

Phase 0 migrates only the **list page** (`/detection-methods` index). The detail page (`/detection-methods/$detectionMethodId`), signature analysis, signature flow, ruleset status, and other sub-components are migrated in Phase 4.

The table entity must preserve all existing functionality from the current `SignaturesTable`:
- All existing columns and filters (including `with_alerts` switch filter and `sid` filter from Redux query filters)
- Expanded row component
- Export columns
- Column preferences persistence

### Migration Steps

1. Create `features/detection-methods/` with model, API (re-exports initially), table definition
2. Create the `DetectionMethodsTable` entity preserving all existing table functionality
3. Rewrite route as thin orchestrator using `Page`/`PageHeader`
4. Delete `src/pages/detection-methods/`

## Deliverables

1. **This spec** — conventions reference for all future phases
2. **`usePaginatedSearch` refactor** — new `{ search, navigate }` signature
3. **`/detection-methods` migration** — thin route + table entity, `Page`/`PageHeader`
