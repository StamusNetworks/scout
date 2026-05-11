# Plan: Hunting Trail Polish (Banner + Summary Matrix)

**Created**: 2026-05-11
**Branch**: `feat-201-hunting-trails` (rebased onto `origin/staging`)
**Spec**: [`docs/superpowers/specs/2026-05-11-hunting-trail-polish-design.md`](../docs/superpowers/specs/2026-05-11-hunting-trail-polish-design.md)
**Issues**: #201 (run banner), #202 (summary matrix)
**Status**: implemented

## Goal

Ship a pre-launch legibility layer for Hunting Trail before customer release. Add an aggregate run-status banner ("X queries ran · Y returned results · Learn more →") to every Hunting Trail surface (Host Insights, network-wide page, DoC expanded row), and add a new asset×purpose-group summary matrix that becomes the network-wide page's landing tab. v1 has read-only matrix cells — no drill-through.

## Acceptance Criteria

Mirrored from spec — each maps to one or more steps below.

- [x] AC1: Banner appears on all three surfaces
- [x] AC2: `ran` count = 37 (host) / 36 (network), constant per surface
- [x] AC3: `returnedResults` excludes errored queries
- [x] AC4: Banner is visible from first paint (no skeleton replacement)
- [x] AC5: "Learn more" is `target="_blank" rel="noopener noreferrer"` to `HUNTING_TRAIL_DOCS_URL` placeholder constant
- [x] AC6: `/hunting-trail` redirects to `/hunting-trail/summary`; Summary is the first tab
- [x] AC7: Matrix rows sorted by `groupsWithHits` desc, then `totalEvents` desc
- [x] AC8: Non-empty cells render `"<events> events · <queries> queries"`; empty cells render no text
- [x] AC9: Per-cell event count never exceeds the group's event count (matrix double-counts events across asset rows by design — see spec)
- [x] AC10: Pagination page sizes `[10, 20, 30, 40, 50]` (default 20), `page` + `pageSize` in URL search params, deep-link restores page
- [x] AC11: Empty matrix state shows defined copy; banner still visible
- [x] AC12: Cells inert in v1 (plain DOM, no click handlers)
- [x] AC13: Loading / error / empty states implemented per CLAUDE.md
- [x] AC14: `pnpm run lint --fix` + `pnpm run check` clean; new code covered by vitest/RTL
- [x] AC15: One `RunBanner` import path across all surfaces
- [x] AC16: No regressions to existing purpose tabs; `runStats` is an additive return on the hooks

## Steps

### Step 1: Add `HUNTING_TRAIL_DOCS_URL` constant

**Complexity**: trivial
**RED**: Add a unit test in `hunting-trail.test.ts` (new file or appended) asserting `HUNTING_TRAIL_DOCS_URL` is a non-empty string and that re-exports surface it from `@/features/hunting-trail`.
**GREEN**: Add `export const HUNTING_TRAIL_DOCS_URL = '/* TODO: Hunting Trail docs URL */';` to `src/features/hunting-trail/model/hunting-trail.ts`. Re-export from `src/features/hunting-trail/index.ts`.
**REFACTOR**: None needed.
**Files**: `src/features/hunting-trail/model/hunting-trail.ts`, `src/features/hunting-trail/model/hunting-trail.test.ts` (new), `src/features/hunting-trail/index.ts`
**Commit**: `feat(hunting-trail): add HUNTING_TRAIL_DOCS_URL placeholder constant`

### Step 2: Extend `useHostHuntingTrail` with `runStats`

**Complexity**: standard
**RED**: In `src/features/hunting-trail/hooks/use-host-hunting-trail.test.ts` (new), test cases:
- All 37 queries return empty results → `runStats = { total: 37, withResults: 0, errored: 0 }`.
- 5 queries return ≥1 event, 32 return empty → `withResults: 5`.
- 2 queries error, 4 of the remaining return ≥1 event, rest empty → `{ total: 37, withResults: 4, errored: 2 }`.
- During loading (some queries `isLoading: true`), counters reflect only settled-successful queries with hits so far.
**GREEN**: In `use-host-hunting-trail.ts`, after building `queryResults`, compute `runStats` over `Object.values(queryResults)`. Add `runStats` to the returned object. Type the new field.
**REFACTOR**: None — keep the loop simple; avoid premature extraction until step 3 mirrors it.
**Files**: `src/features/hunting-trail/hooks/use-host-hunting-trail.ts`, `src/features/hunting-trail/hooks/use-host-hunting-trail.test.ts` (new or appended)
**Commit**: `feat(hunting-trail): expose runStats from useHostHuntingTrail`

