# Plan: Hunting Trail — Slice A (unify hook + Sightings on alerts_tail)

**Created**: 2026-05-19
**Branch**: jolly-seahorse
**Status**: implemented

## Goal

Collapse `useHostHuntingTrail` and `useNetworkHuntingTrail` into a single `useHuntingTrail({ from, to, additionalFilter? })` hook, and move the Sightings query off `/appliances/es_discovery_events/` onto `alerts_tail` with `event_type:alert AND discovery:*`. The host view passes `(src_ip:<asset> OR dest_ip:<asset>)` via `additionalFilter` (raw string, AND-merged). After this slice, network view shows the Sightings card (it was missing it), both views run 37 queries, and the qfilter catalog stays hardcoded in `hunting-trail.qfilters.ts` (the static-config + filterset-lookup refactor is Slice B).

## Acceptance Criteria

- [ ] Network view renders the Sightings card; banner reads "37 queries ran" (was 36).
- [ ] Sightings call hits `/rules/es/alerts_tail` with qfilter `event_type:alert AND discovery:*` (plus the asset prefix on host views).
- [ ] No call to `/appliances/es_discovery_events/` from either hunting-trail consumer.
- [ ] `useHuntingTrail` is the only hook exported from `@/features/hunting-trail` for trail data; `useHostHuntingTrail` and `useNetworkHuntingTrail` are removed.
- [ ] Host view scopes every qfilter as `(src_ip:<asset> OR dest_ip:<asset>) AND <query qfilter>`.
- [ ] `pnpm run fmt`, `pnpm run lint --fix`, `pnpm run check` all clean.
- [ ] All existing trail-related tests pass (with updates for the network/host symmetry and the endpoint shift).

## Steps

### Step 1: Add `sightings` to ALERT_QFILTERS

**Complexity**: trivial
**RED**: N/A — pure constant addition, exercised by Step 2's hook tests.
**GREEN**: Add `sightings: 'event_type:alert AND discovery:*'` to `ALERT_QFILTERS` in `src/features/hunting-trail/definitions/hunting-trail.qfilters.ts`. Drop the obsolete-by-Step-7 leading `// Alert qfilters` ordering only if natural; otherwise leave it.
**REFACTOR**: None.
**Files**: `src/features/hunting-trail/definitions/hunting-trail.qfilters.ts`
**Commit**: `feat(hunting-trail): add sightings qfilter for alerts_tail path`

### Step 2: Create `useHuntingTrail` hook with tests

**Complexity**: complex
**RED**: Write `src/features/hunting-trail/hooks/use-hunting-trail.test.ts` covering:
  - With no `additionalFilter`: 37 queries fire (msw spy on `/rules/es/alerts_tail` + `/rules/es/events_tail/`); zero calls to `/appliances/es_discovery_events/`; banner-source `runStats.total === 37`.
  - With `additionalFilter` as a raw string (e.g., `'(src_ip:10.0.0.5 OR dest_ip:10.0.0.5)'`): every captured qfilter starts with the wrapper `'(src_ip:10.0.0.5 OR dest_ip:10.0.0.5) AND '`.
  - Sightings call: confirm one request to `/rules/es/alerts_tail` carries qfilter ending in `event_type:alert AND discovery:*` (and prefixed with the asset wrapper when `additionalFilter` is set).
  - Loading: while any query is pending, `isLoading` is true; when all settled empty, `isEmpty` is true; when all fail, `isError` is true.
  - Returned shape matches the existing host hook's `{ groups, runStats, isLoading, isError, isEmpty }` so downstream components don't change.
