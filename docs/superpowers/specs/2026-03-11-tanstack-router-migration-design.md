# TanStack Router Migration Design

## Overview

Replace React Router v6 with TanStack Router using file-based routing. Refactor the hosts table page as a proof of concept for the "route as orchestrator" pattern where routes own data flow and pass props to presentational components. Rewrite `useServerTableState` to use TanStack Router's search params instead of nuqs.

## Goals

1. Switch the entire routing layer from React Router v6 to TanStack Router with file-based routing
2. Remove layers of encapsulation on table-based pages — routes dictate data flow
3. Replace nuqs with TanStack Router's built-in search params (starting with hosts page)
4. Extract table column definitions as individual named exports for reuse

## Non-Goals

- Migrating `useGlobalQueryParams` away from Redux (stays as-is)
- Backward-compatibility redirects for old route paths
- Refactoring non-table pages beyond minimal route tree migration
- Changing the data layer (RTK Query stays)

## Approach

Approach C: Full route tree swap with incremental page migration.

1. Set up TanStack Router infrastructure (plugin, root route, router instance)
2. Migrate the full route tree to file-based routing (all pages work under new router)
3. Refactor hosts page as proof of concept (search params, columns, route-as-orchestrator)
4. Clean up removed dependencies

## Design

### 1. Infrastructure

#### Vite Plugin

Add `TanStackRouterVite` to `vite.config.ts`:

```ts
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      autoCodeSplitting: true,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    // ... existing plugins
  ],
})
```

`autoCodeSplitting: true` eliminates the need for `.lazy.tsx` files.

#### Root Route (`src/routes/__root.tsx`)

Uses `createRootRouteWithContext`. The current `Root` component (sidebar, header, breadcrumbs, keyboard shortcuts) becomes the root route's component.

```ts
import { createRootRouteWithContext } from '@tanstack/react-router'

interface RouterContext {
  store: AppStore
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,
})
```

#### Router Instance (`src/router.tsx`)

```ts
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultErrorComponent: DefaultCatchBoundary,
  defaultNotFoundComponent: NotFound,
  scrollRestoration: true,
  basepath: import.meta.env.BASE_URL || '/',
  context: { store },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

#### New Dependencies

- `@tanstack/zod-adapter` — for `zodValidator` used in `validateSearch`

Already installed:
- `@tanstack/react-router`, `@tanstack/router-plugin`, `@tanstack/react-router-devtools`

#### Search Param Serialization

Use TanStack Router's default JSON-based serialization. No custom serializer.

#### App.tsx Changes

- Remove `NuqsAdapter` wrapper
- Replace react-router `RouterProvider` with TanStack's `RouterProvider`
- Redux Provider and PersistGate stay as-is

```ts
import { RouterProvider } from '@tanstack/react-router'
import { router } from '../router'

