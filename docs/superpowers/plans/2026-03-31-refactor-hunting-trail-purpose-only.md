# Refactor Hunting Trail: Purpose Grouping Only

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strip the hunting trail feature down to purpose-grouping only, consolidate all shared code in `@src/features/hunting-trail/`, and provide thin data-fetching entities for compromise and host-insights consumers.

**Architecture:** The feature folder owns models, hooks, molecules, and templates. Consumer features (compromise, host-insights) each have a single thin entity that wires up `useHostHuntingTrail` + `PurposeAggregated`. The standalone network page remains unchanged (it already lives in the feature folder with its own hook and context).

**Tech Stack:** React, RTK Query, TanStack Router, Vitest, React Testing Library, MSW

---

## File Map

### Feature folder — files to CREATE or MOVE

| Action | File | Responsibility |
|--------|------|----------------|
| Move | `src/features/hunting-trail/hooks/use-host-hunting-trail.ts` | Host-scoped data fetching (from `compromises/.../hooks/use-hunting-trail.ts`) |
| Move | `src/features/hunting-trail/hooks/use-host-hunting-trail.test.ts` | Unit tests for the hook |
| Move | `src/features/hunting-trail/entities/purpose-aggregated.tsx` | Purpose-grouped template (from `compromises/.../use-cases/purpose-aggregated.tsx`) |

### Consumer entities — files to CREATE or MODIFY

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail.tsx` | Thin entity: fetch + render PurposeAggregated |
| Rewrite | `src/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail.test.tsx` | Tests for simplified entity |
| Create | `src/features/host-insights/use-cases/host-details/entities/host-hunting-trail/host-hunting-trail.tsx` | Thin entity for host details tab |
| Create | `src/features/host-insights/use-cases/host-details/entities/host-hunting-trail/host-hunting-trail.test.tsx` | Tests for host-insights entity |

### Route updates

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/routes/_enterprise/hosts/$hostId/hunting-trail.tsx` | Import from host-insights entity instead of compromise |

### Files to DELETE

| File | Reason |
|------|--------|
| `src/features/threats/compromises/use-cases/hunting-trail/use-cases/aggregated-timeline.tsx` | Non-purpose view |
| `src/features/threats/compromises/use-cases/hunting-trail/use-cases/query-aggregated.tsx` | Non-purpose view |
| `src/features/threats/compromises/use-cases/hunting-trail/use-cases/flow-aggregated.tsx` | Non-purpose view |
| `src/features/threats/compromises/use-cases/hunting-trail/use-cases/purpose-aggregated.tsx` | Moved to feature folder |
| `src/features/threats/compromises/use-cases/hunting-trail/molecules/hunting-trail-card.tsx` | Used only by aggregated-timeline |
| `src/features/threats/compromises/use-cases/hunting-trail/molecules/card-summary.tsx` | Re-export, no longer needed |
| `src/features/threats/compromises/use-cases/hunting-trail/molecules/card-events-table.tsx` | Re-export, no longer needed |
| `src/features/threats/compromises/use-cases/hunting-trail/utils/aggregate-timeline-events.ts` | Used only by aggregated-timeline |
| `src/features/threats/compromises/use-cases/hunting-trail/utils/aggregate-timeline-events.test.ts` | Test for deleted util |
| `src/features/threats/compromises/use-cases/hunting-trail/hunting-trail.model.ts` | Re-export, no longer needed |
| `src/features/threats/compromises/use-cases/hunting-trail/hooks/use-hunting-trail.ts` | Moved to feature folder |
| `src/features/threats/compromises/use-cases/hunting-trail/hooks/use-hunting-trail.test.ts` | Moved to feature folder |

---

### Task 1: Move host-scoped hook to feature folder

**Files:**
- Create: `src/features/hunting-trail/hooks/use-host-hunting-trail.ts`
- Create: `src/features/hunting-trail/hooks/use-host-hunting-trail.test.ts`

