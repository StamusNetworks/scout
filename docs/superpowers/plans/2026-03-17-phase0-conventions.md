# Phase 0: Conventions & Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish feature structure conventions, refactor `usePaginatedSearch` to a props-driven API, and migrate `/detection-methods` as the reference implementation of the thin orchestrator + table entity pattern.

**Architecture:** Routes are thin orchestrators that provide layout (`Page`/`PageHeader`) and delegate to feature entities. Table entities own data fetching, toolbar, table rendering, and pagination. `usePaginatedSearch` is refactored to accept `{ search, navigate }` as plain props instead of a Route object, decoupling entities from the router.

**Tech Stack:** TanStack Router (file-based), TanStack React Table v8, RTK Query, Zod, React 19, Tailwind CSS, vitest, react-testing-library, MSW.

**Spec:** `docs/superpowers/specs/2026-03-17-phase0-conventions-design.md`

---

## File Structure

### New Files

```
src/features/detection-methods/
├── detection-method.model.ts                              # Types (re-export from hunt/)
├── detection-methods.api.ts                               # RTK Query endpoints (re-export from hunt/)
├── detection-methods.table.tsx                            # Columns, export columns, utils
├── use-cases/
│   └── detection-methods-list/
│       └── entities/
│           ├── detection-methods-table.tsx                # Full wired table entity
│           └── detection-methods-table.test.tsx           # Entity test
```

### Modified Files

```
src/common/design-system/molecules/data-table/hooks/
├── use-paginated-search.ts                                # Refactored to { search, navigate } API
└── use-paginated-search.test.ts                           # Updated tests

src/routes/detection-events/index.tsx                      # Updated to new usePaginatedSearch API
src/routes/_enterprise/hosts/$hostId/detection-events.tsx   # Updated to new usePaginatedSearch API
src/routes/detection-methods/index.tsx                     # Thin orchestrator with Page/PageHeader
```

### Deleted Files

```
src/pages/detection-methods/index.tsx                      # Replaced by route orchestrator
```

---

## Task 1: Refactor `usePaginatedSearch` to props-driven API

Change from accepting a Route object to accepting plain `{ search, navigate }`.

**Files:**
- Modify: `src/common/design-system/molecules/data-table/hooks/use-paginated-search.ts`
- Modify: `src/common/design-system/molecules/data-table/hooks/use-paginated-search.test.ts`

- [ ] **Step 1: Update the hook signature and implementation**

Change the first argument from a Route-like object with `useSearch()`/`useNavigate()` hooks to a plain object with `search` and `navigate` values:

```ts
// Before:
export function usePaginatedSearch(
  route: {
    useSearch: () => Record<string, unknown>;
    useNavigate: () => (opts: { ... }) => void;
  },
  options: PaginatedSearchOptions,
): PaginatedSearchResult {
  const search = route.useSearch();
  const navigate = route.useNavigate();
  // ...
}

// After:
export function usePaginatedSearch(
  params: {
    search: Record<string, unknown>;
    navigate: (opts: {
      search: (prev: Record<string, unknown>) => Record<string, unknown>;
      replace?: boolean;
    }) => void;
  },
  options: PaginatedSearchOptions,
): PaginatedSearchResult {
  const { search, navigate } = params;
  // ... rest unchanged
}
```

The internal logic stays the same — only the way `search` and `navigate` are obtained changes.

- [ ] **Step 2: Update all tests**

The test mock changes from:

```ts
function createMockRoute(search: Record<string, unknown>) {
  const navigateFn = vi.fn();
  return {
    route: {
      useSearch: () => search,
      useNavigate: () => navigateFn,
    },
    navigate: navigateFn,
  };
}
// Usage: usePaginatedSearch(route, { resetOn: [] })
```

To:

```ts
function createMockParams(search: Record<string, unknown>) {
  const navigateFn = vi.fn();
  return {
    params: { search, navigate: navigateFn },
    navigate: navigateFn,
  };
}
// Usage: usePaginatedSearch(params, { resetOn: [] })
```

Update every test case to use the new mock structure.

- [ ] **Step 3: Run tests**

Run: `pnpm vitest run src/common/design-system/molecules/data-table/hooks/use-paginated-search.test.ts`
Expected: All tests PASS