### Step 3: Extend `useNetworkHuntingTrail` with `runStats`

**Complexity**: standard
**RED**: Test cases parallel to step 2 in `use-network-hunting-trail.test.ts`, but the totals are 36 (no sightings).
**GREEN**: Compute `runStats` identically; return it. Now both hooks return the same shape additively, so extract `computeRunStats(queryResults)` into a helper in `model/hunting-trail.ts` (or a new `model/run-stats.ts` if cleaner) and reuse from both hooks.
**REFACTOR**: Replace inline duplicate logic in both hooks with the shared `computeRunStats` call.
**Files**: `src/features/hunting-trail/hooks/use-network-hunting-trail.ts`, `src/features/hunting-trail/hooks/use-network-hunting-trail.test.ts` (new), `src/features/hunting-trail/model/run-stats.ts` (new), `src/features/hunting-trail/model/run-stats.test.ts` (new), `src/features/hunting-trail/index.ts`
**Commit**: `feat(hunting-trail): expose runStats from useNetworkHuntingTrail and share computeRunStats`

### Step 4: Build `RunBanner` component

**Complexity**: standard
**RED**: In `src/features/hunting-trail/components/run-banner/run-banner.test.tsx`:
- Renders `"36 queries ran · 5 returned results · Learn more →"` for `{ total: 36, withResults: 5 }`.
- Renders `"37 queries ran · 0 returned results · Learn more →"` for `{ total: 37, withResults: 0 }` and stays visible (not replaced by anything).
- "Learn more" anchor has `target="_blank"` and `rel="noopener noreferrer"` and `href` equal to the passed `docsUrl`.
- Component renders even when `withResults === 0` and even when some queries haven't settled — props are values, not state, so timing is the consumer's concern.
**GREEN**: Implement `RunBanner({ total, withResults, docsUrl }: RunBannerProps)` as a pure functional component using the design-system primitives (no surface-specific layout). Render an inline-flex bar with the text and the link.
**REFACTOR**: Verify the banner uses existing design-system classes; no one-off styling.
**Files**: `src/features/hunting-trail/components/run-banner/run-banner.tsx` (new), `src/features/hunting-trail/components/run-banner/run-banner.test.tsx` (new), `src/features/hunting-trail/index.ts`
**Commit**: `feat(hunting-trail): add RunBanner component`

### Step 5: Wire `RunBanner` into the three surfaces

**Complexity**: standard
**RED**: Three test additions:
- `host-hunting-trail.test.tsx`: assert banner is present at top of rendered tree on every render path (loading, error, empty, populated). Banner counts reflect 37 / withResults from mocked data.
- `src/features/threats/components/hunting-trail/hunting-trail.test.tsx`: same assertions for the DoC expanded-row surface.
- `src/routes/_enterprise/hunting-trail/route.tsx` is covered by a route-level test (add `route.test.tsx` if absent) asserting banner sits above the `<Tabs>` strip with `total: 36`.
**GREEN**:
- In `HostHuntingTrail`, destructure `runStats` from `useHostHuntingTrail`; render `<RunBanner total={runStats.total} withResults={runStats.withResults} docsUrl={HUNTING_TRAIL_DOCS_URL} />` above the conditional loading/error/empty/PurposeAggregated tree.
- In `features/threats/components/hunting-trail/hunting-trail.tsx`, same insertion.
- In `routes/_enterprise/hunting-trail/route.tsx`, destructure `runStats` from `useNetworkHuntingTrail` and render the banner above the `<Tabs>` component.
**REFACTOR**: None — single-line insertions.
**Files**: `src/features/host-insights/components/host-hunting-trail/host-hunting-trail.tsx`, `src/features/host-insights/components/host-hunting-trail/host-hunting-trail.test.tsx`, `src/features/threats/components/hunting-trail/hunting-trail.tsx`, `src/features/threats/components/hunting-trail/hunting-trail.test.tsx`, `src/routes/_enterprise/hunting-trail/route.tsx`, plus a route test
**Commit**: `feat(hunting-trail): mount RunBanner on host, network, and DoC surfaces (#201)`

### Step 6: Build `buildAssetMatrix` pure aggregate

