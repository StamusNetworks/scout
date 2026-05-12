# Plan: Summary Matrix Column Sorting

**Created**: 2026-05-12
**Branch**: `feat-hunting-trails-sorting` (rebased onto `origin/staging`)
**Spec**: In-conversation specification (Intent / Gherkin / Architecture / Acceptance Criteria) — not yet checked in to `docs/superpowers/specs/`.
**Status**: implemented

## Goal

Make the asset×purpose-group matrix on the hunting-trail Summary tab interactively sortable per column. Default order changes to total queries-with-results desc, tiebreak total events desc. Asset column sorts alphabetically by IP string. Each purpose-group column sorts by its cell's `queryCount` (tiebreak `eventCount`), with empty cells always at the bottom regardless of direction. Sort state lives in the URL via TanStack Router (`?sort=` / `?sort=-…`). The shared `DataTableColumnHeader` gains active-direction arrow indicators for use across the codebase.

## Acceptance Criteria

Mirrored from the spec.

- [x] AC1: All Gherkin scenarios pass as automated tests.
- [x] AC2: With no `sort` URL param, rows ordered by `totalQueriesWithResults` desc, tiebreak `totalEvents` desc; no header shows an arrow.
- [x] AC3: `sort=asset` / `sort=-asset` orders rows by asset string (case-insensitive) asc / desc; Asset header shows the matching arrow.
- [x] AC4: Sorting by any purpose-group column places rows with an empty cell for that column at the bottom in both asc and desc.
- [x] AC5: Changing the sort key or direction resets the URL `page` to 1 (covered by `usePaginatedSearch.setSorting`).
- [x] AC6: Deep link `?sort=-lateral-movement` renders sorted by Lateral Movement desc on first paint, with the down arrow visible.
- [x] AC7: Malformed `sort` values (unknown column id, malformed prefix) render the default order without error.
- [x] AC8: `SummaryMatrix` props expose only flat values + handlers (`page`, `pageSize`, `sorting`, `onPageChange`, `onPageSizeChange`, `onSortingChange`) — no `search`-shaped prop.
- [x] AC9: `pnpm run lint --fix` and `pnpm run check` pass with no new errors.
- [x] AC10: Keyboard nav from the new header arrows still works (inherited from `DataTableColumnHeader`).
- [x] AC11: Existing `summary-matrix.*` and `data-table.columnHeader.*` consumers continue to pass; full suite stays at 100 files passing.
- [x] AC12: `sortAssetRows` and `sortingStateToKeyDirection` are pure, exported, and unit-tested without React.

## Steps

### Step 1: Add `totalQueriesWithResults` to `AssetRow`

**Complexity**: standard
**RED**: Add cases to `summary-matrix.aggregate.test.ts` asserting that `buildAssetMatrix` populates `totalQueriesWithResults` on every row as the sum of `cells[*].queryCount`. Cover: row with 1 cell of `queryCount: 3` → total 3; row with 3 cells (counts 2, 1, 4) → total 7; row with one empty cell skipped → total only counts non-empty cells. Existing default-order test still passes for now.
**GREEN**: In `summary-matrix.aggregate.ts`, accumulate `totalQueriesWithResults` alongside `totalEvents` inside `buildAssetMatrix`. Add the field to the `AssetRow` type.
**REFACTOR**: None — wait for Step 2 to consolidate the sort.
**Files**: `src/features/hunting-trail/components/summary-matrix/summary-matrix.aggregate.ts`, `src/features/hunting-trail/components/summary-matrix/summary-matrix.aggregate.test.ts`
**Commit**: `feat(hunting-trail): track totalQueriesWithResults on summary-matrix rows`

### Step 2: Extract pure `sortAssetRows` + adapter; change default order

