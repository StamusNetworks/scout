# Phase 1b: Network Events + Events Flow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `/network-events` (transaction card view) and `/events-flow` (Sankey visualization) to the thin orchestrator pattern with feature entities.

**Architecture:** Bottom-up: create protocol-specific atoms for card content, build molecules and entities, then rewrite routes as thin orchestrators. Entities receive typed domain props + handlers (not search/navigate). Routes own all URL state via `usePaginatedSearch`.

**Tech Stack:** TanStack Router, RTK Query, Recharts Sankey, Zod, React 19, Tailwind CSS, vitest, react-testing-library, MSW.

**Spec:** `docs/superpowers/specs/2026-03-18-phase1b-network-events-flow-design.md`

---

## File Structure

### New Files

```
src/features/events/network-events/use-cases/
├── network-events-timeline/
│   └── entities/
│       ├── network-events-timeline.tsx
│       └── network-events-timeline.test.tsx
└── network-events-list/
    ├── molecules/
    │   └── transaction-card.tsx
    ├── entities/
    │   ├── network-events-list.tsx
    │   └── network-events-list.test.tsx
    └── protocol/
        ├── http-card-content.tsx
        ├── tls-card-content.tsx
        ├── dns-card-content.tsx
        ├── flow-card-content.tsx
        ├── smb-card-content.tsx
        ├── fileinfo-card-content.tsx
        └── anomaly-card-content.tsx

src/features/events/use-cases/events-flow/
├── events-flow.columns.ts
├── molecules/
│   └── events-flow-for-protocol.tsx
└── entities/
    ├── events-flow-view.tsx
    └── events-flow-view.test.tsx
```

### Modified Files

```
src/routes/network-events.tsx              # Thin orchestrator
src/routes/events-flow.tsx                 # Thin orchestrator
src/common/design-system/graphs/proto-flow/flow.columns.ts  # Becomes re-export
```

### Deleted Files

```
src/pages/transactions/index.tsx
src/pages/events-flow/index.tsx
```

---

## Task 1: Create protocol card content atoms

Protocol-specific rendering extracted from the inline switch in the current `TransactionCard`.

**Files:**
- Create: `src/features/events/network-events/use-cases/network-events-list/protocol/flow-card-content.tsx`
- Create: `src/features/events/network-events/use-cases/network-events-list/protocol/http-card-content.tsx`
- Create: `src/features/events/network-events/use-cases/network-events-list/protocol/tls-card-content.tsx`
- Create: `src/features/events/network-events/use-cases/network-events-list/protocol/dns-card-content.tsx`
- Create: `src/features/events/network-events/use-cases/network-events-list/protocol/smb-card-content.tsx`
- Create: `src/features/events/network-events/use-cases/network-events-list/protocol/fileinfo-card-content.tsx`
- Create: `src/features/events/network-events/use-cases/network-events-list/protocol/anomaly-card-content.tsx`

- [ ] **Step 1: Read the existing TransactionCard**

Read `src/pages/transactions/index.tsx` lines 190-551. Understand the exact rendering for each `event_type` case in the right column (3fr grid column).

- [ ] **Step 2: Create all 7 protocol card content atoms**

Each atom receives `{ event: Event }` and renders the protocol-specific fields. Extract the exact JSX from the TransactionCard's event_type switch.

Example for HTTP:
```tsx
// protocol/http-card-content.tsx
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';
import type { Event } from '@/features/events/common/events.model';

export function HttpCardContent({ event }: { event: Event }) {
  return (
    <div className="flex flex-row flex-wrap items-start gap-x-1 gap-y-1">
      <EventValue query_key="http.url" value={event.http?.url} className="max-w-80 break-all line-clamp-3" />
      <EventValue query_key="http.http_method" value={event.http?.http_method} />
      <EventValue query_key="http.http_content_type" value={event.http?.http_content_type} />
      <EventValue query_key="http.status" value={event.http?.status} />
      <EventValue query_key="http.protocol" value={event.http?.protocol} />
      <EventValue query_key="http.server" value={event.http?.server} />
      <EventValue query_key="http.http_user_agent" value={event.http?.http_user_agent} className="max-w-80 break-all line-clamp-3" />
    </div>
  );
}
```

