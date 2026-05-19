# Plan: Hunting Trail — Slice B (static config + dynamic filterset lookup)

**Created**: 2026-05-19
**Branch**: feat-hunting-trails-rename-queries
**Status**: implemented

## Goal

Replace the hardcoded `ALERT_QFILTERS`/`EVENTS_TAIL_QFILTERS` lists and the parallel `TYPE_LABEL`/`QUERY_DESCRIPTION` maps with a single static config of grouped query entries that reference platform filter sets by id. At runtime the hook resolves each filterset-kind entry against `useGetFilterSetsQuery`, builds qfilters via the existing `QFBuilder`+`mapPersistedToFilterState` pipeline, and dispatches all N requests through one RTK `queryFn` endpoint instead of 37 parallel `useGet*Query` calls. Three queries with no matching filter set (Sightings, Fileinfo, Dynamic DNS) are declared as `static` config entries carrying their own qfilter, endpoint, name, and description. After this slice, adding or renaming a hunt query is a config edit; card titles and descriptions track what the filter-set admin defines.

## Acceptance Criteria

- [ ] `HUNTING_TRAIL_CONFIG` declares 37 entries (3 static + 34 filterset) grouped into 8 purpose slugs; entry ids are the current `TimelineEventType` union.
- [ ] Filterset entry with `page === 'SESSION_EVENTS'` routes to `events_tail`; otherwise `alerts_tail` (msw-verified).
- [ ] Filterset card title equals the filterset's `name` and description equals its `description` (msw-overridable; the UI follows what the API returns).
- [ ] A configured filterset id that is absent from the filter-sets response renders that card with the error state; banner `errored` increments by 1; banner `total` stays at `HUNTING_TRAIL_CONFIG.queries.length`.
- [ ] While `useGetFilterSetsQuery` is loading, the trail shows the existing loading skeleton.
- [ ] When `useGetFilterSetsQuery` errors, the trail shows the existing error state.
- [ ] One RTK cache entry per `(from, to, tenant, additionalFilter, resolvedQueries-hash)` — re-renders with stable inputs do not refetch.
- [ ] `additionalFilter` accepts a `QueryFilterState[]` (threaded through `QFBuilder` for filterset entries) **or** a raw `string` (AND-appended verbatim).
- [ ] The Slice A test suite still passes with only label/handler updates required for the new resolution path.
- [ ] `pnpm run fmt`, `pnpm run lint --fix`, `pnpm run check` all clean.
- [ ] `definitions/hunting-trail.qfilters.ts` is deleted; the `TYPE_LABEL`, `QUERY_DESCRIPTION`, `TIMELINE_TYPE_PRIORITY`, `PURPOSE_GROUPS` exports are gone (`PURPOSE_SLUGS` and `PURPOSE_SLUG_MAP` remain, derived from `HUNTING_TRAIL_CONFIG`).

## Steps

### Step 1: Add `HUNTING_TRAIL_CONFIG` static config

**Complexity**: standard
**RED**: Write `src/features/hunting-trail/definitions/hunting-trail.config.test.ts`:
  - Entries total 37; every entry id matches the existing `TimelineEventType` union.
  - 3 static entries (`sightings`, `file`, `dynamicDns`) carry `qfilter`, `endpoint`, `name`, `description` strings.
  - 34 filterset entries carry an integer `filtersetId` matching the mapping in the spec.
  - 8 groups; group slugs match the existing `PurposeSlug` union.
  - `sightings` belongs to the `sightings-discovery` group; `file` to `file-activity`; `dynamicDns` to `dns-domains`.
**GREEN**: Add `src/features/hunting-trail/definitions/hunting-trail.config.ts` exporting `HUNTING_TRAIL_CONFIG`, `HuntingTrailQuery`, `HuntingTrailGroup`. Populate with the filterset-id mapping from the spec; keep static entries' qfilter strings identical to the current `ALERT_QFILTERS.sightings`, `EVENTS_TAIL_QFILTERS.file`, `ALERT_QFILTERS.dynamicDns`.
**REFACTOR**: None — pure data.
**Files**: `src/features/hunting-trail/definitions/hunting-trail.config.ts`, `src/features/hunting-trail/definitions/hunting-trail.config.test.ts`
**Commit**: `feat(hunting-trail): add HUNTING_TRAIL_CONFIG static query catalog`

### Step 2: Add `buildQueryParams` resolver utility