**Complexity**: standard
**RED**: Add tests in `summary-matrix.aggregate.test.ts`:
- `sortAssetRows(rows, null, 'desc')` → primary `totalQueriesWithResults` desc, tiebreak `totalEvents` desc, tertiary `asset` asc.
- `sortAssetRows(rows, 'asset', 'asc')` → `asset.localeCompare` asc, case-insensitive.
- `sortAssetRows(rows, 'asset', 'desc')` → same comparator descending.
- `sortAssetRows(rows, 'lateral-movement', 'desc')` → that column's `queryCount` desc, tiebreak `eventCount` desc, tertiary `asset` asc.
- `sortAssetRows(rows, 'lateral-movement', 'asc')` → same comparator ascending.
- Empties-last invariant: fixture with one row missing the `lateral-movement` cell → it sorts last for both `asc` and `desc`.
- Default order regression: after this change, `buildAssetMatrix` returns rows pre-sorted by the new default (queries-with-results, then events) — update the existing default-order test fixture to reflect the new ordering.
- `sortingStateToKeyDirection([])` → `{ key: null, direction: 'desc' }`.
- `sortingStateToKeyDirection([{ id: 'asset', desc: false }])` → `{ key: 'asset', direction: 'asc' }`.
- `sortingStateToKeyDirection([{ id: 'unknown-col', desc: true }])` → `{ key: null, direction: 'desc' }` (malformed → default).
- `sortingStateToKeyDirection([{ id: 'lateral-movement', desc: true }])` → `{ key: 'lateral-movement', direction: 'desc' }`.
**GREEN**: In `summary-matrix.aggregate.ts`:
- Export `SortKey = 'asset' | PurposeSlug | null` and `SortDirection = 'asc' | 'desc'`.
- Implement `sortAssetRows(rows, key, direction)`. Always returns a new array; never mutates input. Empties-last rule for purpose-group keys uses early returns (`return 1` / `return -1` regardless of direction).
- Implement `sortingStateToKeyDirection(sorting)` — accepts TanStack `SortingState`; reads only `sorting[0]`; validates `id ∈ {'asset', ...PURPOSE_SLUGS.map(s => s.slug)}` and falls back to `{ key: null, direction: 'desc' }` on unknown id.
- Replace the inline `rows.sort(...)` block in `buildAssetMatrix` with `return sortAssetRows(rows, null, 'desc');`.
**REFACTOR**: If the compare logic grows, extract `compareTotals`, `compareAssetString`, `comparePurposeCell` helpers — only if it improves readability. Keep `AssetRow.groupsWithHits` for now (still computed; not used for sorting, but other surfaces may rely on it — verify with `grep`; if nothing else reads it, remove in a follow-up commit).
**Files**: `src/features/hunting-trail/components/summary-matrix/summary-matrix.aggregate.ts`, `src/features/hunting-trail/components/summary-matrix/summary-matrix.aggregate.test.ts`
**Commit**: `feat(hunting-trail): make summary-matrix row ordering pure and parameterized`

### Step 3: Active-direction arrow in `DataTableColumnHeader`

**Complexity**: standard (shared design-system change)
**RED**: Add `data-table.columnHeader.test.tsx` (new). Use a minimal TanStack table fixture (`useReactTable` with one sortable column) and exercise:
- Column inactive (`getIsSorted() === false`) → trigger button renders `CaretSortIcon` (or matches `data-testid="sort-caret"` / accessible `aria-label="Not sorted"`).
- Column asc (`getIsSorted() === 'asc'`) → trigger renders `ArrowUpIcon`, `aria-label="Sorted ascending"`.
- Column desc (`getIsSorted() === 'desc'`) → trigger renders `ArrowDownIcon`, `aria-label="Sorted descending"`.
**GREEN**: In `data-table.columnHeader.tsx`, replace the trigger's `<CaretSortIcon />` with a small inline branch:
```tsx
const direction = column?.getIsSorted();
const TriggerIcon = direction === 'asc' ? ArrowUpIcon : direction === 'desc' ? ArrowDownIcon : CaretSortIcon;
const triggerAria = direction === 'asc' ? 'Sorted ascending' : direction === 'desc' ? 'Sorted descending' : 'Not sorted';
```
Render `<TriggerIcon />` and pass `aria-label={triggerAria}` to the `Button`. No other changes (Asc / Desc / Hide menu items untouched).
**REFACTOR**: If the same icon-pick logic appears in another header surface during this work, extract a `pickSortIcon` helper. Otherwise inline is fine.
**Files**: `src/common/design-system/molecules/data-table/data-table.columnHeader.tsx`, `src/common/design-system/molecules/data-table/data-table.columnHeader.test.tsx` (new)
**Commit**: `feat(data-table): show active sort direction in column header`