**GREEN**: Implement `src/features/hunting-trail/hooks/use-hunting-trail.ts`. Structure mirrors the existing host hook, with two changes:
  - Sightings uses `useGetEventsQuery({ ...alertParams, qfilter: withPrefix(ALERT_QFILTERS.sightings) })` — no `useGetSightingEventsQuery`.
  - All qfilters are wrapped through `withPrefix(q)` where `withPrefix = additionalFilter ? (q) => \`${additionalFilter} AND ${q}\` : (q) => q`. Use the raw string verbatim; the caller is responsible for paren-wrapping (document this in the hook's signature comment).
  - `queryResults` is `Record<TimelineEventType, ...>` (full set, no `Exclude`).
**REFACTOR**: Extract the per-qfilter wrapping into a small local helper if it improves readability. No cross-file extraction in this slice.
**Files**: `src/features/hunting-trail/hooks/use-hunting-trail.ts`, `src/features/hunting-trail/hooks/use-hunting-trail.test.ts`
**Commit**: `feat(hunting-trail): add unified useHuntingTrail hook`

### Step 3: Migrate host-insights consumer

**Complexity**: standard
**RED**: Update `src/features/host-insights/components/host-hunting-trail/host-hunting-trail.test.tsx`:
  - Replace any msw handler for `/appliances/es_discovery_events/` with an `alerts_tail` handler that branches on the `qfilter` query param — return data when the qfilter contains `discovery:*`, empty otherwise.
  - Confirm Sightings card still renders.
  - Banner total stays at 37.
**GREEN**: Update `src/features/host-insights/components/host-hunting-trail/host-hunting-trail.tsx` to call `useHuntingTrail({ from, to, additionalFilter: \`(src_ip:${esEscape(hostId)} OR dest_ip:${esEscape(hostId)})\` })`. Drop the `useHostHuntingTrail` import.
**REFACTOR**: None.
**Files**: `src/features/host-insights/components/host-hunting-trail/host-hunting-trail.tsx`, `src/features/host-insights/components/host-hunting-trail/host-hunting-trail.test.tsx`
**Commit**: `refactor(host-insights): use unified useHuntingTrail hook`

### Step 4: Migrate threats hunting-trail consumer

**Complexity**: standard
**RED**: Update `src/features/threats/components/hunting-trail/hunting-trail.test.tsx`:
  - Replace the `appliances/es_discovery_events/` handler usage with an `alerts_tail` branching handler.
  - Rewrite the "partial results when only some sources succeed" scenario: now both `alerts_tail` and `events_tail` are the only sources; partial success means one of those returns data while others fail (e.g., succeed for a specific qfilter, error otherwise). Assert the visible card from the succeeding qfilter still renders and the error state does not appear.
  - Update the asset wrapper assertions where present.
**GREEN**: Update `src/features/threats/components/hunting-trail/hunting-trail.tsx` to call `useHuntingTrail({ from, to, additionalFilter: \`(src_ip:${esEscape(asset)} OR dest_ip:${esEscape(asset)})\` })`.
**REFACTOR**: None.
**Files**: `src/features/threats/components/hunting-trail/hunting-trail.tsx`, `src/features/threats/components/hunting-trail/hunting-trail.test.tsx`
**Commit**: `refactor(threats): use unified useHuntingTrail hook`

### Step 5: Migrate the network trail route

**Complexity**: standard
**RED**: Update `src/routes/_enterprise/hunting-trail/summary.test.tsx` (and `index.test.tsx`/`$purpose.test.tsx` if they exercise the hook) to expect 37 queries (was 36) and to allow the new Sightings card in the network view. If `summary-matrix.test.tsx` has counts tied to network's old 36, update accordingly.
**GREEN**: Replace `useNetworkHuntingTrail({ from, to })` with `useHuntingTrail({ from, to })` in whichever route component(s) own the network trail data fetch (likely `route.tsx` or `index.tsx` — confirm during implementation).
**REFACTOR**: None.
**Files**: `src/routes/_enterprise/hunting-trail/*.tsx` (only the ones currently importing `useNetworkHuntingTrail`), plus any test files referenced above.
**Commit**: `refactor(routes): use unified useHuntingTrail hook for network trail`

### Step 6: Delete the old hooks and update barrel

**Complexity**: trivial
**RED**: Run `pnpm run check` and `pnpm vitest` — must be green before deletion (proves nothing imports the old hooks).
**GREEN**:
  - Delete `src/features/hunting-trail/hooks/use-host-hunting-trail.ts`, `src/features/hunting-trail/hooks/use-host-hunting-trail.test.ts`, `src/features/hunting-trail/hooks/use-network-hunting-trail.ts`, `src/features/hunting-trail/hooks/use-network-hunting-trail.test.ts`.
  - In `src/features/hunting-trail/index.ts`: remove the `useHostHuntingTrail`/`useNetworkHuntingTrail` exports, add `export { useHuntingTrail } from './hooks/use-hunting-trail';`.
**REFACTOR**: None.
**Files**: `src/features/hunting-trail/index.ts`, the four hook files above.
**Commit**: `refactor(hunting-trail): remove obsolete host/network hooks`

## Complexity Classification

| Step | Rating | Reasoning |
|---|---|---|
| 1 | trivial | One-line constant addition |
| 2 | complex | New architectural unit (the unified hook) + comprehensive test scaffold; carries the slice's behavior change |
| 3 | standard | Wiring change inside a feature, with mirrored test update |
| 4 | standard | Wiring change + non-trivial test scenario rewrite |
| 5 | standard | Route-level wiring + count assertion updates |
| 6 | trivial | Deletion + barrel update; guarded by passing tests |

## Pre-PR Quality Gate

- [ ] All tests pass (`pnpm vitest run`)
- [ ] Type check passes (`pnpm run check`)
- [ ] Linter passes (`pnpm run lint --fix` clean)
- [ ] Formatter applied (`pnpm run fmt`)
- [ ] `/code-review --changed` passes
- [ ] No new entries in `index.ts` beyond `useHuntingTrail`; old hook names absent
- [ ] msw assertions confirm `/appliances/es_discovery_events/` is no longer hit by hunting-trail tests

## Risks & Open Questions

- **Risk — discovery endpoint other consumers**: `useGetSightingEventsQuery` may still be used outside hunting-trail (sightings tables, etc.). Slice A leaves the endpoint definition in `events.api.ts`; only the hunting-trail consumer changes. Mitigation: grep for `useGetSightingEventsQuery` before Step 6 to confirm scope.
- **Risk — qfilter shape change broke msw assertions**: A few existing tests assert handler-level error/success without filtering on qfilter. After Step 3/4, several tests need handler-level qfilter inspection to distinguish Sightings from other alert queries. Mitigation: the handler-branching pattern is straightforward; reference the existing `host-hunting-trail.test.tsx` `nrd` filter check at lines 99-117 as a template.
- **Open question — asset escaping**: Confirm `esEscape` from `@/common/lib/strings` is the right helper for the IP wrapper (used by the current host hook at `use-host-hunting-trail.ts:34`). If yes, use the same import. If a different escape utility is preferred for `additionalFilter` strings, surface it in Step 3.
- **Open question — `additionalFilter` paren wrapping**: The plan documents that the caller paren-wraps when needed (raw AND-append). If callers consistently forget, we can add wrapping in the hook later — punt that to Slice B's QueryFilterState path which doesn't have this footgun.
- **Open question — `summary-matrix` test query count**: `summary-matrix.test.tsx` doesn't assert "36 vs 37" directly (it iterates `PURPOSE_SLUGS`), but the threats `hunting-trail.test.tsx` asserts the "37 queries ran" banner. Network's summary route may have a similar assertion. Verify during Step 5.
