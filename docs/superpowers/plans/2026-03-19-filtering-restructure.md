# Filtering Feature Restructure Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure `src/features/filtering/` into clean architecture with repository pattern, use-case services, and colocated UI components — no behavior changes.

**Architecture:** Repositories are React hooks wrapping Redux slices as dumb read/write adapters. Use-case services compose repositories with business logic. Components live in their relevant use-case folders. The repository interface enables future storage swaps (URL params) without touching use-cases or UI.

**Tech Stack:** Redux Toolkit, RTK Query, React 19, Zod, vitest, react-testing-library.

**Spec:** `docs/superpowers/specs/2026-03-19-filtering-restructure-design.md`

**Important constraints:**
- Redux store keys (`state.filters.queryFilters`, `state.filters.queryFiltersSets`, `state.filters.datesFilters`, `state.filters.tenancy`) MUST NOT change — redux-persist would lose data.
- The `modals.addFiltersCommand` and `modals.saveFilterSetModal` store keys also stay unchanged.
- Every task must leave the app working — run `pnpm run lint --fix && pnpm run check` after each.

---

## File Structure

### Phase A — File Moves

Files move from their current locations to the new folder structure. All imports across the codebase are updated. No logic changes.

### Phase B — Abstraction Layer

New files created alongside existing code:

```
src/features/filtering/
├── dates/
│   └── dates.repository.ts                 # NEW
├── tenant/
│   └── tenant.repository.ts                # NEW
├── filters/
│   ├── tag-filters/
│   │   ├── tag-filters.model.ts            # NEW (types extracted from slice)
│   │   └── tag-filters.repository.ts       # NEW
│   └── query-filters/
│       ├── query-filters.repository.ts     # NEW
│       └── utils/
│           └── suspension-rules.ts         # NEW (pure functions extracted from slice)
```

### Phase C — Use-Case Services

New service hooks, one per use-case folder:

```
use-cases/
├── create-filter/create-filter.ts          # NEW
├── update-filter/update-filter.ts          # NEW
├── delete-filter/delete-filter.ts          # NEW
├── suspend-filter/suspend-filter.ts        # NEW
├── clear-filters/clear-filters.ts          # NEW
├── replace-filters/replace-filters.ts      # NEW
├── upsert-filter-by-role/upsert-filter-by-role.ts  # NEW
├── reorder-filters/reorder-filters.ts      # NEW
├── list-filters/list-filters.ts            # NEW
├── build-qfilter/build-qfilter.ts          # NEW
├── build-host-id-qfilter/build-host-id-qfilter.ts  # NEW
└── build-signature-filter/build-signature-filter.ts # NEW
```

### Phase D — Consumer Migration & Cleanup

Modified files: ~30 files that dispatch actions + store.ts + 102 useGlobalQueryParams consumers.

---

## Task 1: Move dates-filters to `filtering/dates/`

Rename files and update all imports. No logic changes.

**Files:**
- Rename: `src/features/filtering/dates-filters/dates-filters.slice.ts` → `src/features/filtering/dates/dates.store.ts`
- Rename: `src/features/filtering/dates-filters/dates-filters.types.ts` → `src/features/filtering/dates/dates.model.ts`
- Rename: `src/features/filtering/dates-filters/dates-filters.ts` → `src/features/filtering/dates/dates.selectors.ts`
- Rename: `src/features/filtering/dates-filters/dates-filters.utils.ts` → `src/features/filtering/dates/dates.utils.ts`
- Rename: `src/features/filtering/dates-filters/api/dates-filters.api.ts` → `src/features/filtering/dates/dates.api.ts`
- Rename: `src/features/filtering/dates-filters/hooks/use-auto-range.ts` → `src/features/filtering/dates/use-cases/auto-range/use-auto-range.ts`
- Rename: `src/features/filtering/dates-filters/use-previous-dates.ts` → `src/features/filtering/dates/use-cases/previous-dates/use-previous-dates.ts`
- Modify: `src/store/store.ts` (update import path)
- Modify: All files importing from `filtering/dates-filters/`

- [ ] **Step 1: Create the target directory structure**

```bash
mkdir -p src/features/filtering/dates/use-cases/auto-range src/features/filtering/dates/use-cases/previous-dates
```

- [ ] **Step 2: Move files with `git mv`**

```bash
git mv src/features/filtering/dates-filters/dates-filters.slice.ts src/features/filtering/dates/dates.store.ts
git mv src/features/filtering/dates-filters/dates-filters.types.ts src/features/filtering/dates/dates.model.ts
git mv src/features/filtering/dates-filters/dates-filters.ts src/features/filtering/dates/dates.selectors.ts
git mv src/features/filtering/dates-filters/dates-filters.utils.ts src/features/filtering/dates/dates.utils.ts
git mv src/features/filtering/dates-filters/api/dates-filters.api.ts src/features/filtering/dates/dates.api.ts
git mv src/features/filtering/dates-filters/hooks/use-auto-range.ts src/features/filtering/dates/use-cases/auto-range/use-auto-range.ts
git mv src/features/filtering/dates-filters/use-previous-dates.ts src/features/filtering/dates/use-cases/previous-dates/use-previous-dates.ts
```

- [ ] **Step 3: Update internal imports within moved files**

Each moved file has relative imports to its siblings. Update them to reflect new paths. For example, in `dates.store.ts`:

```ts
// Before:
import { DatesAPI } from './api/dates-filters.api';
import { DatesPayload, DatesState, UNITS_IN_MILLISECONDS } from './dates-filters.types';
import { getPersistedDates, persistDates } from './dates-filters.utils';

// After:
import { DatesAPI } from './dates.api';
import { DatesPayload, DatesState, UNITS_IN_MILLISECONDS } from './dates.model';
import { getPersistedDates, persistDates } from './dates.utils';
```

Do the same for `dates.selectors.ts`, `dates.utils.ts`, `dates.api.ts`, `use-auto-range.ts`, and `use-previous-dates.ts`.

- [ ] **Step 4: Update all external imports across the codebase**

Search for all imports from `filtering/dates-filters/` and update to `filtering/dates/`:

```bash
grep -r "filtering/dates-filters/" src/ --include="*.ts" --include="*.tsx" -l
```

Key files to update:
- `src/store/store.ts` — `@/features/filtering/dates-filters/dates-filters.slice` → `@/features/filtering/dates/dates.store`
- `src/common/fetching/useQueryParams.tsx` — `../../features/filtering/dates-filters/dates-filters` → `@/features/filtering/dates/dates.selectors`
- Any component importing dates selectors, types, or hooks

- [ ] **Step 5: Delete the empty `dates-filters/` directory**

```bash
rm -rf src/features/filtering/dates-filters/
```

- [ ] **Step 6: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 7: Run tests**

Run: `pnpm vitest run`
Expected: All tests pass

- [ ] **Step 8: Commit**

```bash
git add -A src/features/filtering/dates-filters/ src/features/filtering/dates/ src/store/store.ts src/common/fetching/
git commit -m "refactor: move dates-filters to filtering/dates/ with new file naming"
```

---

## Task 2: Move query-filters components to use-case folders

Move UI components from the flat `components/` folder into their relevant use-case folders. This is the biggest file move task.

**Files:**
- Move: `components/add-qfilter-command/*` → `use-cases/create-filter/`
- Move: `components/add-es-filter/*` → `use-cases/create-filter/`
- Move: `components/edit-qfilter/*` → `use-cases/update-filter/`
- Move: `components/filters-input.tsx` → `use-cases/update-filter/filter-input.tsx`
- Move: `components/event-value/*` → `use-cases/interactive-value/`
- Move: `components/filters-side-bar.tsx` → `use-cases/list-filters/filters-sidebar.tsx`
- Move: `components/side-bar-query-filter/*` → `use-cases/list-filters/`
- Move: `components/side-bar-filter.tsx` → `use-cases/list-filters/sidebar-filter.tsx`
- Move: `components/filter-label.tsx` → `use-cases/list-filters/filter-label.tsx`
- Move: `components/event-field.tsx` → `use-cases/list-filters/event-field.tsx`
- Move: `components/query-filters.icons.tsx` → `query-filters.icons.tsx` (root of query-filters)

All paths below are relative to `src/features/filtering/query-filters/`.

- [ ] **Step 1: Create target directories**

```bash
mkdir -p src/features/filtering/query-filters/use-cases/create-filter
mkdir -p src/features/filtering/query-filters/use-cases/update-filter
mkdir -p src/features/filtering/query-filters/use-cases/interactive-value/context-menu/options
mkdir -p src/features/filtering/query-filters/use-cases/list-filters
```

Note: some `use-cases/` folders may not exist yet if `load-filter-set.ts` and `enable-tags.ts` were the only ones. Create the full structure.

- [ ] **Step 2: Move create-filter components**