- [ ] **Step 4: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/common/design-system/molecules/data-table/hooks/use-paginated-search.ts src/common/design-system/molecules/data-table/hooks/use-paginated-search.test.ts
git commit -m "refactor: change usePaginatedSearch to props-driven { search, navigate } API"
```

---

## Task 2: Update existing routes to new `usePaginatedSearch` API

Update the two routes that currently use the old Route-object API.

**Files:**
- Modify: `src/routes/detection-events/index.tsx`
- Modify: `src/routes/_enterprise/hosts/$hostId/detection-events.tsx`

- [ ] **Step 1: Update `/detection-events` route**

Read `src/routes/detection-events/index.tsx`. Find the `usePaginatedSearch` call and change from:

```ts
const { page, pageSize, sorting, ... } =
  usePaginatedSearch(Route, { resetOn: [...] });
```

To:

```ts
const search = Route.useSearch();
const navigate = Route.useNavigate();

const { page, pageSize, sorting, ... } =
  usePaginatedSearch({ search, navigate }, { resetOn: [...] });
```

Note: `Route.useSearch()` and `Route.useNavigate()` may already be called elsewhere in the component. If so, reuse the existing variables. If not, add them. Remove any duplicate calls.

- [ ] **Step 2: Update `/hosts/$hostId/detection-events` route**

Same change in `src/routes/_enterprise/hosts/$hostId/detection-events.tsx`. This route may use `useParams({ strict: false })` instead of `Route.useParams()` — that's fine, don't change it. Only change the `usePaginatedSearch` call.

- [ ] **Step 3: Run affected tests**

Run: `pnpm vitest run src/routes/detection-events/ src/routes/_enterprise/hosts/`
Expected: All tests PASS

- [ ] **Step 4: Run full test suite, lint, and type check**

Run: `pnpm vitest run && pnpm run lint --fix && pnpm run check`
Expected: All 501 tests pass, no lint errors, no TS errors

- [ ] **Step 5: Commit**

```bash
git add src/routes/detection-events/index.tsx src/routes/_enterprise/hosts/\$hostId/detection-events.tsx
git commit -m "refactor: update existing routes to new usePaginatedSearch API"
```

---

## Task 3: Create detection-methods feature — model and API re-exports

Set up the new `features/detection-methods/` structure with re-exports from the existing hunt location.

**Files:**
- Create: `src/features/detection-methods/detection-method.model.ts`
- Create: `src/features/detection-methods/detection-methods.api.ts`

- [ ] **Step 1: Create model re-export**

```ts
// src/features/detection-methods/detection-method.model.ts
export type { Signature, Rule } from '@/features/hunt/detection-methods/signatures/model/signature';
export type { SignatureStatus } from '@/features/hunt/detection-methods/signatures/model/signature-status';
```

Read `src/features/hunt/detection-methods/signatures/model/signature.ts` first to confirm the exact export names.

- [ ] **Step 2: Create API re-export**

```ts
// src/features/detection-methods/detection-methods.api.ts
export {
  useGetSignaturesQuery,
  useGetSignatureQuery,
  useGetSignatureRulesetsStatusQuery,
} from '@/features/hunt/detection-methods/signatures/api/signatures.api';
```

Read `src/features/hunt/detection-methods/signatures/api/signatures.api.ts` first to confirm all exported hooks. Re-export all of them.

- [ ] **Step 3: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/features/detection-methods/
git commit -m "feat: create detection-methods feature with model and API re-exports"
```

---

## Task 4: Create detection-methods table definition

Extract columns, export columns, and utils into the table definition file.

**Files:**
- Create: `src/features/detection-methods/detection-methods.table.tsx`
- Reference: `src/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table.columns.tsx`

- [ ] **Step 1: Read the existing columns file**

Read `src/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table.columns.tsx` thoroughly. Understand every column definition and its cell renderer.

- [ ] **Step 2: Create the table definition file**

```tsx
// src/features/detection-methods/detection-methods.table.tsx
```

This file should contain:
- All column definitions from the existing `detectionMethodsColumns` array (expander, sid, category, msg, created, hits, hits_min)
- The `exportColumns` array
- Import components from their current locations (`EventValue`, `DataTableColumnHeader`, `DataTableRowExpander`, `Badge`, etc.)
- Export as `DETECTION_METHODS_COLUMNS` and `DETECTION_METHODS_EXPORT_COLUMNS`

