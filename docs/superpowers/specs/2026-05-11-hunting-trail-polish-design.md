# Hunting Trail Pre-Launch Polish

> Combined slice for issues **#201 (Hunting trail feedback / query run banner)** and **#202 (Add summary to hunting trails)**. Pre-launch correction before Hunting Trail ships to customers.

## Intent

Hunting Trail is in staging across three surfaces — Host Insights, the network-wide `/hunting-trail` page, and the DoC Impacted Assets expanded row — but two pre-launch gaps make its work illegible to analysts:

1. **Negative space is unreadable.** The system runs ~36 curated queries per surface and displays only the ones that returned hits. An analyst seeing "3 hits" cannot distinguish "33 queries cleared this host" from "the tool barely looked." (#201)
2. **The network-wide page lands on the wrong question.** Today it lands on the *Lateral Movement* purpose tab, forcing analysts to mentally aggregate across 8 purpose tabs to answer their real first question: *"which hosts on my network are most interesting right now?"* (#202)

This bet ships a two-part legibility layer: an aggregate run-status banner on every Hunting Trail surface, and a new asset×purpose-group summary matrix that becomes the network-wide page's landing tab. No drill-through interaction in v1 — matrix cells are read-only.

### Decisions made during shaping

| Decision | Rationale |
|---|---|
| Combined slice rather than two independent slices | User override of single-vertical-slice default. Banner and matrix share data plumbing and the matrix sits beneath the banner on the network-wide page. |
| `ran` count = total dispatched, errored included | "Attempted" is what produces the legibility property. Excluding errors would silently re-create the original opacity problem. |
| `returnedResults` = successful with ≥1 event | Errored queries count toward `ran` denominator only, not toward the `returned` numerator. |
| No drill-through in v1 | Cells render as plain text. Drill-through deferred to a later increment if the matrix proves out. |
| Pagination, not virtualization or top-N cap | Standard `data-table` pagination with page-size options `[10, 20, 30, 40, 50]`, default 20. Page state lives in URL search params. |
| Banner copy is constant phrasing from first paint | "X queries ran · Y returned results · Learn more →". X is constant for the surface; Y grows as queries settle. No verb tense swap. |
| Docs URL is a TODO constant for v1 | `HUNTING_TRAIL_DOCS_URL` placeholder; real URL set when Hunting Trail docs land. Blocks customer-ready sign-off, not v1 ship. |
| Out of scope: Hunting Trail documentation content, click telemetry, per-asset filtering on purpose tabs, asset-scoped panels, server-side aggregation, #201 Scope 2 ("Documentation of Hunting Trails") | Pitch explicitly excludes these. |

### Conflicts resolved against pitch text

- Pitch says "7 purpose groups" — code has **8** (`PURPOSE_GROUPS` in `src/features/hunting-trail/model/hunting-trail.ts`). All artifacts use 8.
- Pitch says "~30 queries" — `useHostHuntingTrail` fires **37** (25 alerts + 11 events-tail + 1 sightings); `useNetworkHuntingTrail` fires **36** (sightings is host-only). Banner shows the actual surface-specific count.

## User-Facing Behavior (Gherkin)

```gherkin
Feature: Hunting Trail run banner
  Background:
    Given I am an analyst with access to the Hunting Trail surfaces

  Scenario: Banner on the network-wide page after all queries settle
    Given I open the network-wide Hunting Trail page
    And the 36 curated network queries have all settled
    And 5 of them returned at least one event
    Then I see a banner reading "36 queries ran · 5 returned results · Learn more →"
    And the banner is positioned above the purpose tab strip

  Scenario: Banner on Host Insights includes the host-scoped sightings query
    Given I open the Hunting Trail panel inside Host Insights for host "10.0.0.5"
    And the 37 curated host queries have all settled
    And 8 of them returned at least one event
    Then I see a banner reading "37 queries ran · 8 returned results · Learn more →"

  Scenario: Banner on the DoC expanded row uses host-scoped query set
    Given I expand an Impacted Asset on a Declaration of Compromise
    And I open the Hunting Trail tab inside the expanded row
    And the 37 curated host queries have all settled
    Then I see a banner with the same format as Host Insights, scoped to that asset

  Scenario: Banner counts only successful queries with hits in the "returned results" total
    Given the 36 network queries have settled
    And 2 of them errored
    And 4 of the remaining 34 returned at least one event
    Then I see "36 queries ran · 4 returned results · Learn more →"

  Scenario: Banner counts stream as queries settle
    Given I open any Hunting Trail surface
    When some queries are still in flight
    Then the "ran" count is constant for the surface (36 network, 37 host)
    And the "returned results" count reflects only settled-successful queries with hits so far
    And no skeleton replaces the banner — the banner is visible from first paint

  Scenario: Banner remains visible when zero queries return results
    Given the 36 network queries have all settled
    And none of them returned any events
    Then I see "36 queries ran · 0 returned results · Learn more →"
    And the banner is not hidden, replaced, or suppressed

  Scenario: "Learn more" opens documentation in a new tab
    Given I see the banner on any Hunting Trail surface
    When I click "Learn more →"
    Then the configured documentation URL opens in a new browser tab
    And the current page state is preserved

Feature: Network-wide Hunting Trail Summary tab
  Background:
    Given I have opened the network-wide Hunting Trail page

  Scenario: Summary is the landing tab
    When I navigate to "/hunting-trail"
    Then I am redirected to "/hunting-trail/summary"
    And the Summary tab is the active tab
    And the 8 existing purpose tabs follow it in the tab strip

  Scenario: Matrix shows assets ranked by groups-with-hits
    Given the network queries have settled with hits across multiple assets
    Then the matrix shows one row per unique asset (any IP that appears as src or dest in at least one event)
    And rows are sorted by number of purpose groups with hits, descending
    And ties are broken by total event count, descending

  Scenario: Matrix cell shows events and queries-fired counts
    Given asset "10.0.0.5" has 14 events across 3 distinct query types within the Lateral Movement group
    Then the Lateral Movement cell for "10.0.0.5" shows "14 events · 3 queries"
    And cells with zero events render no text

  Scenario: Cell event counts never exceed group totals
    Given the network queries have settled with some events shared across src/dest assets
    Then each cell's event count is less than or equal to the corresponding purpose group's event count
    And the same underlying event may contribute to multiple rows when it involves multiple assets (intended)

  Scenario: Pagination with URL state
    Given the matrix contains more than the selected page size of assets
    Then I see paginated table controls
    And page-size options are 10, 20, 30, 40, 50 (default 20)
    And the current page and page size live in URL search params
    And switching pages preserves sort order
    And a deep link to a specific page restores that page on reload

  Scenario: Empty matrix state
    Given all 36 network queries settled with zero events
    Then the matrix shows "No suspicious activity in the selected time range"
    And the banner above still shows "36 queries ran · 0 returned results · Learn more →"

  Scenario: Loading state for the summary tab
    Given some network queries are still in flight when the page loads
    Then the matrix shows a skeleton consistent with other tables in the app
    And the banner is already visible with streaming counts

  Scenario: Error state for the summary tab
    Given every network query errored
    Then the matrix shows the same error treatment used by purpose tabs

  Scenario: Cells are inert in v1
    Given I see the matrix with populated cells
    When I click a cell
    Then nothing happens (no navigation, no filter applied)
    And the cell renders as plain text, not a button or link
```

## Architecture

### Module map

| Path | Status | Role |
|---|---|---|
| `src/features/hunting-trail/components/run-banner/run-banner.tsx` | new | Pure presentational. Props `{ total, withResults, docsUrl }`. Renders banner copy + `Learn more →` link. |
| `src/features/hunting-trail/components/run-banner/run-banner.test.tsx` | new | RTL: copy, link target/rel, render-from-first-paint, errored exclusion. |
| `src/features/hunting-trail/components/summary-matrix/summary-matrix.tsx` | new | Renders the matrix via `data-table`. Consumes `useNetworkHuntingTrailContext()`. |
| `src/features/hunting-trail/components/summary-matrix/summary-matrix.aggregate.ts` | new | Pure: `(groups) → AssetRow[]`. |
| `src/features/hunting-trail/components/summary-matrix/summary-matrix.aggregate.test.ts` | new | vitest: sort order, src/dest merge, column-total invariant. |
| `src/features/hunting-trail/components/summary-matrix/summary-matrix.test.tsx` | new | RTL: pagination, URL state, empty/loading/error states, inert cells. |
| `src/features/hunting-trail/hooks/use-host-hunting-trail.ts` | modified | Return adds `runStats: { total; withResults; errored }`. |
| `src/features/hunting-trail/hooks/use-network-hunting-trail.ts` | modified | Same `runStats` extension. |
| `src/features/hunting-trail/model/hunting-trail.ts` | modified | Add `HUNTING_TRAIL_DOCS_URL` placeholder constant. |
| `src/features/hunting-trail/index.ts` | modified | Public exports for `RunBanner`, `SummaryMatrix`, `buildAssetMatrix`, `AssetRow`. |
| `src/routes/_enterprise/hunting-trail/route.tsx` | modified | Mount `<RunBanner>` above `<Tabs>`. Prepend Summary to tab strip. |
| `src/routes/_enterprise/hunting-trail/index.tsx` | modified | Redirect target changes from `lateral-movement` to `summary`. |
| `src/routes/_enterprise/hunting-trail/summary.tsx` | new | File route. Renders `<SummaryMatrix />`. |
| `src/features/host-insights/components/host-hunting-trail/host-hunting-trail.tsx` | modified | Insert `<RunBanner>` above `<PurposeAggregated>`. |
| `src/features/threats/components/hunting-trail/hunting-trail.tsx` | modified | Insert `<RunBanner>` above `<PurposeAggregated>`. |

### Data flow

1. `useHostHuntingTrail` / `useNetworkHuntingTrail` already build a `queryResults` map keyed by `TimelineEventType`. Extend the reducer that produces `groups` to also compute:
   - `runStats.total = Object.keys(queryResults).length`
   - `runStats.withResults = count where !isError && (data?.results?.length ?? 0) > 0`
   - `runStats.errored = count where isError`
2. `RunBanner` consumes only `runStats` + `HUNTING_TRAIL_DOCS_URL`. Streams updates via RTK Query's per-query state without any extra wiring.
3. `SummaryMatrix` consumes `groups` via `useNetworkHuntingTrailContext()`. No new network fetches.
4. `buildAssetMatrix(groups)` is pure and memoized via `useMemo`.

### Aggregation algorithm (`buildAssetMatrix`)

```
input:  groups: Record<PurposeSlug, PurposeGroupData>   // each group has events: TaggedEvent[]
output: AssetRow[] sorted by (groupsWithHits desc, totalEvents desc)

AssetRow = {
  asset: string;
  cells: Record<PurposeSlug, { eventCount: number; queryCount: number }>;
  groupsWithHits: number;
  totalEvents: number;
}

algorithm:
  for each purpose slug s in PURPOSE_SLUGS:
    for each event e in groups[s].events:
      for asset in unique({ e.src_ip, e.dest_ip }):       // skip missing/undefined
        row = rowsByAsset.getOrCreate(asset)
        cell = row.cells[s] ||= { eventCount: 0, types: Set<TimelineEventType> }
        cell.eventCount += 1
        cell.types.add(e.timelineType)
  for each row:
    for each cell:
      cell.queryCount = cell.types.size
    row.groupsWithHits = count of cells with eventCount > 0
    row.totalEvents = sum of cell.eventCount across all cells
  sort by (groupsWithHits desc, totalEvents desc)
```

### Pagination

- `data-table` molecule (`src/common/design-system/molecules/data-table/`) with `getPaginationRowModel`.
- Page-size options: `[10, 20, 30, 40, 50]`, default **20**.
- Page + pageSize stored in URL search params. Follow the existing `use-paginated-search` / `use-server-table-state` pattern.
- Sort and page survive page reload via the URL.

### Constraints

- **No new endpoints.** Aggregation is client-side; reuses existing `useNetworkHuntingTrail` data.
- **Banner renders from first paint.** Never replaced by a skeleton.
- **Banner copy is identical across surfaces.** Only the `total` value differs (37 host vs 36 network).
- **Per-category UI is unchanged.** `PurposeTabContent`, `QueryCard`, `PurposeAggregated` are not touched.
- **No drill-through in v1.** Matrix cells are plain text.
- **No breaking API changes.** `runStats` is additive on the existing hook return shape.

### Out of scope

- Documentation content (Peter Manev owns Hunting Trail docs).
- Telemetry on the docs link click.
- Per-asset filtering on existing purpose tabs.
- Asset-scoped panels or new host views.
- Server-side aggregation endpoints.
- #201 Scope 2 ("Documentation of Hunting Trails").

## Acceptance Criteria

| # | Criterion | Pass condition |
|---|---|---|
| AC1 | Banner appears on all three surfaces | Visible at the top of Hunting Trail UI on Host Insights, network-wide `/hunting-trail`, and DoC expanded-row Hunting Trail tab. Verified by component tests + manual smoke. |
| AC2 | `ran` count matches dispatched query count | 37 on host surfaces, 36 on network — asserted in tests. |
| AC3 | `returnedResults` count excludes errored queries | Test mocking 2 errors + 4 non-empty responses across 36 queries shows `36 queries ran · 4 returned results`. |
| AC4 | Banner is visible from first paint | Manual: hard-refresh any surface; banner appears before any skeleton renders below it. Test: render with all queries `isLoading: true` — banner is in DOM. |
| AC5 | "Learn more" opens docs in a new tab | `<a target="_blank" rel="noopener noreferrer">` to `HUNTING_TRAIL_DOCS_URL`. Verified by component test on `target` + `rel`. Constant is a TODO placeholder for v1 ship — blocks customer-ready sign-off, not v1 merge. |
| AC6 | Summary is the landing tab | Visiting `/hunting-trail` redirects to `/hunting-trail/summary`. Tab strip shows Summary first, then the 8 purpose tabs. |
| AC7 | Matrix rows sorted by groups-with-hits desc, then total events desc | Unit test on `buildAssetMatrix` fixtures asserting order. |
| AC8 | Cell content format | Non-empty cells render `"<eventCount> events · <queryCount> queries"`; empty cells render no text. |
| AC9 | Cell event counts never exceed group totals | Per-cell `eventCount ≤ groups[slug].count`. Note: matrix rows double-count events across src/dest assets (an event with src=A, dest=B contributes 1 event to both row A and row B in that group), so column sums may exceed the badge — this is the intended UX (each row reflects asset involvement, not a partition). |
| AC10 | Pagination works with URL state | Page-size options `[10, 20, 30, 40, 50]`, default 20. `page` and `pageSize` URL search params. Deep link to a page restores that page on reload. Sort survives page change. |
| AC11 | Empty matrix state | When all groups have zero events, matrix shows defined empty copy; banner still visible. |
| AC12 | Cells are inert in v1 | Plain DOM, not focusable, no click handler, no navigation. |
| AC13 | Loading/error/empty states implemented per CLAUDE.md | Summary tab handles loading (skeleton), error (matching purpose-tab style), empty (defined copy) explicitly. |
| AC14 | Quality gates green | `pnpm run lint --fix` clean; `pnpm run check` clean; new code covered by colocated vitest/RTL tests. |
| AC15 | Banner reuses identical component across surfaces | Single `RunBanner` import path across Host Insights, network-wide page, DoC. No surface-specific copies. |
| AC16 | No regressions to existing purpose tabs | All current tab routes still render the same content. `useNetworkHuntingTrail` consumers see no breaking API change beyond the additive `runStats`. |

## Consistency gate

| Check | Status |
|---|---|
| Intent unambiguous | PASS |
| Every intent behavior has a BDD scenario | PASS |
| Architecture constrains without over-engineering | PASS |
| Consistent naming across artifacts | PASS — "Hunting Trail", "purpose group" (8 of them), "query type", "asset" |
| No contradictions between artifacts | PASS |

**Verdict: PASS.** Ready for `/plan` or `/build`.
