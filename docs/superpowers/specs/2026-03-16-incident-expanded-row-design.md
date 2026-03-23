# Incident Expanded Row — Auto Investigation & Detection Methods

**Date:** 2026-03-16

## Context

Analysts investigating incidents currently have to navigate away from the incident table to understand what happened. This design adds an expanded row to the incident table with two tabs:

- **Auto Investigation** — a chronological timeline aggregating events from 5 intelligence sources (NRD, Sightings, File, Lateral, Hunting), giving analysts a quick contextual picture around the incident window.
- **Detection Methods** — the existing list of unique signatures and ProtoFlow visualizations that triggered the incident.

This applies to two pages: `threats/incidents` and `hosts/[hostId]/incidents`.

---

## Architecture

### New files

```
src/features/hunt/threats/
  components/
    incident-expanded-row.tsx                         ← tab shell (composed entry point)
    incident-detection-methods/
      incident-detection-methods.tsx                  ← extracted from ThreatStatusExpandedRow
    incident-auto-investigation/
      incident-auto-investigation.tsx                 ← timeline component (loading/error/empty)
      incident-auto-investigation.card.tsx            ← single aggregated timeline card
  hooks/
    use-incident-auto-investigation.ts                ← 5 queries + aggregation logic
  models/
    incident-auto-investigation.model.ts              ← TimelineGroup, TimelineEventType, TaggedEvent types
```

### Modified files

- `src/pages/threats/incidents/index.tsx` — add `ExpandedRow={IncidentExpandedRow}` to `<DataTable>`
- `src/pages/hosts/[hostId]/incidents/index.tsx` — replace `ThreatStatusExpandedRow` with `IncidentExpandedRow`

### Deleted files

- `src/pages/hosts/[hostId]/incidents/threat-status.expanded-row.tsx` — logic moved to `IncidentDetectionMethods`

---

## Integration

`IncidentExpandedRow` uses `pillTabs` from `@/common/design-system/atoms/ui/pillTabs`. Default tab is Auto Investigation.

```tsx
const IncidentExpandedRow = ({ row }: { row: Row<ThreatStatus> }) => (
  <Tabs defaultValue="auto-investigation" className="p-2">
    <TabsList>
      <TabsTrigger value="auto-investigation">Auto Investigation</TabsTrigger>
      <TabsTrigger value="detection-methods">Detection Methods</TabsTrigger>
    </TabsList>
    <TabsContent value="auto-investigation">
      <IncidentAutoInvestigation incident={row.original} />
    </TabsContent>
    <TabsContent value="detection-methods">
      <IncidentDetectionMethods incident={row.original} />
    </TabsContent>
  </Tabs>
);
```

**Threats/Incidents page note:** The page already uses `onRowClick` for navigation. Adding `ExpandedRow` adds a chevron column; clicking the chevron expands, clicking the row body still navigates — both behaviours coexist.

---

## Data Layer

### Hook: `useIncidentAutoInvestigation(incident: ThreatStatus)`

Computes shared params:

```ts
const startDate = subDays(new Date(incident.first_seen), 7).getTime();
const endDate   = addDays(new Date(incident.last_seen),  7).getTime();
const ipFilter  = `src_ip:${esEscape(asset)} OR dest_ip:${esEscape(asset)}`;
```

Five parallel RTK queries (`page_size: 100` each):

| Source   | Hook                       | qfilter |
|----------|----------------------------|---------|
| NRD      | `useGetEventsQuery`        | `(${ipFilter}) AND metadata.flowbits:stamus.nrd*` |
| Sightings| `useGetSightingEventsQuery`| `discovery.asset:${asset}` |
| File     | `useGetEventsTailQuery`    | `(${ipFilter}) AND (metadata.flowbits:stamus.file.identification OR metadata.flowbits:stamus.dga.smbfilename)` — uses `events_tail` (not `alerts_tail`) because fileinfo events are non-alert event types |
| Lateral  | `useGetEventsQuery`        | `(${ipFilter}) AND alert.lateral:* AND alert.metadata.source:smb_lateral AND alert.metadata.signature_severity:critical` |
| Hunting  | `useGetEventsQuery`        | `(${ipFilter}) AND alert.metadata.stamus_type:hunting` |

### Aggregation logic

1. Tag each event with its `TimelineEventType`
2. Merge all results into one array, sort by `timestamp` ascending; use a fixed type-priority order (`nrd → sightings → file → lateral → hunting`) as a stable secondary sort key for events sharing the same timestamp
3. Walk the sorted array and group **consecutive** same-type events into a single `TimelineGroup`. A new group starts whenever the type changes — the same type can appear as multiple separate groups if other types appear between them. For example:

   ```
   Input (sorted by time):  SIGHTING, SIGHTING, FILE, HUNTING, HUNTING, LATERAL, SIGHTING, SIGHTING, SIGHTING, HUNTING
   Output groups:           [SIGHTING×2] [FILE×1] [HUNTING×2] [LATERAL×1] [SIGHTING×3] [HUNTING×1]
   ```