```bash
# add-qfilter-command files
git mv src/features/filtering/query-filters/components/add-qfilter-command/add-qfilter-command.tsx src/features/filtering/query-filters/use-cases/create-filter/
git mv src/features/filtering/query-filters/components/add-qfilter-command/add-qfilter-command.slice.ts src/features/filtering/query-filters/use-cases/create-filter/
git mv src/features/filtering/query-filters/components/add-qfilter-command/add-qfilter-command.selectors.ts src/features/filtering/query-filters/use-cases/create-filter/
git mv src/features/filtering/query-filters/components/add-qfilter-command/add-qfilter-command.slice.test.ts src/features/filtering/query-filters/use-cases/create-filter/
git mv src/features/filtering/query-filters/components/add-qfilter-command/filter-options.tsx src/features/filtering/query-filters/use-cases/create-filter/
git mv src/features/filtering/query-filters/components/add-qfilter-command/operator-options.tsx src/features/filtering/query-filters/use-cases/create-filter/
git mv src/features/filtering/query-filters/components/add-qfilter-command/values-options.tsx src/features/filtering/query-filters/use-cases/create-filter/

# add-es-filter
git mv src/features/filtering/query-filters/components/add-es-filter/add-es-filter.modal.tsx src/features/filtering/query-filters/use-cases/create-filter/
```

- [ ] **Step 3: Move update-filter components**

```bash
git mv src/features/filtering/query-filters/components/edit-qfilter/edit-filter.modal.tsx src/features/filtering/query-filters/use-cases/update-filter/
git mv src/features/filtering/query-filters/components/edit-qfilter/edit-qfilter-form.tsx src/features/filtering/query-filters/use-cases/update-filter/
git mv src/features/filtering/query-filters/components/filters-input.tsx src/features/filtering/query-filters/use-cases/update-filter/filter-input.tsx
```

- [ ] **Step 4: Move interactive-value components**

```bash
git mv src/features/filtering/query-filters/components/event-value/event-value.tsx src/features/filtering/query-filters/use-cases/interactive-value/
git mv src/features/filtering/query-filters/components/event-value/event-value.test.tsx src/features/filtering/query-filters/use-cases/interactive-value/
git mv src/features/filtering/query-filters/components/event-value/context-menu/context-menu.content.tsx src/features/filtering/query-filters/use-cases/interactive-value/context-menu/
git mv src/features/filtering/query-filters/components/event-value/context-menu/options/mitre.tsx src/features/filtering/query-filters/use-cases/interactive-value/context-menu/options/
git mv src/features/filtering/query-filters/components/event-value/context-menu/options/threat-family-name.tsx src/features/filtering/query-filters/use-cases/interactive-value/context-menu/options/
git mv src/features/filtering/query-filters/components/event-value/context-menu/options/threat-name.tsx src/features/filtering/query-filters/use-cases/interactive-value/context-menu/options/
```

- [ ] **Step 5: Move list-filters components**

```bash
git mv src/features/filtering/query-filters/components/filters-side-bar.tsx src/features/filtering/query-filters/use-cases/list-filters/filters-sidebar.tsx
git mv src/features/filtering/query-filters/components/side-bar-query-filter/side-bar-query-filter.tsx src/features/filtering/query-filters/use-cases/list-filters/sidebar-query-filter.tsx
git mv src/features/filtering/query-filters/components/side-bar-filter.tsx src/features/filtering/query-filters/use-cases/list-filters/sidebar-filter.tsx
git mv src/features/filtering/query-filters/components/filter-label.tsx src/features/filtering/query-filters/use-cases/list-filters/filter-label.tsx
git mv src/features/filtering/query-filters/components/event-field.tsx src/features/filtering/query-filters/use-cases/list-filters/event-field.tsx
```

Delete the `side-bar-query-filter/index.ts` barrel file (now orphaned):

```bash
rm src/features/filtering/query-filters/components/side-bar-query-filter/index.ts
```

- [ ] **Step 6: Move filterset-related components to staging area**

These will move to `filtersets/` in Task 4 but need to leave `components/` now. Move them to temporary locations under `use-cases/`:

```bash
mkdir -p src/features/filtering/query-filters/use-cases/save-filter-set
mkdir -p src/features/filtering/query-filters/use-cases/delete-filter-set
mkdir -p src/features/filtering/query-filters/use-cases/pinned-filter-sets

git mv src/features/filtering/query-filters/components/save-filterset/save-filterset.dialog.tsx src/features/filtering/query-filters/use-cases/save-filter-set/
git mv src/features/filtering/query-filters/components/save-filterset/save-filterset.form.tsx src/features/filtering/query-filters/use-cases/save-filter-set/
git mv src/features/filtering/query-filters/components/save-filterset/save-filterset.slice.ts src/features/filtering/query-filters/use-cases/save-filter-set/
git mv src/features/filtering/query-filters/components/delete-filter-set-confirmation/delete-filter-set-confirmation.tsx src/features/filtering/query-filters/use-cases/delete-filter-set/
git mv src/features/filtering/query-filters/components/side-bar-query-filter-sets/side-bar-query-filter-sets.tsx src/features/filtering/query-filters/use-cases/pinned-filter-sets/sidebar-query-filter-sets.tsx
git mv src/features/filtering/query-filters/components/side-bar-query-filter-sets/side-bar-query-filter-sets.molecules.tsx src/features/filtering/query-filters/use-cases/pinned-filter-sets/sidebar-query-filter-sets.molecules.tsx
```

- [ ] **Step 7: Move icons to query-filters root**

```bash
git mv src/features/filtering/query-filters/components/query-filters.icons.tsx src/features/filtering/query-filters/query-filters.icons.tsx
```

- [ ] **Step 8: Note existing use-cases**

The current `use-cases/enable-tags.ts` will move to tag-filters in Task 3.
The current `use-cases/load-filter-set.ts` will move to filtersets in Task 4.

- [ ] **Step 9: Update all relative imports within moved files**

Each moved file has relative imports to siblings, constants, model, store, hooks, etc. All these paths change. Update every import in every moved file.

Key import path changes (from perspective of files now in `use-cases/<name>/`):
- `../../constants/` stays the same (same depth)
- `../../model/` stays the same
- `../../store/` stays the same
- `../../hooks/` stays the same
- Sibling component imports change (e.g., `../edit-qfilter/edit-filter.modal` → `../update-filter/edit-filter.modal`)
- `../query-filters.icons` → `../../query-filters.icons`
- `../save-filterset/save-filterset.slice` → `../save-filter-set/save-filterset.slice` (if still under query-filters; these move to filtersets in Task 4)

- [ ] **Step 10: Update all external imports across the codebase**

Search for all imports from the old component paths:

```bash
grep -r "filtering/query-filters/components/" src/ --include="*.ts" --include="*.tsx" -l
```

Key external consumers:
- `src/features/filter-actions/` — imports `EventValue`, `FilterLabel`
- `src/features/events/` — imports `EventValue`, `EventField`
- `src/features/threats/` — imports `EventValue`
- `src/features/host-insights/` — imports `EventValue`
- `src/features/operational-center/` — imports `EventValue`
- `src/common/design-system/` — imports `EventValue`
- `src/store/store.ts` — imports `addQfilterCommandSlice`, `saveFilterSetModalSlice`
- `src/features/ui/` — imports `FiltersSideBar`

Update each import to the new path.

- [ ] **Step 11: Delete empty `components/` directory**

```bash
rm -rf src/features/filtering/query-filters/components/
```

- [ ] **Step 12: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 13: Run tests**

Run: `pnpm vitest run`
Expected: All tests pass

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "refactor: move query-filters components to use-case folders"
```

---

## Task 3: Extract tag-filters as separate subfolder

Extract `TagFilters`, `AlertTags`, `EventTypes`, `Novelty` types and the `enable-tags` use-case into `filters/tag-filters/`.

**Files:**
- Create: `src/features/filtering/filters/tag-filters/tag-filters.model.ts`
- Move: `src/features/filtering/query-filters/use-cases/enable-tags.ts` → `src/features/filtering/filters/tag-filters/use-cases/update-tag-filters/update-tag-filters.ts`
- Modify: `src/features/filtering/query-filters/store/query-filters.slice.ts` (import types from tag-filters.model.ts instead of defining inline)

- [ ] **Step 1: Create the tag-filters directory**

```bash
mkdir -p src/features/filtering/filters/tag-filters/use-cases/update-tag-filters
```

- [ ] **Step 2: Create tag-filters.model.ts**

Extract the type definitions from `query-filters.slice.ts`:

```ts
// src/features/filtering/filters/tag-filters/tag-filters.model.ts
export type EventTypes = {
  discovery: boolean;
  stamus: boolean;
  alert: boolean;
};

export type AlertTags = {
  relevant: boolean;
  untagged: boolean;
  informational: boolean;
};

export type Novelty = {
  novelty: boolean;
};

export type TagFilters = EventTypes & AlertTags & Novelty;
```

- [ ] **Step 3: Update query-filters.slice.ts to import from tag-filters.model.ts**

Replace the inline type definitions with imports:

```ts
// Before (in query-filters.slice.ts):
export type EventTypes = { ... };
export type AlertTags = { ... };
export type Novelty = { ... };
export type TagFilters = EventTypes & AlertTags & Novelty;

