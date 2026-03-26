# Hunting Trail Display Alternatives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate data fetching from display in the hunting trail feature and provide 4 alternative tab-based views for comparing display strategies.

**Architecture:** `useHuntingTrail` returns raw `taggedEvents` instead of aggregated groups. The `HuntingTrail` entity becomes a tabbed shell (border tabs) with loading/error/empty handled once. Each of the 4 tabs is a self-contained file with its own transformation logic and rendering.

**Tech Stack:** React, Radix UI Tabs, Tailwind CSS, Vitest

---

### Task 1: Add PURPOSE_GROUPS config and export TYPE_LABEL/TYPE_COLOR from model

**Files:**
- Modify: `src/features/threats/compromises/use-cases/hunting-trail/hunting-trail.model.ts`
- Modify: `src/features/threats/compromises/use-cases/hunting-trail/molecules/hunting-trail-card.tsx`

The purpose groups config is needed by tabs 3 and 4. The TYPE_LABEL and TYPE_COLOR maps are currently private to `hunting-trail-card.tsx` but needed by multiple tab files. Move them to the model.

- [ ] **Step 1: Add PURPOSE_GROUPS and move TYPE_LABEL/TYPE_COLOR to the model**

In `hunting-trail.model.ts`, add at the bottom (before the closing of the file):

```ts
export const TYPE_LABEL: Record<TimelineEventType, string> = {
  sightings: 'Sightings',
  hunting: 'Hunting',
  file: 'Fileinfo',
  lateral: 'Lateral',
  nrd: 'NRD',
  remoteAdmin: 'Remote Administration',
  remoteRegistry: 'Remote Registry',
  postExploit: 'Post Exploit',
  ipDownload: 'IP Download',
  rawProtocol: 'Raw Protocol Transfer',
  userEnum: 'User Enumeration',
  powershell: 'Powershell',
  newServers: 'New Servers',
  smbSightings: 'SMB Sightings',
  torrent: 'Torrent',
  smtpExe: 'SMTP EXE',
  base64Encoding: 'Base64 Encoding',
  maliciousFilenames: 'Malicious Filenames',
  suspiciousFilenames: 'Suspicious Filenames',
  longDomains: 'Long Domain Names',
  shortDomains: 'Short Domain Names',
  exeSightings: 'Exe Sightings',
  dynamicDns: 'Dynamic DNS',
  tor: 'Tor',
  publicDns: 'Public DNS Queries',
  smtpUnencrypted: 'SMTP Unencrypted',
  base64Decoding: 'Base64 Decoding',
};

export const TYPE_COLOR: Record<TimelineEventType, string> = {
  nrd: 'border-blue-500 text-blue-400',
  sightings: 'border-purple-500 text-purple-400',
  file: 'border-orange-500 text-orange-400',
  lateral: 'border-red-500 text-red-400',
  hunting: 'border-green-500 text-green-400',
  remoteAdmin: 'border-red-500 text-red-400',
  remoteRegistry: 'border-red-500 text-red-400',
  postExploit: 'border-rose-500 text-rose-400',
  ipDownload: 'border-sky-500 text-sky-400',
  rawProtocol: 'border-sky-500 text-sky-400',
  userEnum: 'border-indigo-500 text-indigo-400',
  powershell: 'border-violet-500 text-violet-400',
  newServers: 'border-cyan-500 text-cyan-400',
  smbSightings: 'border-fuchsia-500 text-fuchsia-400',
  torrent: 'border-lime-500 text-lime-400',
  smtpExe: 'border-pink-500 text-pink-400',
  base64Encoding: 'border-emerald-500 text-emerald-400',
  maliciousFilenames: 'border-red-500 text-red-400',
  suspiciousFilenames: 'border-amber-500 text-amber-400',
  longDomains: 'border-teal-500 text-teal-400',
  shortDomains: 'border-teal-500 text-teal-400',
  exeSightings: 'border-purple-500 text-purple-400',
  dynamicDns: 'border-teal-500 text-teal-400',
  tor: 'border-rose-500 text-rose-400',
  publicDns: 'border-teal-500 text-teal-400',
  smtpUnencrypted: 'border-pink-500 text-pink-400',
  base64Decoding: 'border-emerald-500 text-emerald-400',
};

export const PURPOSE_GROUPS: { label: string; types: TimelineEventType[] }[] = [
  { label: 'Lateral Movement', types: ['lateral', 'remoteAdmin', 'remoteRegistry', 'userEnum'] },
  { label: 'Exploitation & Post-Exploit', types: ['postExploit', 'powershell', 'base64Encoding', 'base64Decoding'] },
  { label: 'File Activity', types: ['file', 'maliciousFilenames', 'suspiciousFilenames', 'smtpExe', 'exeSightings'] },
  { label: 'Network Anomalies', types: ['ipDownload', 'rawProtocol', 'torrent', 'tor', 'smtpUnencrypted'] },
  { label: 'DNS & Domains', types: ['nrd', 'longDomains', 'shortDomains', 'dynamicDns', 'publicDns'] },
  { label: 'Sightings & Discovery', types: ['sightings', 'newServers', 'smbSightings'] },
  { label: 'Hunting Signals', types: ['hunting'] },
];
```