```ts
type TimelineEventType = 'nrd' | 'sightings' | 'file' | 'lateral' | 'hunting';

type TimelineGroup = {
  type: TimelineEventType;
  events: TaggedEvent[];
  startTime: string;
  endTime: string;
};
```

Returns: `{ groups: TimelineGroup[], isLoading: boolean, isError: boolean, isEmpty: boolean }`

- `isLoading` — true while any of the 5 queries is loading
- `isError` — true only when **all 5** queries have failed; partial failures drop the failed source silently and render whatever succeeded
- `isEmpty` — true when `groups` is empty and `isError` is false (covers both all-zero-results and partial-error-with-zero-results cases)

---

## Cherry-Picked Event Types (TaggedEvent)

Each `TaggedEvent` contains only the fields needed for its card table. IPs display `flow.src_ip` / `flow.dest_ip` with fallback to top-level `src_ip` / `dest_ip`.

All values are rendered with `<EventValue query_key="..." value={...} />` (from `@/features/hunt/filtering/query-filters/components/event-value/event-value`) except timestamps (plain formatted text) and `discovery.key` (plain text).

| Type      | Fields displayed |
|-----------|-----------------|
| NRD       | timestamp, `dns?.rrname` (`"dns.rrname"`), flow src/dest IP (`"src_ip"` / `"dest_ip"`), `alert?.signature` (`"alert.signature"`) |
| Sightings | timestamp, `discovery.asset` (`"discovery.asset"`), `discovery.key` (plain text), `discovery.value` (`query_key="discovery.key"`) |
| File      | timestamp, `fileinfo.filename` (`"fileinfo.filename"`), `fileinfo.mimetype` (`"fileinfo.mimetype"`), `fileinfo.size` (`"fileinfo.size"`), flow src/dest IP |
| Lateral   | timestamp, `alert.signature` (`"alert.signature"`), flow src/dest IP, `alert.lateral` (`"alert.lateral"`) |
| Hunting   | timestamp, `alert.signature` (`"alert.signature"`), flow src/dest IP |

---

## Card UI (`IncidentAutoInvestigationCard`)

- Color-coded left border by event type: NRD=blue, Sightings=purple, File=orange, Lateral=red, Hunting=green
- Header: type badge, event count, time range (single timestamp if count = 1)
- Body: table of cherry-picked fields, **5 rows shown by default**, "Show all N" toggle to reveal the rest
- Cards are stacked vertically with a connecting line (vertical timeline pattern)

`IncidentAutoInvestigation` handles three states before rendering cards:
- **Loading** — skeleton
- **Error** — error message
- **Empty** — empty state message

---

## IncidentDetectionMethods

Extracts the logic from the existing `ThreatStatusExpandedRow`, relocated to `features/hunt/threats/components/incident-detection-methods/`:

- Queries events via `useGetEventsQuery` filtered by `stamus.threat_id` and asset IP, using the **exact `first_seen` / `last_seen` timestamps** (no ±7d padding — detection methods belong to the strict incident window)
- Groups events by `alert.signature_id`
- Renders each unique signature as `<EventValue query_key="alert.signature" />` with a `<ProtoFlow>` beneath it
- Handles all three network states:
  - **Loading** — skeleton
  - **Error** — error message
  - **Empty** — "No detection methods found" empty state

---

## Testing

**`use-incident-auto-investigation.test.ts`** (vitest — pure logic):
- Groups consecutive same-type events into one card
- Does not group non-consecutive same-type events
- Sorts events chronologically across all 5 sources
- Computes date range correctly (first_seen − 7d, last_seen + 7d)
- Returns `isEmpty: true` when all 5 sources return zero results

**`incident-auto-investigation.test.tsx`** (RTL + msw):
- Loading skeleton while any query is in flight
- Error state when a query fails
- Empty state when all sources return no events
- Cards render with correct type labels and row data
- "Show all" expands rows beyond the initial 5

**`incident-detection-methods.test.tsx`** (RTL + msw):
- Renders unique signatures from threat events
- Renders ProtoFlow per signature

**`incident-expanded-row.test.tsx`** (RTL):
- Auto Investigation tab is active by default
- Switching to Detection Methods renders that component

Mock data lives next to the API source files (`events.api.ts`, `sightings.api.ts`) as named exports per source type (e.g. `mockNrdEvents`, `mockLateralEvents`). MSW handlers for `incident-auto-investigation.test.tsx` must match on the `qfilter` query parameter to return distinct fixtures per source — this ensures per-source behaviour is actually tested rather than returning the same data for all 5 calls.