// After:
export type { EventTypes, AlertTags, Novelty, TagFilters } from '@/features/filtering/filters/tag-filters/tag-filters.model';
import type { TagFilters } from '@/features/filtering/filters/tag-filters/tag-filters.model';
```

- [ ] **Step 4: Move enable-tags.ts to update-tag-filters**

```bash
git mv src/features/filtering/query-filters/use-cases/enable-tags.ts src/features/filtering/filters/tag-filters/use-cases/update-tag-filters/update-tag-filters.ts
```

Update internal imports in the moved file and all consumers that import `enable-tags`.

- [ ] **Step 5: Update all consumers importing TagFilters types**

Search for imports of `TagFilters`, `AlertTags`, `EventTypes`, `Novelty` from the query-filters slice. Many can keep importing from the slice (which re-exports), but update any that should import from the canonical location.

- [ ] **Step 6: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 7: Run tests**

Run: `pnpm vitest run`
Expected: All tests pass

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: extract tag-filters types and update-tag-filters use-case"
```

---

## Task 4: Move filtersets to `filtering/filtersets/`

Move all filter-set related files from `query-filters/` to a top-level `filtersets/` subfolder.

**Files:**
- Move: `query-filters/model/query-filterset.schema.ts` → `filtersets/filterset.model.ts`
- Move: `query-filters/store/query-filters-sets.slice.ts` → `filtersets/filtersets.store.ts`
- Move: `query-filters/api/query-filter.api.ts` → `filtersets/filtersets.api.ts`
- Move: `query-filters/use-cases/load-filter-set.ts` → `filtersets/use-cases/load-filter-set/load-filter-set.ts`
- Move: `query-filters/components/save-filterset/*` → `filtersets/use-cases/save-filter-set/` (if not already moved in Task 2)
- Move: `query-filters/components/side-bar-query-filter-sets/*` → `filtersets/use-cases/pinned-filter-sets/`
- Move: `query-filters/components/delete-filter-set-confirmation/*` → `filtersets/use-cases/delete-filter-set/`
- Move: `query-filters/entities/filter-sets-view.*` → `filtersets/use-cases/list-filter-sets/`
- Modify: `src/store/store.ts` (update import paths)

Note: Some of these may have already been moved in Task 2 if they were under `components/`. Check what's left.

- [ ] **Step 1: Create the filtersets directory structure**

```bash
mkdir -p src/features/filtering/filtersets/use-cases/load-filter-set
mkdir -p src/features/filtering/filtersets/use-cases/save-filter-set
mkdir -p src/features/filtering/filtersets/use-cases/delete-filter-set
mkdir -p src/features/filtering/filtersets/use-cases/list-filter-sets
mkdir -p src/features/filtering/filtersets/use-cases/pinned-filter-sets
```

- [ ] **Step 2: Move model, store, and API files**

```bash
git mv src/features/filtering/query-filters/model/query-filterset.schema.ts src/features/filtering/filtersets/filterset.model.ts
git mv src/features/filtering/query-filters/store/query-filters-sets.slice.ts src/features/filtering/filtersets/filtersets.store.ts
git mv src/features/filtering/query-filters/api/query-filter.api.ts src/features/filtering/filtersets/filtersets.api.ts
```

- [ ] **Step 3: Move use-case and component files**

All filterset-related components were moved to `query-filters/use-cases/` in Task 2 Step 6. Now move them to `filtersets/use-cases/`:

```bash
# load-filter-set
git mv src/features/filtering/query-filters/use-cases/load-filter-set.ts src/features/filtering/filtersets/use-cases/load-filter-set/load-filter-set.ts

# filter-sets-view entity + test
git mv src/features/filtering/query-filters/entities/filter-sets-view.tsx src/features/filtering/filtersets/use-cases/list-filter-sets/filter-sets-view.tsx
git mv src/features/filtering/query-filters/entities/filter-sets-view.test.tsx src/features/filtering/filtersets/use-cases/list-filter-sets/filter-sets-view.test.tsx

# Move from query-filters use-cases to filtersets use-cases
git mv src/features/filtering/query-filters/use-cases/save-filter-set/ src/features/filtering/filtersets/use-cases/save-filter-set/
git mv src/features/filtering/query-filters/use-cases/pinned-filter-sets/ src/features/filtering/filtersets/use-cases/pinned-filter-sets/
git mv src/features/filtering/query-filters/use-cases/delete-filter-set/ src/features/filtering/filtersets/use-cases/delete-filter-set/

# Move query-filtersets constant to filtersets
git mv src/features/filtering/query-filters/constants/query-filtersets.ts src/features/filtering/filtersets/filtersets.constants.ts
```

- [ ] **Step 4: Update all internal imports within moved files**

Each file needs its relative imports updated: model, store, API files reference each other. The load-filter-set file imports from query-filters slice and filterset model — update paths.

- [ ] **Step 5: Update all external imports**

```bash
grep -r "query-filters/store/query-filters-sets" src/ --include="*.ts" --include="*.tsx" -l
grep -r "query-filters/model/query-filterset" src/ --include="*.ts" --include="*.tsx" -l
grep -r "query-filters/api/query-filter.api" src/ --include="*.ts" --include="*.tsx" -l
```

Update `src/store/store.ts` imports:
```ts
// Before:
import { queryFiltersSetsSlice } from '@/features/filtering/query-filters/store/query-filters-sets.slice';
// After:
import { queryFiltersSetsSlice } from '@/features/filtering/filtersets/filtersets.store';

// Before:
import { saveFilterSetModalSlice } from '@/features/filtering/query-filters/components/save-filterset/save-filterset.slice';
// After:
import { saveFilterSetModalSlice } from '@/features/filtering/filtersets/use-cases/save-filter-set/save-filterset.slice';
```

- [ ] **Step 6: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 7: Run tests**

Run: `pnpm vitest run`
Expected: All tests pass

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: move filtersets to filtering/filtersets/ with dedicated structure"
```

---

## Task 5: Rename query-filters store file and move remaining files

Rename the main slice file and clean up remaining query-filters structure.

**Files:**
- Rename: `query-filters/store/query-filters.slice.ts` → `query-filters/query-filters.store.ts`
- Rename: `query-filters/store/query-filters.selector.ts` → `query-filters/query-filters.selectors.ts`
- Move: `query-filters/store/query-filters.slice.test.ts` → `query-filters/query-filters.store.test.ts`
- Move: `query-filters/store/query-filters.selector.test.ts` → `query-filters/query-filters.selectors.test.ts`
- Move: `query-filters/constants/query-filtersets.ts` → `filtersets/` (if filterset-related)

Note: The path prefix for all files below is `src/features/filtering/`. If there is a `filters/` nesting level in the spec, apply it now or defer — confirm the exact target path: `src/features/filtering/filters/query-filters/` vs `src/features/filtering/query-filters/`. The spec shows `filters/query-filters/`. Move accordingly.

- [ ] **Step 1: Move query-filters under filters/ parent**

```bash
mkdir -p src/features/filtering/filters
git mv src/features/filtering/query-filters src/features/filtering/filters/query-filters
```

- [ ] **Step 2: Rename store files**

```bash
git mv src/features/filtering/filters/query-filters/store/query-filters.slice.ts src/features/filtering/filters/query-filters/query-filters.store.ts
git mv src/features/filtering/filters/query-filters/store/query-filters.selector.ts src/features/filtering/filters/query-filters/query-filters.selectors.ts
git mv src/features/filtering/filters/query-filters/store/query-filters.slice.test.ts src/features/filtering/filters/query-filters/query-filters.store.test.ts
git mv src/features/filtering/filters/query-filters/store/query-filters.selector.test.ts src/features/filtering/filters/query-filters/query-filters.selectors.test.ts
```

- [ ] **Step 3: Move model file to query-filters root**

```bash
git mv src/features/filtering/filters/query-filters/model/query-filter.ts src/features/filtering/filters/query-filters/query-filter.model.ts
rm -rf src/features/filtering/filters/query-filters/model/
```

Note: `query-filterset.schema.ts` was already moved to `filtersets/filterset.model.ts` in Task 4. If the `model/` directory still has other files, move them first.

- [ ] **Step 4: Move build utility files to use-case folders**

```bash
git mv src/features/filtering/filters/query-filters/utils/build-hostid-qfilter.ts src/features/filtering/filters/query-filters/use-cases/build-host-id-qfilter/build-host-id-qfilter.ts
git mv src/features/filtering/filters/query-filters/utils/build-signature-filters.ts src/features/filtering/filters/query-filters/use-cases/build-signature-filter/build-signature-filter.ts
git mv src/features/filtering/filters/query-filters/utils/build-signature-filters.test.ts src/features/filtering/filters/query-filters/use-cases/build-signature-filter/build-signature-filter.test.ts
```

- [ ] **Step 5: Delete empty `store/` directory**

```bash
rm -rf src/features/filtering/filters/query-filters/store/
```

- [ ] **Step 6: Update ALL imports across the entire codebase**

This is the largest import update. Three categories of path changes:

1. **`filtering/query-filters/` → `filtering/filters/query-filters/`** — every external import (41+ files)
2. **`store/query-filters.slice` → `query-filters.store`** — slice consumers
3. **`store/query-filters.selector` → `query-filters.selectors`** — selector consumers
4. **`model/query-filter` → `query-filter.model`** — model consumers
5. **`utils/build-hostid-qfilter` → `use-cases/build-host-id-qfilter/build-host-id-qfilter`** — host qfilter consumers
6. **`utils/build-signature-filters` → `use-cases/build-signature-filter/build-signature-filter`** — signature filter consumers

```bash
# Find all affected files:
grep -r "filtering/query-filters/" src/ --include="*.ts" --include="*.tsx" -l
```

Key files to update:
- `src/store/store.ts` — slice + addQfilterCommandSlice + saveFilterSetModalSlice imports
- `src/common/fetching/useQueryParams.tsx` — selector imports
- ~30 files importing actions
- ~15 files importing selectors
- All the moved component/use-case files from Tasks 2-4

Also update internal imports within `filters/query-filters/` files — any file referencing `../store/`, `../model/`, etc. now uses `../` or `./` relative paths.

- [ ] **Step 7: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 8: Run tests**

Run: `pnpm vitest run`
Expected: All tests pass

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor: move query-filters under filters/, rename store/model files, move build utils to use-cases"
```