Follow the same pattern for all 7 protocols, matching the exact fields and layout from the current page. For `alert` and `stamus` event types, those are simple enough to stay inline in the TransactionCard (2-3 lines each).

- [ ] **Step 3: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add protocol card content atoms for network events"
```

---

## Task 2: Create TransactionCard molecule

Card shell component that delegates to protocol atoms.

**Files:**
- Create: `src/features/events/network-events/use-cases/network-events-list/molecules/transaction-card.tsx`

- [ ] **Step 1: Read the existing TransactionCard**

Read `src/pages/transactions/index.tsx` lines 190-571. Understand:
- The grid layout (`grid-cols-[1.25rem_2fr_min-content_3fr]`)
- Expand/collapse toggle
- Left column: timestamps, source/dest IPs with hostname/network enrichment
- Center column: event type badge
- Right column: protocol-specific content (delegated to atoms)
- Expanded section: `EventDetailTabs` with 6 tabs (no DetectionMethodTab)

- [ ] **Step 2: Implement the TransactionCard molecule**

Props:
```ts
interface TransactionCardProps {
  event: Event;
}
```

The molecule:
- Manages its own `open` state for expand/collapse
- Renders the 4-column grid layout
- Left column: timestamps, source/dest IPs (using `EventValue`, `Hostname`, `Network` from their current locations)
- Center: `EventValue` for event_type
- Right: delegates to protocol atoms based on `event.event_type`
  - `flow` → `<FlowCardContent event={event} />`
  - `http` → `<HttpCardContent event={event} />`
  - `tls` → `<TlsCardContent event={event} />`
  - `dns` → `<DnsCardContent event={event} />`
  - `smb` → `<SmbCardContent event={event} />`
  - `fileinfo` → `<FileinfoCardContent event={event} />`
  - `anomaly` → `<AnomalyCardContent event={event} />`
  - `alert` → inline (signature + category)
  - `stamus` → inline (ThreatTag + KillchainTag)
- Expanded section: `EventDetailTabs` from `@/features/events/common/event-detail` with all tabs except DetectionMethodTab

- [ ] **Step 3: Run lint and type check**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add TransactionCard molecule for network events"
```

---

## Task 3: Create NetworkEventsTimeline entity

Self-contained entity that fetches events timeline data.

**Files:**
- Create: `src/features/events/network-events/use-cases/network-events-timeline/entities/network-events-timeline.tsx`
- Create: `src/features/events/network-events/use-cases/network-events-timeline/entities/network-events-timeline.test.tsx`

- [ ] **Step 1: Read the existing EventsCountTimeline**

Read `src/pages/transactions/index.tsx` lines 580-609. Understand:
- Takes `qfilter` prop
- Calls `useGetEventsTimelineQuery`
- Transforms response to `CountsTimeline` format
- Renders `BarChartTimeline`

- [ ] **Step 2: Write tests**

Test: renders chart when data available (mock `GET */rules/es/events_timeline/*`).

- [ ] **Step 3: Implement the entity**

The entity:
- Reads global params via `useGlobalQueryParams(['tenant', 'dates'])`
- Builds the network events qfilter (same logic as the page — excludes alert/stamus/discovery, requires flow_id)
- Also reads Redux `selectQueryFilters` to build the filtered qfilter (same as current page)
- Calls `useGetEventsTimelineQuery` with assembled params
- Transforms response to `CountsTimeline` format
- Renders `BarChartTimeline`

**Important:** The qfilter construction must match the page exactly. Read the current page's qfilter logic (lines 56-66) and replicate it. The entity needs to build the same `(flow_id:* AND NOT event_type:(alert OR stamus OR discovery))` base filter.

