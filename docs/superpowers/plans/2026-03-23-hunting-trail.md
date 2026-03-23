# Hunting Trail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract auto-investigation into a standalone "Hunting Trail" use-case, wire it into the Impacted Entities expanded row and host details page, and remove the incident expanded row.

**Architecture:** Create `threats/compromises/use-cases/hunting-trail/` with model, hook, utils, and UI components. The `HuntingTrail` component takes only `asset: string` and reads global dates internally. Consumers pass the host IP; the component handles the rest.

**Tech Stack:** React, TanStack Router, RTK Query, vitest, react-testing-library, msw

**Spec:** `docs/superpowers/specs/2026-03-23-hunting-trail-design.md`

---

### Task 1: Create hunting-trail model

**Files:**
- Create: `src/features/threats/compromises/use-cases/hunting-trail/hunting-trail.model.ts`
- Reference: `src/features/threats/common/incident-auto-investigation.model.ts`

- [ ] **Step 1: Create the model file**

Copy types from the old model, update the import path for `Event`:

```ts
import { Event } from '@/features/events/common/events.model';

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

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm run check 2>&1 | grep -i 'hunting-trail.model' || echo "No errors"`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/threats/compromises/use-cases/hunting-trail/hunting-trail.model.ts
git commit -m "feat: add hunting trail model types"
```

---

### Task 2: Move aggregate-timeline-events utility

**Files:**
- Create: `src/features/threats/compromises/use-cases/hunting-trail/utils/aggregate-timeline-events.ts`
- Create: `src/features/threats/compromises/use-cases/hunting-trail/utils/aggregate-timeline-events.test.ts`
- Reference: `src/features/threats/common/utils/aggregate-timeline-events.ts`
- Reference: `src/features/threats/common/utils/aggregate-timeline-events.test.ts`

- [ ] **Step 1: Create the utility file**

Same logic, updated import path:

```ts
import {
  TaggedEvent,
  TIMELINE_TYPE_PRIORITY,
  TimelineGroup,
} from '../hunting-trail.model';

