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
  // Extensible for future needs (e.g., queryClient)
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
  context: {},
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

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
│   │   │   ├── threat.$threatId/
│   │   │   │   ├── route.tsx               # layout
│   │   │   │   ├── index.tsx
│   │   │   │   ├── events.tsx
│   │   │   │   └── detection-methods.tsx
│   │   │   └── family.$familyId/
│   │   │       ├── route.tsx               # layout
│   │   │       ├── index.tsx
│   │   │       ├── threats.tsx
│   │   │       ├── events.tsx
│   │   │       └── detection-methods.tsx
│   ├── policy-violations/                  # Mirrors threats structure
│   │   ├── route.tsx
│   │   ├── index.tsx
│   │   ├── violations/
│   │   │   ├── route.tsx
│   │   │   ├── index.tsx
│   │   │   └── graph.tsx
│   │   └── coverage/
│   │       ├── index.tsx
│   │       ├── threat.$threatId/
│   │       │   ├── route.tsx
│   │       │   ├── index.tsx
│   │       │   ├── events.tsx
│   │       │   └── detection-methods.tsx
│   │       └── family.$familyId/
│   │           ├── route.tsx
│   │           ├── index.tsx
│   │           ├── threats.tsx
│   │           ├── events.tsx
│   │           └── detection-methods.tsx
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
  beforeLoad: () => {
    // Access feature flags — if not enterprise, redirect
    // Note: since feature flags come from Redux, we'll use
    // the store directly in beforeLoad rather than hooks
    const state = store.getState()
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

### 3. Hosts Page Refactoring (Proof of Concept)

#### Search Params Schema

The hosts route declares its search params with zod validation:

```ts
import { z } from 'zod'

const hostsSearchSchema = z.object({
  page: z.number().min(1).catch(1),
  page_size: z.number().min(1).catch(10),
  sort: z.string().optional(),
  with_alerts: z.boolean().catch(true),
  in_home_net: z.enum(['true', 'false', 'all']).catch('all'),
})

export const Route = createFileRoute('/_enterprise/hosts/')({
  validateSearch: (search) => hostsSearchSchema.parse(search),
  component: HostsRoute,
})
```

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
        columns={hostsColumns}
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
type UseServerTableStateInput = {
  page: number
  page_size: number
  sort?: string
}

type UseServerTableStateOptions = {
  navigate: (opts: { search: (prev: any) => any }) => void
}

function useServerTableState(search: UseServerTableStateInput, options: UseServerTableStateOptions) {
  // Derives pagination/sorting from search params
  // Uses navigate({ search }) to update URL
  // Resets page to 1 when params change
  // Returns { queryParams, pagination, setPagination, sorting, setSorting }
}
```

The hook no longer manages its own URL state — it reads from search params passed in and uses the provided navigate function to write updates. The dual local+URL state pattern from nuqs is no longer needed since TanStack Router's search params are synchronous.

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

`HostsTable` no longer calls `useServerTableState`, `useGlobalQueryParams`, or `useGetHostsQuery`. It receives everything as props:

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
  // Pure presentation — renders DataTable with the props
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

#### First Pass Scope

- Full route tree migrated to file-based routing under `src/routes/`
- All react-router-dom imports replaced with TanStack Router equivalents
- Hosts page fully refactored (search params, column extraction, route-as-orchestrator)
- All other pages: minimal changes — moved into route files, components stay as-is internally
- `react-router-dom` fully removed
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

The current `OutletBreadcrumb` context-based system needs adaptation. Options:
- Use TanStack Router's route `staticData` or route context to declare breadcrumb labels
- Keep the existing context-based system but trigger it from route components

This will be determined during implementation based on what fits cleanly.