---

## Task 6: Extract suspension rules as pure functions

Extract business logic from the query-filters slice reducers into pure, testable functions.

**Files:**
- Create: `src/features/filtering/filters/query-filters/utils/suspension-rules.ts`
- Create: `src/features/filtering/filters/query-filters/utils/suspension-rules.test.ts`

- [ ] **Step 1: Write tests for suspension rules**

Create `suspension-rules.test.ts` with tests covering the current slice behavior:

```ts
// src/features/filtering/filters/query-filters/utils/suspension-rules.test.ts
import { describe, expect, it } from 'vitest';
import { QueryFilterState } from '../query-filter.model';
import {
  applySuspensionOnAdd,
  applyDeduplication,
  applySuspensionOnUpdate,
  applyToggleSuspension,
  applyReplaceLogic,
  applyUpsertByRole,
} from './suspension-rules';

describe('applySuspensionOnAdd', () => {
  it('suspends non-negated siblings when adding non-negated filter for same key', () => {
    const existing: QueryFilterState[] = [
      { id: '1', key: 'src_ip', value: '1.1.1.1', is_suspended: false, is_negated: false, is_wildcarded: false },
    ];
    const newFilter: QueryFilterState = { id: '2', key: 'src_ip', value: '2.2.2.2', is_suspended: false, is_negated: false, is_wildcarded: false };
    const result = applySuspensionOnAdd(existing, newFilter);
    expect(result[0].is_suspended).toBe(true);
  });

  it('does not suspend siblings for keys in authorizeMultipleFilters (msg, es_filter, ip, port)', () => {
    const existing: QueryFilterState[] = [
      { id: '1', key: 'msg', value: 'test', is_suspended: false, is_negated: false, is_wildcarded: true },
    ];
    const newFilter: QueryFilterState = { id: '2', key: 'msg', value: 'other', is_suspended: false, is_negated: false, is_wildcarded: true };
    const result = applySuspensionOnAdd(existing, newFilter);
    expect(result[0].is_suspended).toBe(false);
  });

  it('does not suspend negated siblings', () => {
    const existing: QueryFilterState[] = [
      { id: '1', key: 'src_ip', value: '1.1.1.1', is_suspended: false, is_negated: true, is_wildcarded: false },
    ];
    const newFilter: QueryFilterState = { id: '2', key: 'src_ip', value: '2.2.2.2', is_suspended: false, is_negated: false, is_wildcarded: false };
    const result = applySuspensionOnAdd(existing, newFilter);
    expect(result[0].is_suspended).toBe(false);
  });

  it('does not suspend when new filter is negated', () => {
    const existing: QueryFilterState[] = [
      { id: '1', key: 'src_ip', value: '1.1.1.1', is_suspended: false, is_negated: false, is_wildcarded: false },
    ];
    const newFilter: QueryFilterState = { id: '2', key: 'src_ip', value: '2.2.2.2', is_suspended: false, is_negated: true, is_wildcarded: false };
    const result = applySuspensionOnAdd(existing, newFilter);
    expect(result[0].is_suspended).toBe(false);
  });
});

describe('applyDeduplication', () => {
  it('replaces existing filter with same key and value', () => {
    const existing: QueryFilterState[] = [
      { id: '1', key: 'src_ip', value: '1.1.1.1', is_suspended: false, is_negated: false, is_wildcarded: false },
    ];
    const newFilter: QueryFilterState = { id: '2', key: 'src_ip', value: '1.1.1.1', is_suspended: false, is_negated: false, is_wildcarded: false };
    const result = applyDeduplication(existing, newFilter);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('appends filter when no duplicate exists', () => {
    const existing: QueryFilterState[] = [
      { id: '1', key: 'src_ip', value: '1.1.1.1', is_suspended: false, is_negated: false, is_wildcarded: false },
    ];
    const newFilter: QueryFilterState = { id: '2', key: 'src_ip', value: '2.2.2.2', is_suspended: false, is_negated: false, is_wildcarded: false };
    const result = applyDeduplication(existing, newFilter);
    expect(result).toHaveLength(2);
  });
});

describe('applyToggleSuspension', () => {
  it('toggles is_suspended on the target filter', () => {
    const filters: QueryFilterState[] = [
      { id: '1', key: 'src_ip', value: '1.1.1.1', is_suspended: false, is_negated: false, is_wildcarded: false },
    ];
    const result = applyToggleSuspension(filters, '1');
    expect(result[0].is_suspended).toBe(true);
  });

  it('applies sibling suspension rules when unsuspending', () => {
    const filters: QueryFilterState[] = [
      { id: '1', key: 'src_ip', value: '1.1.1.1', is_suspended: true, is_negated: false, is_wildcarded: false },
      { id: '2', key: 'src_ip', value: '2.2.2.2', is_suspended: false, is_negated: false, is_wildcarded: false },
    ];
    const result = applyToggleSuspension(filters, '1');
    expect(result[0].is_suspended).toBe(false);
    expect(result[1].is_suspended).toBe(true);
  });
});

describe('applyReplaceLogic', () => {
  it('suspends all existing and unsuspends matches', () => {
    const existing: QueryFilterState[] = [
      { id: '1', key: 'src_ip', value: '1.1.1.1', is_suspended: false, is_negated: false, is_wildcarded: false },
    ];
    const newFilters: QueryFilterState[] = [
      { id: '1', key: 'src_ip', value: '1.1.1.1', is_suspended: false, is_negated: false, is_wildcarded: false },
    ];
    const mockCreateFilter = (key: string, value: string | number) => ({
      id: 'new', key, value, is_suspended: false, is_negated: false, is_wildcarded: false,
    });
    const result = applyReplaceLogic(existing, newFilters, mockCreateFilter);
    expect(result[0].is_suspended).toBe(false);
  });
});

describe('applyUpsertByRole', () => {
  it('creates a new filter when no existing filter has the role', () => {
    const existing: QueryFilterState[] = [];
    const newFilter: QueryFilterState = { id: '1', key: 'host_id.net_info.agg', value: 'test', is_suspended: false, is_negated: false, is_wildcarded: false, role: 'attack_surface' };
    const result = applyUpsertByRole(existing, newFilter);
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe('attack_surface');
  });

  it('updates existing filter with same role', () => {
    const existing: QueryFilterState[] = [
      { id: '1', key: 'host_id.net_info.agg', value: 'old', is_suspended: false, is_negated: false, is_wildcarded: false, role: 'attack_surface' },
    ];
    const newFilter: QueryFilterState = { id: '2', key: 'host_id.net_info.agg', value: 'new', is_suspended: false, is_negated: false, is_wildcarded: false, role: 'attack_surface' };
    const result = applyUpsertByRole(existing, newFilter);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('new');
    expect(result[0].id).toBe('1'); // keeps original id
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/features/filtering/filters/query-filters/utils/suspension-rules.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement the pure functions**

Create `suspension-rules.ts` by extracting the logic from the current slice reducers:

```ts
// src/features/filtering/filters/query-filters/utils/suspension-rules.ts
import type { QueryFilterState } from '../query-filter.model';

const AUTHORIZE_MULTIPLE_FILTERS = ['msg', 'es_filter', 'ip', 'port'];

/**
 * Apply sibling suspension rules when adding a new filter.
 * Returns a new array with existing filters' suspension state updated.
 * Does NOT include the new filter in the result.
 */
