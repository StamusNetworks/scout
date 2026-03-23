# Incident Expanded Row Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a tabbed expanded row to the incident tables on `threats/incidents` and `hosts/[hostId]/incidents`, showing an Auto Investigation timeline (5 intelligence sources, chronological, aggregated) and a Detection Methods view (unique alert signatures + ProtoFlow).

**Architecture:** A `useIncidentAutoInvestigation` hook fires 5 parallel RTK Query requests, tags results, merges and sorts them by timestamp, then groups consecutive same-type events into `TimelineGroup[]`. `IncidentExpandedRow` wraps `IncidentAutoInvestigation` and `IncidentDetectionMethods` in `pillTabs`, defaulting to Auto Investigation.

**Tech Stack:** React, TypeScript, RTK Query (`useGetEventsQuery`, `useGetEventsTailQuery`, `useGetSightingEventsQuery`), date-fns, Radix UI Tabs (`pillTabs`), vitest, React Testing Library, msw

---

## File Map

### New files
| File | Responsibility |
|------|---------------|
| `src/features/hunt/threats/models/incident-auto-investigation.model.ts` | `TimelineEventType`, `TimelineGroup`, `TaggedEvent` types |
| `src/features/hunt/threats/utils/aggregate-timeline-events.ts` | Pure sort + consecutive-group function |
| `src/features/hunt/threats/utils/aggregate-timeline-events.test.ts` | vitest unit tests for aggregation |
| `src/features/hunt/threats/hooks/use-incident-auto-investigation.ts` | 5 RTK queries + tagging + calls aggregation utility |
| `src/features/hunt/threats/components/incident-detection-methods/incident-detection-methods.tsx` | Unique signatures + ProtoFlow per sig (loading/error/empty) |
| `src/features/hunt/threats/components/incident-detection-methods/incident-detection-methods.test.tsx` | RTL + msw tests |
| `src/features/hunt/threats/components/incident-auto-investigation/incident-auto-investigation.card.tsx` | Single card: header (type badge, count, time range) + table |
| `src/features/hunt/threats/components/incident-auto-investigation/incident-auto-investigation.tsx` | Renders loading/error/empty or list of cards |
| `src/features/hunt/threats/components/incident-auto-investigation/incident-auto-investigation.test.tsx` | RTL + msw tests |
| `src/features/hunt/threats/components/incident-expanded-row.tsx` | Tab shell: pillTabs wrapping both components |
| `src/features/hunt/threats/components/incident-expanded-row.test.tsx` | RTL tab-switching test |
| `src/features/hunt/events/api/events.mocks.ts` | Named mock event factories per source type |
| `src/features/analytics/sightings/api/sightings.mocks.ts` | Named mock sighting event factories |

### Modified files
| File | Change |
|------|--------|
| `src/pages/threats/incidents/index.tsx` | Add `ExpandedRow={IncidentExpandedRow}` to `<DataTable>` |
| `src/pages/hosts/[hostId]/incidents/index.tsx` | Replace `ThreatStatusExpandedRow` with `IncidentExpandedRow` |

### Deleted files
- `src/pages/hosts/[hostId]/incidents/threat-status.expanded-row.tsx`

---

## Chunk 1: Types + Aggregation Logic

### Task 1: Define Types

**Files:**
- Create: `src/features/hunt/threats/models/incident-auto-investigation.model.ts`

- [ ] **Step 1: Create the model file**

```typescript
// src/features/hunt/threats/models/incident-auto-investigation.model.ts
import { Event } from '@/features/hunt/events/model/event.schema';

export type TimelineEventType =
  | 'nrd'
  | 'sightings'
  | 'file'
  | 'lateral'
  | 'hunting';

export const TIMELINE_TYPE_PRIORITY: Record<TimelineEventType, number> = {
  nrd: 0,
  sightings: 1,
  file: 2,
  lateral: 3,
  hunting: 4,
};

export type TaggedEvent = Event & { timelineType: TimelineEventType };

export type TimelineGroup = {
  type: TimelineEventType;
  events: TaggedEvent[];
  startTime: string;
  endTime: string;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/hunt/threats/models/incident-auto-investigation.model.ts
git commit -m "feat: add incident auto investigation model types"
```

---

### Task 2: Aggregation Utility (TDD)

**Files:**
- Create: `src/features/hunt/threats/utils/aggregate-timeline-events.ts`
- Create: `src/features/hunt/threats/utils/aggregate-timeline-events.test.ts`

- [ ] **Step 1: Create mock event factory**

