# Phase 3b: Coverage Pages Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all threats/policy-violations coverage routes to thin orchestrators using shared templates from `features/threats/common/templates/`.

**Architecture:** Coverage pages are thin wrappers around shared templates parameterized by `familyClass` ('doc' or 'dopv'). Templates already live in `features/threats/common/templates/`. Routes pass `familyClass` and route params. Detail pages derive `familyClass` from data.

**Tech Stack:** TanStack Router, RTK Query, Zod, React 19.

---

## Task 1: Migrate threats coverage routes

**Files to modify:**
- `src/routes/_enterprise/threats/coverage/index.tsx` — coverage list
- `src/routes/_enterprise/threats/coverage/family/$familyId/route.tsx` — family layout
- `src/routes/_enterprise/threats/coverage/family/$familyId/index.tsx` — family overview
- `src/routes/_enterprise/threats/coverage/family/$familyId/threats.tsx` — family threats tab
- `src/routes/_enterprise/threats/coverage/family/$familyId/events.tsx` — family events tab
- `src/routes/_enterprise/threats/coverage/family/$familyId/detection-methods.tsx` — family det-methods tab
- `src/routes/_enterprise/threats/coverage/threat/$threatId/route.tsx` — threat layout
- `src/routes/_enterprise/threats/coverage/threat/$threatId/index.tsx` — threat overview
- `src/routes/_enterprise/threats/coverage/threat/$threatId/events.tsx` — threat events tab
- `src/routes/_enterprise/threats/coverage/threat/$threatId/detection-methods.tsx` — threat det-methods tab

**Pages to reference:**
- `src/pages/threats/coverage/index.tsx`
- `src/pages/threats/coverage/family/index.tsx` + sub-pages
- `src/pages/threats/coverage/threat/index.tsx` + sub-pages

- [ ] **Step 1:** Read ALL current route files and page files for threats coverage.

- [ ] **Step 2:** Rewrite coverage list route (`coverage/index.tsx`):
The templates are already at `@/features/threats/common/templates/`. The current page just wraps `CoveragePage` with `familyClass="doc"`. The route becomes:
```tsx
function ThreatsCoveragePage() {
  return <CoveragePage familyClass="doc" />;
}
```
Import from `@/features/threats/common/templates/coverage`. Wrap in PageBoundary.

- [ ] **Step 3:** Rewrite family detail layout (`family/$familyId/route.tsx`):
Currently wraps `ThreatFamilyById` template. The template handles tabs and data fetching internally. The route passes `familyId` param:
```tsx
function ThreatFamilyLayout() {
  const { familyId } = Route.useParams();
  return <ThreatFamilyById familyId={familyId} />;
}
```
Or if the template uses Outlet for tabs, keep the layout + Outlet pattern.

- [ ] **Step 4:** Rewrite family tab routes:
Each tab page is a simple wrapper. Replace imports from `pages/` with imports from `@/features/threats/common/templates/family-by-id/`:
- `index.tsx` → default tab content
- `threats.tsx` → `ThreatFamilyThreatsList`
- `events.tsx` → `ThreatFamilyEvents`
- `detection-methods.tsx` → `ThreatFamilyDetectionMethods`

- [ ] **Step 5:** Rewrite threat detail layout + tab routes:
Same pattern as family:
- `threat/$threatId/route.tsx` → `ThreatById` template with `threatId` param
- `threat/$threatId/index.tsx` → default tab
- `threat/$threatId/events.tsx` → `ThreatByIdEvents`
- `threat/$threatId/detection-methods.tsx` → `ThreatByIdDetectionMethods`

- [ ] **Step 6:** Run: `pnpm run lint --fix && pnpm run check`
- [ ] **Step 7:** Commit: `feat(threats): migrate threats coverage routes`

---

## Task 2: Migrate policy-violations coverage routes

Same pattern as threats coverage but with `familyClass="dopv"`.

**Files to modify:** All files in `src/routes/_enterprise/policy-violations/coverage/`

**Pages to reference:** `src/pages/policy-violations/coverage/`

- [ ] **Step 1:** Read all PV coverage route + page files.

- [ ] **Step 2:** Rewrite coverage list: `<CoveragePage familyClass="dopv" />`

- [ ] **Step 3:** Rewrite family detail + tab routes (same templates as threats, familyClass derived from data).

- [ ] **Step 4:** Rewrite threat/policy-violation detail + tab routes.

Note: PV coverage uses the same `ThreatById` and `ThreatFamilyById` templates as threats — the templates handle `familyClass` internally by reading it from the data object.

- [ ] **Step 5:** Run quality checks.
- [ ] **Step 6:** Commit: `feat(policy-violations): migrate coverage routes`

---

## Task 3: Delete old coverage pages

- [ ] **Step 1:** Check for remaining imports of old pages.
- [ ] **Step 2:** Delete:
  - `src/pages/threats/coverage/` (entire directory)
  - `src/pages/policy-violations/coverage/` (entire directory)
- [ ] **Step 3:** Clean up empty parent directories.
- [ ] **Step 4:** Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`
- [ ] **Step 5:** Commit: `chore: delete old coverage pages`