export function applySuspensionOnAdd(
  existing: QueryFilterState[],
  newFilter: QueryFilterState,
  types?: Record<string, { type: string }>,
): QueryFilterState[] {
  if (
    newFilter.is_negated ||
    AUTHORIZE_MULTIPLE_FILTERS.includes(newFilter.key)
  ) {
    return existing;
  }

  const siblings = existing.filter((f) => f.key === newFilter.key);
  if (siblings.length === 0) return existing;

  return existing.map((f) => {
    if (f.key !== newFilter.key) return f;
    if (f.is_negated) return f;

    if (newFilter.is_wildcarded && types?.[newFilter.key]?.type === 'text') {
      if (f.is_wildcarded) return f;
      return { ...f, is_suspended: true };
    }

    return { ...f, is_suspended: true };
  });
}

/**
 * Handle duplicate detection: if a filter with same key+value exists, replace it.
 * Otherwise append the new filter.
 * Returns the complete new filters array.
 */
export function applyDeduplication(
  filters: QueryFilterState[],
  newFilter: QueryFilterState,
): QueryFilterState[] {
  const copyIndex = filters.findIndex(
    (f) => f.key === newFilter.key && f.value === newFilter.value,
  );
  if (copyIndex >= 0) {
    return filters.map((f, i) => (i === copyIndex ? newFilter : f));
  }
  return [...filters, newFilter];
}

/**
 * Apply sibling suspension rules when updating a filter.
 * Returns the complete updated filters array.
 */
export function applySuspensionOnUpdate(
  filters: QueryFilterState[],
  update: QueryFilterState,
  types?: Record<string, { type: string }>,
): QueryFilterState[] {
  const index = filters.findIndex((f) => f.id === update.id);
  if (index === -1) return filters;

  const withUpdate = filters.map((f, i) =>
    i === index ? { ...f, ...update } : f,
  );

  if (
    update.is_negated ||
    AUTHORIZE_MULTIPLE_FILTERS.includes(update.key)
  ) {
    return withUpdate;
  }

  const siblings = withUpdate.filter(
    (f) => f.key === update.key && f.id !== update.id,
  );
  if (siblings.length === 0) return withUpdate;

  return withUpdate.map((f) => {
    if (f.key !== update.key || f.id === update.id) return f;
    if (f.is_negated) return f;

    if (update.is_wildcarded && types?.[update.key]?.type === 'text') {
      if (f.is_wildcarded) return f;
      return { ...f, is_suspended: true };
    }

    return { ...f, is_suspended: true };
  });
}

/**
 * Toggle suspension on a filter, applying sibling rules when unsuspending.
 */
export function applyToggleSuspension(
  filters: QueryFilterState[],
  filterId: string,
  types?: Record<string, { type: string }>,
): QueryFilterState[] {
  const index = filters.findIndex((f) => f.id === filterId);
  if (index === -1) return filters;

  const filter = filters[index];
  const newSuspended = !filter.is_suspended;

  // First toggle the target
  let result = filters.map((f, i) =>
    i === index ? { ...f, is_suspended: newSuspended } : f,
  );

  // If unsuspending, apply sibling suspension rules
  if (!newSuspended) {
    const updatedFilter = { ...filter, is_suspended: false };
    result = applySuspensionOnAdd(
      result.filter((f) => f.id !== filterId),
      updatedFilter,
      types,
    );
    // Re-insert the unsuspended filter at its original position
    result.splice(index, 0, updatedFilter);
  }

  return result;
}

/**
 * Replace all filters: suspend existing, match or create new.
 */
export function applyReplaceLogic(
  existing: QueryFilterState[],
  newFilters: (QueryFilterState | { key: string; value: string | number; options?: { is_negated?: boolean; is_wildcarded?: boolean; is_suspended?: boolean; role?: string } })[],
  createFilter: (key: string, value: string | number, options?: Record<string, unknown>) => QueryFilterState,
): QueryFilterState[] {
  const suspended = existing.map((f) => ({ ...f, is_suspended: true }));

  newFilters.forEach((newFilter) => {
    const isQueryFilterState = 'id' in newFilter;
    const isNegated = isQueryFilterState ? newFilter.is_negated : !!newFilter.options?.is_negated;
    const isWildcarded = isQueryFilterState ? newFilter.is_wildcarded : !!newFilter.options?.is_wildcarded;

    const copyIndex = suspended.findIndex(
      (f) =>
        f.key === newFilter.key &&
        f.value === newFilter.value &&
        f.is_negated === isNegated &&
        f.is_wildcarded === isWildcarded,
    );

    if (copyIndex >= 0) {
      suspended[copyIndex] = { ...suspended[copyIndex], is_suspended: false };
    } else if (isQueryFilterState) {
      suspended.push(newFilter as QueryFilterState);
    } else {
      suspended.push(createFilter(newFilter.key, newFilter.value as string, newFilter.options));
    }
  });

  return suspended;
}

/**
 * Create or update a filter identified by its role.
 */
export function applyUpsertByRole(
  filters: QueryFilterState[],
  newFilter: QueryFilterState,
): QueryFilterState[] {
  const existingIndex = filters.findIndex((f) => f.role === newFilter.role);

  if (existingIndex === -1) {
    return [...filters, newFilter];
  }

  const { id: _id, ...updates } = newFilter;
  return filters.map((f, i) =>
    i === existingIndex ? { ...f, ...updates } : f,
  );
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm vitest run src/features/filtering/filters/query-filters/utils/suspension-rules.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/features/filtering/filters/query-filters/utils/suspension-rules.ts src/features/filtering/filters/query-filters/utils/suspension-rules.test.ts
git commit -m "feat: extract suspension rules as pure testable functions"
```

---

## Task 7: Add simple CRUD actions to slice and create repositories

Add `setQueryFilters`, `setTagFilters` actions alongside existing ones. Create all 5 repository hooks.

**Files:**
- Modify: `src/features/filtering/filters/query-filters/query-filters.store.ts`
- Create: `src/features/filtering/filters/query-filters/query-filters.repository.ts`
- Create: `src/features/filtering/filters/tag-filters/tag-filters.repository.ts`
- Create: `src/features/filtering/dates/dates.repository.ts`
- Create: `src/features/filtering/filtersets/filtersets.repository.ts`
- Create: `src/features/filtering/tenant/tenant.repository.ts`

- [ ] **Step 1: Add `setQueryFilters` and `setTagFilters` to the slice**

In `query-filters.store.ts`, add two new reducers alongside the existing ones:

```ts
// Add to the reducers object:
setQueryFilters: (state, action: PayloadAction<QueryFilterState[]>) => {
  state.queryFilters = action.payload;
},
setTagFilters: (state, action: PayloadAction<Partial<TagFilters>>) => {
  toPairs(action.payload)
    .filter((value) => !isNil(value))
    .forEach(([key, value]) => {
      if (!isNil(value)) {
        state.tagFilters[key] = value;
      }
    });
},
```

Note: `setTagFilters` uses the same logic as the existing `updateTagFilters`. This is intentional — both coexist during migration. Export both:

```ts
export const {
  // ... existing exports ...
  setQueryFilters,
  setTagFilters,
} = queryFiltersSlice.actions;
```

- [ ] **Step 2: Create useQueryFiltersRepository**

```ts
// src/features/filtering/filters/query-filters/query-filters.repository.ts
import { useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/store';

import type { QueryFilterState } from './query-filter.model';
import type { QueryFilterType } from './query-filter.model';
import {
  clearQueryFilters,
  setQueryFilters,
} from './query-filters.store';

export type QueryFiltersRepository = {
  getAll(): QueryFilterState[];
  getTypes(): Record<string, { type: QueryFilterType }> | undefined;
  set(filters: QueryFilterState[]): void;
  clear(): void;
};

export function useQueryFiltersRepository(): QueryFiltersRepository {
  const filters = useAppSelector(
    (state) => state.filters.queryFilters.queryFilters,
  );
  const types = useAppSelector(
    (state) => state.filters.queryFilters.types,
  );
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      getAll: () => filters,
      getTypes: () => types,
      set: (newFilters: QueryFilterState[]) =>
        dispatch(setQueryFilters(newFilters)),
      clear: () => dispatch(clearQueryFilters()),
    }),
    [filters, types, dispatch],
  );
}
```

- [ ] **Step 3: Create useTagFiltersRepository**

```ts
// src/features/filtering/filters/tag-filters/tag-filters.repository.ts
import { useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/store';

import type { TagFilters } from './tag-filters.model';
import { setTagFilters } from '@/features/filtering/filters/query-filters/query-filters.store';

export type TagFiltersRepository = {
  getAll(): TagFilters;
  set(tags: Partial<TagFilters>): void;
};

export function useTagFiltersRepository(): TagFiltersRepository {
  const tags = useAppSelector(
    (state) => state.filters.queryFilters.tagFilters,
  );
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      getAll: () => tags,
      set: (newTags: Partial<TagFilters>) => dispatch(setTagFilters(newTags)),
    }),
    [tags, dispatch],
  );
}
```

- [ ] **Step 4: Create useDatesRepository**

```ts
// src/features/filtering/dates/dates.repository.ts
import { useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/store';

import type { DatesPayload, DatesState } from './dates.model';
import { selectDates } from './dates.selectors';
import { refreshRange, setDates } from './dates.store';

export type DatesRepository = {
  getAll(): DatesState;
  set(payload: DatesPayload): void;
  refresh(): void;
};

export function useDatesRepository(): DatesRepository {
  const dates = useAppSelector(selectDates);
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      getAll: () => dates,
      set: (payload: DatesPayload) => dispatch(setDates(payload)),
      refresh: () => dispatch(refreshRange()),
    }),
    [dates, dispatch],
  );
}
```

- [ ] **Step 5: Create useFilterSetsRepository**

```ts
// src/features/filtering/filtersets/filtersets.repository.ts
import { useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/store';

import type { QueryFilterSet } from './filterset.model';
import {
  addQueryFilterSets,
  clearQueryFilterSets,
  type QueryFiltersKey,
  removeQueryFilterSet,
  selectLoadedFilterSetId,
  selectQueryFilterSets,
  setLoadedFilterSetId,
} from './filtersets.store';

export type FilterSetsRepository = {
  getLoadedId(): number | null;
  getFavorites(): QueryFilterSet[];
  getPinned(): QueryFilterSet[];
  setLoadedId(id: number): void;
  addToCollection(key: QueryFiltersKey, sets: QueryFilterSet[]): void;
  removeFromCollection(key: QueryFiltersKey, id: number): void;
  clearCollection(key: QueryFiltersKey): void;
};

export function useFilterSetsRepository(): FilterSetsRepository {
  const loadedId = useAppSelector(selectLoadedFilterSetId);
  const favorites = useAppSelector((state) =>
    selectQueryFilterSets(state, 'favorites'),
  );
  const pinned = useAppSelector((state) =>
    selectQueryFilterSets(state, 'pinned'),
  );
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      getLoadedId: () => loadedId,
      getFavorites: () => favorites,
      getPinned: () => pinned,
      setLoadedId: (id: number) => dispatch(setLoadedFilterSetId(id)),
      addToCollection: (key: QueryFiltersKey, sets: QueryFilterSet[]) =>
        dispatch(addQueryFilterSets({ key, sets })),
      removeFromCollection: (key: QueryFiltersKey, id: number) =>
        dispatch(removeQueryFilterSet({ key, id })),
      clearCollection: (key: QueryFiltersKey) =>
        dispatch(clearQueryFilterSets(key)),
    }),
    [loadedId, favorites, pinned, dispatch],
  );
}
```

- [ ] **Step 6: Create useTenantRepository**

```ts
// src/features/filtering/tenant/tenant.repository.ts
import { useMemo } from 'react';