Preserve every column's exact cell renderer, header, visibility, enableHiding, and meta properties.

- [ ] **Step 3: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/features/detection-methods/detection-methods.table.tsx
git commit -m "feat: add detection-methods table definition with columns and export config"
```

---

## Task 5: Create `DetectionMethodsTable` entity

The full wired table entity that owns data fetching, toolbar, table, and pagination.

**Files:**
- Create: `src/features/detection-methods/use-cases/detection-methods-list/entities/detection-methods-table.tsx`
- Create: `src/features/detection-methods/use-cases/detection-methods-list/entities/detection-methods-table.test.tsx`
- Reference: `src/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table.tsx`

- [ ] **Step 1: Read the existing signatures table**

Read `src/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table.tsx` thoroughly. Understand:
- How `useServerTableState` is used (legacy nuqs pattern — we replace with `usePaginatedSearch`)
- The `with_alerts` switch filter (via nuqs `useQueryState`)
- The `sid` filter from Redux query filters
- The toolbar rendering
- The DataTable props
- The empty state

- [ ] **Step 2: Write the failing test**

Create a test with MSW mocking the signatures API endpoint (`GET /rules/rule/`). Test:
- Renders loading state
- Renders table with mock data (signature ID, message, category, hits visible)
- Renders empty state when no results

Reference existing test patterns from `src/routes/detection-events/index.test.tsx` for router/Redux test setup.

The entity receives `search` and `navigate` as props — mock `navigate` as `vi.fn()` and pass search params directly.

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run src/features/detection-methods/use-cases/detection-methods-list/entities/detection-methods-table.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 4: Implement the DetectionMethodsTable entity**

The entity should:

1. Accept `search` and `navigate` as props (matching the interface from the spec)
2. Read global params via `useGlobalQueryParams(['tenant', 'dates', 'qfilter', 'qfilterSignature'])`
3. Manage the `with_alerts` filter — read it from `search.with_alerts` (passed as prop from the route). Toggle it via `navigate({ search: (prev) => ({ ...prev, with_alerts: !prev.with_alerts, page: 1 }) })`. The route defines `with_alerts` in its Zod schema (Task 6). The entity's `search` prop type should include `with_alerts: boolean`.
4. Read `sid` filter from Redux query filters
5. Use `usePaginatedSearch({ search, navigate }, { resetOn: [...] })` for pagination
6. Call `useGetSignaturesQuery` with assembled params
7. Use `useTablePreferences({ tableId: 'detectionMethodsTable', columns: DETECTION_METHODS_COLUMNS })`
8. Render toolbar with "Apply event query filters" switch
9. Render `Table` with columns, sorting, column order/visibility
10. Render `PaginationFooter`
11. Render `DataTableEmpty` for empty state
12. Pass `DetectionMethodsExpandedRow` from the existing location (it stays where it is — moved in Phase 4)
13. Pass `DETECTION_METHODS_EXPORT_COLUMNS` for export

Import columns from `@/features/detection-methods/detection-methods.table`.
Import API from `@/features/detection-methods/detection-methods.api`.
Import `DetectionMethodsExpandedRow` from its current location at `@/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table.expanded-row`.

**Default sort:** `-hits` (descending hits)

- [ ] **Step 5: Run tests**

Run: `pnpm vitest run src/features/detection-methods/use-cases/detection-methods-list/entities/detection-methods-table.test.tsx`
Expected: PASS

- [ ] **Step 6: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/features/detection-methods/use-cases/
git commit -m "feat: add DetectionMethodsTable entity with data fetching and pagination"
```

---

## Task 6: Migrate `/detection-methods` route to thin orchestrator

Rewrite the route as a thin orchestrator using `Page`/`PageHeader` and the `DetectionMethodsTable` entity.

**Files:**
- Modify: `src/routes/detection-methods/index.tsx`
- Reference: `src/pages/detection-methods/index.tsx` (current page)

- [ ] **Step 1: Read the current route and page**

Read:
- `src/routes/detection-methods/index.tsx` — current thin wrapper
- `src/pages/detection-methods/index.tsx` — current page (uses `DefaultPage`)
- `src/routes/detection-methods/route.tsx` — parent route (if exists)

Understand what the page renders: breadcrumbs, title, description, then `SignaturesTable`.

- [ ] **Step 2: Add Zod search schema**