```typescript
// src/features/hunt/events/api/events.mocks.ts
import { Event } from '@/features/hunt/events/model/event.schema';

export const makeEvent = (overrides: Partial<Event> = {}): Event => ({
  _id: 'evt-1',
  '@timestamp': '2026-01-12T08:00:00Z',
  timestamp: '2026-01-12T08:00:00Z',
  app_proto: 'dns',
  dest_ip: '8.8.8.8',
  dest_port: 53,
  event_type: 'alert',
  src_ip: '192.168.1.5',
  src_port: 12345,
  ...overrides,
});

export const makeNrdEvent = (overrides: Partial<Event> = {}): Event =>
  makeEvent({
    _id: 'nrd-1',
    app_proto: 'dns',
    dns: { type: 'query', rrname: 'newly-registered.io', id: 1, tx_id: 1 },
    alert: { signature: 'ET NRD Domain', signature_id: 1001 },
    flow: {
      src_ip: '192.168.1.5',
      src_port: 12345,
      dest_ip: '8.8.8.8',
      dest_port: 53,
      start: '2026-01-12T08:00:00Z',
      state: 'new',
      alerted: true,
    },
    ...overrides,
  });

export const makeSightingEvent = (overrides: Partial<Event> = {}): Event =>
  makeEvent({
    _id: 'sighting-1',
    app_proto: 'stamus',
    event_type: 'discovery',
    discovery: {
      asset_role: ['victim'],
      key: 'hostname',
      asset: '192.168.1.5',
      value: 'WORKSTATION-05',
      asset_net: '192.168.1.0/24',
    },
    ...overrides,
  });

export const makeFileEvent = (overrides: Partial<Event> = {}): Event =>
  makeEvent({
    _id: 'file-1',
    app_proto: 'smb',
    event_type: 'fileinfo',
    fileinfo: {
      filename: 'invoice.exe',
      mimetype: 'application/x-dosexec',
      gaps: false,
      sha256: 'abc123',
      tx_id: 1,
      state: 'CLOSED',
      size: 86200,
      stored: false,
    },
    flow: {
      src_ip: '10.0.0.1',
      src_port: 445,
      dest_ip: '192.168.1.5',
      dest_port: 54321,
      start: '2026-01-12T12:45:00Z',
      state: 'closed',
      alerted: false,
    },
    ...overrides,
  });

export const makeLateralEvent = (overrides: Partial<Event> = {}): Event =>
  makeEvent({
    _id: 'lateral-1',
    app_proto: 'smb',
    event_type: 'alert',
    alert: {
      signature: 'SMB Lateral Movement',
      signature_id: 2001,
      lateral: 'smb_exec',
    },
    flow: {
      src_ip: '10.0.0.1',
      src_port: 445,
      dest_ip: '10.0.0.7',
      dest_port: 445,
      start: '2026-01-12T15:22:00Z',
      state: 'closed',
      alerted: true,
    },
    ...overrides,
  });

export const makeHuntingEvent = (overrides: Partial<Event> = {}): Event =>
  makeEvent({
    _id: 'hunting-1',
    app_proto: 'tcp',
    event_type: 'alert',
    alert: {
      signature: 'Recon Activity Detected',
      signature_id: 3001,
    },
    flow: {
      src_ip: '192.168.1.5',
      src_port: 56789,
      dest_ip: '10.0.0.254',
      dest_port: 80,
      start: '2026-01-12T16:01:00Z',
      state: 'closed',
      alerted: true,
    },
    ...overrides,
  });
```

- [ ] **Step 2: Write failing tests**