- [ ] **Step 1: Create `use-host-hunting-trail.ts` in feature folder**

Copy from `src/features/threats/compromises/use-cases/hunting-trail/hooks/use-hunting-trail.ts` with updated imports. The only import to fix is the relative model import → absolute feature import.

```tsx
import { esEscape } from '@/common/lib/strings';
import {
  useGetEventsQuery,
  useGetEventsTailQuery,
} from '@/features/events/common/events.api';
import { useGetSightingEventsQuery } from '@/features/events/sightings/common/sightings.api';
import {
  TaggedEvent,
  TimelineEventType,
} from '@/features/hunting-trail/hunting-trail.model';

interface UseHostHuntingTrailParams {
  asset: string;
  startDate: number | undefined;
  endDate: number | undefined;
}

export function useHostHuntingTrail({
  asset,
  startDate,
  endDate,
}: UseHostHuntingTrailParams) {
  // ... exact same body as use-hunting-trail.ts ...
}
```

Changes from the original:
- Rename function `useHuntingTrail` → `useHostHuntingTrail`
- Rename interface `UseHuntingTrailParams` → `UseHostHuntingTrailParams`
- Fix import: `from '../hunting-trail.model'` → `from '@/features/hunting-trail/hunting-trail.model'`

- [ ] **Step 2: Create `use-host-hunting-trail.test.ts` in feature folder**

Copy from `src/features/threats/compromises/use-cases/hunting-trail/hooks/use-hunting-trail.test.ts` with updated imports.

Changes from the original:
- Import `useHostHuntingTrail` from `./use-host-hunting-trail`
- Update all references to the hook name

- [ ] **Step 3: Run the moved tests**

Run: `pnpm vitest run src/features/hunting-trail/hooks/use-host-hunting-trail.test.ts`
Expected: All 5 tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/features/hunting-trail/hooks/use-host-hunting-trail.ts src/features/hunting-trail/hooks/use-host-hunting-trail.test.ts
git commit -m "refactor(hunting-trail): move host-scoped hook to feature folder"
```

---

### Task 2: Move PurposeAggregated template to feature folder

**Files:**
- Create: `src/features/hunting-trail/entities/purpose-aggregated.tsx`

- [ ] **Step 1: Create `purpose-aggregated.tsx` in feature entities**

Copy from `src/features/threats/compromises/use-cases/hunting-trail/use-cases/purpose-aggregated.tsx` with absolute imports (they're already absolute in the original).

The file is an exact copy — imports already use `@/features/hunting-trail/...`:

```tsx
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  PURPOSE_GROUPS,
  TaggedEvent,
  TimelineEventType,
  TypeColorConfig,
} from '@/features/hunting-trail/hunting-trail.model';
import {
  QueryCard,
  QueryGroup,
} from '@/features/hunting-trail/molecules/query-card';

// ... exact same content ...
```

No changes needed — the original already uses absolute `@/features/hunting-trail/` imports.

- [ ] **Step 2: Verify file compiles**

Run: `pnpm tsc --noEmit --pretty 2>&1 | grep purpose-aggregated || echo "No errors"`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/hunting-trail/entities/purpose-aggregated.tsx
git commit -m "refactor(hunting-trail): move purpose-aggregated template to feature folder"
```

---

### Task 3: Simplify compromise entity to purpose-only

**Files:**
- Modify: `src/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail.tsx`
- Rewrite: `src/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail.test.tsx`

- [ ] **Step 1: Rewrite the entity**

Replace the entire file with a thin wrapper that fetches data and renders PurposeAggregated:

```tsx
import { useHostHuntingTrail } from '@/features/hunting-trail/hooks/use-host-hunting-trail';
import { PurposeAggregated } from '@/features/hunting-trail/entities/purpose-aggregated';

interface HuntingTrailProps {
  asset: string;
  startDate: number | undefined;
  endDate: number | undefined;
}

export const HuntingTrail = ({
  asset,
  startDate,
  endDate,
}: HuntingTrailProps) => {
  const { taggedEvents, isLoading, isError, isEmpty } = useHostHuntingTrail({
    asset,
    startDate,
    endDate,
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

  return <PurposeAggregated events={taggedEvents} />;
};
```