**Complexity**: complex
**RED**: Write `src/features/hunting-trail/builders/build-query-params.test.ts` covering:
  - **Filterset DASHBOARDS**: returns `{ endpoint: 'alerts_tail', qfilter, name, description, alertTags }` where `qfilter` is the `QFBuilder.toQFString` output for the filterset's filters and `alertTags` reflects the filterset's `tags` merged with an all-true default — every flag (`untagged`, `relevant`, `informational`, `alerts`, `sightings`, `stamus`) starts `true`, and a key only becomes `false` when the filterset's `tags` object explicitly sets it to `false`. Missing / `undefined` keys stay `true`. Verified by a unit test with a partial tags object (e.g., `{ stamus: false }`) → resolved alertTags has `stamus: false` and every other key `true`.
  - **Filterset SESSION_EVENTS**: same shape but `endpoint: 'events_tail'`.
  - **Filterset missing**: returns `{ isMissing: true }` (no qfilter, no endpoint).
  - **Static entry**: returns the declared `endpoint`/`qfilter`/`name`/`description` verbatim.
  - **`additionalFilter` as string**: AND-appended after the resolved qfilter (`'<resolved> AND <additionalFilter>'`); applies to both kinds.
  - **`additionalFilter` as `QueryFilterState[]`**: prepended into the filter list before `QFBuilder.toQFString` (filterset kind); for static kind, the array is converted to a qfilter via `QFBuilder.toQFString` and AND-appended.
  - **Filterset with `es_filter` content**: the existing `mapPersistedToFilterState` path produces a literal qfilter fragment; verify the output includes it.
**GREEN**: Add `src/features/hunting-trail/builders/build-query-params.ts`. Reuse `mapPersistedToFilterState` from `@/features/filter-sets` (export it via that barrel if not already exported) and `useQFBuilder` / `QFBuilder` from `@/features/query-filters`. Function shape: `buildQueryParams(query: HuntingTrailQuery, filterSets: FilterSet[], additionalFilter?: QueryFilterState[] | string) => ResolvedQuery`. Where `ResolvedQuery = { id: string; endpoint: 'alerts_tail' | 'events_tail'; qfilter: string; name: string; description: string; alertTags?: AlertTagFlags; isMissing?: false } | { id: string; isMissing: true }`.
**REFACTOR**: Extract the additionalFilter-merging helpers if both code paths duplicate logic; otherwise leave inline.
**Files**: `src/features/hunting-trail/builders/build-query-params.ts`, `src/features/hunting-trail/builders/build-query-params.test.ts`, possibly `src/features/filter-sets/index.ts` (re-export `mapPersistedToFilterState` if needed).
**Commit**: `feat(hunting-trail): add buildQueryParams resolver for filterset & static entries`

### Step 3: Add `useGetHuntingTrailQuery` RTK endpoint with parallel queryFn

**Complexity**: complex
**RED**: Write `src/features/hunting-trail/api/hunting-trail.api.test.ts` using msw:
  - With 3 resolved queries (2 alerts_tail + 1 events_tail), endpoint dispatches 3 GET requests in parallel and returns `Record<string, QueryRunResult>` keyed by query id.
  - An `isMissing: true` resolved entry yields a synthetic `{ isError: true, errorReason: 'FILTERSET_MISSING' }` in the result map, **without** firing a network request.
  - Failed requests surface as `{ isError: true }` for that id; successes coexist (partial success works).
  - Re-rendering the same arg shape does not refire the requests (RTK cache reuse).