- [ ] **Step 4: Run tests, lint, type check**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add NetworkEventsTimeline entity"
```

---

## Task 4: Create NetworkEventsList entity

Card list with group-by-flow toggle and pagination. Typed domain props.

**Files:**
- Create: `src/features/events/network-events/use-cases/network-events-list/entities/network-events-list.tsx`
- Create: `src/features/events/network-events/use-cases/network-events-list/entities/network-events-list.test.tsx`

- [ ] **Step 1: Read the current page implementation**

Read `src/pages/transactions/index.tsx` thoroughly. Understand:
- qfilter construction (lines 56-66)
- useGetEventsTailQuery call with selectFromResult grouping (lines 77-96)
- GroupedList vs List rendering (lines 152-184)
- Empty state
- The toolbar with group-by-flow switch

- [ ] **Step 2: Write tests**

Mock `GET */rules/es/events_tail/*`. Test:
- Renders cards with mock event data
- Renders empty state when no results
- Renders group-by-flow toggle

- [ ] **Step 3: Implement the entity**

Props:
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
- Reads `selectQueryFilters` from Redux for filter construction
- Builds network events qfilter (same logic as timeline entity — share via utility or duplicate)
- Calls `useGetEventsTailQuery` with pagination params + qfilter
- Groups events by `flow_id` when `groupByFlow` is true (in `selectFromResult`)
- Renders toolbar with group-by-flow `SwitchFilter`
- Renders card list — grouped (Card per flow) or flat (Card per event)
- Each card uses `TransactionCard` molecule
- Renders `PaginationFooter`
- Renders empty state

**Important:** The qfilter logic is shared with the timeline entity. Extract a utility function `buildNetworkEventsQfilter(qfilters, globalQfilter)` that both entities can use, or colocate it in `network-events/` at the use-case level.

- [ ] **Step 4: Run tests, lint, type check**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add NetworkEventsList entity with group-by-flow and pagination"
```

---

## Task 5: Migrate `/network-events` route to thin orchestrator

**Files:**
- Modify: `src/routes/network-events.tsx`

- [ ] **Step 1: Read the current route**

Read `src/routes/network-events.tsx`.

- [ ] **Step 2: Rewrite as thin orchestrator**

```tsx
const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(20),
  group_by_flow: z.boolean().default(true),
});

function NetworkEventsPage() {
  usePageTitle('Network Events');
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const globals = useGlobalQueryParams(['tenant', 'dates', 'qfilter']);

  // Page reset on global param change
  const { page, setPage } = usePaginatedSearch({ search, navigate }, {
    resetOn: [globals.tenant, globals.start_date, globals.end_date, globals.qfilter],
  });

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Network Events</PageTitle>
            <PageDescription>
              {/* Use exact text from current page */}
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <NetworkEventsTimeline />
        <NetworkEventsList
          page={page}
          pageSize={search.page_size}
          groupByFlow={search.group_by_flow}
          onPageChange={setPage}
          onPageSizeChange={(s) => navigate({ search: (prev) => ({ ...prev, page_size: s, page: 1 }) })}
          onGroupByFlowChange={(v) => navigate({ search: (prev) => ({ ...prev, group_by_flow: v, page: 1 }) })}
        />
      </PageContainer>
    </Page>
  );
}
```

Read the current page at `src/pages/transactions/index.tsx` for the exact description text. Wrap in `PageBoundary`. Handle the navigate type wrapper if needed. The current transactions page does NOT render `OutletBreadcrumb`.

- [ ] **Step 3: Verify no remaining imports of old page**

Search: `grep -r "pages/transactions" src/`

- [ ] **Step 4: Delete old page**

Remove `src/pages/transactions/index.tsx`.

- [ ] **Step 5: Run full test suite, lint, type check**

Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: migrate /network-events to thin orchestrator"
```

---

## Task 6: Move events flow column configs

Move protocol Sankey column configs from common to the events-flow use-case.

**Files:**
- Create: `src/features/events/use-cases/events-flow/events-flow.columns.ts`
- Modify: `src/common/design-system/graphs/proto-flow/flow.columns.ts` (becomes re-export)

- [ ] **Step 1: Read the existing file**

Read `src/common/design-system/graphs/proto-flow/flow.columns.ts` fully. Understand the `ProtoColumn` type and all protocol configs.

- [ ] **Step 2: Move to new location**

Copy `flow.columns.ts` to `src/features/events/use-cases/events-flow/events-flow.columns.ts`. Update any internal imports to `@/` paths.

Replace the old file with a re-export:
```ts
export * from '@/features/events/use-cases/events-flow/events-flow.columns';
```

This preserves existing imports from common (used by Sankey utils tests).