- [ ] **Step 2: Rewrite entity tests**

Remove tab-related tests. Keep: loading, empty, error, data rendering tests.

```tsx
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
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
  renderWithProviders(
    <HuntingTrail
      asset="192.168.1.5"
      startDate={1736640000000}
      endDate={1736899200000}
    />,
    {
      router: createTestRouter(),
    },
  );

describe('HuntingTrail', () => {
  it('shows loading skeleton while queries are in flight', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', async () => {
        await new Promise(() => {});
        return HttpResponse.json(emptyPaginated);
      }),
    );
    renderWithProviders(
      <HuntingTrail
        asset="192.168.1.5"
        startDate={1736640000000}
        endDate={1736899200000}
      />,
    );
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('shows empty state when all sources return no events', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/no hunting trail data/i)).toBeInTheDocument();
    });
  });

  it('shows error state when all sources fail', async () => {
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

  it('renders purpose-grouped cards when data is present', async () => {
    const nrd1 = makeNrdEvent({ _id: 'n1', timestamp: '2026-01-12T08:00:00Z' });
    const nrd2 = makeNrdEvent({ _id: 'n2', timestamp: '2026-01-12T09:00:00Z' });
    const lateral = makeLateralEvent({ timestamp: '2026-01-12T15:00:00Z' });

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
    expect(screen.getByText('2 events')).toBeInTheDocument();
  });

  it('shows partial results when only some sources succeed', async () => {
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
    await waitFor(() => {
      expect(screen.getByText('Sightings')).toBeInTheDocument();
    });
    expect(
      screen.queryByText(/failed to load hunting trail data/i),
    ).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run entity tests**

Run: `pnpm vitest run src/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail.test.tsx`
Expected: All 5 tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail.tsx src/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail.test.tsx
git commit -m "refactor(hunting-trail): simplify compromise entity to purpose-only view"
```

---

### Task 4: Create host-insights entity

**Files:**
- Create: `src/features/host-insights/use-cases/host-details/entities/host-hunting-trail/host-hunting-trail.tsx`
- Create: `src/features/host-insights/use-cases/host-details/entities/host-hunting-trail/host-hunting-trail.test.tsx`

- [ ] **Step 1: Create the entity component**

Follow the pattern of `host-timeline.tsx` — accept `hostId`, read dates from global params, fetch + render.

```tsx
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';
import { PurposeAggregated } from '@/features/hunting-trail/entities/purpose-aggregated';
import { useHostHuntingTrail } from '@/features/hunting-trail/hooks/use-host-hunting-trail';

export interface HostHuntingTrailProps {
  hostId: string;
}

export function HostHuntingTrail({ hostId }: HostHuntingTrailProps) {
  const { start_date, end_date } = useGlobalQueryParams(['dates']);
  const { taggedEvents, isLoading, isError, isEmpty } = useHostHuntingTrail({
    asset: hostId,
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

  return <PurposeAggregated events={taggedEvents} />;
}
```

- [ ] **Step 2: Create test file**

