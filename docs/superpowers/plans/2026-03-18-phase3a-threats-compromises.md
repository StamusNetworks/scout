# Phase 3a: Threats Feature + Compromises Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `features/threats/` domain, move threats+entities code, create compromises entities, migrate threats layout + 5 tab routes.

**Architecture:** Move common layer (API, models, shared molecules) first. Create entities for each compromises sub-page. Rewrite routes as thin orchestrators.

**Tech Stack:** TanStack Router, RTK Query, Zod, D3, React 19, vitest, MSW.

**Spec:** `docs/superpowers/specs/2026-03-18-phase3a-threats-compromises-design.md`

---

## Task 1: Move threats common layer

Move threats API, models, hooks, and shared components from `features/hunt/threats/` to `features/threats/common/`.

**Files:** All files in `features/hunt/threats/` → `features/threats/common/`

- [ ] **Step 1:** Read ALL files in `features/hunt/threats/` (api, model, components, hooks, utils, templates)
- [ ] **Step 2:** Move API: `threats.api.ts` → `common/threats.api.ts`. Update imports. Re-export from old location.
- [ ] **Step 3:** Move models: all model files → `common/threats.model.ts` (or keep separate if large). Re-export.
- [ ] **Step 4:** Move shared molecules: `threat-tag.tsx`, `coverage-block/`, `create-edit-threat-form.tsx`, `threat-grid.tsx` → `common/molecules/`. Re-export.
- [ ] **Step 5:** Move hooks: all hooks → `common/hooks/`. Re-export.
- [ ] **Step 6:** Move utils: `combine-threats-stats.ts`, `combine-families-stats.ts` → `common/utils/`. Re-export.
- [ ] **Step 7:** Move templates: all templates → `common/templates/` (these are reused by coverage pages in Phase 3b). Re-export.
- [ ] **Step 8:** Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`
- [ ] **Step 9:** Commit: `refactor(threats): move threats common layer to features/threats`

---

## Task 2: Move entities common layer

Move impacted entities API, models, and shared components from `features/hunt/entities/` to `features/threats/common/`.

**Files:** All files in `features/hunt/entities/` → `features/threats/common/`

- [ ] **Step 1:** Read ALL files in `features/hunt/entities/`
- [ ] **Step 2:** Move API: `entities.api.ts` → `common/entities.api.ts`. Re-export.
- [ ] **Step 3:** Move models → `common/entities.model.ts`. Re-export.
- [ ] **Step 4:** Move components: `impacted-entities-table/`, `entities-force-graph/`, `entities-threat-tags-list/`, `ip-or-entity.tsx`, `attacker-infrastructure/`, `offenders-world-map/`, `threats-table/` → `common/molecules/`. Re-export.
- [ ] **Step 5:** Move hooks: `use-family-class-param.ts`, `useImpactedEntities.tsx`, `useKillChainCounters.tsx` → `common/hooks/`. Re-export.
- [ ] **Step 6:** Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`
- [ ] **Step 7:** Commit: `refactor(threats): move entities common layer to features/threats`

---

## Task 3: Create compromises entities (incidents, entities, graph)

Create entities for the 3 simpler compromises sub-pages.

**Files:**
- Create: `src/features/threats/compromises/use-cases/incidents/incidents.table.tsx`
- Create: `src/features/threats/compromises/use-cases/incidents/entities/incidents-table.tsx`
- Create: `src/features/threats/compromises/use-cases/incidents/entities/incidents-table.test.tsx`
- Create: `src/features/threats/compromises/use-cases/entities/entities/compromises-entities.tsx`
- Create: `src/features/threats/compromises/use-cases/graph/entities/compromises-graph.tsx`

