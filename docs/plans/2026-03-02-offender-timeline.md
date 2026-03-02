# Offender Data in Timeline — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Display offender entities in the timeline alongside victims, using purple color for offender threats, merging data when an asset is both victim and offender.

**Architecture:** Remove `is_offender: false` filter from the threat history query so the API returns both victim and offender entries. In `formatThreatHistory`, group results by asset and merge victim/offender entries: keep victim KC phases, add offender threats with type `'offender'`. For offender-only assets, use `kc_step_offender` for KC phases. Map the new `'offender'` threat type to the existing purple `offender` badge variant.

**Tech Stack:** React, RTK Query, Vitest, Tailwind CSS (existing badge variants)

---

### Task 1: Extend TimelineThreat type to include 'offender'

**Files:**
- Modify: `src/features/hunt/timeline/models/threat-history.model.ts:65-71`

**Step 1: Update the type union**

In `threat-history.model.ts`, change `TimelineThreat.type` from:
```typescript
type: 'doc' | 'dopv';
```
to:
```typescript
type: 'doc' | 'dopv' | 'offender';
```

**Step 2: Verify no TypeScript errors**

Run: `pnpm run check`
Expected: PASS (no exhaustive checks on this type yet)

**Step 3: Commit**

```bash
git add src/features/hunt/timeline/models/threat-history.model.ts
git commit -m "feat(timeline): add offender type to TimelineThreat"
```

---

### Task 2: Add tests for format-threat-history utils

**Files:**
- Create: `src/features/hunt/timeline/utils/format-threat-history.test.ts`

**Step 1: Write tests for existing behavior and new merge logic**

Create `src/features/hunt/timeline/utils/format-threat-history.test.ts` with the following structure:

