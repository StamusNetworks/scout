# Phase 1a: Events Common + Detection Events Design

## Overview

Restructure `features/events/` to follow Phase 0 conventions, create detection-events entities, and refactor all detection-events routes to thin orchestrators. Migrate the event detail page.

This is the first of four events sub-phases:
- **Phase 1a** — Events common + detection events (this spec)
- **Phase 1b** — Network events + events flow
- **Phase 1c** — Beaconing
- **Phase 1d** — Sightings

## Feature Structure

### Target: `features/events/`

```
features/events/
├── common/
│   ├── events.model.ts                    # Event type + discriminated unions (move from hunt)
│   ├── events.api.ts                      # All shared RTK Query endpoints (move from hunt)
│   ├── events.table.tsx                   # Shared columns: expander, timestamp, source, dest, protocol, host, hostname-host
│   ├── atoms/
│   │   └── scrollable.tsx                 # Already exists
│   ├── molecules/
│   │   └── expanded-event-row.tsx         # Move from hunt
│   └── event-detail/                      # Event detail tabs sub-feature
│       ├── event-detail-tabs.tsx          # Tab container
│       ├── meta-view-tab.tsx
│       ├── synthetic-tab.tsx
│       ├── json-tab.tsx
│       ├── detection-method-tab.tsx
│       ├── related-events-tab.tsx         # Re-exports from hunt for now
│       ├── pcap-tab.tsx
│       └── files-tab.tsx
│
├── detection-events/
│   ├── detection-events.table.tsx         # Alert columns: tag, method, category, lateral, outlier
│   └── entities/
│       ├── detection-events-table.tsx     # Full wired table entity (search/navigate props)
│       ├── events-timeline.tsx            # Tags/Probes toggle + chart entity
│       └── events-counter.tsx             # Pie chart entity
│
├── network-events/
│   └── network-events.table.tsx           # Protocol columns: tls-sni, http-url, payload, etc.
│
├── sightings/                             # Placeholder (Phase 1d)
├── stamus/                                # Placeholder (future)
└── beaconing/                             # Placeholder (Phase 1c)
```

### Column Consolidation

The 18 individual column files from the initial migration get consolidated into 3 `.table.tsx` files:

| Old (individual files) | New (table definition) |
|---|---|
| `common/columns/expander.tsx`, `timestamp.tsx`, `source.tsx`, `destination.tsx`, `protocol.tsx`, `host.tsx`, `hostname-host.tsx` | `common/events.table.tsx` |
| `alerts/columns/tag.tsx`, `method.tsx`, `category.tsx`, `lateral.tsx`, `outlier.tsx` | `detection-events/detection-events.table.tsx` |
| `protocol/columns/tls-sni.tsx`, `http-url.tsx`, `http-request.tsx`, `http-response.tsx`, `payload.tsx` | `network-events/network-events.table.tsx` |

Old `columns/` directories and their `index.ts` barrel exports are deleted after consolidation.

### Code Movement from `features/hunt/events/`

**Move to `features/events/common/`:**
- `events.api.ts` — all RTK Query endpoints. The file in `hunt/events/api/` becomes a re-export FROM the new location (reverse the current direction).
- `event.schema.ts` — event model types. Same re-export reversal.
- `ExpandedEventRow` — moves to `common/molecules/`
- Event detail tabs — move to `common/event-detail/`

**Stay in `features/hunt/events/` (moved in later phases):**
- 40+ related event protocol tables
- PCAP extraction components
- Files info components
- Specialized views (meta-view internals, synthetic-view internals)

The event detail tabs that reference related events, PCAP, or files will import from `features/hunt/events/` directly (not via re-exports). These dependencies get cleaned up in later phases.

## Detection Events Entities

### `DetectionEventsTable` Entity

Receives `search` and `navigate` as props from the route. Owns:
- Global params via `useGlobalQueryParams(['tenant', 'dates', 'qfilter', 'qfilterHost'])`
- Pagination via `usePaginatedSearch({ search, navigate }, { resetOn: [...] })`
- Data fetching via `useGetEventsQuery()`
- Table preferences via `useTablePreferences({ tableId: 'eventsPageTable' })`
- Toolbar (column visibility toggle, export button, column reset)
- `Table` + `PaginationFooter` + `ExpandedEventRow` + empty state
- Row click navigation to event detail

Columns assembled from `events.table.tsx` (shared) + `detection-events.table.tsx` (alert-specific) + `network-events.table.tsx` (protocol-specific, hidden by default).

### `EventsTimeline` Entity

Self-contained. Fetches its own timeline data. Renders the Tags/Probes chart toggle (enterprise-only) with `BarChartTimeline`. Reads global params internally.

### `EventsCounter` Entity

Self-contained. Fetches event type counts. Renders the pie/donut chart widget.

## Event Detail Entity

### `EventDetail` Entity

Located at `features/events/common/event-detail/entities/event-detail.tsx`.

- Accepts `eventId` as prop
- Fetches the event via `useGetEventsQuery` (by `_id`)
- Fetches host info via `useGetHostWithAlertsQuery` (for source/dest IP enrichment)
- Fetches impacted entity via `useGetImpactedEntitiesQuery`
- Renders event header: signature, MITRE tactics/techniques, timestamp, source/dest IPs
- Renders `EventDetailTabs` with 7 tabs
- Handles loading/error/not-found states

The `EventDetailTabs` and individual tab components move from `features/hunt/events/components/event-detail-tabs/` to `features/events/common/event-detail/`. Tabs that reference related event tables, PCAP, or files components import them from `features/hunt/events/` directly.

## Route Migrations

### `/detection-events` — Thin Orchestrator

```tsx
const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-timestamp'),
});

function DetectionEventsPage() {
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

Replace `DefaultPage` with composable `Page`/`PageHeader`. The fat orchestrator logic moves into the 3 entities.

### `/hosts/$hostId/detection-events` — Thin Orchestrator

Same pattern but host-scoped. The `DetectionEventsTable` entity accepts an optional `hostId` prop (or a `qfilter` prop) to scope events to a specific host. The `EventsTimeline` entity also accepts optional host scoping.

### `/detection-events/event` — Event Detail Page

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

The route is minimal — just passes the `_id` search param to the `EventDetail` entity.

### Old Pages Deleted

After migration:
- `src/pages/events/index.tsx` — already deleted in first migration
- `src/pages/events/:eventId/index.tsx` — deleted after event detail migration
- `src/pages/hosts/[hostId]/detection-events/` — already deleted in first migration

## Deliverables

1. **Consolidate columns** — 18 individual files → 3 `.table.tsx` files
2. **Move core code from hunt** — API, model, ExpandedEventRow, event detail tabs → `features/events/common/`
3. **Create 3 detection-events entities** — `DetectionEventsTable`, `EventsTimeline`, `EventsCounter`
4. **Create EventDetail entity** — with event detail tabs
5. **Refactor `/detection-events` route** — thin orchestrator
6. **Refactor `/hosts/$hostId/detection-events` route** — thin orchestrator
7. **Migrate `/detection-events/event` route** — thin orchestrator + EventDetail entity
8. **Delete old page files** — `pages/events/:eventId/`
