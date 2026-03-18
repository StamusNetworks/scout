# Phase 1d: Sightings Design

## Overview

Migrate sightings from `features/analytics/sightings/` to `features/events/sightings/`, organize into use-cases, and migrate both sightings routes to thin orchestrators.

Enterprise-only feature with 2 routes: list and detail. Host sightings tab deferred to Phase 2.

## Feature Structure

```
features/events/sightings/
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
│       └── events-stream.tsx
│
└── use-cases/
    ├── sightings-list/
    │   ├── sightings-list.table.tsx        # allSightingsTableColumns + export + tools
    │   └── entities/
    │       └── sightings-table.tsx          # typed props entity
    └── sighting-details/
        └── entities/
            └── sighting-details.tsx         # accepts sightingId prop
```

### Code Movement

**Move from `features/analytics/sightings/` to `features/events/sightings/common/`:**
- `api/sightings.api.ts` → `common/sightings.api.ts`
- `models/sighting-event.model.ts` → `common/sighting-event.model.ts`
- `hooks/use-get-sighting-by-id.tsx` → `common/hooks/`
- `hooks/use-get-sighting-events-tail.tsx` → `common/hooks/`
- `utils/get-sighting-qfilter.ts` → `common/utils/`
- `components/metadata/` → `common/molecules/sightings-metadata.tsx`
- `components/patient-zero-details/` → `common/molecules/patient-zero-details.tsx`
- `components/events-counts-timeline/` → `common/molecules/events-counts-timeline.tsx`
- `components/events-tail-flow/` → `common/molecules/events-tail-flow.tsx`
- `components/events-stream/` → `common/molecules/events-stream.tsx` (+ expanded row)

**Move to use-cases:**
- `components/sightings-table/` columns + tools → `use-cases/sightings-list/sightings-list.table.tsx`

**Make `features/analytics/sightings/` re-export** for backward compatibility.

## Entities

### SightingsTable Entity (typed props)

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

Fetches data internally via `useGetSightingEventsQuery`. Includes filter toolbar (text search + role dropdown). Uses `allSightingsTableColumns` and export columns.

### SightingDetails Entity

Props: `{ sightingId: string }`

Fetches sighting via `useGetSightingById`. Renders:
- Stats: discovery key/value, probe, timestamp
- PatientZeroDetails molecule
- SightingsMetadata molecule
- EventsCountsTimeline molecule
- Tabs: Flow Chart (SightingEventsTailFlow) / Table (EventsStream)
- Loading/error/empty states

## Route Migrations

### `/analytics/sightings` — Thin Orchestrator

Zod schema: `{ page: z.number().default(1), page_size: z.number().default(10), sort: z.string().default('-timestamp') }`

```tsx
function SightingsPage() {
  // usePaginatedSearch at route level
  // Pass typed props to SightingsTable
  // onRowClick navigates to /analytics/sightings/$sightingId
}
```

Uses `Page`/`PageContainer`/`PageHeader` with title "Sightings".

### `/analytics/sightings/$sightingId` — Thin Orchestrator

```tsx
function SightingDetailPage() {
  const { sightingId } = Route.useParams();
  return <SightingDetails sightingId={sightingId} />;
}
```

### Host Sightings Tab

Deferred to Phase 2 (host-insights). The host sightings page at `/hosts/$hostId/sightings` will use sightings primitives from `features/events/sightings/`.

### Old Pages Deleted

- `src/pages/analytics/sightings/index.tsx`
- `src/pages/analytics/sightings/[id]/index.tsx`

## Deliverables

1. **Move sightings feature** to `features/events/sightings/` with common + use-cases
2. **Create SightingsTable entity** with typed props
3. **Create SightingDetails entity**
4. **Thin routes** for list and detail
5. **Re-exports** in old location
6. **Delete old pages**