```typescript
import { describe, expect, it } from 'vitest';

import { ThreatHistory } from '../models/threat-history.model';
import { formatThreatHistory } from './format-threat-history';

// --- Mock data factories ---

const makeThreatHistory = (
  overrides: Partial<ThreatHistory> & { asset: string },
): ThreatHistory => ({
  asset_type: 'ip',
  first_seen: '2024-01-01T00:00:00Z',
  last_seen: '2024-01-02T00:00:00Z',
  history: [],
  kc_change_history: [
    { first_seen: '2024-01-01T00:00:00Z' },
    { last_seen: '2024-01-02T00:00:00Z' },
  ],
  tenant: 1,
  is_offender: false,
  ...overrides,
});

const victimEntry: ThreatHistory = makeThreatHistory({
  asset: '10.0.0.1',
  is_offender: false,
  history: [
    {
      history_type: 'first_seen',
      timestamp: '2024-01-01T01:00:00Z',
      threat_id: 'threat-1',
      is_offender: false,
      params: {
        step_kill_chain: 'exploitation',
        step_kill_chain_offender: null,
      },
    },
    {
      history_type: 'last_seen',
      timestamp: '2024-01-01T12:00:00Z',
      threat_id: 'threat-1',
      is_offender: false,
      params: { count: 5 },
    },
  ],
  kc_change_history: [
    {
      timestamp: '2024-01-01T01:00:00Z',
      threat_id: 'threat-1',
      is_offender: false,
      kc_step: 'exploitation',
      kc_step_offender: null,
    },
    { first_seen: '2024-01-01T00:00:00Z' },
    { last_seen: '2024-01-02T00:00:00Z' },
  ],
});

const offenderEntry: ThreatHistory = makeThreatHistory({
  asset: '10.0.0.2',
  is_offender: true,
  history: [
    {
      history_type: 'first_seen',
      timestamp: '2024-01-01T02:00:00Z',
      threat_id: 'threat-2',
      is_offender: true,
      params: {
        step_kill_chain: 'exploitation',
        step_kill_chain_offender: 'command_and_control',
      },
    },
    {
      history_type: 'last_seen',
      timestamp: '2024-01-01T18:00:00Z',
      threat_id: 'threat-2',
      is_offender: true,
      params: { count: 3 },
    },
  ],
  kc_change_history: [
    {
      timestamp: '2024-01-01T02:00:00Z',
      threat_id: 'threat-2',
      is_offender: true,
      kc_step: 'exploitation',
      kc_step_offender: 'command_and_control',
    },
    { first_seen: '2024-01-01T00:00:00Z' },
    { last_seen: '2024-01-02T00:00:00Z' },
  ],
});

// Same asset as victim + offender (for merge testing)
const dualVictimEntry: ThreatHistory = makeThreatHistory({
  asset: '10.0.0.3',
  is_offender: false,
  history: [
    {
      history_type: 'first_seen',
      timestamp: '2024-01-01T01:00:00Z',
      threat_id: 'threat-3',
      is_offender: false,
      params: {
        step_kill_chain: 'delivery',
        step_kill_chain_offender: null,
      },
    },
    {
      history_type: 'last_seen',
      timestamp: '2024-01-01T10:00:00Z',
      threat_id: 'threat-3',
      is_offender: false,
      params: { count: 2 },
    },
  ],
  kc_change_history: [
    {
      timestamp: '2024-01-01T01:00:00Z',
      threat_id: 'threat-3',
      is_offender: false,
      kc_step: 'delivery',
      kc_step_offender: null,
    },
    { first_seen: '2024-01-01T00:00:00Z' },
    { last_seen: '2024-01-02T00:00:00Z' },
  ],
});

const dualOffenderEntry: ThreatHistory = makeThreatHistory({
  asset: '10.0.0.3',
  is_offender: true,
  history: [
    {
      history_type: 'first_seen',
      timestamp: '2024-01-01T03:00:00Z',
      threat_id: 'threat-4',
      is_offender: true,
      params: {
        step_kill_chain: 'delivery',
        step_kill_chain_offender: 'actions_on_objectives',
      },
    },
    {
      history_type: 'last_seen',
      timestamp: '2024-01-01T20:00:00Z',
      threat_id: 'threat-4',
      is_offender: true,
      params: { count: 1 },
    },
  ],
  kc_change_history: [
    {
      timestamp: '2024-01-01T03:00:00Z',
      threat_id: 'threat-4',
      is_offender: true,
      kc_step: 'delivery',
      kc_step_offender: 'actions_on_objectives',
    },
    { first_seen: '2024-01-01T00:00:00Z' },
    { last_seen: '2024-01-02T00:00:00Z' },
  ],
});

describe('formatThreatHistory', () => {
  it('formats victim-only entities with doc threats', () => {
    const result = formatThreatHistory([victimEntry]);
    expect(result.entities).toHaveLength(1);
    expect(result.entities[0].entity).toBe('10.0.0.1');
    expect(result.entities[0].threats).toHaveLength(1);
    expect(result.entities[0].threats[0].type).toBe('doc');
    expect(result.entities[0].kc_phases).toHaveLength(1);
    expect(result.entities[0].kc_phases[0].kc_phase).toBe('exploitation');
  });

  it('formats offender-only entities with offender threats and offender KC phases', () => {
    const result = formatThreatHistory([offenderEntry]);
    expect(result.entities).toHaveLength(1);
    expect(result.entities[0].entity).toBe('10.0.0.2');
    expect(result.entities[0].threats).toHaveLength(1);
    expect(result.entities[0].threats[0].type).toBe('offender');
    expect(result.entities[0].kc_phases).toHaveLength(1);
    expect(result.entities[0].kc_phases[0].kc_phase).toBe('command_and_control');
  });

  it('merges same-asset victim and offender: keeps victim KC, adds offender threats', () => {
    const result = formatThreatHistory([dualVictimEntry, dualOffenderEntry]);
    expect(result.entities).toHaveLength(1);
    const entity = result.entities[0];
    expect(entity.entity).toBe('10.0.0.3');

    // Should have both victim and offender threats
    expect(entity.threats).toHaveLength(2);
    const victimThreat = entity.threats.find((t) => t.type === 'doc');
    const offenderThreat = entity.threats.find((t) => t.type === 'offender');
    expect(victimThreat).toBeDefined();
    expect(offenderThreat).toBeDefined();

    // KC phases should come from victim only
    expect(entity.kc_phases).toHaveLength(1);
    expect(entity.kc_phases[0].kc_phase).toBe('delivery');
  });

  it('computes correct start_date and end_date across all entries', () => {
    const result = formatThreatHistory([victimEntry, offenderEntry]);
    // start_date should be min of first_seen minus 5% gap
    // end_date should be max of last_seen plus 5% gap
    expect(result.start_date).toBeLessThan(
      new Date('2024-01-01T00:00:00Z').getTime(),
    );
    expect(result.end_date).toBeGreaterThan(
      new Date('2024-01-02T00:00:00Z').getTime(),
    );
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `pnpm test -- --run src/features/hunt/timeline/utils/format-threat-history.test.ts`
Expected: FAIL — offender-only and merge tests fail (current code doesn't handle offenders)

---

### Task 3: Update formatThreatHistory to handle offender data

**Files:**
- Modify: `src/features/hunt/timeline/utils/format-threat-history.ts`

**Step 1: Update getThreats to accept an isOffender flag**

Change `getThreats` to:
```typescript
const getThreats = (history: ThreatHistory['history'], isOffender = false) =>
  Object.values(
    history.reduce(
      (acc, curr) => {
        if (!acc[curr.threat_id]) {
          acc[curr.threat_id] = {
            threat_id: curr.threat_id,
            start_date: new Date(curr.timestamp).getTime(),
            end_date: new Date(curr.timestamp).getTime(),
            type: isOffender
              ? 'offender'
              : 'step_kill_chain' in curr.params &&
                  curr.params.step_kill_chain === 'pre_condition'
                ? 'dopv'
                : 'doc',
          };
        }
        if (curr.history_type === 'last_seen') {
          acc[curr.threat_id].end_date = new Date(curr.timestamp).getTime();
        }
        return acc;
      },
      {} as Record<string, TimelineThreat>,
    ),
  );