export function aggregateTimelineEvents(
  events: TaggedEvent[],
): TimelineGroup[] {
  const sorted = [...events].sort((a, b) => {
    const tA = new Date(a.timestamp).getTime();
    const tB = new Date(b.timestamp).getTime();
    if (tA !== tB) return tA - tB;
    return (
      TIMELINE_TYPE_PRIORITY[a.timelineType] -
      TIMELINE_TYPE_PRIORITY[b.timelineType]
    );
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

- [ ] **Step 2: Create the test file**

Same tests, updated imports:

```ts
import { describe, expect, it } from 'vitest';

import {
  makeFileEvent,
  makeHuntingEvent,
  makeLateralEvent,
  makeNrdEvent,
  makeSightingEvent,
} from '@/features/events/common/events.mocks';

import { TaggedEvent } from '../hunting-trail.model';
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
      tag(makeFileEvent({ timestamp: '2026-01-12T10:00:00Z' }), 'file'),
      tag(makeHuntingEvent({ timestamp: '2026-01-12T11:00:00Z' }), 'hunting'),
      tag(makeHuntingEvent({ _id: 'c', timestamp: '2026-01-12T12:00:00Z' }), 'hunting'),
      tag(makeLateralEvent({ timestamp: '2026-01-12T13:00:00Z' }), 'lateral'),
      tag(makeSightingEvent({ _id: 'd', timestamp: '2026-01-12T14:00:00Z' }), 'sightings'),
      tag(makeSightingEvent({ _id: 'e', timestamp: '2026-01-12T15:00:00Z' }), 'sightings'),
      tag(makeSightingEvent({ _id: 'f', timestamp: '2026-01-12T16:00:00Z' }), 'sightings'),
      tag(makeHuntingEvent({ _id: 'g', timestamp: '2026-01-12T17:00:00Z' }), 'hunting'),
    ];
    const groups = aggregateTimelineEvents(events);
    expect(groups.map((g) => `${g.type}×${g.events.length}`)).toEqual([
      'sightings×2',
      'file×1',
      'hunting×2',
      'lateral×1',
      'sightings×3',
      'hunting×1',
    ]);
  });

  it('sorts events by timestamp before grouping', () => {
    const events = [
      tag(makeNrdEvent({ _id: 'b', timestamp: '2026-01-12T09:00:00Z' }), 'nrd'),
      tag(makeLateralEvent({ timestamp: '2026-01-12T10:00:00Z' }), 'lateral'),
      tag(makeNrdEvent({ _id: 'a', timestamp: '2026-01-12T08:00:00Z' }), 'nrd'),
    ];
    const groups = aggregateTimelineEvents(events);
    expect(groups).toHaveLength(2);
    expect(groups[0].type).toBe('nrd');
    expect(groups[0].events).toHaveLength(2);
    expect(groups[1].type).toBe('lateral');
  });

  it('uses type-priority as a tie-breaker for identical timestamps', () => {
    const ts = '2026-01-12T08:00:00Z';
    const events = [
      tag(makeHuntingEvent({ _id: 'h', timestamp: ts }), 'hunting'),
      tag(makeNrdEvent({ _id: 'n', timestamp: ts }), 'nrd'),
    ];
    const groups = aggregateTimelineEvents(events);
    expect(groups[0].type).toBe('nrd');
    expect(groups[1].type).toBe('hunting');
  });
});
```

- [ ] **Step 3: Run tests**

Run: `pnpm vitest run src/features/threats/compromises/use-cases/hunting-trail/utils/aggregate-timeline-events.test.ts`
Expected: All 6 tests pass

- [ ] **Step 4: Commit**

```bash
git add src/features/threats/compromises/use-cases/hunting-trail/utils/
git commit -m "feat: add hunting trail aggregate-timeline-events utility"
```

---

### Task 3: Create useHuntingTrail hook (TDD)

**Files:**
- Create: `src/features/threats/compromises/use-cases/hunting-trail/hooks/use-hunting-trail.ts`
- Create: `src/features/threats/compromises/use-cases/hunting-trail/hooks/use-hunting-trail.test.ts`

- [ ] **Step 1: Write the test file**

Refactored from the old hook test — takes `{ asset, startDate, endDate }` instead of `ThreatStatus`:

```ts
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/events/common/events.api', () => ({
  useGetEventsQuery: vi.fn(),
  useGetEventsTailQuery: vi.fn(),
}));
vi.mock('@/features/events/sightings/common/sightings.api', () => ({
  useGetSightingEventsQuery: vi.fn(),
}));

import {
  useGetEventsQuery,
  useGetEventsTailQuery,
} from '@/features/events/common/events.api';
import { makeNrdEvent } from '@/features/events/common/events.mocks';
import { useGetSightingEventsQuery } from '@/features/events/sightings/common/sightings.api';

import { useHuntingTrail } from './use-hunting-trail';

const mockUseGetEventsQuery = vi.mocked(useGetEventsQuery);
const mockUseGetEventsTailQuery = vi.mocked(useGetEventsTailQuery);
const mockUseGetSightingEventsQuery = vi.mocked(useGetSightingEventsQuery);

const params = {
  asset: '192.168.1.5',
  startDate: new Date('2026-01-12T00:00:00Z').getTime(),
  endDate: new Date('2026-01-15T00:00:00Z').getTime(),
};

const emptyResult = {
  data: { results: [], count: 0 },
  isLoading: false,
  isFetching: false,
  isError: false,
} as unknown as ReturnType<typeof useGetEventsQuery>;

const loadingResult = {
  data: undefined,
  isLoading: true,
  isFetching: true,
  isError: false,
} as unknown as ReturnType<typeof useGetEventsQuery>;

const errorResult = {
  data: undefined,
  isLoading: false,
  isFetching: false,
  isError: true,
} as unknown as ReturnType<typeof useGetEventsQuery>;

describe('useHuntingTrail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isLoading: true when any query is still loading', () => {
    mockUseGetEventsQuery
      .mockReturnValueOnce(loadingResult)
      .mockReturnValueOnce(emptyResult)
      .mockReturnValueOnce(emptyResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);
    mockUseGetSightingEventsQuery.mockReturnValue(
      emptyResult as unknown as ReturnType<typeof useGetSightingEventsQuery>,
    );

    const { result } = renderHook(() => useHuntingTrail(params));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isEmpty).toBe(false);
  });

  it('returns isError: true only when ALL 5 queries have failed', () => {
    mockUseGetEventsQuery.mockReturnValue(errorResult);
    mockUseGetEventsTailQuery.mockReturnValue(errorResult);
    mockUseGetSightingEventsQuery.mockReturnValue(
      errorResult as unknown as ReturnType<typeof useGetSightingEventsQuery>,
    );

    const { result } = renderHook(() => useHuntingTrail(params));

    expect(result.current.isError).toBe(true);
    expect(result.current.isEmpty).toBe(false);
  });

  it('does not return isError: true when only some queries have failed', () => {
    mockUseGetEventsQuery
      .mockReturnValueOnce(errorResult)
      .mockReturnValueOnce(emptyResult)
      .mockReturnValueOnce(emptyResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);
    mockUseGetSightingEventsQuery.mockReturnValue(
      emptyResult as unknown as ReturnType<typeof useGetSightingEventsQuery>,
    );

    const { result } = renderHook(() => useHuntingTrail(params));

    expect(result.current.isError).toBe(false);
  });

  it('returns isEmpty: true when all queries succeed with no results', () => {
    mockUseGetEventsQuery.mockReturnValue(emptyResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);
    mockUseGetSightingEventsQuery.mockReturnValue(
      emptyResult as unknown as ReturnType<typeof useGetSightingEventsQuery>,
    );

    const { result } = renderHook(() => useHuntingTrail(params));

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('returns isEmpty: false when there are results', () => {
    const withResults = {
      ...emptyResult,
      data: { results: [makeNrdEvent()], count: 1 },
    } as unknown as ReturnType<typeof useGetEventsQuery>;

    mockUseGetEventsQuery
      .mockReturnValueOnce(withResults)
      .mockReturnValueOnce(emptyResult)
      .mockReturnValueOnce(emptyResult);
    mockUseGetEventsTailQuery.mockReturnValue(emptyResult);
    mockUseGetSightingEventsQuery.mockReturnValue(
      emptyResult as unknown as ReturnType<typeof useGetSightingEventsQuery>,
    );

    const { result } = renderHook(() => useHuntingTrail(params));

    expect(result.current.isEmpty).toBe(false);
    expect(result.current.groups.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/features/threats/compromises/use-cases/hunting-trail/hooks/use-hunting-trail.test.ts`
Expected: FAIL — `useHuntingTrail` not found

- [ ] **Step 3: Write the hook implementation**

```ts
import { esEscape } from '@/common/lib/strings';
import {
  useGetEventsQuery,
  useGetEventsTailQuery,
} from '@/features/events/common/events.api';
import { useGetSightingEventsQuery } from '@/features/events/sightings/common/sightings.api';

import { TaggedEvent } from '../hunting-trail.model';
import { aggregateTimelineEvents } from '../utils/aggregate-timeline-events';

interface UseHuntingTrailParams {
  asset: string;
  startDate: number;
  endDate: number;
}

export function useHuntingTrail({ asset, startDate, endDate }: UseHuntingTrailParams) {
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
  const isError = queries.every((q) => q.isError);

  const taggedEvents: TaggedEvent[] = [
    ...(nrd.data?.results ?? []).map((e) => ({
      ...e,
      timelineType: 'nrd' as const,
    })),
    ...(sightings.data?.results ?? []).map((e) => ({
      ...e,
      timelineType: 'sightings' as const,
    })),
    ...(file.data?.results ?? []).map((e) => ({
      ...e,
      timelineType: 'file' as const,
    })),
    ...(lateral.data?.results ?? []).map((e) => ({
      ...e,
      timelineType: 'lateral' as const,
    })),
    ...(hunting.data?.results ?? []).map((e) => ({
      ...e,
      timelineType: 'hunting' as const,
    })),
  ];

  const groups = aggregateTimelineEvents(taggedEvents);

  return {
    groups,
    isLoading,
    isError,
    isEmpty: !isLoading && groups.length === 0 && !isError,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/features/threats/compromises/use-cases/hunting-trail/hooks/use-hunting-trail.test.ts`
Expected: All 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/features/threats/compromises/use-cases/hunting-trail/hooks/
git commit -m "feat: add useHuntingTrail hook"
```

---

### Task 4: Create HuntingTrailCard component

**Files:**
- Create: `src/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail-card.tsx`
- Reference: `src/features/threats/compromises/use-cases/incidents/entities/incident-auto-investigation/incident-auto-investigation.card.tsx`

- [ ] **Step 1: Create the card component**

Copy `incident-auto-investigation.card.tsx`, rename exports, update model import. The component is a pure presentational component — no hooks, just props.

Changes from the original:
- Rename `IncidentAutoInvestigationCard` → `HuntingTrailCard`
- Update import: `from '../hunting-trail.model'` instead of the old model path

The full file is identical to `incident-auto-investigation.card.tsx` except:
- Line 7: `import { TimelineEventType, TimelineGroup } from '@/features/threats/common/incident-auto-investigation.model';` → `import { TimelineEventType, TimelineGroup } from '../hunting-trail.model';`
- Line 46: `export const IncidentAutoInvestigationCard` → `export const HuntingTrailCard`

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm run check 2>&1 | grep -i 'hunting-trail-card' || echo "No errors"`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail-card.tsx
git commit -m "feat: add HuntingTrailCard component"
```

---

### Task 5: Create HuntingTrail component (TDD)

**Files:**
- Create: `src/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail.tsx`
- Create: `src/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail.test.tsx`

- [ ] **Step 1: Write the test file**

Adapted from `incident-auto-investigation.test.tsx`. Key change: renders `<HuntingTrail asset="192.168.1.5" />` instead of passing a `ThreatStatus`. The component reads global dates internally via `useGlobalQueryParams`, so tests need to set up the URL with date params.

```tsx
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
  makeLateralEvent,
  makeNrdEvent,
} from '@/features/events/common/events.mocks';
import { makeSightingApiEvent } from '@/features/events/sightings/common/sightings.mocks';

import { HuntingTrail } from './hunting-trail';

const createTestRouter = () =>
  createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

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
  renderWithProviders(<HuntingTrail asset="192.168.1.5" />, {
    router: createTestRouter(),
  });

describe('HuntingTrail', () => {
  it('shows loading skeleton while queries are in flight', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', async () => {
        await new Promise(() => {});
        return HttpResponse.json(emptyPaginated);
      }),
    );
    renderWithProviders(<HuntingTrail asset="192.168.1.5" />);
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('shows empty state when all sources return no events', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/no hunting trail data/i)).toBeInTheDocument();
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
        screen.getByText(/failed to load hunting trail data/i),
      ).toBeInTheDocument();
    });
  });

  it('renders a card for each consecutive group', async () => {
    const nrd1 = makeNrdEvent({ _id: 'n1', timestamp: '2026-01-12T08:00:00Z' });
    const nrd2 = makeNrdEvent({ _id: 'n2', timestamp: '2026-01-12T09:00:00Z' });
    const lateral = makeLateralEvent({ timestamp: '2026-01-12T15:00:00Z' });

    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter') ?? '';
        if (qfilter.includes('stamus.nrd')) {
          return HttpResponse.json({
            count: 2, next: null, previous: null, results: [nrd1, nrd2],
          });
        }
        if (qfilter.includes('smb_lateral')) {
          return HttpResponse.json({
            count: 1, next: null, previous: null, results: [lateral],
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
    expect(screen.getByText('2 events')).toBeInTheDocument();
  });

  it('shows partial results when only some sources succeed', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () => HttpResponse.error()),
      http.get(baseUrl + '/appliances/es_discovery_events/', () =>
        HttpResponse.json({
          count: 1, next: null, previous: null, results: [makeSightingApiEvent()],
        }),
      ),
    );
    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Sightings')).toBeInTheDocument();
    });
    expect(
      screen.queryByText(/failed to load hunting trail data/i),
    ).not.toBeInTheDocument();
  });

  it('"Show all" button reveals rows beyond 5', async () => {
    const nrdEvents = Array.from({ length: 7 }, (_, i) => {
      const hour = String(i + 8).padStart(2, '0');
      return makeNrdEvent({
        _id: `nrd-${i}`,
        timestamp: `2026-01-12T${hour}:00:00Z`,
        hostname_info: {
          domain: `domain-${i}.io`,
          host: `domain-${i}.io`,
          url: `http://domain-${i}.io`,
          tld: 'io',
          subdomain: '',
          domain_without_tld: `domain-${i}`,
        },
      });
    });
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter') ?? '';
        if (qfilter.includes('stamus.nrd')) {
          return HttpResponse.json({
            count: 7, next: null, previous: null, results: nrdEvents,
          });
        }
        return HttpResponse.json(emptyPaginated);
      }),
    );

    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Show all 7')).toBeInTheDocument();
    });
    expect(screen.queryByText('domain-6.io')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Show all 7'));
    expect(screen.getByText('domain-6.io')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail.test.tsx`
Expected: FAIL — `HuntingTrail` not found

- [ ] **Step 3: Write the component**

```tsx
import { Column } from '@/common/design-system/atoms/layout/column';
import { ScrollArea } from '@/common/design-system/atoms/ui/scroll-area';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

import { useHuntingTrail } from '../hooks/use-hunting-trail';
import { HuntingTrailCard } from './hunting-trail-card';

interface HuntingTrailProps {
  asset: string;
}

export const HuntingTrail = ({ asset }: HuntingTrailProps) => {
  const { start_date, end_date } = useGlobalQueryParams(['dates']);
  const { groups, isLoading, isError, isEmpty } = useHuntingTrail({
    asset,
    startDate: start_date,
    endDate: end_date,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-muted h-16 animate-pulse rounded-md"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive p-4 text-sm">
        Failed to load hunting trail data.
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="text-muted-foreground p-4 text-sm">
        No hunting trail data found for this host.
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[800px]">
      <Column className="gap-2 p-2">
        {groups.map((group, idx) => (
          <HuntingTrailCard
            key={`${group.type}-${group.startTime}-${idx}`}
            group={group}
          />
        ))}
      </Column>
    </ScrollArea>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail.test.tsx`
Expected: All 6 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/features/threats/compromises/use-cases/hunting-trail/entities/
git commit -m "feat: add HuntingTrail component"
```

---

### Task 6: Wire into Impacted Entities expanded row

**Files:**
- Modify: `src/features/threats/common/molecules/impacted-entities-table/impacted-asstets-table.expanded-row.tsx`

- [ ] **Step 1: Add the Hunting Trail tab**

Add `HuntingTrail` import and a new tab between "Threats" and "Host Insights" for `doc` type.

In the imports section, add:
```tsx
import { HuntingTrail } from '@/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail';
```

After the `<TabsTrigger value="threats">` block (line 32-34), add for `doc` type:
```tsx
          {type === 'doc' && (
            <TabsTrigger value="hunting-trail">Hunting Trail</TabsTrigger>
          )}
```

After the `<TabsContent value="threats">` block (line 47-52), add for `doc` type:
```tsx
        {type === 'doc' && (
          <TabsContent value="hunting-trail">
            <HuntingTrail asset={row.original.value} />
          </TabsContent>
        )}
```

Full resulting tab order for `doc`: Timeline, Attacker infrastructure, Threats, **Hunting Trail**, Host Insights.

- [ ] **Step 2: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/threats/common/molecules/impacted-entities-table/impacted-asstets-table.expanded-row.tsx
git commit -m "feat: add Hunting Trail tab to Impacted Entities expanded row"
```

---

### Task 7: Wire into host details page

**Files:**
- Create: `src/routes/_enterprise/hosts/$hostId/hunting-trail.tsx`
- Modify: `src/routes/_enterprise/hosts/$hostId/route.tsx`

- [ ] **Step 1: Create the route file**

Follow the pattern from `incidents.tsx` but simpler — no pagination needed:

```tsx
import { createFileRoute, useParams } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HuntingTrail } from '@/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail';

export const Route = createFileRoute(
  '/_enterprise/hosts/$hostId/hunting-trail',
)({
  component: () => (
    <PageBoundary key="host-hunting-trail">
      <HostHuntingTrailTab />
    </PageBoundary>
  ),
});

function HostHuntingTrailTab() {
  const { hostId } = useParams({ strict: false }) as { hostId: string };
  return <HuntingTrail asset={hostId} />;
}
```

- [ ] **Step 2: Add tab link to host layout**

In `src/routes/_enterprise/hosts/$hostId/route.tsx`, after the Incidents tab trigger (ends around line 265), add:

```tsx
              <TabsTrigger
                value={`/hosts/${hostId}/hunting-trail`}
                asChild
              >
                <Link
                  to="/hosts/$hostId/hunting-trail"
                  params={{ hostId }}
                >
                  Hunting Trail
                </Link>
              </TabsTrigger>
```

No badge count — unlike other tabs, hunting trail aggregates multiple sources and a single count wouldn't be meaningful.

- [ ] **Step 3: Regenerate route tree and verify**

Run: `pnpm run lint --fix && pnpm run check`
Expected: `routeTree.gen.ts` is regenerated. No errors.

- [ ] **Step 4: Commit**

```bash
git add src/routes/_enterprise/hosts/\$hostId/hunting-trail.tsx src/routes/_enterprise/hosts/\$hostId/route.tsx src/routeTree.gen.ts
git commit -m "feat: add Hunting Trail tab to host details page"
```

---

### Task 8: Clean up incidents table

**Files:**
- Modify: `src/features/threats/compromises/use-cases/incidents/incidents.table.tsx`
- Modify: `src/features/threats/compromises/use-cases/incidents/entities/incidents-table.tsx`
- Modify: `src/features/host-insights/use-cases/host-details/entities/host-incidents/host-incidents-table.tsx`

- [ ] **Step 1: Remove expander column from incidents.table.tsx**

Remove the `DataTableRowExpander` import (line 3), `Row as TanstackRow` import (line 1), and `ThreatStatus` import (line 4). Remove the expander column object (lines 8-15). The file should become:

```tsx
import { threatStatusColumnDefs } from '@/features/threats/common/molecules/threat-status-columns';

export const threatIncidentsColumns = [
  { ...threatStatusColumnDefs.first_seen, enableSorting: true },
  threatStatusColumnDefs.entity,
  threatStatusColumnDefs.role,
  threatStatusColumnDefs.threat,
  { ...threatStatusColumnDefs.kill_chain, visible: true },
  threatStatusColumnDefs.network_info,
  { ...threatStatusColumnDefs.last_seen, enableSorting: true },
];
```

- [ ] **Step 2: Remove ExpandedRow from incidents-table.tsx**

Remove the `IncidentExpandedRow` import (line 37) and the `ExpandedRow` prop (line 129):
```tsx
      ExpandedRow={({ row }) => <IncidentExpandedRow incident={row.original} />}
```

- [ ] **Step 3: Remove ExpandedRow from host-incidents-table.tsx**

Remove the `IncidentExpandedRow` import (line 11) and the `ExpandedRow` prop (lines 65-67):
```tsx
        ExpandedRow={({ row }) => (
          <IncidentExpandedRow incident={row.original} />
        )}
```

- [ ] **Step 4: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/features/threats/compromises/use-cases/incidents/ src/features/host-insights/use-cases/host-details/entities/host-incidents/host-incidents-table.tsx
git commit -m "fix: remove incident expanded row from incidents tables"
```

---

### Task 9: Delete old files and final verification

**Files:**
- Delete: `src/features/threats/compromises/use-cases/incidents/entities/incident-expanded-row.tsx`
- Delete: `src/features/threats/compromises/use-cases/incidents/entities/incident-expanded-row.test.tsx`
- Delete: `src/features/threats/compromises/use-cases/incidents/entities/incident-auto-investigation/` (entire dir)
- Delete: `src/features/threats/compromises/use-cases/incidents/entities/incident-detection-methods/` (entire dir)
- Delete: `src/features/threats/common/incident-auto-investigation.model.ts`
- Delete: `src/features/threats/common/hooks/use-incident-auto-investigation.ts`
- Delete: `src/features/threats/common/hooks/use-incident-auto-investigation.test.ts`
- Delete: `src/features/threats/common/utils/aggregate-timeline-events.ts`
- Delete: `src/features/threats/common/utils/aggregate-timeline-events.test.ts`

- [ ] **Step 1: Delete all old files**

```bash
git rm src/features/threats/compromises/use-cases/incidents/entities/incident-expanded-row.tsx
git rm src/features/threats/compromises/use-cases/incidents/entities/incident-expanded-row.test.tsx
git rm -r src/features/threats/compromises/use-cases/incidents/entities/incident-auto-investigation/
git rm -r src/features/threats/compromises/use-cases/incidents/entities/incident-detection-methods/
git rm src/features/threats/common/incident-auto-investigation.model.ts
git rm src/features/threats/common/hooks/use-incident-auto-investigation.ts
git rm src/features/threats/common/hooks/use-incident-auto-investigation.test.ts
git rm src/features/threats/common/utils/aggregate-timeline-events.ts
git rm src/features/threats/common/utils/aggregate-timeline-events.test.ts
```

- [ ] **Step 2: Verify no dangling imports**

Run: `grep -r 'incident-auto-investigation\|incident-expanded-row\|IncidentExpandedRow\|IncidentAutoInvestigation\|IncidentDetectionMethods\|use-incident-auto-investigation' src/ --include='*.ts' --include='*.tsx'`
Expected: No matches

- [ ] **Step 3: Run full quality checks**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 4: Run all hunting trail tests**

Run: `pnpm vitest run src/features/threats/compromises/use-cases/hunting-trail/`
Expected: All tests pass (utils: 6, hook: 5, component: 6 = 17 total)

- [ ] **Step 5: Commit**

```bash
git add -u
git commit -m "chore: delete old incident auto-investigation and detection methods files"
```