function App() {
  return (
    <PersistGate loading={null} persistor={persistor}>
      <Provider store={store}>
        <SystemSettings>
          <AppLoader>
            <RouterProvider router={router} />
            <Toaster />
          </AppLoader>
        </SystemSettings>
      </Provider>
    </PersistGate>
  )
}
```

### 2. File-Based Route Tree

All routes move from `src/pages/router.tsx` to `src/routes/`:

```
src/routes/
├── __root.tsx                              # Root layout
├── index.tsx                               # /
├── _enterprise.tsx                         # Pathless layout (feature flag gate)
├── _enterprise/
│   ├── operational-center.tsx
│   ├── volumetry.tsx
│   ├── hosts/
│   │   ├── index.tsx                       # /hosts (proof of concept)
│   │   └── $hostId/
│   │       ├── route.tsx                   # /hosts/$hostId layout (tabs)
│   │       ├── index.tsx                   # insights (default tab)
│   │       ├── incidents.tsx
│   │       ├── detection-methods.tsx
│   │       ├── beacons.tsx
│   │       ├── sightings.tsx
│   │       ├── timeline.tsx
│   │       ├── outlier-events.tsx
│   │       └── detection-events.tsx
│   ├── threats/
│   │   ├── route.tsx                       # breadcrumb layout
│   │   ├── index.tsx                       # redirect → compromises/incidents
│   │   ├── compromises/
│   │   │   ├── route.tsx                   # tab wrapper layout
│   │   │   ├── index.tsx                   # redirect → incidents
│   │   │   ├── incidents.tsx
│   │   │   ├── entities.tsx
│   │   │   ├── graph.tsx
│   │   │   └── attack-flow.tsx
│   │   ├── timeline.tsx
│   │   ├── coverage/
│   │   │   ├── index.tsx                   # coverage list
│   │   │   ├── threat/
│   │   │   │   └── $threatId/
│   │   │   │       ├── route.tsx           # layout
│   │   │   │       ├── index.tsx
│   │   │   │       ├── events.tsx
│   │   │   │       └── detection-methods.tsx
│   │   │   └── family/
│   │   │       └── $familyId/
│   │   │           ├── route.tsx           # layout
│   │   │           ├── index.tsx
│   │   │           ├── threats.tsx
│   │   │           ├── events.tsx
│   │   │           └── detection-methods.tsx
│   ├── policy-violations/                  # Mirrors threats structure
│   │   ├── route.tsx
│   │   ├── index.tsx
│   │   ├── violations/
│   │   │   ├── route.tsx
│   │   │   ├── index.tsx
│   │   │   └── graph.tsx
│   │   └── coverage/
│   │       ├── index.tsx
│   │       ├── threat/
│   │       │   └── $threatId/
│   │       │       ├── route.tsx
│   │       │       ├── index.tsx
│   │       │       ├── events.tsx
│   │       │       └── detection-methods.tsx
│   │       └── family/
│   │           └── $familyId/
│   │               ├── route.tsx
│   │               ├── index.tsx
│   │               ├── threats.tsx
│   │               ├── events.tsx
│   │               └── detection-methods.tsx
│   ├── analytics/
│   │   ├── route.tsx                       # breadcrumb layout
│   │   ├── index.tsx                       # redirect → beaconing/ips
│   │   ├── beaconing/
│   │   │   ├── ips/
│   │   │   │   ├── index.tsx
│   │   │   │   └── $ip.tsx
│   │   │   └── ja3s/
│   │   │       ├── index.tsx
│   │   │       └── $ja3s.tsx
│   │   └── sightings/
│   │       ├── index.tsx
│   │       └── $sightingId.tsx
│   └── attack-surface/
│       ├── route.tsx                       # layout with tabs
│       ├── index.tsx                       # visualisation (default)
│       └── inventory.tsx
├── explorer.tsx
├── events-flow.tsx
├── detection-events/
│   ├── index.tsx
│   └── event.tsx
├── detection-methods/
│   ├── index.tsx
│   └── $detectionMethodId.tsx
├── filters-actions.tsx
├── investigations.tsx
├── explore.tsx
├── deeplink.tsx
├── deeplinks.tsx
├── share.tsx
├── session-events.tsx
├── filter-sets.tsx
└── user-settings.tsx
```

#### Enterprise Feature Gate

`_enterprise.tsx` is a pathless layout route that checks the feature flag:

```ts
export const Route = createFileRoute('/_enterprise')({
  beforeLoad: ({ context }) => {
    // Access feature flags via store from router context
    const state = context.store.getState()
    const enterprise = selectIsEnterprise(state)
    if (!enterprise) {
      throw redirect({ to: '/explorer' })
    }
  },
  component: () => <Outlet />,
})
```

#### Redirects (Index Routes)

Index routes that currently use `<Navigate>` become:

```ts
export const Route = createFileRoute('/_enterprise/threats/')({
  beforeLoad: () => {
    throw redirect({ to: '/threats/compromises/incidents' })
  },
})
```

**Important:** Redirect targets use URL paths (e.g., `/threats/compromises/incidents`), not route IDs. Pathless segments like `_enterprise` are stripped from URLs — never include them in `to:` targets. The generated route tree provides type checking for valid paths.

### 3. Hosts Page Refactoring (Proof of Concept)

#### Search Params Schema

The hosts route declares its search params with zod validation:

```ts
import { z } from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'

const hostsSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  page_size: z.number().min(1).catch(10),
  sort: z.string().optional(),
  with_alerts: z.boolean().catch(true),
  in_home_net: z.enum(['true', 'false', 'all']).catch('all'),
})

export const Route = createFileRoute('/_enterprise/hosts/')({
  validateSearch: zodValidator(hostsSearchSchema),
  component: HostsRoute,
})
```

Note: `zodValidator` from `@tanstack/zod-adapter` provides correct input/output type inference for `Route.useSearch()`.

#### Route as Orchestrator

The route component reads search params, fetches data, and passes everything down:

```ts
function HostsRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const globalParams = useGlobalQueryParams([...])

  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState(search, { navigate })

  const { data, isFetching } = useGetHostsQuery({
    ...globalParams,
    ...queryParams,
    ordering: queryParams.ordering ?? (search.with_alerts ? '-hits' : '-host_id.last_seen'),
  })

  // Conditionally include hitsColumn based on with_alerts
  const columns = search.with_alerts
    ? [...hostsColumns, hitsColumn]
    : hostsColumns

  return (
    <DefaultPage
      title="Hosts"
      actions={
        <HomeNetPicker
          value={search.in_home_net}
          onChange={(value) => navigate({ search: (prev) => ({ ...prev, in_home_net: value }) })}
        />
      }
    >
      <DiscoveredHosts />
      <HostsTable
        data={data}
        isLoading={isFetching}
        columns={columns}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    </DefaultPage>
  )
}
```

#### useServerTableState Rewrite

The hook is rewritten to accept search params and a navigate function instead of using nuqs internally:

```ts
type PaginationSearch = {
  page: number
  page_size: number
  sort?: string
}

type UseServerTableStateOptions<TSearch extends PaginationSearch> = {
  navigate: (opts: { search: (prev: TSearch) => TSearch }) => void
}