import { selectTenant } from '@/features/user/tenancy/tenancy.selector';
import { useAppSelector } from '@/store/store';

export type TenantRepository = {
  get(): number | undefined;
};

export function useTenantRepository(): TenantRepository {
  const tenant = useAppSelector(selectTenant);

  return useMemo(
    () => ({
      get: () => tenant,
    }),
    [tenant],
  );
}
```

- [ ] **Step 7: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 8: Run tests**

Run: `pnpm vitest run`
Expected: All tests pass

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add repository hooks for all filtering domains"
```

---

## Task 8: Create use-case service hooks

Create all the use-case service hooks that compose repositories with business logic. No consumers change yet — old dispatch pattern still works alongside new hooks.

**Files:**
- Create: `src/features/filtering/filters/query-filters/utils/filter-toast.ts`
- Create: `src/features/filtering/filters/query-filters/use-cases/create-filter/create-filter.ts`
- Create: `src/features/filtering/filters/query-filters/use-cases/update-filter/update-filter.ts`
- Create: `src/features/filtering/filters/query-filters/use-cases/delete-filter/delete-filter.ts`
- Create: `src/features/filtering/filters/query-filters/use-cases/suspend-filter/suspend-filter.ts`
- Create: `src/features/filtering/filters/query-filters/use-cases/clear-filters/clear-filters.ts`
- Create: `src/features/filtering/filters/query-filters/use-cases/replace-filters/replace-filters.ts`
- Create: `src/features/filtering/filters/query-filters/use-cases/upsert-filter-by-role/upsert-filter-by-role.ts`
- Create: `src/features/filtering/filters/query-filters/use-cases/reorder-filters/reorder-filters.ts`
- Create: `src/features/filtering/filters/query-filters/use-cases/list-filters/list-filters.ts`
- Create: `src/features/filtering/filters/query-filters/use-cases/build-qfilter/build-qfilter.ts`
- Create: `src/features/filtering/filters/query-filters/use-cases/build-host-id-qfilter/build-host-id-qfilter.ts`
- Create: `src/features/filtering/filters/query-filters/use-cases/build-signature-filter/build-signature-filter.ts`

- [ ] **Step 1: Create the filter toast helper**

```ts
// src/features/filtering/filters/query-filters/utils/filter-toast.ts
import { toast } from 'sonner';

import { getFilterLabel } from './get-filter-label';

export function showFilterToast(
  action: 'added' | 'updated' | 'deleted',
  filter: { key: string; value: string | number },
) {
  const label = getFilterLabel(filter.key);
  toast.success(`${label} filter ${action}`, {
    description: `value: ${filter.value}`,
  });
}
```

- [ ] **Step 2: Create CRUD use-case hooks**

Create each use-case service following the spec. Each hook uses the repository and pure functions from `suspension-rules.ts`. See the spec for exact signatures. The implementation code for each hook follows the patterns shown in the spec's Use-Case Services section.

Create all use-case directories:
```bash
mkdir -p src/features/filtering/filters/query-filters/use-cases/delete-filter
mkdir -p src/features/filtering/filters/query-filters/use-cases/suspend-filter
mkdir -p src/features/filtering/filters/query-filters/use-cases/clear-filters
mkdir -p src/features/filtering/filters/query-filters/use-cases/replace-filters
mkdir -p src/features/filtering/filters/query-filters/use-cases/upsert-filter-by-role
mkdir -p src/features/filtering/filters/query-filters/use-cases/reorder-filters
mkdir -p src/features/filtering/filters/query-filters/use-cases/build-qfilter
mkdir -p src/features/filtering/filters/query-filters/use-cases/build-host-id-qfilter
mkdir -p src/features/filtering/filters/query-filters/use-cases/build-signature-filter
```

Then create each file following the spec's signatures. Reference the spec section "Use-Case Services" for the exact interface of each hook.

- [ ] **Step 3: Create build use-case hooks**

The build hooks (`useBuildEventsQfilter`, `useBuildHostIdQfilter`, `useBuildSignatureFilter`) replace the current selectors. They compose the query-filters repository, tag-filters repository, and `QFBuilder`.

For `build-qfilter.ts`, preserve the investigation stages logic from `useGlobalQueryParams`:

```ts
// src/features/filtering/filters/query-filters/use-cases/build-qfilter/build-qfilter.ts
import { useMemo } from 'react';

import { esEscape } from '@/common/lib/strings';
import { selectInvestigationFilter } from '@/features/investigation/investigation.slice';
import { useAppSelector } from '@/store/store';

import { FilterCategory } from '../../constants/query-filter.config';
import { getFilterDef } from '../../constants/query-filter.definition';
import { useQFBuilder } from '../../hooks/use-qf-builder';
import type { QueryFilterState } from '../../query-filter.model';
import { useQueryFiltersRepository } from '../../query-filters.repository';
import { useTagFiltersRepository } from '@/features/filtering/filters/tag-filters/tag-filters.repository';
import { selectIsEnterprise } from '@/features/user/settings/settings.slice';

export function useBuildEventsQfilter(
  filterExtension: QueryFilterState[] | string = [],
  options: Partial<{ tags: boolean }> = { tags: true },
): string | undefined {
  const repo = useQueryFiltersRepository();
  const tagRepo = useTagFiltersRepository();
  const qfBuilder = useQFBuilder();
  const investigation = useAppSelector(selectInvestigationFilter);
  const isEnterprise = useAppSelector(selectIsEnterprise);

  return useMemo(() => {
    const queryFilters = repo.getAll();
    const tags = isEnterprise ? tagRepo.getAll() : null;
    const novelty = options?.tags ? tags?.novelty : false;

    // Build investigation extension
    const extension: QueryFilterState[] = [];
    if (investigation?.current.key && investigation?.current.value) {
      extension.push(
        qfBuilder.createFilter(
          investigation.current.key,
          investigation.current.value,
        ),
      );
    }
    if (investigation && investigation.stages.length > 0) {
      investigation.stages.forEach((stage) => {
        extension.push(
          qfBuilder.createFilter(
            'es_filter',
            stage.values
              .map((v) => `${stage.key}:"${esEscape(v)}"`)
              .join(' OR '),
          ),
        );
      });
    }

    if (typeof filterExtension === 'string') {
      const activeFilters = queryFilters
        .filter(
          (f) =>
            getFilterDef(f.key)?.category === FilterCategory.EVENT ||
            (getFilterDef(f.key) === undefined &&
              !f.key.startsWith('host_id.')),
        )
        .filter((f) => !f.is_suspended);
      const filterString = qfBuilder.toQFString(
        activeFilters,
        options.tags ? tags : undefined,
        novelty,
      );
      return `${filterString ? filterString + ' AND ' : ''} ${filterExtension}`;
    }

    const allExtension = [...extension, ...(filterExtension as QueryFilterState[])];
    const activeFilters = [
      ...queryFilters
        .filter(
          (f) =>
            getFilterDef(f.key)?.category === FilterCategory.EVENT ||
            (getFilterDef(f.key) === undefined &&
              !f.key.startsWith('host_id.')),
        )
        .filter((f) => !f.is_suspended),
      ...allExtension.filter(
        (f) =>
          getFilterDef(f.key)?.category === FilterCategory.EVENT ||
          (getFilterDef(f.key) === undefined &&
            !f.key.startsWith('host_id.')),
      ),
    ];

    return qfBuilder.toQFString(activeFilters, tags, novelty);
  }, [repo, tagRepo, qfBuilder, investigation, filterExtension, options, isEnterprise]);
}
```