```

**Step 2: Update getKCPhases to support offender KC step**

Change `getKCPhases` to:
```typescript
const getKCPhases = (
  kc_history: KCChange[],
  last_seen: string,
  phaseKey: 'kc_step' | 'kc_step_offender' = 'kc_step',
) => {
  const filtered =
    phaseKey === 'kc_step_offender'
      ? kc_history.filter((item) => item[phaseKey] != null)
      : kc_history;
  return filtered.map((item, index) => ({
    kc_phase: item[phaseKey] as KillChainPhase,
    start_date: new Date(item.timestamp).getTime(),
    end_date: new Date(
      index === filtered.length - 1
        ? last_seen
        : filtered[index + 1].timestamp,
    ).getTime(),
  }));
};
```

**Step 3: Rewrite formatThreatHistory with merge logic**

```typescript
export const formatThreatHistory = (
  threatHistory: ThreatHistory[],
): Omit<TimelineProps, 'offenders' | 'lateralMovements'> => {
  // Group entries by asset
  const grouped = threatHistory.reduce(
    (acc, entry) => {
      if (!acc[entry.asset]) acc[entry.asset] = [];
      acc[entry.asset].push(entry);
      return acc;
    },
    {} as Record<string, ThreatHistory[]>,
  );

  const entities = Object.entries(grouped).map(([asset, entries]) => {
    const victimEntry = entries.find((e) => !e.is_offender);
    const offenderEntry = entries.find((e) => e.is_offender);

    // Threats: combine victim and offender
    const victimThreats = victimEntry
      ? getThreats(victimEntry.history)
      : [];
    const offenderThreats = offenderEntry
      ? getThreats(offenderEntry.history, true)
      : [];

    // KC phases: prefer victim, fallback to offender
    const kc_phases = victimEntry
      ? getKCPhases(
          victimEntry.kc_change_history.slice(0, -2) as KCChange[],
          victimEntry.last_seen,
        )
      : offenderEntry
        ? getKCPhases(
            offenderEntry.kc_change_history.slice(0, -2) as KCChange[],
            offenderEntry.last_seen,
            'kc_step_offender',
          )
        : [];

    return {
      entity: asset,
      threats: [...victimThreats, ...offenderThreats],
      kc_phases,
    };
  });

  const start_date = Math.floor(
    Math.min(
      ...threatHistory.map((tH) => new Date(tH.first_seen).getTime()),
    ),
  );
  const end_date = Math.floor(
    Math.max(
      ...threatHistory.map((tH) => new Date(tH.last_seen).getTime()),
    ),
  );
  const gap = Math.floor(0.05 * (end_date - start_date));
  return {
    entities,
    start_date: start_date - gap,
    end_date: end_date + gap,
  };
};
```

**Step 4: Run tests to verify they pass**

Run: `pnpm test -- --run src/features/hunt/timeline/utils/format-threat-history.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/features/hunt/timeline/utils/format-threat-history.ts src/features/hunt/timeline/utils/format-threat-history.test.ts
git commit -m "feat(timeline): merge victim and offender data in formatThreatHistory"
```

---

### Task 4: Remove is_offender filter from query

**Files:**
- Modify: `src/features/hunt/timeline/components/timeline/timeline.tsx:32-35`

**Step 1: Remove is_offender: false from the query**

In `timeline.tsx`, change:
```typescript
const { data, isLoading } = useGetThreatHistoryQuery({
  ...params,
  is_offender: false,
});
```
to:
```typescript
const { data, isLoading } = useGetThreatHistoryQuery(params);
```

**Step 2: Update the internalEntities derivation**

In the `useMemo` at line 38-48, the `internalEntities` is used by `getOffenders`. Since entries now include both victim and offender records for the same asset, deduplicate:

```typescript
const timelineProps = useMemo(() => {
  if (!data?.results.length || !offendersData) return null;

  const internalEntities = [
    ...new Set(data.results.map((t) => t.asset)),
  ];

  return {
    ...formatThreatHistory(data.results),
    lateralMovements: getOffenders(offendersData, internalEntities),
    entity,
  };
}, [entity, data, offendersData]);
```

**Step 3: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: PASS

**Step 4: Commit**

```bash
git add src/features/hunt/timeline/components/timeline/timeline.tsx
git commit -m "feat(timeline): remove is_offender filter to fetch all entities"
```

---

### Task 5: Render offender threats with purple badge

**Files:**
- Modify: `src/features/hunt/timeline/components/timeline/timeline.threat.tsx:33-44`

**Step 1: Update badge variant mapping**

In `timeline.threat.tsx`, change:
```typescript
variant={type === 'doc' ? 'victim' : 'policy_violation'}
```
to:
```typescript
variant={
  type === 'offender'
    ? 'offender'
    : type === 'dopv'
      ? 'policy_violation'
      : 'victim'
}
```

**Step 2: Update navigation**

Change the onClick handler from:
```typescript
onClick={() =>
  navigate(
    (type === 'doc'
      ? routes.threats_coverage_threat
      : routes.policy_violations_coverage_threat
    ).replace(':threatId', threat_id),
  )
}
```
to:
```typescript
onClick={() =>
  navigate(
    (type === 'dopv'
      ? routes.policy_violations_coverage_threat
      : routes.threats_coverage_threat
    ).replace(':threatId', threat_id),
  )
}
```

**Step 3: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: PASS

**Step 4: Commit**

```bash
git add src/features/hunt/timeline/components/timeline/timeline.threat.tsx
git commit -m "feat(timeline): render offender threats with purple badge variant"
```

---

### Task 6: Final verification

**Step 1: Run all tests**

Run: `pnpm test -- --run`
Expected: ALL PASS

**Step 2: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: PASS