function useServerTableState<TSearch extends PaginationSearch>(
  search: TSearch,
  options: UseServerTableStateOptions<TSearch>,
) {
  // Derives pagination/sorting from search params
  // Uses navigate({ search }) to update URL
  // Returns { queryParams, pagination, setPagination, sorting, setSorting }
}
```

The hook no longer manages its own URL state — it reads from search params passed in and uses the provided navigate function to write updates. The dual local+URL state pattern from nuqs is no longer needed since TanStack Router's search params are synchronous.

**Page reset on param change:** The existing `shallowEqual`/`prevParamsRef` logic that resets page to 1 when filter params change is preserved. This is inherent to table behavior (not nuqs-specific) — changing a filter while on page 5 must reset to page 1. The rewritten hook tracks the non-pagination subset of `search` via refs and calls `navigate({ search: (prev) => ({ ...prev, page: 1 }) })` when a change is detected.

#### Column Definitions

Extract to `features/analytics/hosts/components/hosts-table/hosts-table.columns.tsx`:

```ts
import { createColumnHelper } from '@tanstack/react-table'

const columnHelper = createColumnHelper<Host>()

export const hostnameColumn = columnHelper.accessor('host_id.hostname', { ... })
export const ipColumn = columnHelper.accessor('host_id.ip', { ... })
export const servicesColumn = columnHelper.accessor('host_id.services', { ... })
export const lastSeenColumn = columnHelper.accessor('host_id.last_seen', { ... })
export const hitsColumn = columnHelper.accessor('hits', { ... })
export const roleColumn = columnHelper.accessor('host_id.role', { ... })
// ... etc

// Convenience array for the standard hosts table
export const hostsColumns = [
  hostnameColumn,
  ipColumn,
  servicesColumn,
  lastSeenColumn,
  roleColumn,
  // hitsColumn conditionally added by route based on with_alerts
]
```

#### HostsTable Becomes Presentational

`HostsTable` no longer calls `useServerTableState`, `useGlobalQueryParams`, or `useGetHostsQuery`. It receives data and table state as props. It still owns `useTablePreferences` internally (column order/visibility is Redux-backed UI state, not route concern) and renders `HostsTableExpandedRow` for row expansion.

```ts
type HostsTableProps = {
  data: HostsResponse | undefined
  isLoading: boolean
  columns: ColumnDef<Host>[]
  pagination: PaginationState
  onPaginationChange: (updater: Updater<PaginationState>) => void
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
}

export function HostsTable(props: HostsTableProps) {
  // Owns table preferences (column order/visibility) via useTablePreferences
  // Owns row expansion (HostsTableExpandedRow)
  // Owns toolbar, export columns
  // Receives data + pagination/sorting from route
}
```

### 4. Cleanup

#### Removed After Full Migration

- `react-router-dom` from `package.json`
- `nuqs` from `package.json` (after all pages migrated; stays for now)
- `NuqsAdapter` from `App.tsx`
- `src/pages/router.tsx`
- `src/pages/routes.config.ts`
- Old `usePaginationUrlState` and `useSortingUrlState` hooks

#### Kept

- `useGlobalQueryParams` — reads from Redux, unchanged
- `useTablePreferences` — Redux-backed column preferences
- `PageBoundary` error UI — reused as `defaultErrorComponent`
- Breadcrumb system — adapted to TanStack Router

#### Dead Code Cleanup

- Remove `hostsPageStateSlice` from Redux store (sort state moves to URL search params)
- Remove `usePaginationUrlState` and `useSortingUrlState` (replaced by `useServerTableState` rewrite)

#### First Pass Scope

- Full route tree migrated to file-based routing under `src/routes/`
- All react-router-dom imports replaced with TanStack Router equivalents
- Breadcrumbs system adapted (replace `useResolvedPath` and `Link` from react-router-dom)
- Hosts page fully refactored (search params, column extraction, route-as-orchestrator)
- All other pages: minimal changes — moved into route files, components stay as-is internally
- `react-router-dom` fully removed (requires breadcrumb migration in same pass)
- `nuqs` stays until remaining pages are migrated (only hosts page stops using it)

## Migration Notes

### Import Replacements (Mechanical)

| react-router-dom | @tanstack/react-router |
|---|---|
| `Outlet` | `Outlet` |
| `useParams` | `Route.useParams()` or `useParams({ from: '...' })` |
| `useNavigate` | `useNavigate()` or `Route.useNavigate()` |
| `Navigate` (component) | `redirect()` in `beforeLoad` |
| `useLocation` | `useLocation()` |
| `Link` | `Link` |
| `useSearchParams` | `Route.useSearch()` |

### Breadcrumbs

The current `OutletBreadcrumb` context-based system imports `useResolvedPath` and `Link` from `react-router-dom`. These must be replaced in the same pass as the route tree migration to fully remove `react-router-dom`.

Approach: Keep the existing context-based registration pattern but replace `react-router-dom` internals:
- Replace `useResolvedPath` — pass explicit `link` paths to breadcrumb registrations (already done in most usages)
- Replace `Link` from react-router-dom with `Link` from `@tanstack/react-router`

### Column Definitions

Column definitions use the existing `CustomColumnDef<T>` pattern from the project's `DataTable` component, not `columnHelper.accessor()`. The extracted individual column consts must match whatever type `DataTable` expects. During implementation, check the actual column type and match it.