- [ ] **Step 1:** Read `pages/threats/incidents/index.tsx`, `pages/threats/impacted-entities/index.tsx`, `pages/threats/graph/index.tsx`
- [ ] **Step 2:** Create IncidentsTable entity (typed props: hostId-free, page/pageSize/sorting/handlers). Column defs in `incidents.table.tsx`. Fetches `useGetThreatsStatusQuery`. Manages kill chain filter internally. Handles complex empty state (entity count + navigation links).
- [ ] **Step 3:** Create CompromisesEntities entity (self-contained). Renders KillChainCounters + ImpactedEntitiesTable with `familyClass='doc'`.
- [ ] **Step 4:** Create CompromisesGraph entity (self-contained). Renders EntitiesForceGraph with `familyClass='doc'`.
- [ ] **Step 5:** Write test for IncidentsTable.
- [ ] **Step 6:** Run quality checks.
- [ ] **Step 7:** Commit: `feat(threats): add compromises entities (incidents, entities, graph)`

---

## Task 4: Create attack-flow and timeline entities

**Files:**
- Create: `src/features/threats/compromises/use-cases/attack-flow/entities/attack-flow-view.tsx`
- Create: `src/features/threats/compromises/use-cases/timeline/entities/threats-timeline-view.tsx`

- [ ] **Step 1:** Read `pages/threats/attack-flow/index.tsx` and `pages/threats/timeline/index.tsx`
- [ ] **Step 2:** Create AttackFlowView entity (self-contained). Sankey chart with threat columns. Context menu. Fetches its own data.
- [ ] **Step 3:** Create ThreatsTimelineView entity (self-contained). Renders ThreatsTimeline from `@/features/hunt/timeline/` (timeline components stay in hunt for now).
- [ ] **Step 4:** Run quality checks.
- [ ] **Step 5:** Commit: `feat(threats): add attack-flow and timeline entities`

---

## Task 5: Migrate threats layout route + all tab routes

**Files:**
- Modify: `src/routes/_enterprise/threats/route.tsx` — tab layout
- Modify: `src/routes/_enterprise/threats/index.tsx` — redirect to compromises/incidents
- Modify: `src/routes/_enterprise/threats/compromises/route.tsx` — sub-layout if needed
- Modify: `src/routes/_enterprise/threats/compromises/incidents.tsx`
- Modify: `src/routes/_enterprise/threats/compromises/entities.tsx`
- Modify: `src/routes/_enterprise/threats/compromises/graph.tsx`
- Modify: `src/routes/_enterprise/threats/compromises/attack-flow.tsx`
- Modify: `src/routes/_enterprise/threats/timeline.tsx`

- [ ] **Step 1:** Read all current route files and page files to understand tab structure, breadcrumbs, indicators.
- [ ] **Step 2:** Rewrite `threats/route.tsx` as tab layout with Page/PageHeader, IndicatorsDoc, tabs, Outlet.
- [ ] **Step 3:** Rewrite each tab route as thin orchestrator:
  - `incidents.tsx` → IncidentsTable with typed props + usePaginatedSearch
  - `entities.tsx` → CompromisesEntities (no props needed)
  - `graph.tsx` → CompromisesGraph (no props needed)
  - `attack-flow.tsx` → AttackFlowView (no props needed)
  - `timeline.tsx` → ThreatsTimelineView (no props needed)
- [ ] **Step 4:** Run quality checks.
- [ ] **Step 5:** Commit: `feat(threats): migrate threats layout and compromises routes`

---

## Task 6: Delete old pages

- [ ] **Step 1:** Check for remaining imports of old pages.
- [ ] **Step 2:** Delete:
  - `src/pages/threats/index.tsx`
  - `src/pages/threats/compromises/index.tsx`
  - `src/pages/threats/incidents/index.tsx` + test
  - `src/pages/threats/impacted-entities/index.tsx`
  - `src/pages/threats/graph/index.tsx`
  - `src/pages/threats/attack-flow/index.tsx`
  - `src/pages/threats/timeline/index.tsx`
- [ ] **Step 3:** Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`
- [ ] **Step 4:** Commit: `chore(threats): delete old threats/compromises pages`