```typescript
// src/features/hunt/threats/utils/aggregate-timeline-events.test.ts
import { describe, expect, it } from 'vitest';

import {
  makeNrdEvent,
  makeSightingEvent,
  makeFileEvent,
  makeLateralEvent,
  makeHuntingEvent,
} from '@/features/hunt/events/api/events.mocks';
import { TaggedEvent } from '../models/incident-auto-investigation.model';
import { aggregateTimelineEvents } from './aggregate-timeline-events';

const tag = (
  event: ReturnType<typeof makeNrdEvent>,
  timelineType: TaggedEvent['timelineType'],
): TaggedEvent => ({ ...event, timelineType });

describe('aggregateTimelineEvents', () => {
  it('returns empty array for empty input', () => {
    expect(aggregateTimelineEvents([])).toEqual([]);
  });

  it('wraps a single event in one group', () => {
    const events = [tag(makeNrdEvent(), 'nrd')];
    const groups = aggregateTimelineEvents(events);
    expect(groups).toHaveLength(1);
    expect(groups[0].type).toBe('nrd');
    expect(groups[0].events).toHaveLength(1);
    expect(groups[0].startTime).toBe(groups[0].endTime);
  });

  it('groups consecutive same-type events', () => {
    const events = [
      tag(makeNrdEvent({ _id: 'a', timestamp: '2026-01-12T08:00:00Z' }), 'nrd'),
      tag(makeNrdEvent({ _id: 'b', timestamp: '2026-01-12T09:00:00Z' }), 'nrd'),
    ];
    const groups = aggregateTimelineEvents(events);
    expect(groups).toHaveLength(1);
    expect(groups[0].events).toHaveLength(2);
    expect(groups[0].startTime).toBe('2026-01-12T08:00:00Z');
    expect(groups[0].endTime).toBe('2026-01-12T09:00:00Z');
  });

  it('does NOT group same-type events separated by a different type', () => {
    const events = [
      tag(makeSightingEvent({ _id: 'a', timestamp: '2026-01-12T08:00:00Z' }), 'sightings'),
      tag(makeSightingEvent({ _id: 'b', timestamp: '2026-01-12T09:00:00Z' }), 'sightings'),
      tag(makeFileEvent({             timestamp: '2026-01-12T10:00:00Z' }), 'file'),
      tag(makeHuntingEvent({          timestamp: '2026-01-12T11:00:00Z' }), 'hunting'),
      tag(makeHuntingEvent({ _id: 'c', timestamp: '2026-01-12T12:00:00Z' }), 'hunting'),
      tag(makeLateralEvent({          timestamp: '2026-01-12T13:00:00Z' }), 'lateral'),
      tag(makeSightingEvent({ _id: 'd', timestamp: '2026-01-12T14:00:00Z' }), 'sightings'),
      tag(makeSightingEvent({ _id: 'e', timestamp: '2026-01-12T15:00:00Z' }), 'sightings'),
      tag(makeSightingEvent({ _id: 'f', timestamp: '2026-01-12T16:00:00Z' }), 'sightings'),
      tag(makeHuntingEvent({ _id: 'g', timestamp: '2026-01-12T17:00:00Z' }), 'hunting'),
    ];
    const groups = aggregateTimelineEvents(events);
    expect(groups.map(g => `${g.type}×${g.events.length}`)).toEqual([
      'sightings×2',
      'file×1',
      'hunting×2',
      'lateral×1',
      'sightings×3',
      'hunting×1',
    ]);
  });

  it('sorts events by timestamp before grouping', () => {
    // Events given out of order — should still group by sorted position
    const events = [
      tag(makeNrdEvent({ _id: 'b', timestamp: '2026-01-12T09:00:00Z' }), 'nrd'),
      tag(makeLateralEvent({          timestamp: '2026-01-12T10:00:00Z' }), 'lateral'),
      tag(makeNrdEvent({ _id: 'a', timestamp: '2026-01-12T08:00:00Z' }), 'nrd'),
    ];
    const groups = aggregateTimelineEvents(events);
    expect(groups).toHaveLength(2);
    expect(groups[0].type).toBe('nrd');
    expect(groups[0].events).toHaveLength(2);
    expect(groups[1].type).toBe('lateral');
  });

  it('uses type-priority as a tie-breaker for identical timestamps', () => {
    // nrd (priority 0) should come before hunting (priority 4) at same timestamp
    const ts = '2026-01-12T08:00:00Z';
    const events = [
      tag(makeHuntingEvent({ _id: 'h', timestamp: ts }), 'hunting'),
      tag(makeNrdEvent({     _id: 'n', timestamp: ts }), 'nrd'),
    ];
    const groups = aggregateTimelineEvents(events);
    expect(groups[0].type).toBe('nrd');
    expect(groups[1].type).toBe('hunting');
  });
});
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
pnpm vitest run src/features/hunt/threats/utils/aggregate-timeline-events.test.ts
```

Expected: `FAIL` — `Cannot find module './aggregate-timeline-events'`

- [ ] **Step 4: Implement the aggregation function**

```typescript
// src/features/hunt/threats/utils/aggregate-timeline-events.ts
import {
  TaggedEvent,
  TimelineGroup,
  TIMELINE_TYPE_PRIORITY,
} from '../models/incident-auto-investigation.model';

export function aggregateTimelineEvents(events: TaggedEvent[]): TimelineGroup[] {
  const sorted = [...events].sort((a, b) => {
    const tA = new Date(a.timestamp).getTime();
    const tB = new Date(b.timestamp).getTime();
    if (tA !== tB) return tA - tB;
    return TIMELINE_TYPE_PRIORITY[a.timelineType] - TIMELINE_TYPE_PRIORITY[b.timelineType];
  });

  const groups: TimelineGroup[] = [];
  for (const event of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.type === event.timelineType) {
      last.events.push(event);
      last.endTime = event.timestamp;
    } else {
      groups.push({
        type: event.timelineType,
        events: [event],
        startTime: event.timestamp,
        endTime: event.timestamp,
      });
    }
  }
  return groups;
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
pnpm vitest run src/features/hunt/threats/utils/aggregate-timeline-events.test.ts
```

Expected: all 6 tests `PASS`

- [ ] **Step 6: Commit**

```bash
git add src/features/hunt/events/api/events.mocks.ts \
        src/features/hunt/threats/utils/aggregate-timeline-events.ts \
        src/features/hunt/threats/utils/aggregate-timeline-events.test.ts
git commit -m "feat: add timeline aggregation utility with tests"
```

---

## Chunk 2: Hook + IncidentDetectionMethods

### Task 3: `useIncidentAutoInvestigation` Hook

**Files:**
- Create: `src/features/hunt/threats/hooks/use-incident-auto-investigation.ts`

- [ ] **Step 1: Create the hook**