```tsx
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { baseUrl, server } from '@/common/testing/mocks/server';
import { renderWithProviders } from '@/common/testing/test-utils';
import { makeNrdEvent } from '@/features/events/common/events.mocks';

import { HostHuntingTrail } from './host-hunting-trail';

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

describe('HostHuntingTrail', () => {
  it('shows loading skeleton while queries are in flight', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', async () => {
        await new Promise(() => {});
        return HttpResponse.json(emptyPaginated);
      }),
    );
    renderWithProviders(<HostHuntingTrail hostId="192.168.1.5" />);
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(3);
  });

  it('shows empty state when all sources return no events', async () => {
    await renderWithProviders(<HostHuntingTrail hostId="192.168.1.5" />, {
      router: createTestRouter(),
    });
    await waitFor(() => {
      expect(screen.getByText(/no hunting trail data/i)).toBeInTheDocument();
    });
  });

  it('shows error state when all sources fail', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', () => HttpResponse.error()),
      http.get(baseUrl + '/rules/es/events_tail/', () => HttpResponse.error()),
      http.get(baseUrl + '/appliances/es_discovery_events/', () =>
        HttpResponse.error(),
      ),
    );
    await renderWithProviders(<HostHuntingTrail hostId="192.168.1.5" />, {
      router: createTestRouter(),
    });
    await waitFor(() => {
      expect(
        screen.getByText(/failed to load hunting trail data/i),
      ).toBeInTheDocument();
    });
  });

  it('renders purpose-grouped cards when data is present', async () => {
    server.use(
      http.get(baseUrl + '/rules/es/alerts_tail', ({ request }) => {
        const url = new URL(request.url);
        const qfilter = url.searchParams.get('qfilter') ?? '';
        if (qfilter.includes('stamus.nrd')) {
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [
              makeNrdEvent({
                _id: 'n1',
                timestamp: '2026-01-12T08:00:00Z',
              }),
            ],
          });
        }
        return HttpResponse.json(emptyPaginated);
      }),
    );
    await renderWithProviders(<HostHuntingTrail hostId="192.168.1.5" />, {
      router: createTestRouter(),
    });
    await waitFor(() => {
      expect(screen.getByText('NRD')).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 3: Run tests**

Run: `pnpm vitest run src/features/host-insights/use-cases/host-details/entities/host-hunting-trail/host-hunting-trail.test.tsx`
Expected: All 4 tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/features/host-insights/use-cases/host-details/entities/host-hunting-trail/
git commit -m "feat(host-insights): add host hunting trail entity with purpose grouping"
```

---

### Task 5: Update route to use host-insights entity

**Files:**
- Modify: `src/routes/_enterprise/hosts/$hostId/hunting-trail.tsx`

- [ ] **Step 1: Update the route file**

Replace the compromise import with the host-insights entity:

```tsx
import { createFileRoute, useParams } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostHuntingTrail } from '@/features/host-insights/use-cases/host-details/entities/host-hunting-trail/host-hunting-trail';

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
  return <HostHuntingTrail hostId={hostId} />;
}
```

Note: removed `useGlobalQueryParams` — the entity reads dates internally.

- [ ] **Step 2: Verify compile**

Run: `pnpm tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/routes/_enterprise/hosts/$hostId/hunting-trail.tsx
git commit -m "refactor(routes): use host-insights entity for host hunting trail tab"
```

---

### Task 6: Delete unused files from compromises

**Files to delete:**
- `src/features/threats/compromises/use-cases/hunting-trail/use-cases/aggregated-timeline.tsx`
- `src/features/threats/compromises/use-cases/hunting-trail/use-cases/query-aggregated.tsx`
- `src/features/threats/compromises/use-cases/hunting-trail/use-cases/flow-aggregated.tsx`
- `src/features/threats/compromises/use-cases/hunting-trail/use-cases/purpose-aggregated.tsx`
- `src/features/threats/compromises/use-cases/hunting-trail/molecules/hunting-trail-card.tsx`
- `src/features/threats/compromises/use-cases/hunting-trail/molecules/card-summary.tsx`
- `src/features/threats/compromises/use-cases/hunting-trail/molecules/card-events-table.tsx`
- `src/features/threats/compromises/use-cases/hunting-trail/utils/aggregate-timeline-events.ts`
- `src/features/threats/compromises/use-cases/hunting-trail/utils/aggregate-timeline-events.test.ts`
- `src/features/threats/compromises/use-cases/hunting-trail/hunting-trail.model.ts`
- `src/features/threats/compromises/use-cases/hunting-trail/hooks/use-hunting-trail.ts`
- `src/features/threats/compromises/use-cases/hunting-trail/hooks/use-hunting-trail.test.ts`

