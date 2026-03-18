# Phase 2b: Host Detail Tabs Design

## Overview

Create entities for the 7 remaining host detail tabs and migrate each tab route to a thin orchestrator. Delete old page files.

## Entities

All entities live in `features/host-insights/use-cases/host-details/entities/`. Each tab entity folder contains the entity component + test. Entities that need host-specific columns or expanded rows colocate those in their folder.

```
features/host-insights/use-cases/host-details/entities/
├── host-header.tsx                     # Already exists (Phase 2a)
├── host-header.test.tsx
│
├── host-insights-view/
│   └── host-insights-view.tsx          # Block grid, accepts hostId
│
├── host-incidents/
│   ├── host-incidents-table.tsx        # Table entity, typed props
│   └── host-incidents-table.test.tsx
│
├── host-detection-methods/
│   ├── host-detection-methods-table.tsx # Table entity, typed props
│   └── host-detection-methods-table.test.tsx
│
├── host-sightings/
│   ├── host-sightings-table.tsx        # Table entity, typed props
│   └── host-sightings-table.test.tsx
│
├── host-outlier-events/
│   ├── host-outlier-events.tsx         # Timeline + table, typed props for table
│   └── host-outlier-events.test.tsx
│
├── host-beacons/
│   ├── host-beacons-table.tsx          # Table entity, typed props
│   └── host-beacons-table.test.tsx
│
└── host-timeline/
    └── host-timeline.tsx               # Self-contained, accepts hostId
```

### Entity Patterns

**Table entities** (incidents, detection-methods, sightings, beacons) receive typed props:
```ts
interface HostTabTableProps {
  hostId: string;
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
}
```

Each fetches data internally using its domain's API, scoped to `hostId`. Imports column definitions and expanded rows from their respective domains:
- Incidents → `@/features/hunt/threats/` (current location, moved in Phase 3)
- Detection Methods → `@/features/detection-methods/`
- Sightings → `@/features/events/sightings/`
- Beacons → `@/features/events/beaconing/`

**Outlier events** receives the same table typed props + renders a timeline chart above the table. Uses detection-events columns from `@/features/events/detection-events/`.

**Self-contained entities** (insights, timeline) accept only `hostId`:
- Insights renders the block grid using molecules already in `host-details/molecules/`
- Timeline renders threat timeline + host history timeline from `@/features/hunt/timeline/`

### Route Pattern

Each tab route becomes a thin orchestrator:

```tsx
// Table tabs:
function HostIncidentsTab() {
  const { hostId } = useParams({ strict: false });
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const globals = useGlobalQueryParams(['tenant', 'dates']);
  const { page, pageSize, sorting, setPage, setPageSize, onSortingChange } =
    usePaginatedSearch({ search, navigate }, { resetOn: [...] });

  return (
    <HostIncidentsTable
      hostId={hostId} page={page} pageSize={pageSize} sorting={sorting}
      onPageChange={setPage} onPageSizeChange={setPageSize} onSortingChange={onSortingChange}
    />
  );
}

// Non-table tabs:
function HostInsightsTab() {
  const { hostId } = useParams({ strict: false });
  return <HostInsightsView hostId={hostId} />;
}
```

## Pages Deleted

- `src/pages/hosts/[hostId]/insights/index.tsx`
- `src/pages/hosts/[hostId]/incidents/index.tsx` + `threat-status.columns.tsx` + `threat-status.expanded-row.tsx`
- `src/pages/hosts/[hostId]/detection-methods/index.tsx`
- `src/pages/hosts/[hostId]/sightings/index.tsx`
- `src/pages/hosts/[hostId]/outlier-events/index.tsx`
- `src/pages/hosts/[hostId]/beacons/index.tsx`
- `src/pages/hosts/[hostId]/timeline/index.tsx`

## Deliverables

1. **7 tab entities** — one per tab
2. **7 route rewrites** — thin orchestrators
3. **7 page deletions** — old host detail tab pages
4. **Incidents columns/expanded-row** colocated with entity (imported from hunt/threats for primitives)