**GREEN**: Add `src/features/hunting-trail/api/hunting-trail.api.ts` exposing one RTK endpoint via `queryFn`. Args: `{ from: number | undefined; to: number | undefined; tenant: string | undefined; resolvedQueries: ResolvedQuery[] }`. Inside `queryFn`, build a `Promise.allSettled` of `fetchWithBQ` calls (paths `/rules/es/alerts_tail` or `/rules/es/events_tail/` based on `endpoint`), bypass entries with `isMissing: true`, then assemble the map. Use `serializeQueryArgs` (or RTK's default) so the cache key serializes `resolvedQueries` deterministically. Hook is named `useGetHuntingTrailQuery`.
**REFACTOR**: If the fetchWithBQ wrappers per endpoint duplicate, factor into a small `dispatchOne(query)` helper inside the file. No cross-file extraction.
**Files**: `src/features/hunting-trail/api/hunting-trail.api.ts`, `src/features/hunting-trail/api/hunting-trail.api.test.ts`
**Commit**: `feat(hunting-trail): add useGetHuntingTrailQuery RTK endpoint with parallel queryFn`

### Step 4: Refactor `useHuntingTrail` to consume config + filtersets + new endpoint

**Complexity**: complex
**RED**: Rewrite `src/features/hunting-trail/hooks/use-hunting-trail.test.ts`:
  - Mock `useGetFilterSetsQuery` (loading / data / error) and `useGetHuntingTrailQuery` (data / partial-error / all-error).
  - Filter-sets loading → hook returns `isLoading: true`.
  - Filter-sets error → hook returns `isError: true` (Slice B spec: "existing error state").
  - Filter-sets resolved + endpoint settled empty → `isEmpty: true`, `runStats.total === 37`.
  - Missing filterset id (one config entry references id `-9999` not in the response) → that query's id has `isError: true` in the resulting map, `runStats.errored >= 1`, `runStats.total === 37`.
  - additionalFilter string AND-appends through `buildQueryParams`; additionalFilter `QueryFilterState[]` threads through `QFBuilder` (verify by inspecting the args passed to `useGetHuntingTrailQuery`).
  - Group composition still works: events from the result map are slotted into the correct `PurposeSlug` per the config.
**GREEN**: Rewrite `src/features/hunting-trail/hooks/use-hunting-trail.ts`:
  - Drop the 37 parallel `useGetEventsQuery`/`useGetEventsTailQuery` calls.
  - Inputs unchanged: `{ from, to, additionalFilter?: QueryFilterState[] | string }`.
  - Internally: `const { data: filterSets, isLoading: fsLoading, isError: fsError } = useGetFilterSetsQuery();` then `useMemo` resolved queries via `buildQueryParams`; then `useGetHuntingTrailQuery({ from, to, tenant, resolvedQueries })`.
  - Combine fsLoading + endpoint.isLoading into top-level `isLoading`; same for `isError`. `isEmpty` requires both to be settled and all groups empty.
  - Build `groups: Record<PurposeSlug, PurposeGroupData>` from the result map, threading each resolved query's `name`/`description` into the per-event metadata (for Step 5's query-card consumption).
  - Compute `runStats` from the result map.
  - Return shape unchanged: `{ groups, runStats, isLoading, isError, isEmpty }`.
**REFACTOR**: If the hook grows above ~120 lines, extract `composeGroups(resolvedQueries, result)` into a same-file helper.
**Files**: `src/features/hunting-trail/hooks/use-hunting-trail.ts`, `src/features/hunting-trail/hooks/use-hunting-trail.test.ts`
**Commit**: `refactor(hunting-trail): wire useHuntingTrail to config + filtersets + queryFn endpoint`

### Step 5: Thread name/description through `QueryGroup` and `QueryCard`

**Complexity**: standard
**RED**: Update `src/features/hunting-trail/components/query-card/query-card.test.tsx` (or add one if absent — current coverage comes from the parent `purpose-tab-content.test.tsx`):
  - Card title renders `group.name` (passed in), not a value looked up from a map.
  - Card description renders `group.description` markdown.
  - Removing the now-deleted `TYPE_LABEL`/`QUERY_DESCRIPTION` imports doesn't break rendering.
**GREEN**:
  - Extend `QueryGroup` in `src/features/hunting-trail/model/purpose-grouping.ts` to include `name: string; description: string`.
  - Update `groupEventsByType` and `buildPurposeGroups` signatures to take a `getMeta(type) => { name, description }` callback or accept a pre-built map from the hook.
  - Update `src/features/hunting-trail/components/query-card/query-card.tsx`: drop `TYPE_LABEL`/`QUERY_DESCRIPTION` imports; read `group.name` and `group.description`. Keep `TYPE_COLOR` (color tokens stay in the model).
**REFACTOR**: None — pure shape change.
**Files**: `src/features/hunting-trail/model/purpose-grouping.ts`, `src/features/hunting-trail/model/purpose-grouping.test.ts`, `src/features/hunting-trail/components/query-card/query-card.tsx`, `src/features/hunting-trail/components/query-card/query-card.test.tsx` (new if absent), and the hook from Step 4 (already updated to thread metadata).
**Commit**: `refactor(hunting-trail): source card title/description from resolved query metadata`

### Step 6: Drop legacy maps + qfilters file; replace barrel exports

**Complexity**: standard
**RED**: Run `pnpm run check` + `pnpm vitest run`; both must already be green after Steps 1–5. Run `grep -r "TYPE_LABEL\|QUERY_DESCRIPTION\|TIMELINE_TYPE_PRIORITY\|PURPOSE_GROUPS\|ALERT_QFILTERS\|EVENTS_TAIL_QFILTERS"` and confirm only the files about to be deleted/edited reference them.
**GREEN**:
  - Delete `src/features/hunting-trail/definitions/hunting-trail.qfilters.ts`.
  - In `src/features/hunting-trail/model/hunting-trail.ts`: remove `TYPE_LABEL`, `QUERY_DESCRIPTION`, `TIMELINE_TYPE_PRIORITY`, `PURPOSE_GROUPS`. Re-derive `PURPOSE_SLUGS`, `PURPOSE_SLUG_MAP`, `TYPE_COLOR` from `HUNTING_TRAIL_CONFIG`. Re-derive `TimelineEventType` as the union of config entry ids. Keep color tokens + `TypeColorConfig`.
  - Update `summary-matrix.aggregate.ts` to use a derived priority order from config iteration order (replacing `TIMELINE_TYPE_PRIORITY`).
  - In `src/features/hunting-trail/index.ts`: drop the deleted exports; keep `PURPOSE_SLUGS`, `PURPOSE_SLUG_MAP`, `TYPE_COLOR`, `useHuntingTrail`, etc.
  - Update any test that asserted against the removed exports.