```typescript
// src/features/hunt/threats/hooks/use-incident-auto-investigation.ts
import { addDays, subDays } from 'date-fns';

import { useGetEventsQuery, useGetEventsTailQuery } from '@/features/hunt/events/api/events.api';
import { useGetSightingEventsQuery } from '@/features/analytics/sightings/api/sightings.api';
import { esEscape } from '@/common/lib/strings';
import { ThreatStatus } from '../model/threat-status.schema';
import { TaggedEvent } from '../models/incident-auto-investigation.model';
import { aggregateTimelineEvents } from '../utils/aggregate-timeline-events';

export function useIncidentAutoInvestigation(incident: ThreatStatus) {
  const asset = incident.asset;
  const startDate = subDays(new Date(incident.first_seen), 7).getTime();
  const endDate = addDays(new Date(incident.last_seen), 7).getTime();
  const ipFilter = `src_ip:${esEscape(asset)} OR dest_ip:${esEscape(asset)}`;

  const nrd = useGetEventsQuery({
    qfilter: `(${ipFilter}) AND metadata.flowbits:stamus.nrd*`,
    start_date: startDate,
    end_date: endDate,
    page_size: 100,
    alert: true,
  });

  const sightings = useGetSightingEventsQuery({
    qfilter: `discovery.asset:${esEscape(asset)}`,
    start_date: startDate,
    end_date: endDate,
    page_size: 100,
  });

  // events_tail (not alerts_tail) — fileinfo events are non-alert types
  const file = useGetEventsTailQuery({
    qfilter: `(${ipFilter}) AND (metadata.flowbits:stamus.file.identification OR metadata.flowbits:stamus.dga.smbfilename)`,
    start_date: startDate,
    end_date: endDate,
    page_size: 100,
  });

  const lateral = useGetEventsQuery({
    qfilter: `(${ipFilter}) AND alert.lateral:* AND alert.metadata.source:smb_lateral AND alert.metadata.signature_severity:critical`,
    start_date: startDate,
    end_date: endDate,
    page_size: 100,
    alert: true,
  });

  const hunting = useGetEventsQuery({
    qfilter: `(${ipFilter}) AND alert.metadata.stamus_type:hunting`,
    start_date: startDate,
    end_date: endDate,
    page_size: 100,
    alert: true,
  });

  const queries = [nrd, sightings, file, lateral, hunting];
  const isLoading = queries.some((q) => q.isLoading);
  const allFailed = queries.every((q) => q.isError);

  const taggedEvents: TaggedEvent[] = [
    ...(nrd.data?.results ?? []).map((e) => ({ ...e, timelineType: 'nrd' as const })),
    ...(sightings.data?.results ?? []).map((e) => ({ ...e, timelineType: 'sightings' as const })),
    ...(file.data?.results ?? []).map((e) => ({ ...e, timelineType: 'file' as const })),
    ...(lateral.data?.results ?? []).map((e) => ({ ...e, timelineType: 'lateral' as const })),
    ...(hunting.data?.results ?? []).map((e) => ({ ...e, timelineType: 'hunting' as const })),
  ];

  const groups = aggregateTimelineEvents(taggedEvents);

  return {
    groups,
    isLoading,
    isError: allFailed,
    isEmpty: groups.length === 0 && !allFailed,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/hunt/threats/hooks/use-incident-auto-investigation.ts
git commit -m "feat: add useIncidentAutoInvestigation hook"
```

---

### Task 4: `IncidentDetectionMethods` Component (TDD)

**Files:**
- Create: `src/features/hunt/threats/components/incident-detection-methods/incident-detection-methods.tsx`
- Create: `src/features/hunt/threats/components/incident-detection-methods/incident-detection-methods.test.tsx`

This extracts and refactors the existing `ThreatStatusExpandedRow`, adding the missing loading/error/empty states.

- [ ] **Step 1: Write failing tests**

```typescript
// src/features/hunt/threats/components/incident-detection-methods/incident-detection-methods.test.tsx
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { makeNrdEvent } from '@/features/hunt/events/api/events.mocks';

import { IncidentDetectionMethods } from './incident-detection-methods';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

const mockIncident = {
  id: 1,
  status: 'new' as const,
  tenant: 1,
  first_seen: '2026-01-12T00:00:00Z',
  last_seen: '2026-01-15T00:00:00Z',
  close_status_date: '2026-01-16T00:00:00Z',
  kill_chain: 'exploitation' as const,
  kill_chain_offender: 'exploitation' as const,
  threat_id: 42,
  asset: '192.168.1.5',
  is_offender: false,
};

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

const renderComponent = () =>
  renderWithProviders(<IncidentDetectionMethods incident={mockIncident} />, {
    router: createTestRouter(),
  });

describe('IncidentDetectionMethods', () => {
  it('shows loading state while request is in flight', async () => {
    // Delay the response so we can observe loading state
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json(emptyPaginated);
      }),
    );
    renderWithProviders(<IncidentDetectionMethods incident={mockIncident} />, {
      router: createTestRouter(),
    });
    // Loading state should be visible before request completes
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows empty state when no events', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () =>
        HttpResponse.json(emptyPaginated),
      ),
    );
    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/no detection methods/i)).toBeInTheDocument();
    });
  });

  it('shows error state when request fails', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () =>
        HttpResponse.error(),
      ),
    );
    await renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText(/failed to load detection methods/i),
      ).toBeInTheDocument();
    });
  });

  it('renders unique signatures from events', async () => {
    const event = makeNrdEvent({
      alert: { signature: 'ET EXPLOIT Test Sig', signature_id: 999 },
    });
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () =>
        HttpResponse.json({ count: 1, next: null, previous: null, results: [event] }),
      ),
    );
    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText('ET EXPLOIT Test Sig')).toBeInTheDocument();
    });
  });

  it('deduplicates events with the same signature_id', async () => {
    const event = makeNrdEvent({
      alert: { signature: 'ET EXPLOIT Test Sig', signature_id: 999 },
    });
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () =>
        HttpResponse.json({
          count: 3,
          next: null,
          previous: null,
          results: [
            { ...event, _id: 'a' },
            { ...event, _id: 'b' },
            { ...event, _id: 'c' },
          ],
        }),
      ),
    );
    await renderComponent();
    await waitFor(() => {
      expect(screen.getAllByText('ET EXPLOIT Test Sig')).toHaveLength(1);
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
pnpm vitest run src/features/hunt/threats/components/incident-detection-methods/incident-detection-methods.test.tsx
```