For `build-host-id-qfilter.ts` and `build-signature-filter.ts`, extract the logic from the current selectors in `query-filters.selectors.ts`.

- [ ] **Step 4: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 5: Run tests**

Run: `pnpm vitest run`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add use-case service hooks for all query-filter operations"
```

---

## Task 9: Migrate consumers to use-case hooks

Replace direct dispatch calls with use-case hook calls. Work through each consumer file. The old and new patterns coexist during this task — old actions are still exported from the slice.

**Files:** ~30 files across the codebase that dispatch query-filter actions directly.

- [ ] **Step 1: Migrate internal filtering components first**

Start with the files that moved in Tasks 2-4 — they're already in use-case folders:

- `use-cases/list-filters/filters-sidebar.tsx` — replace `dispatch(clearQueryFilters())` with `useClearFilters()`, `dispatch(reorderQueryFilters())` with `useReorderFilters()`, `dispatch(updateTagFilters())` with tag-filters `useUpdateTagFilters()`, `dispatch(clearSuspendedFilters())` with `useSuspendFilter().clearSuspended()`
- `use-cases/list-filters/sidebar-query-filter.tsx` — replace `dispatch(deleteQueryFilter())` with `useDeleteFilter()`, `dispatch(suspendQueryFilter())` with `useSuspendFilter().toggle()`, `dispatch(updateQueryFilter())` with `useUpdateFilter()`
- `use-cases/list-filters/sidebar-filter.tsx` — replace `dispatch(updateTagFilters())` with `useUpdateTagFilters()`
- `use-cases/interactive-value/event-value.tsx` — replace `dispatch(addQueryFilter())` with `useCreateFilter()`
- `use-cases/interactive-value/context-menu/context-menu.content.tsx` — replace `dispatch(addQueryFilter())` with `useCreateFilter()`, `dispatch(clearQueryFilters())` with `useClearFilters()`

- [ ] **Step 2: Rewrite `loadFilterSet` imperative function**

`filtersets/use-cases/load-filter-set/load-filter-set.ts` uses `store.dispatch()` directly. Rewrite to use `setQueryFilters` + `setTagFilters` instead of dispatching `addQueryFilter` in a loop:

```ts
// filtersets/use-cases/load-filter-set/load-filter-set.ts
import { toast } from 'sonner';

import { store } from '@/store/store-instance';

import { QFBuilder } from '@/features/filtering/filters/query-filters/utils/qf-builder';
import { QueryFiltersRecord } from '@/features/filtering/filters/query-filters/constants/query-filter.definition';
import { setQueryFilters, setTagFilters } from '@/features/filtering/filters/query-filters/query-filters.store';
import {
  getFiltersFromFilterSet,
  getTagsFromFilterSet,
  QueryFilterSet,
} from '../../filterset.model';
import {
  selectLoadedFilterSetId,
  setLoadedFilterSetId,
} from '../../filtersets.store';

export const loadFilterSet = (filterSet: QueryFilterSet) => {
  const loadedFilterSetId = selectLoadedFilterSetId(store.getState());
  if (loadedFilterSetId === filterSet.id) return;

  const qfBuilder = QFBuilder(QueryFiltersRecord, 'raw');
  const globalFilter = getTagsFromFilterSet(filterSet);
  if (globalFilter) {
    store.dispatch(
      setTagFilters({
        stamus: globalFilter.stamus,
        alert: globalFilter.alerts,
        discovery: globalFilter.sightings,
        informational: globalFilter.informational,
        relevant: globalFilter.relevant,
        untagged: globalFilter.untagged,
      }),
    );
  }

  const persistedFilters = getFiltersFromFilterSet(filterSet);
  const newFilters = (persistedFilters ?? []).map((filter) =>
    qfBuilder.createFilter(filter.id, filter.value as string, {
      is_wildcarded: filter.id === 'es_filter' ? false : !filter.fullString,
      is_negated: filter.negated,
    }),
  );
  store.dispatch(setQueryFilters(newFilters));
  store.dispatch(setLoadedFilterSetId(filterSet.id));
  toast.success('Filterset applied');
};
```

Note: This changes behavior slightly — the old code dispatched `addQueryFilter` per filter (triggering suspension rules per filter). The new code builds the full array and sets it at once. Since `loadFilterSet` always calls `clearQueryFilters` first (now implicit — we set the full array), there are no siblings to suspend. The behavior is equivalent.

- [ ] **Step 3: Migrate external consumers**

For each file, replace the old pattern with the new use-case hook:

```ts
// Before:
import { addQueryFilter } from '@/features/filtering/filters/query-filters/query-filters.store';
const dispatch = useDispatch();
dispatch(addQueryFilter({ key, value, options }));

// After:
import { useCreateFilter } from '@/features/filtering/filters/query-filters/use-cases/create-filter/create-filter';
const createFilter = useCreateFilter();
createFilter({ key, value, options });
```

Key external consumers:
- `src/routes/deeplink.tsx` — uses `addQueryFilter`, `clearQueryFilters`
- `src/routes/share.tsx` — uses `replaceFilters`, `reorderQueryFilters`, `updateTagFilters`
- `src/features/filter-actions/` — uses `addQueryFilter`, `clearQueryFilters`
- `src/features/operational-center/` — uses `clearQueryFilters`, `enableTags`
- `src/features/investigation/` — uses `addQueryFilter`, `clearQueryFilters`, `replaceFilters`, `updateTagFilters`
- `src/features/host-insights/common/network-tree/network-tree.filter-service.ts` — uses `updateOrCreateByRole`, `updateQueryFilter`. This is imperative — refactor to use pure functions + `setQueryFilters`. Note: the current file has a double-dispatch bug (`store.dispatch(store.dispatch(...))` on lines 60-62 and 75-77). Fix this during the rewrite.

Rewrite `NetworkTreeFilterService` to compute the full filters array and dispatch once:

```ts
import { QueryFilterState } from '@/features/filtering/filters/query-filters/query-filter.model';
import { setQueryFilters } from '@/features/filtering/filters/query-filters/query-filters.store';
import { applyUpsertByRole } from '@/features/filtering/filters/query-filters/utils/suspension-rules';
import { QFBuilder } from '@/features/filtering/filters/query-filters/utils/qf-builder';
import { QueryFiltersRecord } from '@/features/filtering/filters/query-filters/constants/query-filter.definition';
import { store } from '@/store/store-instance';

const qfBuilder = QFBuilder(QueryFiltersRecord, 'raw');

export const NetworkTreeFilterService = {
  addFilter: (value: string) => {
    const filters = store.getState().filters.queryFilters.queryFilters;

    // Suspend non-attack-surface siblings
    let updated = filters.map((f: QueryFilterState) =>
      f.key === 'host_id.net_info.agg' && !f.is_suspended && f.role !== 'attack_surface'
        ? { ...f, is_suspended: true }
        : f,
    );

    const newFilter = value === 'Undefined Network'
      ? qfBuilder.createFilter('host_id.net_info.agg', '*', {
          is_negated: true, is_wildcarded: true, is_suspended: false, role: 'attack_surface',
        })
      : qfBuilder.createFilter('host_id.net_info.agg', value, {
          is_negated: false, is_wildcarded: value.includes('*'), is_suspended: false, role: 'attack_surface',
        });

    updated = applyUpsertByRole(updated, newFilter);
    store.dispatch(setQueryFilters(updated));
  },
  clearFilter: () => {
    const filters = store.getState().filters.queryFilters.queryFilters;
    const updated = filters.map((f: QueryFilterState) =>
      f.key === 'host_id.net_info.agg' && !f.is_suspended
        ? { ...f, is_suspended: true }
        : f,
    );
    store.dispatch(setQueryFilters(updated));
  },
  clearFilterNonAttackSurface: () => {
    const filters = store.getState().filters.queryFilters.queryFilters;
    const updated = filters.map((f: QueryFilterState) =>
      f.key === 'host_id.net_info.agg' && f.role !== 'attack_surface' && !f.is_suspended
        ? { ...f, is_suspended: true }
        : f,
    );
    store.dispatch(setQueryFilters(updated));
  },
};
```
- `src/features/ui/global-command/global-command.actions.ts` — uses `clearQueryFilters`
- `src/features/threats/` — uses `addQueryFilter`
- `src/features/events/` — uses `addQueryFilter`
- `src/common/design-system/graphs/world-map/world-map.tsx` — uses `addQueryFilter`

- [ ] **Step 4: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 5: Run full test suite**

Run: `pnpm vitest run`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: migrate all consumers to use-case hooks"
```

