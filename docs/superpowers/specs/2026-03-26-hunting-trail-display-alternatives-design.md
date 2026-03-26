# Hunting Trail Display Alternatives

## Overview

Refactor the hunting trail feature to separate data fetching from display, then provide 4 alternative display modes as tabs for comparison and iteration.

## Hook Refactor

`useHuntingTrail` returns raw tagged events instead of aggregated groups:

```ts
{
  taggedEvents: TaggedEvent[],
  isLoading: boolean,
  isError: boolean,
  isEmpty: boolean,
}
```

Each tab receives `taggedEvents` and applies its own transformation.

## Tab Container

The `HuntingTrail` entity component becomes a tabbed shell using the existing `borderTabs` Radix primitives (Tabs/TabsList/TabsTrigger/TabsContent). It handles loading/error/empty states once at the top, then renders 4 tabs that each receive `taggedEvents`. Default tab: "Aggregated Timeline".

## Tab Implementations

Each tab is a single file containing its data transformation logic and rendering primitives, located under `hunting-trail/use-cases/`.

### Tab 1: `aggregated-timeline.tsx` — Aggregated Timeline (current behavior)

Thin wrapper that imports the existing `aggregateTimelineEvents` util and `HuntingTrailCard` molecule. No new logic — preserves the current display as-is.

### Tab 2: `query-aggregated.tsx` — Query Aggregated

**Transform**: Group `taggedEvents` by `timelineType` into `Map<TimelineEventType, TaggedEvent[]>`. One entry per query type that returned results.

**Render**: One card per query type showing: query label, event count, value aggregation summary (reuses `CardSummary`), and expandable events table (reuses `CardEventsTable`).

### Tab 3: `purpose-aggregated.tsx` — Purpose Aggregated

**Transform**: Group by purpose category first, then by query type within each category. Skips empty categories entirely.

**Purpose groups**:

| Group | Query Types |
|-------|-------------|
| Lateral Movement | lateral, remoteAdmin, remoteRegistry, userEnum |
| Exploitation & Post-Exploit | postExploit, powershell, base64Encoding, base64Decoding |
| File Activity | file, maliciousFilenames, suspiciousFilenames, smtpExe, exeSightings |
| Network Anomalies | ipDownload, rawProtocol, torrent, tor, smtpUnencrypted |
| DNS & Domains | nrd, longDomains, shortDomains, dynamicDns, publicDns |
| Sightings & Discovery | sightings, newServers, smbSightings |
| Hunting Signals | hunting |

**Render**: Collapsible section per purpose category. Within each section, one card per query type (same card layout as Tab 2) with a query-type label badge on each event to identify its origin query.

### Tab 4: `flow-aggregated.tsx` — Flow Aggregated

**Transform**: Group `taggedEvents` by `flow_id`. For each flow, collect the set of query types that matched and their counts. Sort flows by timestamp of the earliest event. Events without a `flow_id` are grouped under a fallback "Unassociated" section.

**Render**: One card per flow showing:
- **Header**: `src_ip:src_port → dest_ip:dest_port`, `app_proto`, time range (earliest–latest event)
- **Body**: Colored badges per query type with hit count (compact badge layout)
- **Expandable**: Full event list for that flow, each event labeled with its query type

## Shared Config

Query metadata (labels, colors) lives in the existing `hunting-trail-card.tsx` maps. Purpose group definitions are added to `hunting-trail.model.ts` as a `PURPOSE_GROUPS` constant mapping category names to arrays of `TimelineEventType`.

## File Structure

```
hunting-trail/
├── hunting-trail.model.ts          # types, priorities, PURPOSE_GROUPS config
├── hooks/
│   └── use-hunting-trail.ts        # returns taggedEvents (no aggregation)
├── entities/
│   └── hunting-trail.tsx           # tab container with loading/error/empty
├── use-cases/
│   ├── aggregated-timeline.tsx     # tab 1: current behavior
│   ├── query-aggregated.tsx        # tab 2: one card per query
│   ├── purpose-aggregated.tsx      # tab 3: grouped by purpose category
│   └── flow-aggregated.tsx         # tab 4: grouped by flow
├── molecules/
│   ├── hunting-trail-card.tsx      # labels, colors, card shell
│   ├── card-summary.tsx            # value aggregation columns
│   └── card-events-table.tsx       # expandable events table
└── utils/
    └── aggregate-timeline-events.ts # used by tab 1
```