Expected: `FAIL` — module not found

- [ ] **Step 3: Implement the component**

```typescript
// src/features/hunt/threats/components/incident-detection-methods/incident-detection-methods.tsx
import { groupBy } from 'ramda';

import { Column } from '@/common/design-system/atoms/layout/column';
import { ProtoFlow } from '@/common/design-system/graphs/proto-flow/proto-flow';
import { esEscape } from '@/common/lib/strings';
import { useGetEventsQuery } from '@/features/hunt/events/api/events.api';
import { Event } from '@/features/hunt/events/model/event.schema';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import { ThreatStatus } from '../../model/threat-status.schema';

export const IncidentDetectionMethods = ({
  incident,
}: {
  incident: ThreatStatus;
}) => {
  const { data, isLoading, isError } = useGetEventsQuery({
    start_date: new Date(incident.first_seen).getTime(),
    end_date: new Date(incident.last_seen).getTime(),
    qfilter: `stamus.threat_id:${esEscape(String(incident.threat_id))} AND (src_ip:${esEscape(incident.asset)} OR dest_ip:${esEscape(incident.asset)})`,
    stamus: true,
    alert: true,
  });

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-sm text-destructive">
        Failed to load detection methods.
      </div>
    );
  }

  const bySigId = groupBy(
    (e: Event) => e.alert?.signature_id.toString() ?? 'unknown',
  )(data?.results ?? []);

  const uniqueSignatures = (data?.results ?? []).reduce(
    (acc, e) => {
      if (!e.alert) return acc;
      if (acc.some((s) => s.signature_id === e.alert?.signature_id)) return acc;
      return [...acc, e.alert];
    },
    [] as NonNullable<Event['alert']>[],
  );

  if (uniqueSignatures.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No detection methods found.
      </div>
    );
  }

  return (
    <Column className="gap-4 p-2">
      {uniqueSignatures.map((s) => (
        <Column key={s.signature_id} className="gap-1">
          <EventValue query_key="alert.signature" value={s.signature} />
          <ProtoFlow events={bySigId[s.signature_id.toString()] ?? []} />
        </Column>
      ))}
    </Column>
  );
};
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
pnpm vitest run src/features/hunt/threats/components/incident-detection-methods/incident-detection-methods.test.tsx
```

Expected: all 4 tests `PASS`

- [ ] **Step 5: Commit**

```bash
git add src/features/hunt/threats/components/incident-detection-methods/
git commit -m "feat: add IncidentDetectionMethods component with tests"
```

---

## Chunk 3: Auto Investigation Components

### Task 5: `IncidentAutoInvestigationCard`

**Files:**
- Create: `src/features/hunt/threats/components/incident-auto-investigation/incident-auto-investigation.card.tsx`

The card is a pure presentational component — no network calls, no separate test file needed (tested via the parent component tests in Task 6).

- [ ] **Step 1: Create sightings mock factory**

```typescript
// src/features/analytics/sightings/api/sightings.mocks.ts
import { Event } from '@/features/hunt/events/model/event.schema';
import { makeEvent } from '@/features/hunt/events/api/events.mocks';

export const makeSightingApiEvent = (overrides: Partial<Event> = {}): Event =>
  makeEvent({
    _id: 'sighting-api-1',
    app_proto: 'stamus',
    event_type: 'discovery',
    discovery: {
      asset_role: ['victim'],
      key: 'hostname',
      asset: '192.168.1.5',
      value: 'WORKSTATION-05',
      asset_net: '192.168.1.0/24',
    },
    ...overrides,
  });
```

- [ ] **Step 2: Implement the card**