- [ ] **Step 2: Update hunting-trail-card.tsx to import from model instead of defining locally**

In `hunting-trail-card.tsx`, remove the local `TYPE_LABEL` and `TYPE_COLOR` constants and import them from the model:

```ts
import { TimelineEventType, TimelineGroup, TYPE_LABEL, TYPE_COLOR } from '../hunting-trail.model';
```

Delete the two `const TYPE_LABEL` and `const TYPE_COLOR` blocks (lines 11–69 of the current file).

- [ ] **Step 3: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/features/threats/compromises/use-cases/hunting-trail/hunting-trail.model.ts src/features/threats/compromises/use-cases/hunting-trail/molecules/hunting-trail-card.tsx
git commit -m "refactor(hunting-trail): move TYPE_LABEL, TYPE_COLOR to model, add PURPOSE_GROUPS"
```

---

### Task 2: Refactor useHuntingTrail to return raw taggedEvents

**Files:**
- Modify: `src/features/threats/compromises/use-cases/hunting-trail/hooks/use-hunting-trail.ts`
- Modify: `src/features/threats/compromises/use-cases/hunting-trail/hooks/use-hunting-trail.test.ts`

The hook currently calls `aggregateTimelineEvents` and returns `groups`. Change it to return raw `taggedEvents` instead. The aggregation moves into the individual tab components.

- [ ] **Step 1: Update the test to expect taggedEvents instead of groups**

In `use-hunting-trail.test.ts`, change the last test (`returns isEmpty: false when there are results`). Replace line 119:

```ts
expect(result.current.groups.length).toBeGreaterThan(0);
```

with:

```ts
expect(result.current.taggedEvents.length).toBeGreaterThan(0);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/features/threats/compromises/use-cases/hunting-trail/hooks`
Expected: FAIL — `taggedEvents` does not exist on the return type

- [ ] **Step 3: Update the hook to return taggedEvents**

In `use-hunting-trail.ts`:

1. Remove the import of `aggregateTimelineEvents`
2. Remove the line `const groups = aggregateTimelineEvents(taggedEvents);`
3. Replace the return statement with:

```ts
  return {
    taggedEvents,
    isLoading,
    isError,
    isEmpty: !isLoading && taggedEvents.length === 0 && !isError,
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/features/threats/compromises/use-cases/hunting-trail/hooks`
Expected: PASS — all 5 tests green

- [ ] **Step 5: Commit**

```bash
git add src/features/threats/compromises/use-cases/hunting-trail/hooks/
git commit -m "refactor(hunting-trail): return raw taggedEvents from useHuntingTrail"
```

---

### Task 3: Rewrite HuntingTrail entity as tabbed shell

**Files:**
- Modify: `src/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail.tsx`
- Modify: `src/features/threats/compromises/use-cases/hunting-trail/entities/hunting-trail.test.tsx`

The entity component becomes a tab container. It handles loading/error/empty once, then delegates to tab content components. For now, only the first tab (Aggregated Timeline) is wired up — tabs 2–4 render placeholder text until implemented in later tasks.

- [ ] **Step 1: Update the entity test for the tab structure**

In `hunting-trail.test.tsx`, the test `renders a card for each consecutive group` (line 96) currently checks that NRD and Lateral cards appear. After the refactor, these cards will be inside the default "Aggregated Timeline" tab. The test should still pass since that tab is the default. No test changes needed for this task — existing tests verify the same behavior via the default tab.

However, add one new test to verify tabs render:

Add after the last `it(...)` block (before the closing `});`):

```ts
  it('renders display tabs', async () => {
    await renderComponent();
    await waitFor(() => {
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /aggregated timeline/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /query aggregated/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /purpose aggregated/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /flow aggregated/i })).toBeInTheDocument();
    });
  });