**Complexity**: standard
**RED**: In `src/features/hunting-trail/components/summary-matrix/summary-matrix.aggregate.test.ts`:
- Single event with `src_ip = "10.0.0.5"`, `dest_ip = "10.0.0.6"` in Lateral Movement group → two rows, each with one event in that cell, `queryCount: 1`.
- Events of two different `timelineType`s in the same purpose group for the same asset → `eventCount: 2`, `queryCount: 2`.
- Asset appears in three groups vs another asset in two groups → first sorted ahead.
- Ties in `groupsWithHits` broken by `totalEvents` desc.
- Empty input → empty array.
- Events with missing `src_ip` or `dest_ip` → handled gracefully (skip the missing side).
- Column-total invariant: for each purpose slug, `sum of cell.eventCount across rows === groups[slug].events.length`.
**GREEN**: Implement `buildAssetMatrix(groups)` per the spec's algorithm. Return `AssetRow[]` shape defined in spec. Export the function and the `AssetRow` type from `src/features/hunting-trail/index.ts`.
**REFACTOR**: If the row builder grows past ~30 lines, split into named helpers (`accumulateAssets`, `finalizeRow`).
**Files**: `src/features/hunting-trail/components/summary-matrix/summary-matrix.aggregate.ts` (new), `src/features/hunting-trail/components/summary-matrix/summary-matrix.aggregate.test.ts` (new), `src/features/hunting-trail/index.ts`
**Commit**: `feat(hunting-trail): add buildAssetMatrix aggregate for summary matrix`

### Step 7: Build `SummaryMatrix` component with paginated, URL-driven table

**Complexity**: complex
**RED**: In `summary-matrix.test.tsx`:
- Renders one column per `PURPOSE_SLUG` plus the asset column.
- Cell rendering: `"14 events · 3 queries"` and empty cells show no text.
- Rows sorted by `groupsWithHits` desc then `totalEvents` desc.
- Pagination controls present; selecting a page size from `[10, 20, 30, 40, 50]` updates the visible rows.
- Page state hydrates from URL search params on mount.
- Page state writes to URL search params when changing pages.
- Empty state copy when `assetRows.length === 0`.
- Loading skeleton when `groups` are inflight (use `groups[slug].isLoading` aggregation).
- Error state when every group is `isError`.
- Cells are not buttons or links — clicking them does nothing (assert no role=button, no anchor).
**GREEN**:
1. Wire `useNetworkHuntingTrailContext()` to obtain `groups`.
2. Memoize `assetRows = useMemo(() => buildAssetMatrix(groups), [groups])`.
3. Use `data-table` molecule with `getPaginationRowModel`, page-size options `[10, 20, 30, 40, 50]`, default 20.
4. URL state via the existing pattern (`useNavigate` + `Route.useSearch()` on the summary route; component takes `page`, `pageSize`, and an `onChange` handler so route owns the URL).
5. Aggregate loading/error/empty from `groups`.
6. Render plain `<td>` text in cells — no click handlers.
**REFACTOR**: Extract `summary-matrix.columns.ts` if column defs exceed 50 lines.
**Files**: `src/features/hunting-trail/components/summary-matrix/summary-matrix.tsx` (new), `src/features/hunting-trail/components/summary-matrix/summary-matrix.columns.ts` (new if needed), `src/features/hunting-trail/components/summary-matrix/summary-matrix.test.tsx` (new), `src/features/hunting-trail/index.ts`
**Commit**: `feat(hunting-trail): add SummaryMatrix with paginated table and URL state (#202)`

### Step 8: Add `/hunting-trail/summary` route

**Complexity**: standard
**RED**: Route test verifying:
- `/hunting-trail/summary` renders `SummaryMatrix`.
- The route accepts `page` and `pageSize` search params and round-trips them via the URL.
- Pagination state from the URL is reflected on render.
**GREEN**: Create `src/routes/_enterprise/hunting-trail/summary.tsx` with `createFileRoute` declaring the search schema (`page: number`, `pageSize: 10|20|30|40|50`). Render `<SummaryMatrix page={page} pageSize={pageSize} onPageChange={(next) => navigate({ search: next })} />`. Use `validateSearch` for the page-size enum.
**REFACTOR**: None.
**Files**: `src/routes/_enterprise/hunting-trail/summary.tsx` (new), `src/routes/_enterprise/hunting-trail/summary.test.tsx` (new)
**Commit**: `feat(hunting-trail): add /hunting-trail/summary route`

### Step 9: Make Summary the landing tab