**REFACTOR**: None — the goal is leanness.
**Files**: deletions and updates in `definitions/`, `model/`, `components/summary-matrix/`, `index.ts`, possibly test updates in `summary-matrix.aggregate.test.ts` and `purpose-grouping.test.ts`.
**Commit**: `refactor(hunting-trail): drop legacy qfilter maps; derive slug/color from config`

## Complexity Classification

| Step | Rating | Reasoning |
|---|---|---|
| 1 | standard | New data file with shape tests; no behavior change |
| 2 | complex | New abstraction with branching logic and two `additionalFilter` paths; reuses existing pipeline |
| 3 | complex | New RTK endpoint with `queryFn` fan-out; cache-key design; partial-failure semantics |
| 4 | complex | Hook internals fully rewritten; cross-cutting (loading/error aggregation across two RTK calls) |
| 5 | standard | Shape extension and consumer rewrite within an established pattern |
| 6 | standard | Mechanical deletion + re-derivation; guarded by passing tests |

## Pre-PR Quality Gate

- [ ] All tests pass (`pnpm vitest run`)
- [ ] Type check passes (`pnpm run check`)
- [ ] Linter passes (`pnpm run lint --fix` clean)
- [ ] Formatter applied (`pnpm run fmt`)
- [ ] `/code-review --changed` passes
- [ ] msw assertions confirm filterset entries route to the correct endpoint by `page` field
- [ ] `runStats.total === HUNTING_TRAIL_CONFIG.queries.length` for both views (host + network)
- [ ] No reference to `ALERT_QFILTERS` / `EVENTS_TAIL_QFILTERS` / `TYPE_LABEL` / `QUERY_DESCRIPTION` remains in `src/`

## Risks & Open Questions

- **Risk — filtersets pre-fetched elsewhere**: if `useGetFilterSetsQuery` is already fetched by another part of the app (sidebar, etc.), Slice B adds no extra request. If it's not, the hunting trail introduces a new dependency. Mitigation: grep before Step 4; if first-call wave, document the extra request in the PR description.
- **Risk — `resolvedQueries` cache key size**: RTK serializes args into the cache key. 37 entries × ~200 chars each = ~7KB key. Acceptable but worth checking devtools. Mitigation: if it becomes a concern, derive a stable hash and pass that as the arg, looking up the actual queries inside `queryFn` via `getState()`.
- **Risk — `QueryFilterState[]` consumers**: no current call site uses the array form (host + threats both pass strings). Adding the array support is forward-looking for future consumers. If you'd rather defer until needed, drop that path from Step 2 and re-add later.
- **Open question — `mapPersistedToFilterState` export**: it currently lives in `src/features/filter-sets/components/sidebar-filter-sets/sidebar-filter-sets.molecules.tsx`. The cleanest move is to lift it to `src/features/filter-sets/builders/` and re-export it via the filter-sets barrel. If that move is out of scope, Step 2 can inline a copy of the 8-line function with a TODO.
- **Open question — `useQFBuilder` vs `QFBuilder`**: the existing usage in `useFilterSetQueryParams` calls `useQFBuilder()` as a hook (returns the same surface; presumably memoized with definitions/suffix from context). The builder utility in Step 2 is a pure function. Decide whether `buildQueryParams` calls `useQFBuilder` (then becomes hook-shaped) or accepts a `QFBuilder` instance as a param (stays pure). Recommend the latter for testability; the hook layer instantiates `QFBuilder` once and passes it down.
- **Open question — error reason payload shape**: the spec says missing-filterset queries return a synthetic error. Decide whether the error reason (e.g., `'FILTERSET_MISSING'`) surfaces to the UI for a more specific message, or stays internal. Default: internal — the existing per-card error state copy suffices.
- **Resolved — filterset's `alert.tag` composite**: honor per-filterset tags, but apply them onto an all-true base. Every flag (`untagged`, `relevant`, `informational`, `alerts`, `sightings`, `stamus`) starts `true`; a flag only becomes `false` when the filterset explicitly sets it to `false`. Missing / `undefined` keys stay `true`. (Differs from `useFilterSetQueryParams`, which falls back to app-wide flags — hunting-trail is permissive by default since its catalog is curated, not user-driven.)
