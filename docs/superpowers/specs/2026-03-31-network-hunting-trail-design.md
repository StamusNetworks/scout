# Network-Wide Hunting Trail Page

## Problem

Threat hunters can't survey the network for suspicious activity patterns without first picking a specific host. The signals that Hunting Trail surfaces — lateral movement, newly registered domains, tor usage, powershell activity, raw protocol anomalies, and 30+ other categories — exist in the data but are invisible at network scale.

This page answers: "What's interesting on my network right now?"

## Scope

A dedicated top-level page at `/hunting-trail` that runs 33 of the existing Hunting Trail queries without scoping to a specific IP address. The `sightings` query is dropped (uses `discovery.asset`, inherently host-scoped).

Results are presented using the Purpose Aggregated format: 8 tabs corresponding to the existing purpose groups, each as a URL-driven route. Each tab shows a badge with the count of events in that group.

### No-gos

- Custom query selection (all 33 queries always run)
- Pagination or infinite scroll
- `_msearch` query batching
- Saved hunting sessions or filters

## Routing

### Route structure

```
/src/routes/_enterprise/hunting-trail/
  route.tsx      Layout: page header, purpose tabs, <Outlet />
  index.tsx      Redirect to /hunting-trail/lateral-movement
  $purpose.tsx   Dynamic route rendering the selected purpose group
```

### Tab slugs

| Purpose Group              | URL Slug              |
|----------------------------|-----------------------|
| Lateral Movement           | lateral-movement      |
| Exploitation & Post-Exploit| exploitation          |
| File Activity              | file-activity         |
| Network Anomalies          | network-anomalies     |
| DNS & Domains              | dns-domains           |
| Sightings & Discovery      | sightings-discovery   |
| Hunting Signals            | hunting-signals       |
| Network Sessions           | network-sessions      |

`/hunting-trail` redirects to `/hunting-trail/lateral-movement`.

### Navigation

New entry in the "Hunting & Investigation" submenu of `navigation.config.tsx`, positioned after "Hosts".

## Data Layer

### New hook: `useNetworkHuntingTrail`

Location: `src/features/hunting-trail/hooks/use-network-hunting-trail.ts`

A standalone hook (Approach A — separate from the host-scoped `useHuntingTrail`) that runs 33 queries without IP filtering. Parameters: `startDate` and `endDate` from `useGlobalQueryParams(['dates'])`.

Each query's `qfilter` contains only the query-specific filter string (no `src_ip`/`dest_ip` clause). Uses the same RTK Query hooks: `useGetEventsQuery` and `useGetEventsTailQuery`. The `sightings` query and `useGetSightingEventsQuery` are excluded.

### Return shape

```typescript
type PurposeSlug =
  | 'lateral-movement'
  | 'exploitation'
  | 'file-activity'
  | 'network-anomalies'
  | 'dns-domains'
  | 'sightings-discovery'
  | 'hunting-signals'
  | 'network-sessions';

type PurposeGroupData = {
  events: TaggedEvent[];
  count: number;
  isLoading: boolean;
  isError: boolean;
};

// Hook return
{
  groups: Record<PurposeSlug, PurposeGroupData>;
}
```

Events are grouped by purpose so each tab can:
- Show its own loading/error/empty state independently
- Display badge counts as queries resolve (no waiting for all 33)

### Queries included (33 total)

**Alert queries (25):** `nrd`, `hunting`, `lateral`, `remoteAdmin`, `remoteRegistry`, `postExploit`, `ipDownload`, `rawProtocol`, `userEnum`, `powershell`, `newServers`, `smbSightings`, `torrent`, `smtpExe`, `base64Encoding`, `maliciousFilenames`, `suspiciousFilenames`, `longDomains`, `shortDomains`, `exeSightings`, `dynamicDns`, `tor`, `publicDns`, `smtpUnencrypted`, `base64Decoding`

**Events tail queries (8):** `file`, `ssh`, `longerSsh`, `rdp`, `rfbVnc`, `biggerTcp`, `longerTcp`, `biggerUdp`, `longerUdp`

**Excluded:** `sightings` (host-scoped `discovery.asset` field)

## Feature Directory

```
src/features/hunting-trail/
  hooks/
    use-network-hunting-trail.ts       33 queries, no IP scoping
    use-network-hunting-trail.test.ts
  entities/
    purpose-tab-content.tsx            Renders query cards for one purpose group
    purpose-tab-content.test.tsx
  molecules/
    query-card.tsx                     Shared QueryCard + QUERY_DESCRIPTION
    card-summary.tsx                   Shared CardSummary (moved from host-scoped)
    card-events-table.tsx              Shared CardEventsTable (moved from host-scoped)
  hunting-trail.model.ts               Shared types, PURPOSE_GROUPS, TYPE_LABEL, TYPE_COLOR
```

### Shared molecule extraction

The following components are currently inside `src/features/threats/compromises/use-cases/hunting-trail/`. They will be extracted into `src/features/hunting-trail/` so both the network-wide page and the host-scoped feature can import from the same location:

- `QueryCard` component (currently in `purpose-aggregated.tsx`)
- `CardSummary` component (`molecules/card-summary.tsx`)
- `CardEventsTable` component (`molecules/card-events-table.tsx`)
- `QUERY_DESCRIPTION` map (currently in `purpose-aggregated.tsx`)

The host-scoped feature (`threats/compromises/use-cases/hunting-trail/`) will import these from the new shared location.

Shared model types (`TaggedEvent`, `TimelineEventType`, `PURPOSE_GROUPS`, `TYPE_LABEL`, `TYPE_COLOR`, `TypeColorConfig`) also move to `src/features/hunting-trail/hunting-trail.model.ts`.

## Page Components

### `route.tsx` — Layout

- `usePageTitle('Hunting Trail')`
- `OutletBreadcrumb` with "Hunting Trail"
- `Page` > `TogglePageContainer` > `PageHeader` with title and description
- Purpose tabs using `pillTabs` with `useLocation().pathname` for active state
- Each tab shows a `TabsBadge` with the event count for that purpose group
- Calls `useNetworkHuntingTrail` once at layout level
- Provides hook data to children via React context (TanStack Router `beforeLoad` can't call hooks)
- `<Outlet />` for active tab content

### `index.tsx` — Redirect

```typescript
throw redirect({ to: '/hunting-trail/lateral-movement' });
```

### `$purpose.tsx` — Dynamic tab content

- Reads `purpose` param from route
- Resolves slug to purpose group
- Pulls group data from context
- Renders `PurposeTabContent`

### `PurposeTabContent`

Receives purpose group data and renders:
- Loading: skeleton cards
- Error: error message
- Empty: "No events found for this category"
- Data: `QueryCard` components for each query type in the group that has events

## Testing

### `use-network-hunting-trail.test.ts`

- Returns loading state initially
- Returns grouped events by purpose when queries resolve
- Returns error state when all queries fail
- Returns empty counts for purposes with no matching events
- Excludes sightings query

### `purpose-tab-content.test.tsx`

- Renders loading skeletons while queries are in flight
- Renders query cards with descriptions when data arrives
- Renders empty state when no events for the purpose
- Renders error state on failure

Mock data placed alongside API sources, reusing existing mock data from `features/events/` where possible.
