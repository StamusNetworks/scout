# Phase 1c: Beaconing Design

## Overview

Migrate beaconing from `features/analytics/beaconing/` to `features/events/beaconing/`, reorganize into sub-domains (beaconing-ips, beaconing-ja3s) with use-cases, and migrate all beaconing routes to thin orchestrators.

Enterprise-only feature with 4 routes: IPs list, IP detail, JA3S list, JA3S detail.

## Feature Structure

```
features/events/beaconing/
├── common/
│   ├── beaconing-event.model.ts           # BeaconingEvent + TlsTail types
│   ├── beaconing.api.ts                   # getBeaconingEventsQuery, getTlsTailQuery
│   ├── molecules/
│   │   ├── report-summary.tsx             # Beacon metrics table (type='ip'|'ja3s')
│   │   └── beaconing-metadata.tsx         # TLS flow proto-flow graph (type='ip'|'ja3s')
│   └── hooks/
│       └── use-beacon-report.ts           # Fetches beacon report by type + value
│
├── beaconing-ips/
│   ├── molecules/
│   │   └── beaconing-ips-table.tsx        # Internal IPs table (shared by both detail pages)
│   └── use-cases/
│       ├── ips-list/
│       │   ├── ips-list.table.tsx          # Columns, export columns
│       │   └── entities/
│       │       └── serving-ips-table.tsx   # Full wired table entity
│       └── ip-details/
│           └── entities/
│               └── beaconing-ip-details.tsx # IP detail entity (summary + metadata + IPs)
│
└── beaconing-ja3s/
    └── use-cases/
        ├── ja3s-list/
        │   ├── ja3s-list.table.tsx
        │   └── entities/
        │       └── ja3s-hash-table.tsx
        └── ja3s-details/
            └── entities/
                └── beaconing-ja3s-details.tsx  # JA3S detail entity (summary + metadata + IPs + serving IPs)
```

### Code Movement

**Move from `features/analytics/beaconing/` to `features/events/beaconing/common/`:**
- `api/beaconing.api.ts` → `common/beaconing.api.ts`
- `models/beaconing-event.model.ts` + `tls-tail.model.ts` → `common/beaconing-event.model.ts`
- `hooks/use-beacon-report.ts` → `common/hooks/use-beacon-report.ts`
- `utils/format-beacon-metric.ts` → `common/utils/format-beacon-metric.ts`
- `components/report-summary/` → `common/molecules/report-summary.tsx`
- `components/metadata/` → `common/molecules/beaconing-metadata.tsx`

**Move to sub-domains:**
- `components/serving-ips-table/` → `beaconing-ips/use-cases/ips-list/`
- `components/tls-ja3s-table/` → `beaconing-ja3s/use-cases/ja3s-list/`
- `components/ips-table/` → `beaconing-ips/molecules/beaconing-ips-table.tsx`
- `components/ips-serving-ja3s-table/` → `beaconing-ja3s/use-cases/ja3s-details/` (only used in JA3S detail)

**Move generic beaconing table:**
- `components/beaconing-table/` → `common/molecules/beaconing-table.tsx` — generic beacon table used by the host beacons tab. This table stays as a molecule (props-driven) in common since it's shared across beaconing-ips and host-details contexts.

**Make `features/analytics/beaconing/` re-export** from the new locations for backward compatibility during transition.

### Detail Page Entities

**BeaconingIpDetails entity** — accepts `ip: string` prop. Fetches beacon report via `useBeaconReport('ip', ip)`. Renders:
- Stats section: country, IP, score badge, first/last seen, VirusTotal link
- `ReportSummary` molecule (type='ip')
- `BeaconingMetadata` molecule (type='ip')
- `BeaconingIPsTable` molecule (ips from beacon_report.assets)

**BeaconingJa3sDetails entity** — accepts `ja3s: string` prop. Fetches beacon report via `useBeaconReport('ja3s', ja3s)`. Renders:
- Stats section: JA3S hash, score, first/last seen
- `ReportSummary` molecule (type='ja3s')
- `BeaconingMetadata` molecule (type='ja3s')
- `BeaconingIPsTable` molecule (ips from beacon_report.assets)
- `IpsServingJa3sTable` (IPs serving this JA3S)

### Table Entities (Typed Props)

**ServingIpsTable entity:**
```ts
interface ServingIpsTableProps {
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
}
```

**JA3SHashTable entity** — same typed props pattern.

Both fetch data internally via `useGetBeaconingEventsQuery` with appropriate document_type filter.

## Route Migrations

### Tab Layout Route

The current `BeaconingPage` layout wrapper (tabs + badge counts) moves into the beaconing route layout. The route at `/_enterprise/analytics/beaconing/ips/index.tsx` and `ja3s/index.tsx` currently compose `BeaconingPage` + content. In the new pattern:

The tab layout moves into `routes/_enterprise/analytics/beaconing/route.tsx`. This file currently only renders breadcrumbs + Outlet. It will be updated to render: Page/PageHeader with title "Beaconing", tabs (IPs / JA3S) with badge counts, and Outlet. The index routes render just the table entities inside this layout.

### `/analytics/beaconing` — Redirect

Stays as redirect to `/analytics/beaconing/ips`.

### `/analytics/beaconing/ips` — Thin Orchestrator

Zod search schema: `{ page: z.number().default(1), page_size: z.number().default(10), sort: z.string().default('-beacon_report.beacon_metric') }`

```tsx
function BeaconingIpsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const globals = useGlobalQueryParams(['tenant', 'dates']);

  const { page, pageSize, sorting, setPage, setPageSize, onSortingChange } =
    usePaginatedSearch({ search, navigate }, { resetOn: [globals.tenant, globals.start_date, globals.end_date] });

  return (
    <ServingIpsTable
      page={page} pageSize={pageSize} sorting={sorting}
      onPageChange={setPage} onPageSizeChange={setPageSize} onSortingChange={onSortingChange}
    />
  );
}
```

Renders inside the parent layout that provides Page/PageHeader/Tabs.

### `/analytics/beaconing/ips/$ip` — Thin Orchestrator

```tsx
function BeaconingIpDetailPage() {
  const { ip } = Route.useParams();
  return <BeaconingIpDetails ip={ip} />;
}
```

### `/analytics/beaconing/ja3s` — Same pattern as IPs

Zod search schema: `{ page: z.number().default(1), page_size: z.number().default(10), sort: z.string().default('-beacon_report.beacon_metric') }`

### `/analytics/beaconing/ja3s/$ja3s` — Same pattern as IP detail

### Host Beacons Tab

**Deferred to Phase 2 (host-insights).** The host beacons tab at `/hosts/$hostId/beacons` belongs in the host-details use-case and will use beaconing primitives from `features/events/beaconing/`.

### Old Pages Deleted

- `src/pages/analytics/beaconing/index.tsx`
- `src/pages/analytics/beaconing-ips/index.tsx`
- `src/pages/analytics/beaconing-ips/[ip]/index.tsx`
- `src/pages/analytics/beaconing-ja3s/index.tsx`
- `src/pages/analytics/beaconing-ja3s/[ja3s]/index.tsx`

## Deliverables

1. **Move beaconing feature** to `features/events/beaconing/` with common + sub-domains
2. **Create table entities** — ServingIpsTable, JA3SHashTable (typed props)
3. **Create detail entities** — BeaconingIpDetails, BeaconingJa3sDetails
4. **Migrate tab layout** to route level
5. **Thin routes** for all beaconing pages
6. **Re-exports in old location** for backward compatibility
7. **Delete old pages**