---

## Task 10: Simplify query-filters slice and update filtersets extraReducers

Remove old action creators from the slice now that all consumers use the new use-case hooks. Update filtersets store to listen to the simplified actions.

**Files:**
- Modify: `src/features/filtering/filters/query-filters/query-filters.store.ts`
- Modify: `src/features/filtering/filtersets/filtersets.store.ts`
- Modify: `src/features/filtering/filters/query-filters/query-filters.store.test.ts`

- [ ] **Step 1: Remove old action creators from the slice**

In `query-filters.store.ts`, remove all the old reducers and keep only:

```ts
reducers: {
  setQueryFilters: (state, action: PayloadAction<QueryFilterState[]>) => {
    state.queryFilters = action.payload;
  },
  clearQueryFilters: (state) => {
    state.queryFilters = [];
  },
  setTagFilters: (state, action: PayloadAction<Partial<TagFilters>>) => {
    toPairs(action.payload)
      .filter((value) => !isNil(value))
      .forEach(([key, value]) => {
        if (!isNil(value)) {
          state.tagFilters[key] = value;
        }
      });
  },
},
```

Remove: `addQueryFilter`, `updateQueryFilter`, `deleteQueryFilter`, `suspendQueryFilter`, `clearSuspendedFilters`, `reorderQueryFilters`, `replaceFilters`, `updateTagFilters`, `suspendQueryFilters`, `updateOrCreateByRole`.

Remove the `selectQfilterBuilder` selector from the slice (it's duplicated in the selectors file).

Remove the `toast` import and all toast calls.

- [ ] **Step 2: Update filtersets.store.ts extraReducers**

Replace the 8 individual action listeners with the 3 simplified actions:

```ts
extraReducers: (builder) => {
  builder.addCase(setQueryFilters, (state) => {
    state.loaded = null;
  });
  builder.addCase(clearQueryFilters, (state) => {
    state.loaded = null;
  });
  builder.addCase(setTagFilters, (state) => {
    state.loaded = null;
  });
},
```

Import `setQueryFilters`, `clearQueryFilters`, `setTagFilters` from the query-filters store.

- [ ] **Step 3: Update slice tests**

The existing `query-filters.store.test.ts` tests the old action creators. Update to test the simplified CRUD:

- Test `setQueryFilters` replaces entire array
- Test `clearQueryFilters` empties array
- Test `setTagFilters` merges partial tags

The business logic tests (suspension, dedup) are now in `suspension-rules.test.ts`.

- [ ] **Step 4: Verify no remaining imports of old action creators**

```bash
grep -r "addQueryFilter\|deleteQueryFilter\|updateQueryFilter\|suspendQueryFilter\|clearSuspendedFilters\|reorderQueryFilters\|replaceFilters\|updateTagFilters\|suspendQueryFilters\|updateOrCreateByRole" src/ --include="*.ts" --include="*.tsx" -l
```

Expected: Only the slice file itself (re-exporting from use-cases if needed) and test files.

- [ ] **Step 5: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 6: Run full test suite**

Run: `pnpm vitest run`
Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: simplify query-filters slice to dumb CRUD store"
```

---

## Task 11: Move useGlobalQueryParams and final cleanup

Move the hook from `common/fetching/` to `filtering/`, rewrite internals to use build use-cases, update all 102 consumer imports.

**Files:**
- Move: `src/common/fetching/useQueryParams.tsx` → `src/features/filtering/use-global-query-params.ts`
- Modify: 102 files importing `useGlobalQueryParams`

- [ ] **Step 1: Rewrite useGlobalQueryParams to use build use-cases**

```ts
// src/features/filtering/use-global-query-params.ts
import { useMemo } from 'react';

import type { QueryFilterState } from './filters/query-filters/query-filter.model';
import { useBuildEventsQfilter } from './filters/query-filters/use-cases/build-qfilter/build-qfilter';
import { useBuildHostIdQfilter } from './filters/query-filters/use-cases/build-host-id-qfilter/build-host-id-qfilter';
import { useBuildSignatureFilter } from './filters/query-filters/use-cases/build-signature-filter/build-signature-filter';
import { useDatesRepository } from './dates/dates.repository';
import { computeDates } from './dates/dates.selectors';
import { useTenantRepository } from './tenant/tenant.repository';
import { selectEventsTypesParams } from './filters/query-filters/query-filters.selectors';
import { useAppSelector } from '@/store/store';

type SubscribeKey =
  | 'dates'
  | 'tenant'
  | 'qfilter'
  | 'qfilterHost'
  | 'qfilterSignature';

export const useGlobalQueryParams = (
  subscribe?: SubscribeKey[],
  options?: {
    extendQfilter?: QueryFilterState[];
  },
) => {
  const dates = useDatesRepository();
  const tenant = useTenantRepository();
  const eventsTypes = useAppSelector(selectEventsTypesParams);
  const qfilter = useBuildEventsQfilter(options?.extendQfilter);
  const hostIdQfilter = useBuildHostIdQfilter(options?.extendQfilter);
  const signatureFilters = useBuildSignatureFilter(options?.extendQfilter);
  const computedDates = computeDates(dates.getAll());

  return {
    ...(subscribe?.includes('dates') && {
      start_date: computedDates.start_date,
      end_date: computedDates.end_date,
    }),
    ...(subscribe?.includes('qfilter') && {
      qfilter,
      ...eventsTypes,
    }),
    ...(subscribe?.includes('qfilterHost') && {
      host_id_qfilter: hostIdQfilter,
    }),
    ...(subscribe?.includes('qfilterSignature') && signatureFilters),
    ...(subscribe?.includes('tenant') && { tenant: tenant.get() }),
  };
};
```

- [ ] **Step 2: Update all 102 consumer imports**

Search and replace all imports:

```bash
grep -r "useGlobalQueryParams" src/ --include="*.ts" --include="*.tsx" -l
```

Replace:
```ts
// Before:
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
// After:
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';
```

- [ ] **Step 3: Delete old file**

```bash
rm src/common/fetching/useQueryParams.tsx
```

- [ ] **Step 4: Clean up any remaining old files and empty directories**

Check for any leftover files from the migration:

```bash
find src/features/filtering/ -empty -type d
```

Remove any empty directories.

- [ ] **Step 5: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 6: Run full test suite**

Run: `pnpm vitest run`
Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: move useGlobalQueryParams to filtering/ and use build use-cases"
```

---

## Post-Migration Verification

After all tasks are complete:

1. Run the full test suite: `pnpm vitest run` — all tests pass
2. Run lint and type check: `pnpm run lint --fix && pnpm run check` — no errors
3. Run the app: `pnpm dev` — verify:
   - Filter sidebar opens, shows active/suspended filters
   - Adding a filter works (add-filter modal)
   - Editing a filter works
   - Deleting a filter works
   - Suspending/unsuspending works with correct sibling rules
   - Event types and alert tags toggle correctly
   - Filter sets load/save/delete work
   - Date range changes work
   - useGlobalQueryParams still passes correct params to all API calls
   - EventValue right-click → add filter works
   - Network tree filter service works
   - Deeplink and share routes work

## Summary

| Task | Description | Risk |
|------|-------------|------|
| 1 | Move dates-filters to dates/ | Low — file renames |
| 2 | Move query-filters components to use-case folders | Medium — many files, many imports |
| 3 | Extract tag-filters subfolder | Low — type extraction |
| 4 | Move filtersets to filtersets/ | Medium — several files |
| 5 | Rename query-filters store, move under filters/ | Medium — large import update |
| 6 | Extract suspension rules as pure functions | Low — additive, no consumers change |
| 7 | Add CRUD actions + create repositories | Low — additive |
| 8 | Create use-case service hooks | Low — additive, no consumers change |
| 9 | Migrate consumers to use-case hooks | High — touches ~30 files |
| 10 | Simplify slice + update filtersets extraReducers | High — removes old API |
| 11 | Move useGlobalQueryParams + cleanup | Medium — 102 import updates |