**Complexity**: standard
**RED**:
- `src/routes/_enterprise/hunting-trail/index.tsx` test: visiting `/hunting-trail` redirects to `/hunting-trail/summary` (was `lateral-movement`).
- `route.tsx` test: the tab strip lists Summary first, then the 8 existing purpose tabs in order. Summary tab shows no badge.
**GREEN**:
- Update `index.tsx` redirect: `to: '/hunting-trail/summary'`, drop the `params: { purpose: 'lateral-movement' }`.
- In `route.tsx`, prepend a `Summary` `<TabsTrigger>` to the strip before the `PURPOSE_SLUGS.map(...)`. Active state: pathname matches `/hunting-trail/summary`.
**REFACTOR**: None — tab strip stays declarative.
**Files**: `src/routes/_enterprise/hunting-trail/index.tsx`, `src/routes/_enterprise/hunting-trail/route.tsx`, and the existing route tests
**Commit**: `feat(hunting-trail): make Summary the landing tab of the network-wide page (#202)`

### Step 10: Quality gate + manual smoke

**Complexity**: trivial
**RED**: N/A — this is the final gate.
**GREEN**:
- Run `pnpm run lint --fix`, fix anything that surfaces.
- Run `pnpm run check`, fix anything that surfaces.
- Run `pnpm run test` (or vitest equivalent), all green.
- Manual smoke in `pnpm run dev`:
  - Visit `/hunting-trail` → land on `/hunting-trail/summary` with banner + matrix.
  - Open Host Insights for a known host → banner above purpose sections.
  - Open a DoC, expand an impacted asset, switch to Hunting Trail tab → banner above purpose sections.
  - On the summary tab: change page size, paginate, deep-link copy/paste a URL with `?page=2&pageSize=20`, confirm state restores.
**REFACTOR**: Any cleanup surfaced by review.
**Files**: any cleanup files
**Commit**: `chore(hunting-trail): final lint/typecheck pass` (only if changes needed; otherwise skip)

## Complexity Classification

| Step | Complexity |
|---|---|
| 1 | trivial |
| 2 | standard |
| 3 | standard |
| 4 | standard |
| 5 | standard |
| 6 | standard |
| 7 | **complex** |
| 8 | standard |
| 9 | standard |
| 10 | trivial |

## Pre-PR Quality Gate

- [ ] `pnpm run test` passes (vitest + RTL)
- [ ] `pnpm run check` passes (TypeScript)
- [ ] `pnpm run lint --fix` passes (zero warnings)
- [ ] `/code-review --changed` passes
- [ ] Manual smoke on all three Hunting Trail surfaces
- [ ] Manual smoke of URL-driven pagination on `/hunting-trail/summary`
- [ ] `HUNTING_TRAIL_DOCS_URL` is a TODO placeholder (acceptable for v1 ship; flag in PR description)
- [ ] PR targets `staging`, not `main`

## Risks & Open Questions

- **Client-side aggregation cost.** `buildAssetMatrix` walks every event in every group. On a busy network with thousands of events across 36 query types, this is O(events × 2) for the bucket-fill phase. Should be acceptable for the v1 ship (data already fully fetched and held in memory) but worth a perf check on a populated staging dataset during step 10's manual smoke. *Mitigation*: if profiling shows it, memoize harder, or hoist aggregation into a web worker as a follow-up — not in scope here.
- **`Event` type assumption.** The aggregate relies on `src_ip` and `dest_ip` strings on every `TaggedEvent`. The model in `model/hunting-trail.ts` types `TaggedEvent = Event & { timelineType }`. Step 6 needs a defensive read that skips events missing one side; tests already cover this.
- **URL-state hook pattern.** Step 7 + 8 use TanStack Router's `Route.useSearch()` + `navigate({ search })`. If a project-local pagination-with-URL hook exists, reuse it; otherwise implement inline on the summary route. Decision deferred to step 7 — flag in PR if a helper is introduced.
- **`HUNTING_TRAIL_DOCS_URL` placeholder.** Ships as a TODO. Will need to be replaced with the real URL before customer release — separate ticket, not blocking this PR.
- **Existing test breakage.** The hook return shape gets an additive `runStats` field. If any existing test asserts a full object shape with deep equality, it will break. Mitigation: in step 2 and 3, run the touched test files to confirm.
- **Tab ordering with the existing Tabs molecule.** Step 9 prepends Summary. Confirm the `pill-tabs` Tabs molecule renders a non-purpose tab (`/hunting-trail/summary`) without surprises (badge, active-state styling). Mitigation: covered by the route test in step 9.
