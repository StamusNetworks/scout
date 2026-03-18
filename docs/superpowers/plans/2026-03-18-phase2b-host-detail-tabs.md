# Phase 2b: Host Detail Tabs Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create entities for 7 host detail tabs and migrate each tab route to a thin orchestrator.

**Architecture:** Each tab becomes an entity in `host-insights/use-cases/host-details/entities/`. Table entities receive typed props (hostId, page, pageSize, sorting, handlers). Non-table entities accept only hostId. Routes wire pagination via usePaginatedSearch and pass typed props.

**Tech Stack:** TanStack Router, RTK Query, Zod, React 19, Tailwind CSS, vitest, MSW.

**Spec:** `docs/superpowers/specs/2026-03-18-phase2b-host-detail-tabs-design.md`

---

## Task 1: HostInsightsView entity + route

**Simple tab** — block grid, no table.

**Files:**
- Create: `src/features/host-insights/use-cases/host-details/entities/host-insights-view/host-insights-view.tsx`
- Modify: `src/routes/_enterprise/hosts/$hostId/index.tsx`
- Delete: `src/pages/hosts/[hostId]/insights/index.tsx`

- [ ] **Step 1:** Read `src/pages/hosts/[hostId]/insights/index.tsx` and `src/routes/_enterprise/hosts/$hostId/index.tsx`
- [ ] **Step 2:** Create entity — accepts `{ hostId: string }`, fetches host via `useGetHostWithAlertsQuery`, renders block grid with `HostValuesSort` + `HostBlock` components. Import blocks from `@/features/host-insights/use-cases/host-details/molecules/`
- [ ] **Step 3:** Rewrite route as thin orchestrator — no search schema needed (no pagination). Wrap in PageBoundary.
- [ ] **Step 4:** Delete old page. Verify no remaining imports.
- [ ] **Step 5:** Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`
- [ ] **Step 6:** Commit: `feat(host-insights): add HostInsightsView entity, migrate insights tab`

---

## Task 2: HostIncidentsTable entity + route

**Table tab** with expandable rows showing ProtoFlow.

**Files:**
- Create: `src/features/host-insights/use-cases/host-details/entities/host-incidents/host-incidents-table.tsx`
- Create: `src/features/host-insights/use-cases/host-details/entities/host-incidents/host-incidents-table.test.tsx`
- Modify: `src/routes/_enterprise/hosts/$hostId/incidents.tsx`
- Delete: `src/pages/hosts/[hostId]/incidents/index.tsx` + `threat-status.columns.tsx` + `threat-status.expanded-row.tsx`

- [ ] **Step 1:** Read all 3 page files in `src/pages/hosts/[hostId]/incidents/`. Understand columns, expanded row (ProtoFlow), and threat status API.
- [ ] **Step 2:** Write test — mock threats API. Verify table renders.
- [ ] **Step 3:** Create entity with typed props (`hostId`, `page`, `pageSize`, `sorting`, handlers). Import threat-related primitives from `@/features/hunt/threats/`. Colocate the host-specific columns and expanded row within the entity folder.
- [ ] **Step 4:** Rewrite route — Zod schema `{ page, page_size, sort }`, `usePaginatedSearch`, pass typed props.
- [ ] **Step 5:** Delete old page files. Verify no remaining imports.
- [ ] **Step 6:** Run quality checks.
- [ ] **Step 7:** Commit: `feat(host-insights): add HostIncidentsTable entity, migrate incidents tab`

---

## Task 3: HostDetectionMethodsTable entity + route

**Simple table tab**.

**Files:**
- Create: `src/features/host-insights/use-cases/host-details/entities/host-detection-methods/host-detection-methods-table.tsx`
- Create: `src/features/host-insights/use-cases/host-details/entities/host-detection-methods/host-detection-methods-table.test.tsx`
- Modify: `src/routes/_enterprise/hosts/$hostId/detection-methods.tsx`
- Delete: `src/pages/hosts/[hostId]/detection-methods/index.tsx`

- [ ] **Step 1:** Read page and route files.
- [ ] **Step 2:** Write test.
- [ ] **Step 3:** Create entity with typed props. Uses `useGetSignaturesQuery` scoped by `host_id_qfilter`. Columns from `@/features/detection-methods/detection-methods.table`. Expanded row: `DetectionMethodsExpandedRow` from `@/features/hunt/detection-methods/`.
- [ ] **Step 4:** Rewrite route — thin orchestrator with search schema.
- [ ] **Step 5:** Delete old page.
- [ ] **Step 6:** Run quality checks.
- [ ] **Step 7:** Commit: `feat(host-insights): add HostDetectionMethodsTable entity, migrate tab`

---

## Task 4: HostSightingsTable entity + route

**Simple table tab**.

**Files:**
- Create: `src/features/host-insights/use-cases/host-details/entities/host-sightings/host-sightings-table.tsx`
- Create: `src/features/host-insights/use-cases/host-details/entities/host-sightings/host-sightings-table.test.tsx`
- Modify: `src/routes/_enterprise/hosts/$hostId/sightings.tsx`
- Delete: `src/pages/hosts/[hostId]/sightings/index.tsx`

- [ ] **Step 1:** Read page and route files.
- [ ] **Step 2:** Write test.
- [ ] **Step 3:** Create entity with typed props. Uses `useGetSightingEventsQuery` scoped by `discovery.asset:{hostId}`. Columns: `hostSightingTableColumns` from `@/features/events/sightings/use-cases/sightings-list/sightings-list.table`. Expanded row: `ExpandedEventRow` from `@/features/events/common/molecules/`.
- [ ] **Step 4:** Rewrite route.
- [ ] **Step 5:** Delete old page.
- [ ] **Step 6:** Run quality checks.
- [ ] **Step 7:** Commit: `feat(host-insights): add HostSightingsTable entity, migrate tab`

---

## Task 5: HostOutlierEvents entity + route

**Complex tab** — timeline chart + table.

**Files:**
- Create: `src/features/host-insights/use-cases/host-details/entities/host-outlier-events/host-outlier-events.tsx`
- Create: `src/features/host-insights/use-cases/host-details/entities/host-outlier-events/host-outlier-events.test.tsx`
- Modify: `src/routes/_enterprise/hosts/$hostId/outlier-events.tsx`
- Delete: `src/pages/hosts/[hostId]/outlier-events/index.tsx`

- [ ] **Step 1:** Read page file. Understand: timeline chart (BarChartTimeline with useGetCountsTimelineQuery) + table (detection events columns minus tag, scoped by hostId + stamus_novel:true).
- [ ] **Step 2:** Write test.
- [ ] **Step 3:** Create entity with typed props (hostId, page, pageSize, sorting, handlers). Renders timeline chart + table. Uses detection-events columns from `@/features/events/`. Very similar to the detection-events tab but with `stamus_novel:true` filter added.
- [ ] **Step 4:** Rewrite route.
- [ ] **Step 5:** Delete old page.
- [ ] **Step 6:** Run quality checks.
- [ ] **Step 7:** Commit: `feat(host-insights): add HostOutlierEvents entity, migrate tab`

---

## Task 6: HostBeaconsTable entity + route

**Simple table tab**.

**Files:**
- Create: `src/features/host-insights/use-cases/host-details/entities/host-beacons/host-beacons-table.tsx`
- Create: `src/features/host-insights/use-cases/host-details/entities/host-beacons/host-beacons-table.test.tsx`
- Modify: `src/routes/_enterprise/hosts/$hostId/beacons.tsx`
- Delete: `src/pages/hosts/[hostId]/beacons/index.tsx`

- [ ] **Step 1:** Read page and route files.
- [ ] **Step 2:** Write test.
- [ ] **Step 3:** Create entity with typed props. Uses `useGetBeaconingEventsQuery` scoped by `beacon_report.assets:{hostId}`. Columns: `beaconingTableColumns` from `@/features/events/beaconing/common/molecules/beaconing-table`. Uses the generic beaconing table molecule.
- [ ] **Step 4:** Rewrite route.
- [ ] **Step 5:** Delete old page.
- [ ] **Step 6:** Run quality checks.
- [ ] **Step 7:** Commit: `feat(host-insights): add HostBeaconsTable entity, migrate tab`

---

## Task 7: HostTimeline entity + route

**Complex tab** — two timeline visualizations, no table.

**Files:**
- Create: `src/features/host-insights/use-cases/host-details/entities/host-timeline/host-timeline.tsx`
- Modify: `src/routes/_enterprise/hosts/$hostId/timeline.tsx`
- Delete: `src/pages/hosts/[hostId]/timeline/index.tsx`

- [ ] **Step 1:** Read page file. Understand: ThreatsTimeline (D3 visualization) + HostTimelineTemplate (history events). Both from `@/features/hunt/timeline/`.
- [ ] **Step 2:** Create entity — accepts `{ hostId: string }`. Self-contained (no table, no pagination). Fetches host data + threat history. Renders both timeline sections.
- [ ] **Step 3:** Rewrite route — no search schema needed. Just renders `<HostTimeline hostId={hostId} />`.
- [ ] **Step 4:** Delete old page.
- [ ] **Step 5:** Run quality checks.
- [ ] **Step 6:** Commit: `feat(host-insights): add HostTimeline entity, migrate tab`

---

## Task 8: Final cleanup

- [ ] **Step 1:** Verify all `pages/hosts/[hostId]/` files are deleted. Check: `ls src/pages/hosts/`
- [ ] **Step 2:** If the entire `pages/hosts/` directory is empty, delete it.
- [ ] **Step 3:** Run full test suite: `pnpm vitest run && pnpm run lint --fix && pnpm run check`
- [ ] **Step 4:** Commit: `chore(host-insights): delete remaining host page files`

---

## Post-Migration Notes

Phase 2b complete. All host detail tabs are migrated.

**Remaining in Phase 2c:** Attack surface pages (inventory + visualization) using host-insights primitives.

**Remaining in `src/pages/hosts/`:** Should be empty after this phase. If not, investigate remaining files.