- [ ] **Step 3: Run lint and type check**

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor: move events flow column configs to events feature"
```

---

## Task 7: Create EventsFlowForProtocol molecule and EventsFlowView entity

**Files:**
- Create: `src/features/events/use-cases/events-flow/molecules/events-flow-for-protocol.tsx`
- Create: `src/features/events/use-cases/events-flow/entities/events-flow-view.tsx`
- Create: `src/features/events/use-cases/events-flow/entities/events-flow-view.test.tsx`

- [ ] **Step 1: Read the existing implementation**

Read `src/pages/events-flow/index.tsx` fully. Understand:
- `EventsFlow` component (protocol list fetching, mapping to per-protocol)
- `EventsFlowForProtocol` component (aggregation query, Sankey rendering, context menu)
- `buildEventsFlowQfilter` function

- [ ] **Step 2: Create EventsFlowForProtocol molecule**

Props:
```ts
interface EventsFlowForProtocolProps {
  appProto: string;
  globalParams: { start_date?: string; end_date?: string; tenant?: string; qfilter?: string };
  eventTypes: { alert?: boolean; stamus?: boolean; discovery?: boolean } | null;
}
```

The molecule:
- Looks up columns from `events-flow.columns.ts`
- Fetches ES mapping via `useGetESMappingQuery` (from `@/features/hunt/dashboard/api/dashboard.api`)
- Builds aggregation via `buildFlowAggQuery` from `@/common/design-system/graphs/sankey/sankey.utils`
- Fetches data via `useGetEventsAggregationQuery` from `@/features/events/common/events.api`
- Transforms to Sankey data via `transformAggToSankey`
- Renders title row with protocol name + first/last seen timestamps
- Renders `SankeyChart` from `@/common/design-system/graphs/sankey`
- Handles node click (add filter to Redux) and right-click (context menu)
- Only renders if `sankeyData.nodes.length > 0`

- [ ] **Step 3: Create EventsFlowView entity**

Self-contained entity. No props.

The entity:
- Reads global params via `useGlobalQueryParams(['tenant', 'dates', 'qfilter'])`
- Reads event types from global params (the `alert`, `stamus`, `discovery` flags)
- Builds qfilter for protocol discovery via `buildEventsFlowQfilter`
- Fetches protocols via `useGetProtocolsFromEventsQuery`
- Filters out blacklisted protocols ('failed', 'unknown')
- Renders loading/empty state
- Maps each protocol to `EventsFlowForProtocol` molecule

- [ ] **Step 4: Write tests**

Mock `POST */rules/es/search/*`. Test:
- Renders loading state
- Renders empty state when no protocols
- Renders protocol sections when protocols available

- [ ] **Step 5: Run tests, lint, type check**

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add EventsFlowView entity and EventsFlowForProtocol molecule"
```

---

## Task 8: Migrate `/events-flow` route to thin orchestrator

**Files:**
- Modify: `src/routes/events-flow.tsx`

- [ ] **Step 1: Rewrite as thin orchestrator**

```tsx
function EventsFlowPage() {
  usePageTitle('Events Flow');

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Events Flow</PageTitle>
            <PageDescription>
              {/* Use exact text from current page */}
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <EventsFlowView />
      </PageContainer>
    </Page>
  );
}
```

Read `src/pages/events-flow/index.tsx` for exact description text. Wrap in `PageBoundary`. Include breadcrumb if current route has it.

- [ ] **Step 2: Verify no remaining imports of old page**

Search: `grep -r "pages/events-flow" src/`

- [ ] **Step 3: Delete old page**

Remove `src/pages/events-flow/index.tsx`.

- [ ] **Step 4: Run full test suite, lint, type check**

Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: migrate /events-flow to thin orchestrator"
```

---

## Post-Migration Notes

Phase 1b is complete. All network events and events flow functionality is migrated.

**What was delivered:**
- 7 protocol card content atoms
- TransactionCard molecule
- NetworkEventsTimeline entity (self-contained)
- NetworkEventsList entity (typed props: page, pageSize, groupByFlow + handlers)
- Events flow column configs (moved from common)
- EventsFlowForProtocol molecule
- EventsFlowView entity (self-contained)
- 2 thin routes

**Next phases:**
- Phase 1c: Beaconing
- Phase 1d: Sightings