```typescript
// src/features/hunt/threats/components/incident-auto-investigation/incident-auto-investigation.card.tsx
import { format } from 'date-fns';
import { useState } from 'react';

import { Button } from '@/common/design-system/atoms/ui/button';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import {
  TimelineEventType,
  TimelineGroup,
} from '../../models/incident-auto-investigation.model';

const TYPE_LABEL: Record<TimelineEventType, string> = {
  nrd: 'NRD',
  sightings: 'Sightings',
  file: 'File',
  lateral: 'Lateral',
  hunting: 'Hunting',
};

const TYPE_COLOR: Record<TimelineEventType, string> = {
  nrd: 'border-blue-500 text-blue-400',
  sightings: 'border-purple-500 text-purple-400',
  file: 'border-orange-500 text-orange-400',
  lateral: 'border-red-500 text-red-400',
  hunting: 'border-green-500 text-green-400',
};

const PAGE_SIZE = 5;

const formatTs = (ts: string) => format(new Date(ts), 'MMM d HH:mm');

const displayIp = (event: TimelineGroup['events'][number]) =>
  event.flow?.src_ip ?? event.src_ip;

const displayDestIp = (event: TimelineGroup['events'][number]) =>
  event.flow?.dest_ip ?? event.dest_ip;

export const IncidentAutoInvestigationCard = ({
  group,
}: {
  group: TimelineGroup;
}) => {
  const [expanded, setExpanded] = useState(false);
  const { type, events, startTime, endTime } = group;
  const visible = expanded ? events : events.slice(0, PAGE_SIZE);
  const hasMore = events.length > PAGE_SIZE;

  const timeRange =
    startTime === endTime
      ? formatTs(startTime)
      : `${formatTs(startTime)} – ${formatTs(endTime)}`;

  return (
    <div className={`border-l-2 ${TYPE_COLOR[type]} overflow-hidden rounded-md bg-card`}>
      {/* Card header */}
      <div className="flex items-center justify-between bg-muted/40 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wide ${TYPE_COLOR[type].split(' ')[1]}`}>
            {TYPE_LABEL[type]}
          </span>
          <span className="text-xs text-muted-foreground">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{timeRange}</span>
      </div>

      {/* Card table */}
      <table className="w-full text-xs">
        <tbody>
          {visible.map((event) => (
            <tr key={event._id} className="border-b border-border last:border-0">
              <td className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">
                {formatTs(event.timestamp)}
              </td>
              {type === 'nrd' && (
                <>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="dns.rrname" value={event.dns?.rrname} />
                  </td>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="src_ip" value={displayIp(event)} />
                  </td>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="dest_ip" value={displayDestIp(event)} />
                  </td>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="alert.signature" value={event.alert?.signature} />
                  </td>
                </>
              )}
              {type === 'sightings' && (
                <>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="discovery.asset" value={event.discovery?.asset} />
                  </td>
                  <td className="px-3 py-1.5 text-muted-foreground">
                    {event.discovery?.key}
                  </td>
                  <td className="px-3 py-1.5">
                    <EventValue
                      query_key="discovery.key"
                      value={event.discovery?.value}
                    />
                  </td>
                </>
              )}
              {type === 'file' && (
                <>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="fileinfo.filename" value={event.fileinfo?.filename} />
                  </td>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="fileinfo.mimetype" value={event.fileinfo?.mimetype} />
                  </td>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="fileinfo.size" value={event.fileinfo?.size} />
                  </td>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="src_ip" value={displayIp(event)} />
                  </td>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="dest_ip" value={displayDestIp(event)} />
                  </td>
                </>
              )}
              {type === 'lateral' && (
                <>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="alert.signature" value={event.alert?.signature} />
                  </td>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="src_ip" value={displayIp(event)} />
                  </td>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="dest_ip" value={displayDestIp(event)} />
                  </td>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="alert.lateral" value={event.alert?.lateral} />
                  </td>
                </>
              )}
              {type === 'hunting' && (
                <>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="alert.signature" value={event.alert?.signature} />
                  </td>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="src_ip" value={displayIp(event)} />
                  </td>
                  <td className="px-3 py-1.5">
                    <EventValue query_key="dest_ip" value={displayDestIp(event)} />
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {hasMore && (
        <div className="px-3 py-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Show less' : `Show all ${events.length}`}
          </Button>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add src/features/hunt/threats/components/incident-auto-investigation/incident-auto-investigation.card.tsx \
        src/features/analytics/sightings/api/sightings.mocks.ts
git commit -m "feat: add IncidentAutoInvestigationCard component"
```

---

### Task 6: `IncidentAutoInvestigation` Component (TDD)

**Files:**
- Create: `src/features/hunt/threats/components/incident-auto-investigation/incident-auto-investigation.tsx`
- Create: `src/features/hunt/threats/components/incident-auto-investigation/incident-auto-investigation.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/features/hunt/threats/components/incident-auto-investigation/incident-auto-investigation.test.tsx
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import {
  makeNrdEvent,
  makeLateralEvent,
} from '@/features/hunt/events/api/events.mocks';
import { makeSightingApiEvent } from '@/features/analytics/sightings/api/sightings.mocks';

import { IncidentAutoInvestigation } from './incident-auto-investigation';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

const mockIncident = {
  id: 1,
  status: 'new' as const,
  tenant: 1,
  first_seen: '2026-01-12T00:00:00Z',
  last_seen: '2026-01-15T00:00:00Z',
  close_status_date: '2026-01-16T00:00:00Z',
  kill_chain: 'exploitation' as const,
  kill_chain_offender: 'exploitation' as const,
  threat_id: 42,
  asset: '192.168.1.5',
  is_offender: false,
};

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

// Silence all 5 sources by default
beforeEach(() => {
  server.use(
    http.get(baseUrl + '/rules/es/alerts_tail', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.get(baseUrl + '/rules/es/events_tail/', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.get(baseUrl + '/appliances/es_discovery_events/', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

const renderComponent = () =>
  renderWithProviders(
    <IncidentAutoInvestigation incident={mockIncident} />,
    { router: createTestRouter() },
  );

describe('IncidentAutoInvestigation', () => {
  it('shows loading skeleton while queries are in flight', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json(emptyPaginated);
      }),
    );
    renderWithProviders(<IncidentAutoInvestigation incident={mockIncident} />, {
      router: createTestRouter(),
    });
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('shows empty state when all sources return no events', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/no investigation data/i)).toBeInTheDocument();
    });
  });

  it('shows error state when all 5 sources fail', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () => HttpResponse.error()),
      http.get(baseUrl + '/rules/es/events_tail/', () => HttpResponse.error()),
      http.get(baseUrl + '/appliances/es_discovery_events/', () =>
        HttpResponse.error(),
      ),
    );
    await renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText(/failed to load investigation data/i),
      ).toBeInTheDocument();
    });
  });

  it('renders a card for each consecutive group', async () => {
    const nrd1 = makeNrdEvent({ _id: 'n1', timestamp: '2026-01-12T08:00:00Z' });
    const nrd2 = makeNrdEvent({ _id: 'n2', timestamp: '2026-01-12T09:00:00Z' });
    const lateral = makeLateralEvent({ timestamp: '2026-01-12T15:00:00Z' });

    // NRD and Lateral both come from alerts_tail; differentiate by qfilter
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter') ?? '';
        if (qfilter.includes('stamus.nrd')) {
          return HttpResponse.json({
            count: 2,
            next: null,
            previous: null,
            results: [nrd1, nrd2],
          });
        }
        if (qfilter.includes('smb_lateral')) {
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [lateral],
          });
        }
        return HttpResponse.json(emptyPaginated);
      }),
    );

    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText('NRD')).toBeInTheDocument();
      expect(screen.getByText('Lateral')).toBeInTheDocument();
    });
    // NRD group has 2 events
    expect(screen.getByText('2 events')).toBeInTheDocument();
  });

  it('shows partial results when only some sources succeed', async () => {
    // Only sightings succeed; all alert sources fail
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () => HttpResponse.error()),
      http.get(baseUrl + '/appliances/es_discovery_events/', () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [makeSightingApiEvent()],
        }),
      ),
    );
    await renderComponent();
    // Should show Sightings card, not error state
    await waitFor(() => {
      expect(screen.getByText('Sightings')).toBeInTheDocument();
    });
    expect(
      screen.queryByText(/failed to load investigation data/i),
    ).not.toBeInTheDocument();
  });

  it('"Show all" button reveals rows beyond 5', async () => {
    // Create 7 NRD events
    const nrdEvents = Array.from({ length: 7 }, (_, i) =>
      makeNrdEvent({
        _id: `nrd-${i}`,
        timestamp: `2026-01-12T0${i + 8}:00:00Z`,
        dns: { type: 'query', rrname: `domain-${i}.io`, id: i, tx_id: i },
      }),
    );
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter') ?? '';
        if (qfilter.includes('stamus.nrd')) {
          return HttpResponse.json({
            count: 7,
            next: null,
            previous: null,
            results: nrdEvents,
          });
        }
        return HttpResponse.json(emptyPaginated);
      }),
    );

    await renderComponent();

    // Wait for NRD card to appear
    await waitFor(() => {
      expect(screen.getByText('Show all 7')).toBeInTheDocument();
    });

    // Only 5 domains visible before expanding
    expect(screen.queryByText('domain-6.io')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Show all 7'));
    expect(screen.getByText('domain-6.io')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
pnpm vitest run src/features/hunt/threats/components/incident-auto-investigation/incident-auto-investigation.test.tsx
```

Expected: `FAIL` — module not found

- [ ] **Step 3: Implement the component**

```typescript
// src/features/hunt/threats/components/incident-auto-investigation/incident-auto-investigation.tsx
import { Column } from '@/common/design-system/atoms/layout/column';
import { ThreatStatus } from '../../model/threat-status.schema';
import { useIncidentAutoInvestigation } from '../../hooks/use-incident-auto-investigation';
import { IncidentAutoInvestigationCard } from './incident-auto-investigation.card';

export const IncidentAutoInvestigation = ({
  incident,
}: {
  incident: ThreatStatus;
}) => {
  const { groups, isLoading, isError, isEmpty } =
    useIncidentAutoInvestigation(incident);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-sm text-destructive">
        Failed to load investigation data.
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No investigation data found for this incident.
      </div>
    );
  }

  return (
    <Column className="gap-2 p-2">
      {groups.map((group, idx) => (
        <IncidentAutoInvestigationCard key={`${group.type}-${idx}`} group={group} />
      ))}
    </Column>
  );
};
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
pnpm vitest run src/features/hunt/threats/components/incident-auto-investigation/incident-auto-investigation.test.tsx
```

Expected: all 6 tests `PASS`

- [ ] **Step 5: Commit**

```bash
git add src/features/hunt/threats/components/incident-auto-investigation/
git commit -m "feat: add IncidentAutoInvestigation component with tests"
```

---

## Chunk 4: Tab Shell + Page Wiring

### Task 7: `IncidentExpandedRow` Tab Shell (TDD)

**Files:**
- Create: `src/features/hunt/threats/components/incident-expanded-row.tsx`
- Create: `src/features/hunt/threats/components/incident-expanded-row.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
// src/features/hunt/threats/components/incident-expanded-row.test.tsx
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';

