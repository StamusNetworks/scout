# Phase 1b: Network Events + Events Flow Design

## Overview

Migrate `/network-events` (transaction card view) and `/events-flow` (Sankey visualization) to the thin orchestrator pattern with feature entities following Phase 0 conventions.

## Feature Structure

### `features/events/network-events/use-cases/`

```
features/events/network-events/
├── network-events.table.tsx                       # already exists (protocol columns)
└── use-cases/
    ├── network-events-timeline/
    │   └── entities/
    │       └── network-events-timeline.tsx         # BarChartTimeline entity
    │
    └── network-events-list/
        ├── molecules/
        │   └── transaction-card.tsx                # card shell, delegates to protocol atoms
        ├── entities/
        │   └── network-events-list.tsx             # card list + group-by-flow + pagination
        └── protocol/                              # protocol-specific card content atoms
            ├── http-card-content.tsx
            ├── tls-card-content.tsx
            ├── dns-card-content.tsx
            ├── flow-card-content.tsx
            ├── smb-card-content.tsx
            ├── fileinfo-card-content.tsx
            └── anomaly-card-content.tsx
```

### `features/events/use-cases/`

```
features/events/use-cases/
├── related-events/                                # future — currently in hunt
│   └── ...
└── events-flow/
    ├── events-flow.columns.ts                     # protocol Sankey column configs (all protos)
    ├── molecules/
    │   └── events-flow-for-protocol.tsx            # per-protocol Sankey + context menu
    └── entities/
        └── events-flow-view.tsx                   # fetches protocols, renders per-protocol Sankeys
```

## Network Events

### NetworkEventsTimeline Entity

Self-contained entity. Fetches timeline data via `useGetEventsTimelineQuery`. Renders `BarChartTimeline`.

Receives no props — reads global params internally (this timeline has no host scoping or toggle).

### NetworkEventsList Entity

Receives typed domain props:

```ts
interface NetworkEventsListProps {
  page: number;
  pageSize: number;
  groupByFlow: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onGroupByFlowChange: (groupByFlow: boolean) => void;
}
```

The entity:
- Reads global params via `useGlobalQueryParams(['tenant', 'dates', 'qfilter'])`
- Builds qfilter excluding alert/stamus/discovery events, requiring `flow_id:*`
- Fetches events via `useGetEventsTailQuery`
- Groups events by `flow_id` when `groupByFlow` is true
- Renders group-by-flow toggle in toolbar
- Renders card list (grouped or flat) using `TransactionCard` molecule
- Renders `PaginationFooter`
- Renders empty state

### TransactionCard Molecule

Props-driven card component. Receives an `Event` (or `Event[]` for grouped) and renders:
- Source/dest IPs with hostname/network enrichment
- Event type badge
- Protocol-specific content delegated to atoms from `protocol/`
- Expandable detail section using `EventDetailTabs`

The card delegates to protocol-specific atoms based on `event_type`:
- `flow` → `FlowCardContent`
- `http` → `HttpCardContent`
- `tls` → `TlsCardContent`
- `dns` → `DnsCardContent`
- `smb` → `SmbCardContent`
- `fileinfo` → `FileinfoCardContent`
- `anomaly` → `AnomalyCardContent`
- `alert` → inline (signature + category)
- `stamus` → inline (threat tag + kill chain)

### Protocol Card Content Atoms

Each atom receives the `Event` object and renders protocol-specific fields. For example:

```tsx
// protocol/http-card-content.tsx
export function HttpCardContent({ event }: { event: Event }) {
  return (
    <>
      <EventValue query_key="http.url" value={event.http?.url} />
      <EventValue query_key="http.http_method" value={event.http?.http_method} />
      {/* ... */}
    </>
  );
}
```

## Events Flow

### EventsFlowView Entity

Self-contained entity. No props — reads global params internally.

The entity:
- Reads global params via `useGlobalQueryParams(['tenant', 'dates', 'qfilter'])`
- Fetches available protocols via `useGetProtocolsFromEventsQuery`
- Filters out blacklisted protocols ('failed', 'unknown')
- Renders loading/empty state
- Maps each protocol to `EventsFlowForProtocol` molecule

### EventsFlowForProtocol Molecule

Props-driven:

```ts
interface EventsFlowForProtocolProps {
  appProto: string;
  globalParams: { start_date?: string; end_date?: string; tenant?: string; qfilter?: string };
  eventTypes: { alert?: boolean; stamus?: boolean; discovery?: boolean } | null;
}
```

The molecule:
- Looks up Sankey column config from `events-flow.columns.ts`
- Fetches ES mapping via `useGetESMappingQuery`
- Fetches aggregation data via `useGetEventsAggregationQuery`
- Transforms aggregation to Sankey data
- Renders protocol title with first/last seen timestamps
- Renders `SankeyChart` from `@/common/design-system/graphs/sankey`
- Handles node click (add filter) and right-click (context menu)

### events-flow.columns.ts

Moved from `common/design-system/graphs/proto-flow/flow.columns.ts`. Contains column configs for all protocols used by the Sankey visualization:
- `default` — single offender column
- `http` — user agent → hostname → method → URL → status
- `tls` — JA4 → SNI → subject → issuer → version → ALPN
- `dns` — rrname → rrtype → protocol
- `smb` — DCERPC interface → endpoint → command → status
- `snmp` — community → PDU type → vars → version
- `sip` — version → method → URI
- `code` — extra info

The old `flow.columns.ts` in common becomes a re-export.

## Route Migrations

### `/network-events` — Thin Orchestrator

```tsx
const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(20),
  group_by_flow: z.boolean().default(true),
});

function NetworkEventsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Network Events</PageTitle>
            <PageDescription>...</PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <NetworkEventsTimeline />
        <NetworkEventsList
          page={search.page}
          pageSize={search.page_size}
          groupByFlow={search.group_by_flow}
          onPageChange={(p) => navigate({ search: (prev) => ({ ...prev, page: p }) })}
          onPageSizeChange={(s) => navigate({ search: (prev) => ({ ...prev, page_size: s, page: 1 }) })}
          onGroupByFlowChange={(v) => navigate({ search: (prev) => ({ ...prev, group_by_flow: v, page: 1 }) })}
        />
      </PageContainer>
    </Page>
  );
}
```

The route uses `usePaginatedSearch` at the route level for page reset on global param change (dates/tenant/qfilter), same as other paginated routes. Even though there's no sorting, pagination state must reset when globals change.

### `/events-flow` — Thin Orchestrator

```tsx
function EventsFlowPage() {
  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Events Flow</PageTitle>
            <PageDescription>...</PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <EventsFlowView />
      </PageContainer>
    </Page>
  );
}
```

No search params — the Sankey view has no pagination.

### Old Pages Deleted

- `src/pages/transactions/index.tsx`
- `src/pages/events-flow/index.tsx`

## Deliverables

1. **Protocol card content atoms** — 7 atoms in `network-events/use-cases/network-events-list/protocol/`
2. **TransactionCard molecule** — card shell delegating to protocol atoms
3. **NetworkEventsList entity** — typed props for page/pageSize/groupByFlow + handlers
4. **NetworkEventsTimeline entity** — self-contained
5. **events-flow.columns.ts** — protocol Sankey column configs moved from common
6. **EventsFlowForProtocol molecule** — per-protocol Sankey
7. **EventsFlowView entity** — self-contained
8. **Thin `/network-events` route**
9. **Thin `/events-flow` route**
10. **Delete old pages**