**Cross-cutting note**: After this commit, every consumer of `DataTableColumnHeader` whose column is actively sorted will show the new arrow. This is intentional. Before opening the PR, scan callers (`grep "DataTableColumnHeader"`) and (1) refresh any snapshot tests that captured the static caret, (2) eyeball each table in dev (impacted-entities, deeplinks, detection-events) to confirm nothing layout-breaks.

### Step 4: Migrate Summary route + `SummaryMatrix` to route-orchestrator with sortable headers

**Complexity**: complex
**RED**: Two test files.

*Route test* — `src/routes/_enterprise/hunting-trail/summary.test.tsx` (new). Use TanStack Router's test harness pattern (mirror `detection-events.test.tsx` or similar — confirm during build):
- Initial render with no search params → `SummaryMatrix` receives `page=1`, `pageSize=20`, `sorting=[]`.
- Initial render with `?sort=-lateral-movement&page=2` → `SummaryMatrix` receives `sorting=[{id:'lateral-movement', desc:true}]`, `page=2`.
- Calling `onSortingChange` from the rendered component → URL updates to `?sort=…&page=1` (via `usePaginatedSearch`'s built-in reset).

*Component test* — extend `summary-matrix.test.tsx`:
- Default mount: rows render in `totalQueriesWithResults` desc order; no header shows an arrow.
- `sorting=[{id:'asset', desc:false}]` prop → rows render in asset-string asc order; Asset header shows up arrow.
- `sorting=[{id:'lateral-movement', desc:true}]` prop → rows render with non-empty Lateral Movement cells first (queryCount desc), empties at the bottom; Lateral Movement header shows down arrow.
- Opening the Asset header dropdown and clicking "Asc" calls `onSortingChange` with `[{id:'asset', desc:false}]`.
- Opening the Lateral Movement header dropdown and clicking "Desc" calls `onSortingChange` with `[{id:'lateral-movement', desc:true}]`.
- Malformed `sorting=[{id:'unknown-col', desc:false}]` → renders default order, no error.

**GREEN**: Two files.

*Route* — `src/routes/_enterprise/hunting-trail/summary.tsx`:
- Add `validateSearch` Zod schema:
  ```ts
  const searchSchema = z.object({
    page: z.number().default(1),
    page_size: z.number().default(20),
    sort: z.string().default(''),
  });
  ```
- Inside `SummaryPage`, mirror the detection-events pattern: `Route.useSearch()`, `Route.useNavigate()`, build a `navigate` adapter, call `usePaginatedSearch({ search, navigate }, { resetOn: [globals.tenant, globals.from, globals.to], defaultPageSize: 20 })` (use whichever globals reset paging on this surface — confirm during build by inspecting `useNetworkHuntingTrailContext`).
- Pass `{ groups, page, pageSize, sorting, onPageChange: setPage, onPageSizeChange: setPageSize, onSortingChange }` to `SummaryMatrix`.

*Component* — `src/features/hunting-trail/components/summary-matrix/summary-matrix.tsx`:
- Replace `SummaryMatrixProps` with the flat-props shape (no `search`-typed prop):
  ```ts
  interface SummaryMatrixProps {
    groups: Record<PurposeSlug, PurposeGroupData>;
    page: number;
    pageSize: number;
    sorting: SortingState;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onSortingChange: (updater: Updater<SortingState>) => void;
  }
  ```
- Remove the internal `usePaginationUrlState` call.
- In `useColumns`, set `enableSorting: true` and `header: ({ column }) => <DataTableColumnHeader column={column} title={…} />` on every column, with `id: 'asset'` for the asset column and `id: slug` for each purpose column.
- Sort rows in a `useMemo`:
  ```ts
  const { key, direction } = sortingStateToKeyDirection(sorting);
  const sortedRows = useMemo(
    () => sortAssetRows(rows, key, direction),
    [rows, key, direction],
  );
  ```
- Pass `state: { sorting }`, `onSortingChange`, `manualSorting: true` to the underlying `Table` molecule so TanStack Table knows the active column (powering `column.getIsSorted()`) without trying to re-sort the data itself. If `Table` doesn't already forward these to `useReactTable`, add minimal forwarding in the molecule (verify scope at build time — flag if molecule API needs extension; that becomes Step 4a).
- Pagination footer: `onPageChange={(page) => onPageChange(page)}` and `onPageSizeChange={onPageSizeChange}` — drop the local pagination object construction.

**REFACTOR**: If `Table` requires an extension to pass through sorting state, factor that out as a small isolated change (Step 4a) before merging. If `manualSorting` and controlled sorting are already supported, no refactor needed.

**Files**:
- `src/routes/_enterprise/hunting-trail/summary.tsx`
- `src/routes/_enterprise/hunting-trail/summary.test.tsx` (new)
- `src/features/hunting-trail/components/summary-matrix/summary-matrix.tsx`
- `src/features/hunting-trail/components/summary-matrix/summary-matrix.test.tsx`
- Possibly `src/common/design-system/molecules/table/table.tsx` (if missing sort forwarding — flag at build time)

**Commit**: `feat(hunting-trail): sort summary matrix by column via URL`

### Step 5: Manual smoke + lint/typecheck + scan for stale snapshots

**Complexity**: trivial
**RED**: N/A — verification step.
**GREEN**: Run `pnpm run lint --fix && pnpm run check && pnpm test --run`. Start `pnpm run dev`, open the Summary tab in browser, click through Asc/Desc on Asset and one purpose column, refresh with `?sort=-lateral-movement&page=2`, change a global filter to confirm `page` resets, change `sort` to confirm `page` resets to 1.
**REFACTOR**: None.
**Files**: none (verification only).
**Commit**: Squash into Step 4 commit if no fixups land here. Otherwise: `chore(hunting-trail): refresh snapshots and a11y after sort headers`.

## Complexity Classification

| Step | Rating | Why |
|------|--------|-----|
| 1 | standard | Behavioral change to an aggregate function; new public field. |
| 2 | standard | Pure-logic extraction with multiple comparators and a small adapter; new public API. |
| 3 | standard | Shared design-system component with cross-cutting visual impact; needs caller review. |
| 4 | complex | Route migration + component prop-shape change + TanStack Table sorting wiring + multiple new test files. |
| 5 | trivial | Manual smoke + lint/typecheck; no production code. |

## Pre-PR Quality Gate

- [ ] All tests pass (`pnpm test --run`)
- [ ] Type check passes (`pnpm run check`)
- [ ] Linter passes (`pnpm run lint --fix` is clean)
- [ ] `/code-review --changed` passes
- [ ] Manual smoke: default order, asc/desc on Asset, asc/desc on a purpose column with empties, deep link, global-filter change resets page, sort change resets page
- [ ] No snapshot drift in unrelated tables after Step 3 (or drift is reviewed and intentional)
- [ ] Documentation: none expected — the hunting-trail-polish plan didn't add docs and this is the same area.

## Risks & Open Questions

- **R1 — `Table` molecule may not forward controlled sorting state.** If it doesn't expose `state.sorting`, `onSortingChange`, and `manualSorting` to its internal `useReactTable` call, Step 4 needs a small molecule extension (Step 4a). Mitigation: verify in the first 10 minutes of Step 4 by reading `src/common/design-system/molecules/table/table.tsx`; if a change is required, scope it minimally (additive props, no API break for existing callers).
- **R2 — Cross-table visual regression after Step 3.** Direction arrows now appear on every active-sort column across the app. Mitigation: list callers via `grep` after Step 3, smoke each in dev mode, refresh any snapshot tests as a deliberate change.
- **R3 — Snapshot drift in `summary-matrix.test.tsx` from the default-order change (Step 2).** Fixture-based row order in existing tests was tuned to `groupsWithHits` desc; the new default is `totalQueriesWithResults` desc. Mitigation: update fixtures or assertions deliberately as part of Step 2's test edits.
- **R4 — `usePaginatedSearch.resetOn` selection.** Need to confirm which globals should reset the Summary page when they change. Mitigation: read `useNetworkHuntingTrailContext` during Step 4 and mirror detection-events' `[tenant, from, to]` triple if applicable; otherwise pass `[]`.
- **R5 — `AssetRow.groupsWithHits` becomes possibly-unused.** Step 2 keeps it computed. Mitigation: after Step 2, grep usages; if no consumer remains, schedule a follow-up cleanup commit (out of this plan's scope).
- **Q1 — Should the spec artifacts be saved to `docs/superpowers/specs/`?** The route-orchestrator memory references that path. The previous hunting-trail-polish work used it. Asking before Step 1 lands; default is "no, keep specs in the plan + commit message" unless you say otherwise.

## Approval

Status: draft — awaiting human approval. Update to `approved` once confirmed.