- [ ] **Step 1: Delete all files**

```bash
git rm src/features/threats/compromises/use-cases/hunting-trail/use-cases/aggregated-timeline.tsx \
      src/features/threats/compromises/use-cases/hunting-trail/use-cases/query-aggregated.tsx \
      src/features/threats/compromises/use-cases/hunting-trail/use-cases/flow-aggregated.tsx \
      src/features/threats/compromises/use-cases/hunting-trail/use-cases/purpose-aggregated.tsx \
      src/features/threats/compromises/use-cases/hunting-trail/molecules/hunting-trail-card.tsx \
      src/features/threats/compromises/use-cases/hunting-trail/molecules/card-summary.tsx \
      src/features/threats/compromises/use-cases/hunting-trail/molecules/card-events-table.tsx \
      src/features/threats/compromises/use-cases/hunting-trail/utils/aggregate-timeline-events.ts \
      src/features/threats/compromises/use-cases/hunting-trail/utils/aggregate-timeline-events.test.ts \
      src/features/threats/compromises/use-cases/hunting-trail/hunting-trail.model.ts \
      src/features/threats/compromises/use-cases/hunting-trail/hooks/use-hunting-trail.ts \
      src/features/threats/compromises/use-cases/hunting-trail/hooks/use-hunting-trail.test.ts
```

- [ ] **Step 2: Verify no broken imports**

Run: `pnpm tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors (the entity was already updated in Task 3, the route in Task 5)

- [ ] **Step 3: Run all hunting-trail tests**

Run: `pnpm vitest run --reporter=verbose 2>&1 | grep -E "(hunting-trail|PASS|FAIL)"`
Expected: All remaining tests PASS

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor(hunting-trail): delete non-purpose views and moved files from compromises"
```

---

### Task 7: Final verification

- [ ] **Step 1: Run lint with auto-fix**

Run: `pnpm run lint --fix`
Expected: No errors

- [ ] **Step 2: Run TypeScript check**

Run: `pnpm run check`
Expected: No errors

- [ ] **Step 3: Run full test suite**

Run: `pnpm vitest run`
Expected: All tests PASS

- [ ] **Step 4: Commit any lint fixes if needed**

```bash
git add -A && git commit -m "chore: lint fixes after hunting-trail refactor"
```

---

## Final directory structure

### Feature folder (`src/features/hunting-trail/`)
```
├── hunting-trail.model.ts         # Types, constants, purpose groups
├── network-hunting-trail-context.tsx  # Context for network page routes
├── hooks/
│   ├── use-network-hunting-trail.ts       # Network-wide data fetching
│   ├── use-network-hunting-trail.test.ts
│   ├── use-host-hunting-trail.ts          # Host-scoped data fetching
│   └── use-host-hunting-trail.test.ts
├── entities/
│   ├── purpose-tab-content.tsx     # Purpose tab for network page (takes pre-grouped data)
│   ├── purpose-tab-content.test.tsx
│   └── purpose-aggregated.tsx      # Purpose view template (takes flat events)
└── molecules/
    ├── query-card.tsx              # Individual query type card
    ├── card-summary.tsx            # Unique-value summary columns
    └── card-events-table.tsx       # Event details table
```

### Compromise entity (thin)
```
src/features/threats/compromises/use-cases/hunting-trail/
└── entities/
    ├── hunting-trail.tsx           # fetch + PurposeAggregated
    └── hunting-trail.test.tsx
```

### Host insights entity (thin)
```
src/features/host-insights/use-cases/host-details/entities/host-hunting-trail/
    ├── host-hunting-trail.tsx      # fetch + PurposeAggregated
    └── host-hunting-trail.test.tsx
```
