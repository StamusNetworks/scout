# Phase 2a: Host Insights — Feature Structure + Hosts List + Host Details Refactor

## Overview

Create the `features/host-insights/` domain, move host code from `features/analytics/hosts/`, migrate the hosts list page to thin orchestrator, and refactor HostHeader imports.

Phase 2 sub-phases:
- **Phase 2a** — Feature structure + hosts list + HostHeader move (this spec)
- **Phase 2b** — Host detail tab entities (7 remaining tabs)
- **Phase 2c** — Attack surface (inventory + visualization)

## Feature Structure

```
features/host-insights/
├── common/
│   ├── host.model.ts                          # Host types (move from analytics/hosts)
│   ├── host-insights.api.ts                   # Shared API endpoints
│   ├── atoms/
│   └── molecules/
│
└── use-cases/
    ├── hosts-list/
    │   ├── hosts-list.api.ts                  # List-specific endpoints (getHosts, getHostsCount)
    │   ├── hosts-list.table.tsx               # Columns, export columns
    │   └── entities/
    │       └── hosts-table.tsx                # Typed props entity
    │
    ├── host-details/
    │   ├── host-details.api.ts                # Detail-specific endpoints (getHostWithAlerts)
    │   ├── molecules/
    │   │   ├── host-summary.tsx               # IP, hostname, roles, network info
    │   │   ├── host-detections-radar.tsx       # Radar chart
    │   │   ├── host-profile.tsx               # Profile chart
    │   │   ├── host-roles.tsx
    │   │   └── host-hostname.tsx
    │   └── entities/
    │       ├── host-header.tsx                # Self-contained: accepts hostId, fetches data, renders summary+radar+profile
    │       ├── host-beacons-table.tsx          # Phase 2b
    │       ├── host-sightings-table.tsx        # Phase 2b
    │       ├── host-detection-methods-table.tsx # Phase 2b
    │       ├── host-incidents-table.tsx        # Phase 2b
    │       ├── host-outlier-events-table.tsx   # Phase 2b
    │       ├── host-insights-view.tsx          # Phase 2b (insights tab)
    │       └── host-timeline.tsx              # Phase 2b
    │
    └── hosts-visualisation/                   # Phase 2c
```

## Code Movement

### From `features/analytics/hosts/`

**Move to `features/host-insights/common/`:**
- `api/hosts.api.ts` → `common/host-insights.api.ts` (or split into list/detail APIs)
- `models/` → `common/host.model.ts`

**Move to `features/host-insights/use-cases/host-details/molecules/`:**
- `components/host-summary/` → `molecules/host-summary.tsx`
- `components/host-detections-radar/` → `molecules/host-detections-radar.tsx`
- `components/hostProfile/` → `molecules/host-profile.tsx`

**Move to `features/host-insights/use-cases/hosts-list/`:**
- Host list table columns/components

**Make `features/analytics/hosts/` re-export** for backward compatibility.

### From `features/hosts/entities/`

**Move to `features/host-insights/use-cases/host-details/entities/`:**
- `host-header.tsx` → `entities/host-header.tsx`
- `host-header.test.tsx` → `entities/host-header.test.tsx`

**Delete `features/hosts/`** after move (it only contained the HostHeader entity).

## HostHeader Entity

Stays as a self-contained entity accepting `hostId` prop. Fetches its own data via `useGetHostWithAlertsQuery`. Renders HostSummary molecule + HostDetectionsRadar + HostProfile.

Multiple entities in the host detail page can call the same query hooks with the same args — RTK Query deduplicates via cache. The route layout also calls some of the same queries for badge counts — these share the cache too.

**Key principle:** Badge count queries in the route layout should use the **same hooks and same args** as tab entities to avoid duplicate network requests.

## HostsTable Entity

Typed props entity for the `/hosts` list page.

```ts
interface HostsTableProps {
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
  onRowClick: (hostId: string) => void;
}
```

Fetches data internally via host list API. Reads global params. Renders toolbar + Table + PaginationFooter.

## Route Migrations

### `/hosts` — Thin Orchestrator

Enterprise-only. Zod schema: `{ page, page_size, sort }`

```tsx
function HostsPage() {
  // usePaginatedSearch at route level
  // Pass typed props to HostsTable
  // onRowClick navigates to /hosts/$hostId
}
```

Uses `Page`/`PageContainer`/`PageHeader`.

### `/hosts/$hostId/route.tsx` — Update Imports

Already migrated as a fat layout route. Update HostHeader import from `@/features/hosts/entities/host-header` to `@/features/host-insights/use-cases/host-details/entities/host-header`.

Ensure badge count queries use the same hooks/args as future tab entities.

## Old Pages/Files Deleted

- `src/features/hosts/` directory (only contained HostHeader, now moved)
- Host list page from `src/pages/` (if it exists as a separate file)

## Deliverables

1. **Create `features/host-insights/`** with common + use-cases structure
2. **Move host code** from `features/analytics/hosts/` — API, models, molecules. Re-export from old location.
3. **Move HostHeader** from `features/hosts/entities/` to `features/host-insights/use-cases/host-details/entities/`
4. **Create hosts-list table definition** — columns, export columns
5. **Create HostsTable entity** — typed props
6. **Migrate `/hosts` route** — thin orchestrator
7. **Update `/hosts/$hostId/route.tsx`** — fix HostHeader import path
8. **Delete old files** — `features/hosts/`, old host list page