import { IncidentExpandedRow } from './incident-expanded-row';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

const mockIncident = {
  id: 1,
  status: 'new' as const,
  tenant: 1,
  first_seen: '2026-01-12T00:00:00Z',
  last_seen: '2026-01-15T00:00:00Z',
  close_status_date: '2026-01-16T00:00:00Z',
  kill_chain: 'exploitation' as const,
  kill_chain_offender: 'exploitation' as const,
  threat_id: 42,
  asset: '192.168.1.5',
  is_offender: false,
};

const emptyPaginated = { count: 0, next: null, previous: null, results: [] };

beforeEach(() => {
  server.use(
    http.get(baseUrl + '/rules/es/alerts_tail', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.get(baseUrl + '/rules/es/events_tail/', () =>
      HttpResponse.json(emptyPaginated),
    ),
    http.get(baseUrl + '/appliances/es_discovery_events/', () =>
      HttpResponse.json(emptyPaginated),
    ),
  );
});

const renderComponent = () =>
  renderWithProviders(
    <IncidentExpandedRow incident={mockIncident} />,
    { router: createTestRouter() },
  );

describe('IncidentExpandedRow', () => {
  it('shows Auto Investigation tab by default', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(
        screen.getByRole('tab', { name: /auto investigation/i }),
      ).toHaveAttribute('data-state', 'active');
    });
  });

  it('switches to Detection Methods tab on click', async () => {
    await renderComponent();
    const detectionTab = screen.getByRole('tab', { name: /detection methods/i });
    await userEvent.click(detectionTab);
    await waitFor(() => {
      expect(detectionTab).toHaveAttribute('data-state', 'active');
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
pnpm vitest run src/features/hunt/threats/components/incident-expanded-row.test.tsx
```

Expected: `FAIL` — module not found

- [ ] **Step 3: Implement the tab shell**

```typescript
// src/features/hunt/threats/components/incident-expanded-row.tsx
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { ThreatStatus } from '../model/threat-status.schema';
import { IncidentDetectionMethods } from './incident-detection-methods/incident-detection-methods';
import { IncidentAutoInvestigation } from './incident-auto-investigation/incident-auto-investigation';

export const IncidentExpandedRow = ({
  incident,
}: {
  incident: ThreatStatus;
}) => (
  <Tabs defaultValue="auto-investigation" className="p-2">
    <TabsList>
      <TabsTrigger value="auto-investigation">Auto Investigation</TabsTrigger>
      <TabsTrigger value="detection-methods">Detection Methods</TabsTrigger>
    </TabsList>
    <TabsContent value="auto-investigation">
      <IncidentAutoInvestigation incident={incident} />
    </TabsContent>
    <TabsContent value="detection-methods">
      <IncidentDetectionMethods incident={incident} />
    </TabsContent>
  </Tabs>
);
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
pnpm vitest run src/features/hunt/threats/components/incident-expanded-row.test.tsx
```

Expected: both tests `PASS`

- [ ] **Step 5: Commit**

```bash
git add src/features/hunt/threats/components/incident-expanded-row.tsx \
        src/features/hunt/threats/components/incident-expanded-row.test.tsx
git commit -m "feat: add IncidentExpandedRow tab shell with tests"
```

---

### Task 8: Wire Up Pages + Cleanup

**Files:**
- Modify: `src/pages/threats/incidents/index.tsx`
- Modify: `src/pages/hosts/[hostId]/incidents/index.tsx`
- Delete: `src/pages/hosts/[hostId]/incidents/threat-status.expanded-row.tsx`

- [ ] **Step 1: Add `ExpandedRow` to the Threats/Incidents page**

In `src/pages/threats/incidents/index.tsx`, add the import at the top:

```typescript
import { IncidentExpandedRow } from '@/features/hunt/threats/components/incident-expanded-row';
```

Then add `ExpandedRow` to the `<DataTable>` (note: `onRowClick` stays — it fires on row body click, the chevron expander is separate):

```diff
       <DataTable
         data={data}
         isLoading={isFetching}
         columns={threatIncidentsColumns}
+        ExpandedRow={({ row }) => <IncidentExpandedRow incident={row.original} />}
         pagination={pagination}
```

- [ ] **Step 2: Replace `ThreatStatusExpandedRow` in the host detail page**

In `src/pages/hosts/[hostId]/incidents/index.tsx`:

1. Remove the import:
```diff
-import { ThreatStatusExpandedRow } from './threat-status.expanded-row';
```

2. Add the new import:
```diff
+import { IncidentExpandedRow } from '@/features/hunt/threats/components/incident-expanded-row';
```

3. Replace the `ExpandedRow` prop on `<DataTable>`:
```diff
-       ExpandedRow={ThreatStatusExpandedRow}
+       ExpandedRow={({ row }) => <IncidentExpandedRow incident={row.original} />}
```

- [ ] **Step 3: Delete the old expanded row file**

```bash
git rm src/pages/hosts/\[hostId\]/incidents/threat-status.expanded-row.tsx
```

- [ ] **Step 4: Run lint and type-check**

```bash
pnpm run lint --fix
pnpm run check
```

Expected: no errors

- [ ] **Step 5: Run the full test suite**

```bash
pnpm vitest run
```

Expected: all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/pages/threats/incidents/index.tsx \
        src/pages/hosts/\[hostId\]/incidents/index.tsx
git commit -m "feat: wire IncidentExpandedRow into incident tables"
```