```tsx
const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-hits'),
  with_alerts: z.boolean().default(true),
});
```

Note: `with_alerts` is now a route search param instead of nuqs state. This means the `DetectionMethodsTable` entity from Task 5 should read it from `search.with_alerts` prop rather than local state. **Update the entity if needed** to read `with_alerts` from the search params passed as props.

- [ ] **Step 3: Implement the thin orchestrator**

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import {
  Page,
  PageContainer,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
} from '@/common/design-system/atoms/page';
import { usePageTitle } from '@/common/lib/use-page-title';
import { DetectionMethodsTable } from '@/features/detection-methods/use-cases/detection-methods-list/entities/detection-methods-table';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-hits'),
  with_alerts: z.boolean().default(true),
});

export const Route = createFileRoute('/detection-methods/')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary>
      <DetectionMethodsPage />
    </PageBoundary>
  ),
});

function DetectionMethodsPage() {
  usePageTitle('Detection Methods');
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <Page>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Detection Methods</PageTitle>
            <PageDescription>
              Explore and investigate your detection logic in depth. Review
              signatures, track their performance, and analyze their impact on
              your network security.
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <DetectionMethodsTable search={search} navigate={navigate} />
      </PageContainer>
    </Page>
  );
}
```

Read the current page's title and description text from `src/pages/detection-methods/index.tsx` and use the exact same text.

- [ ] **Step 4: Verify the parent route.tsx still works**

Check if `src/routes/detection-methods/route.tsx` exists. If it renders breadcrumbs + `<Outlet />`, ensure the new index route works within it. If the parent route also wraps in `DefaultPage` or `ScrollArea`, the new route should not duplicate these wrappers.

- [ ] **Step 5: Update the sibling detail route**

Read `src/routes/detection-methods/$detectionMethodId.tsx`. It imports `DetectionMethods` from the same `@/pages/detection-methods` module. Since we are deleting that page in Task 7, update the detail route to import the `SignaturesTable` component directly from `@/features/hunt/detection-methods/signatures/components/signatures-table/signatures-table` and wrap it in `Page`/`PageContainer` as a thin orchestrator. The detail route will be fully migrated in Phase 4 — for now, just keep it working.

- [ ] **Step 6: Run the app and manually verify**

Run: `pnpm dev`
Navigate to `/detection-methods` and verify:
- Page title and description render correctly
- Table loads with data
- Pagination works (URL updates with page/page_size)
- Sorting works (clicking headers updates URL)
- "Apply event query filters" switch works
- Column visibility/reorder works
- Expanded row works
- Export works
- Changing date range resets pagination to page 1
- Empty state shows when no results

- [ ] **Step 7: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add src/routes/detection-methods/index.tsx
git commit -m "feat: migrate /detection-methods to thin orchestrator with Page/PageHeader"
```

---

## Task 7: Delete old detection-methods page and verify

**Files:**
- Delete: `src/pages/detection-methods/index.tsx`

- [ ] **Step 1: Check for remaining imports**

Search for any remaining imports of the old page:

```
grep -r "pages/detection-methods" src/
```

The detail route (`$detectionMethodId.tsx`) should have been updated in Task 6 Step 5 to no longer import from the old page. Verify no remaining imports exist before deleting.

- [ ] **Step 2: Delete the old page file**

Remove `src/pages/detection-methods/index.tsx`.

- [ ] **Step 3: Run full test suite**

Run: `pnpm vitest run`
Expected: All tests pass

- [ ] **Step 4: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/pages/detection-methods/
git commit -m "chore: delete old detection-methods page replaced by route orchestrator"
```

---

## Post-Migration Notes

This completes Phase 0. The conventions are established and the `/detection-methods` migration serves as the reference implementation.

**Pattern summary for future migrations:**

1. Create `features/<domain>/` with model + API re-exports and table definition
2. Create table entity in `use-cases/<use-case>/entities/` that owns data fetching + toolbar + table + pagination
3. Rewrite route as thin orchestrator: Zod schema → `Page`/`PageHeader` → entity with `search`/`navigate` props
4. Delete old `pages/` entry

**Next phases:**
- Phase 1: Events domain (alerts, protocol, sightings, stamus, beaconing)
- Phase 2: Host Insights (hosts-list, host-details, hosts-visualisation)
- Phase 3+: Remaining domains