```

- [ ] **Step 2: Run tests to verify the new test fails**

Run: `pnpm vitest run src/features/threats/compromises/use-cases/hunting-trail/entities`
Expected: FAIL — no tablist found

- [ ] **Step 3: Rewrite the entity component**

Replace the entire content of `hunting-trail.tsx` with:

```tsx
import { Column } from '@/common/design-system/atoms/layout/column';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/borderTabs';

import { useHuntingTrail } from '../hooks/use-hunting-trail';
import { TaggedEvent } from '../hunting-trail.model';
import { AggregatedTimeline } from '../use-cases/aggregated-timeline';
import { FlowAggregated } from '../use-cases/flow-aggregated';
import { PurposeAggregated } from '../use-cases/purpose-aggregated';
import { QueryAggregated } from '../use-cases/query-aggregated';

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
  const { taggedEvents, isLoading, isError, isEmpty } = useHuntingTrail({
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

  return (
    <Tabs defaultValue="aggregated-timeline">
      <div className="px-2 pt-2">
        <TabsList>
          <TabsTrigger value="aggregated-timeline">Aggregated Timeline</TabsTrigger>
          <TabsTrigger value="query-aggregated">Query Aggregated</TabsTrigger>
          <TabsTrigger value="purpose-aggregated">Purpose Aggregated</TabsTrigger>
          <TabsTrigger value="flow-aggregated">Flow Aggregated</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="aggregated-timeline">
        <AggregatedTimeline events={taggedEvents} />
      </TabsContent>
      <TabsContent value="query-aggregated">
        <QueryAggregated events={taggedEvents} />
      </TabsContent>
      <TabsContent value="purpose-aggregated">
        <PurposeAggregated events={taggedEvents} />
      </TabsContent>
      <TabsContent value="flow-aggregated">
        <FlowAggregated events={taggedEvents} />
      </TabsContent>
    </Tabs>
  );
};
```

This will not compile yet — the 4 tab components don't exist. Create them as stubs in the next steps.

- [ ] **Step 4: Create stub files for all 4 tab components**

Create `src/features/threats/compromises/use-cases/hunting-trail/use-cases/aggregated-timeline.tsx`:

```tsx
import { Column } from '@/common/design-system/atoms/layout/column';

import { TaggedEvent } from '../hunting-trail.model';
import { HuntingTrailCard } from '../molecules/hunting-trail-card';
import { aggregateTimelineEvents } from '../utils/aggregate-timeline-events';

export const AggregatedTimeline = ({ events }: { events: TaggedEvent[] }) => {
  const groups = aggregateTimelineEvents(events);

  return (
    <Column className="gap-2 p-2">
      {groups.map((group, idx) => (
        <HuntingTrailCard
          key={`${group.type}-${group.startTime}-${idx}`}
          group={group}
        />
      ))}
    </Column>
  );
};
```

Create `src/features/threats/compromises/use-cases/hunting-trail/use-cases/query-aggregated.tsx`:

```tsx
import { TaggedEvent } from '../hunting-trail.model';

export const QueryAggregated = ({ events }: { events: TaggedEvent[] }) => {
  return <div className="text-muted-foreground p-4 text-sm">Query Aggregated — coming soon</div>;
};
```

Create `src/features/threats/compromises/use-cases/hunting-trail/use-cases/purpose-aggregated.tsx`:

```tsx
import { TaggedEvent } from '../hunting-trail.model';

export const PurposeAggregated = ({ events }: { events: TaggedEvent[] }) => {
  return <div className="text-muted-foreground p-4 text-sm">Purpose Aggregated — coming soon</div>;
};
```

Create `src/features/threats/compromises/use-cases/hunting-trail/use-cases/flow-aggregated.tsx`:

```tsx
import { TaggedEvent } from '../hunting-trail.model';

export const FlowAggregated = ({ events }: { events: TaggedEvent[] }) => {
  return <div className="text-muted-foreground p-4 text-sm">Flow Aggregated — coming soon</div>;
};
```

- [ ] **Step 5: Run lint, type check, and tests**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

Run: `pnpm vitest run src/features/threats/compromises/use-cases/hunting-trail`
Expected: All tests pass (existing behavior preserved via default tab, new tab test passes)

- [ ] **Step 6: Commit**

```bash
git add src/features/threats/compromises/use-cases/hunting-trail/entities/ src/features/threats/compromises/use-cases/hunting-trail/use-cases/
git commit -m "feat(hunting-trail): add tabbed shell with 4 display tabs, wire up aggregated timeline"
```

---

### Task 4: Implement Query Aggregated tab

**Files:**
- Modify: `src/features/threats/compromises/use-cases/hunting-trail/use-cases/query-aggregated.tsx`

Groups events by `timelineType` — one card per query type that returned results. Reuses existing `CardSummary` and `CardEventsTable` molecules.

- [ ] **Step 1: Implement query-aggregated.tsx**

Replace the stub content of `query-aggregated.tsx` with:

```tsx
import { useMemo, useState } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { DateTime } from '@/common/design-system/entities/date-time';

import {
  TaggedEvent,
  TimelineEventType,
  TYPE_COLOR,
  TYPE_LABEL,
} from '../hunting-trail.model';
import { CardEventsTable } from '../molecules/card-events-table';
import { CardSummary } from '../molecules/card-summary';

// --- Transform ---

type QueryGroup = {
  type: TimelineEventType;
  events: TaggedEvent[];
  startTime: string;
  endTime: string;
};

function groupByQuery(events: TaggedEvent[]): QueryGroup[] {
  const map = new Map<TimelineEventType, TaggedEvent[]>();
  for (const event of events) {
    const list = map.get(event.timelineType);
    if (list) {
      list.push(event);
    } else {
      map.set(event.timelineType, [event]);
    }
  }

  return Array.from(map.entries()).map(([type, evts]) => {
    const sorted = evts.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    return {
      type,
      events: sorted,
      startTime: sorted[0].timestamp,
      endTime: sorted[sorted.length - 1].timestamp,
    };
  });
}

// --- UI ---

const QueryCard = ({ group }: { group: QueryGroup }) => {
  const [showEvents, setShowEvents] = useState(false);
  const { type, events } = group;

  return (
    <div className={`border-l-2 ${TYPE_COLOR[type]} bg-card overflow-hidden`}>
      <Row className="bg-muted/40 border-border items-center gap-2 border-t border-b px-3 py-2 text-xs">
        <span className={`font-bold tracking-wide uppercase ${TYPE_COLOR[type].split(' ')[1]}`}>
          {TYPE_LABEL[type]}
        </span>
        <span className="text-muted-foreground">
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </span>
        <span className="text-muted-foreground">/</span>
        <Row className="text-muted-foreground gap-1 whitespace-nowrap">
          <DateTime date={group.startTime} />
          <span>—</span>
          <DateTime date={group.endTime} />
        </Row>
      </Row>

      {showEvents ? (
        <CardEventsTable type={type} events={events} />
      ) : (
        <CardSummary type={type} events={events} />
      )}

      <div className="border-border border-t px-3 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={() => setShowEvents((v) => !v)}
        >
          {showEvents ? 'Hide events' : 'Show events'}
        </Button>
      </div>
    </div>
  );
};

export const QueryAggregated = ({ events }: { events: TaggedEvent[] }) => {
  const groups = useMemo(() => groupByQuery(events), [events]);

  return (
    <div className="flex flex-col gap-2 p-2">
      {groups.map((group) => (
        <QueryCard key={group.type} group={group} />
      ))}
    </div>
  );
};
```

- [ ] **Step 2: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/threats/compromises/use-cases/hunting-trail/use-cases/query-aggregated.tsx
git commit -m "feat(hunting-trail): implement Query Aggregated tab"
```

---

### Task 5: Implement Purpose Aggregated tab

**Files:**
- Modify: `src/features/threats/compromises/use-cases/hunting-trail/use-cases/purpose-aggregated.tsx`

Groups events by purpose category (from `PURPOSE_GROUPS`), then by query type within each category. Each event is labeled with its query type. Empty categories are skipped.

- [ ] **Step 1: Implement purpose-aggregated.tsx**

Replace the stub content of `purpose-aggregated.tsx` with:

```tsx
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { DateTime } from '@/common/design-system/entities/date-time';

import {
  PURPOSE_GROUPS,
  TaggedEvent,
  TimelineEventType,
  TYPE_COLOR,
  TYPE_LABEL,
} from '../hunting-trail.model';
import { CardEventsTable } from '../molecules/card-events-table';
import { CardSummary } from '../molecules/card-summary';

// --- Transform ---

type QueryGroup = {
  type: TimelineEventType;
  events: TaggedEvent[];
  startTime: string;
  endTime: string;
};

type PurposeGroup = {
  label: string;
  queryGroups: QueryGroup[];
  totalEvents: number;
};

function groupByPurpose(events: TaggedEvent[]): PurposeGroup[] {
  const byType = new Map<TimelineEventType, TaggedEvent[]>();
  for (const event of events) {
    const list = byType.get(event.timelineType);
    if (list) {
      list.push(event);
    } else {
      byType.set(event.timelineType, [event]);
    }
  }

  return PURPOSE_GROUPS.map(({ label, types }) => {
    const queryGroups: QueryGroup[] = [];
    for (const type of types) {
      const evts = byType.get(type);
      if (!evts || evts.length === 0) continue;
      const sorted = [...evts].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
      queryGroups.push({
        type,
        events: sorted,
        startTime: sorted[0].timestamp,
        endTime: sorted[sorted.length - 1].timestamp,
      });
    }
    return {
      label,
      queryGroups,
      totalEvents: queryGroups.reduce((sum, g) => sum + g.events.length, 0),
    };
  }).filter((g) => g.queryGroups.length > 0);
}

// --- UI ---

const QueryCard = ({ group }: { group: QueryGroup }) => {
  const [showEvents, setShowEvents] = useState(false);
  const { type, events } = group;

  return (
    <div className={`border-l-2 ${TYPE_COLOR[type]} bg-card overflow-hidden`}>
      <Row className="bg-muted/40 border-border items-center gap-2 border-t border-b px-3 py-2 text-xs">
        <span className={`font-bold tracking-wide uppercase ${TYPE_COLOR[type].split(' ')[1]}`}>
          {TYPE_LABEL[type]}
        </span>
        <span className="text-muted-foreground">
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </span>
        <span className="text-muted-foreground">/</span>
        <Row className="text-muted-foreground gap-1 whitespace-nowrap">
          <DateTime date={group.startTime} />
          <span>—</span>
          <DateTime date={group.endTime} />
        </Row>
      </Row>

      {showEvents ? (
        <CardEventsTable type={type} events={events} />
      ) : (
        <CardSummary type={type} events={events} />
      )}

      <div className="border-border border-t px-3 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={() => setShowEvents((v) => !v)}
        >
          {showEvents ? 'Hide events' : 'Show events'}
        </Button>
      </div>
    </div>
  );
};

const PurposeSection = ({ group }: { group: PurposeGroup }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center gap-2 px-2 py-2 text-left text-xs font-semibold"
        onClick={() => setCollapsed((v) => !v)}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        <span>{group.label}</span>
        <span className="text-muted-foreground font-normal">
          {group.totalEvents} {group.totalEvents === 1 ? 'event' : 'events'}
        </span>
      </button>
      {!collapsed && (
        <div className="flex flex-col gap-2 pl-2">
          {group.queryGroups.map((qg) => (
            <QueryCard key={qg.type} group={qg} />
          ))}
        </div>
      )}
    </div>
  );
};

export const PurposeAggregated = ({ events }: { events: TaggedEvent[] }) => {
  const groups = useMemo(() => groupByPurpose(events), [events]);

  return (
    <div className="flex flex-col gap-1 p-2">
      {groups.map((group) => (
        <PurposeSection key={group.label} group={group} />
      ))}
    </div>
  );
};
```

- [ ] **Step 2: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/threats/compromises/use-cases/hunting-trail/use-cases/purpose-aggregated.tsx
git commit -m "feat(hunting-trail): implement Purpose Aggregated tab"
```

---

### Task 6: Implement Flow Aggregated tab

**Files:**
- Modify: `src/features/threats/compromises/use-cases/hunting-trail/use-cases/flow-aggregated.tsx`

Groups events by `flow_id`. Each flow card shows src→dest, app_proto, time range, and colored query-type badges with hit counts. Events without a `flow_id` are collected under an "Unassociated" section. Expandable to show the full event list per flow.

- [ ] **Step 1: Implement flow-aggregated.tsx**

Replace the stub content of `flow-aggregated.tsx` with:

```tsx
import { Binary } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { DateTime } from '@/common/design-system/entities/date-time';
import { Link } from '@tanstack/react-router';

import {
  TaggedEvent,
  TimelineEventType,
  TYPE_COLOR,
  TYPE_LABEL,
} from '../hunting-trail.model';

// --- Transform ---

type FlowGroup = {
  flowId: number | null;
  srcIp: string;
  srcPort: number | undefined;
  destIp: string;
  destPort: number | undefined;
  appProto: string | undefined;
  startTime: string;
  endTime: string;
  events: TaggedEvent[];
  queryCounts: Map<TimelineEventType, number>;
};

function groupByFlow(events: TaggedEvent[]): FlowGroup[] {
  const flowMap = new Map<number, TaggedEvent[]>();
  const noFlow: TaggedEvent[] = [];

  for (const event of events) {
    if (event.flow_id != null) {
      const list = flowMap.get(event.flow_id);
      if (list) {
        list.push(event);
      } else {
        flowMap.set(event.flow_id, [event]);
      }
    } else {
      noFlow.push(event);
    }
  }

  const toGroup = (flowId: number | null, evts: TaggedEvent[]): FlowGroup => {
    const sorted = [...evts].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const first = sorted[0];
    const queryCounts = new Map<TimelineEventType, number>();
    for (const e of sorted) {
      queryCounts.set(e.timelineType, (queryCounts.get(e.timelineType) ?? 0) + 1);
    }
    return {
      flowId,
      srcIp: first.flow?.src_ip ?? first.src_ip,
      srcPort: first.flow?.src_port ?? first.src_port,
      destIp: first.flow?.dest_ip ?? first.dest_ip,
      destPort: first.flow?.dest_port ?? first.dest_port,
      appProto: first.app_proto,
      startTime: sorted[0].timestamp,
      endTime: sorted[sorted.length - 1].timestamp,
      events: sorted,
      queryCounts,
    };
  };

  const groups: FlowGroup[] = [];
  for (const [flowId, evts] of flowMap) {
    groups.push(toGroup(flowId, evts));
  }
  groups.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  if (noFlow.length > 0) {
    groups.push(toGroup(null, noFlow));
  }

  return groups;
}

// --- UI ---

const QueryBadge = ({ type, count }: { type: TimelineEventType; count: number }) => {
  const colorClass = TYPE_COLOR[type].split(' ')[1];
  return (
    <span
      className={`${colorClass} bg-muted inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium`}
    >
      {TYPE_LABEL[type]} <strong>{count}</strong>
    </span>
  );
};

const FlowCard = ({ group }: { group: FlowGroup }) => {
  const [showEvents, setShowEvents] = useState(false);

  const addrLabel = group.flowId != null
    ? `${group.srcIp}:${group.srcPort ?? '?'} → ${group.destIp}:${group.destPort ?? '?'}`
    : 'Unassociated events';

  return (
    <div className="bg-card border-border overflow-hidden border">
      {/* Header */}
      <Row className="bg-muted/40 border-border items-center gap-3 border-b px-3 py-2 text-xs">
        <span className="font-mono text-foreground">{addrLabel}</span>
        {group.appProto && group.flowId != null && (
          <span className="text-muted-foreground uppercase">{group.appProto}</span>
        )}
        <Row className="text-muted-foreground ml-auto gap-1 whitespace-nowrap">
          <DateTime date={group.startTime} />
          <span>—</span>
          <DateTime date={group.endTime} />
        </Row>
      </Row>

      {/* Badge row */}
      <div className="flex flex-wrap gap-1.5 px-3 py-2">
        {Array.from(group.queryCounts.entries()).map(([type, count]) => (
          <QueryBadge key={type} type={type} count={count} />
        ))}
      </div>

      {/* Expandable events */}
      {showEvents && (
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/40 border-border border-t border-b">
              <th className="text-muted-foreground px-3 py-1.5 text-left font-normal">Time</th>
              <th className="text-muted-foreground px-3 py-1.5 text-left font-normal">Query</th>
              <th className="text-muted-foreground px-3 py-1.5 text-left font-normal">Signature</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {group.events.map((event) => (
              <tr key={event._id} className="border-border border-b last:border-0">
                <td className="text-muted-foreground px-3 py-1.5 whitespace-nowrap">
                  <DateTime date={event.timestamp} />
                </td>
                <td className="px-3 py-1.5">
                  <QueryBadge type={event.timelineType} count={1} />
                </td>
                <td className="text-foreground px-3 py-1.5">
                  {event.alert?.signature ?? event.discovery?.key ?? event.fileinfo?.filename ?? '—'}
                </td>
                <td className="px-3 py-1.5 text-right">
                  <Button variant="ghost" size="icon-xs" className="text-foreground" asChild>
                    <Link to="/detection-events/event" search={{ _id: event._id }} preload={false}>
                      <Binary />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="border-border border-t px-3 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={() => setShowEvents((v) => !v)}
        >
          {showEvents ? 'Hide events' : `Show ${group.events.length} events`}
        </Button>
      </div>
    </div>
  );
};

export const FlowAggregated = ({ events }: { events: TaggedEvent[] }) => {
  const groups = useMemo(() => groupByFlow(events), [events]);

  return (
    <div className="flex flex-col gap-2 p-2">
      {groups.map((group, idx) => (
        <FlowCard key={group.flowId ?? `noflow-${idx}`} group={group} />
      ))}
    </div>
  );
};
```

- [ ] **Step 2: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/features/threats/compromises/use-cases/hunting-trail/use-cases/flow-aggregated.tsx
git commit -m "feat(hunting-trail): implement Flow Aggregated tab"
```

---

### Task 7: Run full test suite and final quality checks

**Files:** None (verification only)

- [ ] **Step 1: Run all hunting trail tests**

Run: `pnpm vitest run src/features/threats/compromises/use-cases/hunting-trail`
Expected: All tests pass

- [ ] **Step 2: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors (0 errors, warnings are OK)
