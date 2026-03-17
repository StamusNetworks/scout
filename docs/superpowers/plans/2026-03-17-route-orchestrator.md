# Route Orchestrator Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate two pattern routes (`/detection-events` and `/hosts/$hostId`) from legacy `/pages` to fat orchestrator routes using TanStack Router, establishing the pattern for full migration.

**Architecture:** Routes are fat orchestrators: they define Zod search schemas, fetch data via RTK Query, and compose the full page inline using feature atoms/molecules/entities and column constants. A new dumb `Table` component replaces the current `DataTable`. Global state (tenant, dates, qfilter) stays in Redux; page-level state (page, page_size, sort) lives in the URL.

**Tech Stack:** TanStack Router (file-based), TanStack React Table v8, RTK Query, Zod, React 19, Tailwind CSS, vitest, react-testing-library, MSW.

**Spec:** `docs/superpowers/specs/2026-03-17-route-orchestrator-design.md`

---

## File Structure

### New Files

```
src/common/design-system/molecules/table/
├── table.tsx                    # New dumb Table component
├── table.test.tsx               # Table tests
└── index.ts                     # Barrel export

src/common/design-system/molecules/pagination-footer/
├── pagination-footer.tsx        # Standalone pagination molecule
├── pagination-footer.test.tsx   # PaginationFooter tests
└── index.ts                     # Barrel export

src/common/design-system/molecules/data-table/hooks/
├── use-paginated-search.ts      # Hook bridging route search + Redux globals
└── use-paginated-search.test.ts # Tests for usePaginatedSearch

src/features/events/
├── common/
│   ├── api/
│   │   └── events.api.ts             # Shared RTK Query endpoints (moved from hunt/events/api/)
│   ├── model/
│   │   └── event.schema.ts           # Base Event type + discriminated unions (moved)
│   ├── columns/
│   │   ├── timestamp.tsx              # TIMESTAMP_COLUMN constant
│   │   ├── source.tsx                 # SOURCE_COLUMN constant
│   │   ├── destination.tsx            # DESTINATION_COLUMN constant
│   │   ├── protocol.tsx               # PROTOCOL_COLUMN constant
│   │   ├── host.tsx                   # HOST_COLUMN (probe) constant
│   │   ├── hostname-host.tsx          # HOSTNAME_HOST_COLUMN (enterprise, hidden)
│   │   └── expander.tsx               # EXPANDER_COLUMN constant
│   ├── atoms/
│   │   └── event-value.tsx            # EventValue click/filter component (moved)
│   └── molecules/
│       └── expanded-event-row.tsx     # ExpandedEventRow (moved)
│
├── alerts/
│   └── columns/
│       ├── tag.tsx                    # TAG_COLUMN constant
│       ├── method.tsx                 # METHOD_COLUMN constant
│       ├── category.tsx               # CATEGORY_COLUMN constant
│       ├── lateral.tsx                # LATERAL_COLUMN constant
│       └── outlier.tsx                # OUTLIER_COLUMN constant
│
├── protocol/
│   └── columns/
│       ├── tls-sni.tsx                # TLS_SNI_COLUMN constant
│       ├── http-url.tsx               # HTTP_URL_COLUMN constant
│       ├── http-request.tsx           # HTTP_REQUEST_COLUMN constant
│       ├── http-response.tsx          # HTTP_RESPONSE_COLUMN constant
│       └── payload.tsx                # PAYLOAD_COLUMN constant
│
├── sightings/                         # (placeholder for future sub-feature)
└── stamus/                            # (placeholder for future sub-feature)

src/features/hosts/
├── entities/
│   └── host-summary.tsx               # HostSummary entity (fetches own data)
├── columns/                           # Host-specific column constants (future)
```

### Modified Files

```
src/routes/detection-events/index.tsx       # Fat orchestrator (replaces page import)
src/routes/_enterprise/hosts/$hostId/
├── route.tsx                               # Fat orchestrator layout with HostSummary + tabs
├── detection-events.tsx                    # Fat orchestrator for detection events tab
├── index.tsx                              # (insights tab - future)
├── incidents.tsx                          # (incidents tab - future)
└── ...other tabs                          # (future)
```

### Deleted Files (after migration)

```
src/pages/events/index.tsx                           # Replaced by route orchestrator
src/pages/hosts/[hostId]/index.tsx                   # Replaced by route layout
src/pages/hosts/[hostId]/detection-events/index.tsx  # Replaced by tab orchestrator
src/features/hunt/events/components/events-table/events-table.tsx  # Replaced by route
src/features/hunt/events/components/events-table/events.columns.tsx  # Split into constants
```

---

## Task 1: Create the `Table` Component

A dumb table that renders rows and columns. No toolbar, no pagination, no server-side hooks.

**Files:**
- Create: `src/common/design-system/molecules/table/table.tsx`
- Create: `src/common/design-system/molecules/table/table.test.tsx`
- Create: `src/common/design-system/molecules/table/index.ts`

- [ ] **Step 1: Write the failing test for basic table rendering**

```tsx
// src/common/design-system/molecules/table/table.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CustomColumnDef } from '../data-table/filters/filters.types';
import { Table } from './table';

type TestRow = { id: string; name: string; value: number };

const testColumns: CustomColumnDef<TestRow>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name' },
  { id: 'value', accessorKey: 'value', header: 'Value' },
];

const testData: TestRow[] = [
  { id: '1', name: 'Alpha', value: 10 },
  { id: '2', name: 'Beta', value: 20 },
];

describe('Table', () => {
  it('renders column headers and rows', () => {
    render(<Table data={testData} columns={testColumns} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('renders empty state when data is empty', () => {
    render(
      <Table
        data={[]}
        columns={testColumns}
        Empty={<div>No results</div>}
      />,
    );

    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading is true', () => {
    const { container } = render(
      <Table data={[]} columns={testColumns} isLoading />,
    );

    // Skeleton rows should be rendered
    expect(container.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/common/design-system/molecules/table/table.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement the Table component**

Build the `Table` component by extracting the rendering logic from the existing `DataTable` at `src/common/design-system/molecules/data-table/data-table.tsx`. Keep only:
- TanStack `useReactTable` setup
- Header rendering with `DataTableColumnHeader` support
- Body rendering with row expansion support
- Column reordering via dnd-kit
- Loading skeleton
- Empty state

Strip out:
- Toolbar section (lines 255-284 of current DataTable)
- `DataTablePagination` rendering (line 411 of current DataTable)
- All default `useState` initializations — all state must be passed via props
- The `serverSide` prop — the component is always controlled

**Props:**

```tsx
interface TableProps<TData> {
  data: TData[];
  columns: CustomColumnDef<TData>[];
  isLoading?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  expanded?: ExpandedState;
  onExpandedChange?: OnChangeFn<ExpandedState>;
  columnOrder?: string[];
  onColumnOrderChange?: (order: Updater<string[]>) => void;
  ExpandedRow?: React.JSX.Element;
  onRowClick?: (row: Row<TData>) => void;
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
  skeletonRows?: number;
  Empty?: React.ReactNode;
  rowClickCursor?: 'pointer' | 'default' | 'zoomin';
  reorder?: boolean;
}
```

Note: `data` is `TData[]` (not `Paginated<TData>`). The route unwraps `.results` before passing.

Reference `src/common/design-system/molecules/data-table/data-table.tsx` lines 120-413 for the rendering implementation to extract from.

- [ ] **Step 4: Create barrel export**

```ts
// src/common/design-system/molecules/table/index.ts
export { Table } from './table';
export type { TableProps } from './table';
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run src/common/design-system/molecules/table/table.test.tsx`
Expected: PASS

- [ ] **Step 6: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/common/design-system/molecules/table/
git commit -m "feat: add dumb Table component for route orchestrator pattern"
```

---

## Task 2: Create the `PaginationFooter` Component

Standalone pagination molecule. Wraps the existing composable `Pagination` from `src/common/design-system/molecules/pagination.tsx` with a simpler interface.

**Files:**
- Create: `src/common/design-system/molecules/pagination-footer/pagination-footer.tsx`
- Create: `src/common/design-system/molecules/pagination-footer/pagination-footer.test.tsx`
- Create: `src/common/design-system/molecules/pagination-footer/index.ts`

- [ ] **Step 1: Write the failing test**

```tsx
// src/common/design-system/molecules/pagination-footer/pagination-footer.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PaginationFooter } from './pagination-footer';

describe('PaginationFooter', () => {
  const defaultProps = {
    page: 1,
    pageSize: 10,
    total: 95,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  };

  it('renders total count', () => {
    render(<PaginationFooter {...defaultProps} />);
    // Should display item count info
    expect(screen.getByText(/95/)).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(<PaginationFooter {...defaultProps} page={1} />);
    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<PaginationFooter {...defaultProps} page={10} />);
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('calls onPageChange when next is clicked', async () => {
    const onPageChange = vi.fn();
    render(
      <PaginationFooter {...defaultProps} page={1} onPageChange={onPageChange} />,
    );
    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/common/design-system/molecules/pagination-footer/pagination-footer.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Implement PaginationFooter**

Use the existing `Pagination` component from `src/common/design-system/molecules/pagination.tsx` (lines 32-144) internally. The `PaginationFooter` adapts the simpler props interface to the existing `Pagination` props.

```tsx
// src/common/design-system/molecules/pagination-footer/pagination-footer.tsx
import { Pagination } from '../pagination';

export interface PaginationFooterProps {
  page: number;          // 1-indexed
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function PaginationFooter({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationFooterProps) {
  const pageCount = Math.ceil(total / pageSize);
  const pageIndex = page - 1; // Convert to 0-indexed for internal use

  return (
    <Pagination
      areSomeRowsSelected={false}
      selectedRowsCount={0}
      rowsCount={Math.min(pageSize, total - pageIndex * pageSize)}
      totalCount={total}
      pageSize={pageSize}
      pageIndex={pageIndex}
      onPageSizeChange={onPageSizeChange}
      onPageIndexChange={(idx) => onPageChange(idx + 1)}
      isPreviousPage={pageIndex > 0}
      isNextPage={page < pageCount}
      pageCount={pageCount}
    />
  );
}
```

- [ ] **Step 4: Create barrel export**

```ts
// src/common/design-system/molecules/pagination-footer/index.ts
export { PaginationFooter } from './pagination-footer';
export type { PaginationFooterProps } from './pagination-footer';
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run src/common/design-system/molecules/pagination-footer/pagination-footer.test.tsx`
Expected: PASS

- [ ] **Step 6: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/common/design-system/molecules/pagination-footer/
git commit -m "feat: add standalone PaginationFooter molecule"
```

---

## Task 3: Create the `usePaginatedSearch` Hook

Bridges TanStack Router search params and Redux global state. Resets page synchronously when `resetOn` deps change, preventing duplicate RTK Query calls.

**Files:**
- Create: `src/common/design-system/molecules/data-table/hooks/use-paginated-search.ts`
- Create: `src/common/design-system/molecules/data-table/hooks/use-paginated-search.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/common/design-system/molecules/data-table/hooks/use-paginated-search.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePaginatedSearch } from './use-paginated-search';

// Mock a minimal TanStack Route-like object
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

describe('usePaginatedSearch', () => {
  it('returns page and pageSize from search params', () => {
    const { route } = createMockRoute({ page: 2, page_size: 20, sort: '-timestamp' });
    const { result } = renderHook(() =>
      usePaginatedSearch(route, { resetOn: [] }),
    );

    expect(result.current.page).toBe(2);
    expect(result.current.pageSize).toBe(20);
    expect(result.current.sorting).toEqual([{ id: 'timestamp', desc: true }]);
  });

  it('defaults page to 1 and pageSize to 10', () => {
    const { route } = createMockRoute({});
    const { result } = renderHook(() =>
      usePaginatedSearch(route, { resetOn: [] }),
    );

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
  });

  it('resets page to 1 when resetOn deps change', () => {
    let deps = { start_date: 1000, tenant: 'a' };
    const { route, navigate } = createMockRoute({ page: 3, page_size: 10, sort: '-timestamp' });

    const { result, rerender } = renderHook(
      ({ resetOn }) => usePaginatedSearch(route, { resetOn }),
      { initialProps: { resetOn: [deps.start_date, deps.tenant] } },
    );

    expect(result.current.page).toBe(3);

    // Change deps — simulates tenant change
    deps = { start_date: 1000, tenant: 'b' };
    rerender({ resetOn: [deps.start_date, deps.tenant] });

    expect(result.current.page).toBe(1);
    expect(navigate).toHaveBeenCalledWith(
      expect.objectContaining({ replace: true }),
    );
  });

  it('does not reset page when resetOn deps are the same', () => {
    const deps = [1000, 'a'];
    const { route, navigate } = createMockRoute({ page: 3, page_size: 10 });

    const { result, rerender } = renderHook(
      ({ resetOn }) => usePaginatedSearch(route, { resetOn }),
      { initialProps: { resetOn: deps } },
    );

    rerender({ resetOn: [...deps] }); // Same values, new array

    expect(result.current.page).toBe(3);
    expect(navigate).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/common/design-system/molecules/data-table/hooks/use-paginated-search.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement usePaginatedSearch**

```ts
// src/common/design-system/molecules/data-table/hooks/use-paginated-search.ts
import { useRef } from 'react';
import { parseSorting, serializeSorting } from './sorting-parser';
import type { SortingState } from '@tanstack/react-table';

interface PaginatedSearchOptions {
  resetOn: unknown[];
  defaultPageSize?: number;
}

interface PaginatedSearchResult {
  page: number;
  pageSize: number;
  sorting: SortingState;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSorting: (sorting: SortingState) => void;
}

/**
 * Bridges TanStack Router search params with external dependencies.
 * Resets page synchronously when resetOn deps change — before RTK Query fires.
 *
 * @param route - A TanStack Route object with useSearch() and useNavigate()
 * @param options.resetOn - Array of external values; page resets to 1 when any changes
 * @param options.defaultPageSize - Default page size (default: 10)
 */
export function usePaginatedSearch(
  route: {
    useSearch: () => Record<string, unknown>;
    useNavigate: () => (opts: {
      search: (prev: Record<string, unknown>) => Record<string, unknown>;
      replace?: boolean;
    }) => void;
  },
  options: PaginatedSearchOptions,
): PaginatedSearchResult {
  const { resetOn, defaultPageSize = 10 } = options;
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const prevDepsRef = useRef<unknown[]>(resetOn);

  // Determine if resetOn deps have changed (shallow compare each element)
  let shouldReset = false;
  const prevDeps = prevDepsRef.current;
  if (prevDeps.length !== resetOn.length || prevDeps.some((dep, i) => dep !== resetOn[i])) {
    // Only reset if this isn't the initial render
    if (prevDepsRef.current !== resetOn) {
      shouldReset = true;
    }
  }
  prevDepsRef.current = resetOn;

  const page = shouldReset ? 1 : ((search.page as number) ?? 1);
  const pageSize = (search.page_size as number) ?? defaultPageSize;
  const sorting = parseSorting((search.sort as string) ?? '');

  // Sync URL if page was reset
  if (shouldReset && (search.page as number) !== 1) {
    navigate({
      search: (prev) => ({ ...prev, page: 1 }),
      replace: true,
    });
  }

  const setPage = (newPage: number) => {
    navigate({ search: (prev) => ({ ...prev, page: newPage }) });
  };

  const setPageSize = (newSize: number) => {
    navigate({ search: (prev) => ({ ...prev, page_size: newSize, page: 1 }) });
  };

  const setSorting = (newSorting: SortingState) => {
    const serialized = serializeSorting(newSorting);
    navigate({ search: (prev) => ({ ...prev, sort: serialized, page: 1 }) });
  };

  return { page, pageSize, sorting, setPage, setPageSize, setSorting };
}
```

Note: uses the existing `parseSorting` and `serializeSorting` from `src/common/design-system/molecules/data-table/hooks/sorting-parser.ts`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/common/design-system/molecules/data-table/hooks/use-paginated-search.test.ts`
Expected: PASS

- [ ] **Step 5: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/common/design-system/molecules/data-table/hooks/use-paginated-search.ts src/common/design-system/molecules/data-table/hooks/use-paginated-search.test.ts
git commit -m "feat: add usePaginatedSearch hook for route orchestrator pattern"
```

---

## Task 4: Reorganize Events Feature — Model and API

Move the shared event model and API from `features/hunt/events/` to the new `features/events/common/` structure.

**Files:**
- Create: `src/features/events/common/api/events.api.ts` (re-export from hunt for now)
- Create: `src/features/events/common/model/event.schema.ts` (re-export from hunt for now)

**Important:** For this initial migration, we re-export from the existing locations to avoid breaking all current consumers. The original files stay until all routes are migrated.

- [ ] **Step 1: Create the events feature directory structure**

Create the directory tree:
```
src/features/events/
├── common/
│   ├── api/
│   ├── model/
│   ├── columns/
│   ├── atoms/
│   └── molecules/
├── alerts/
│   └── columns/
├── protocol/
│   └── columns/
├── sightings/
└── stamus/
```

- [ ] **Step 2: Create re-exports for API and model**

```ts
// src/features/events/common/api/events.api.ts
export {
  EventsAPI,
  useGetEventsQuery,
  useGetEventsCountQuery,
  useLazyGetEventFileRetrieveQuery,
  useUploadAlertToProbeMutation,
  useRequestPcapExtractionMutation,
} from '@/features/hunt/events/api/events.api';
```

```ts
// src/features/events/common/model/event.schema.ts
export * from '@/features/hunt/events/model/event.schema';
```

- [ ] **Step 3: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/features/events/
git commit -m "feat: create events feature structure with re-exports from hunt"
```

---

## Task 5: Extract Event Column Constants

Split the monolithic `getColumns()` function from `src/features/hunt/events/components/events-table/events.columns.tsx` into individual column constants.

**Files:**
- Create: `src/features/events/common/columns/timestamp.tsx`
- Create: `src/features/events/common/columns/source.tsx`
- Create: `src/features/events/common/columns/destination.tsx`
- Create: `src/features/events/common/columns/protocol.tsx`
- Create: `src/features/events/common/columns/host.tsx`
- Create: `src/features/events/common/columns/expander.tsx`
- Create: `src/features/events/common/columns/index.ts`
- Create: `src/features/events/alerts/columns/tag.tsx`
- Create: `src/features/events/alerts/columns/method.tsx`
- Create: `src/features/events/alerts/columns/category.tsx`
- Create: `src/features/events/alerts/columns/lateral.tsx`
- Create: `src/features/events/alerts/columns/outlier.tsx`
- Create: `src/features/events/alerts/columns/index.ts`
- Create: `src/features/events/protocol/columns/tls-sni.tsx`
- Create: `src/features/events/protocol/columns/http-url.tsx`
- Create: `src/features/events/protocol/columns/http-request.tsx`
- Create: `src/features/events/protocol/columns/http-response.tsx`
- Create: `src/features/events/protocol/columns/payload.tsx`
- Create: `src/features/events/protocol/columns/index.ts`
- Reference: `src/features/hunt/events/components/events-table/events.columns.tsx` (source to extract from)

- [ ] **Step 1: Extract shared columns**

Read `src/features/hunt/events/components/events-table/events.columns.tsx` and extract each column into its own file. Each file exports a single `CustomColumnDef<Event>` constant.

Example for timestamp:
```tsx
// src/features/events/common/columns/timestamp.tsx
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DateTime } from '@/common/design-system/entities/date-time';
import type { Event } from '../model/event.schema';

export const TIMESTAMP_COLUMN: CustomColumnDef<Event> = {
  id: 'timestamp',
  accessorKey: 'timestamp',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Timestamp" />
  ),
  cell: ({ row }) => <DateTime value={row.original.timestamp} />,
};
```

Extract each column following the same pattern, referencing the exact cell renderers from the current `getColumns()` function. Columns that use components like `EventValue`, `Hostname`, `Network` should import them from their current locations (these will be moved later in full migration).

Shared columns (in `common/columns/`): `expander`, `timestamp`, `source`, `destination`, `protocol`, `host`, `hostname-host` (enterprise-only, hidden by default)
Alert columns (in `alerts/columns/`): `tag`, `method`, `category`, `lateral`, `outlier`
Protocol columns (in `protocol/columns/`): `tls-sni`, `http-url`, `http-request`, `http-response`, `payload`

**Note:** The `payload`, `http-request`, and `http-response` columns share a `Scrollable` helper component (currently defined inline in `events.columns.tsx`). Extract it to `src/features/events/common/atoms/scrollable.tsx` and import it from the three column files that use it.

- [ ] **Step 2: Create barrel exports for each column group**

```ts
// src/features/events/common/columns/index.ts
export { EXPANDER_COLUMN } from './expander';
export { TIMESTAMP_COLUMN } from './timestamp';
export { SOURCE_COLUMN } from './source';
export { DESTINATION_COLUMN } from './destination';
export { PROTOCOL_COLUMN } from './protocol';
export { HOST_COLUMN } from './host';
export { HOSTNAME_HOST_COLUMN } from './hostname-host';
```

```ts
// src/features/events/alerts/columns/index.ts
export { TAG_COLUMN } from './tag';
export { METHOD_COLUMN } from './method';
export { CATEGORY_COLUMN } from './category';
export { LATERAL_COLUMN } from './lateral';
export { OUTLIER_COLUMN } from './outlier';
```

```ts
// src/features/events/protocol/columns/index.ts
export { TLS_SNI_COLUMN } from './tls-sni';
export { HTTP_URL_COLUMN } from './http-url';
export { HTTP_REQUEST_COLUMN } from './http-request';
export { HTTP_RESPONSE_COLUMN } from './http-response';
export { PAYLOAD_COLUMN } from './payload';
```

- [ ] **Step 3: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/features/events/
git commit -m "feat: extract event column constants from monolithic getColumns"
```

---

## Task 6: Migrate `/detection-events` Route

Convert the route from a thin wrapper around a page component to a fat orchestrator.

**Files:**
- Modify: `src/routes/detection-events/index.tsx`
- Reference: `src/pages/events/index.tsx` (the current page being replaced)
- Reference: `src/features/hunt/events/components/events-table/events-table.tsx` (current EventsTable)

- [ ] **Step 1: Read the current route and page implementation**

Read these files to understand exactly what needs to be replicated:
- `src/routes/detection-events/index.tsx` — current route wrapper
- `src/pages/events/index.tsx` — current Events page
- `src/features/hunt/events/components/events-table/events-table.tsx` — current EventsTable

- [ ] **Step 2: Add Zod search schema to the route**

Add `validateSearch` with `page`, `page_size`, and `sort` params to the route's `createFileRoute` call:

```tsx
import { z } from 'zod';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-timestamp'),
});

export const Route = createFileRoute('/detection-events/')({
  validateSearch: searchSchema,
  component: DetectionEventsPage,
  errorComponent: PageBoundary,
});
```

- [ ] **Step 3: Implement the fat orchestrator page component**

Replace the current thin wrapper with the full page implementation. The component should:

1. Use `Route.useSearch()` and `Route.useNavigate()` for search params
2. Call `useGlobalQueryParams(['tenant', 'dates', 'qfilter', 'qfilterHost'])` for global state
3. Call `usePaginatedSearch(Route, { resetOn: [globals...] })` for pagination
4. Call `useGetEventsQuery()` and `useGetCountsTimelineQuery()` for data
5. Build columns array from imported column constants
6. Use `useTablePreferences()` for column visibility/order persistence
7. Render inline: `PageHeader`, `BarChartTimeline`, toolbar, `Table`, `PaginationFooter`

Reference `src/pages/events/index.tsx` for the full page layout and `src/features/hunt/events/components/events-table/events-table.tsx` for the table wiring (column order, visibility, export columns, expanded row).

**Important — features to replicate from the current page:**
- `EventsCounter` widget — grid showing event type counts (alerts, stamus, sightings). Currently at `src/pages/events/index.tsx`. Include it in the route's render.
- Tags/Probes chart toggle — the current page has a toggle between showing `BarChartTimeline` by tags vs by probes. Replicate this toggle inline in the route.
- `useTablePreferences` — column order/visibility persistence with `tableId: 'eventsPageTable'`
- `exportColumns` — the subset of columns used for CSV export
- `ExpandedEventRow` — expanded row detail component
- `onRowClick` / `getRowId` — if the current EventsTable uses row navigation

Read the current page carefully to capture all features.

The key import changes:
- Column constants from `@/features/events/common/columns` and `@/features/events/alerts/columns`
- `Table` from `@/common/design-system/molecules/table`
- `PaginationFooter` from `@/common/design-system/molecules/pagination-footer`
- `usePaginatedSearch` from `@/common/design-system/molecules/data-table/hooks/use-paginated-search`
- `ExpandedEventRow` from current location (will move later in full migration)

- [ ] **Step 4: Run the app and manually verify**

Run: `pnpm dev`
Navigate to `/detection-events` and verify:
- Table renders with data
- Pagination works (page changes update URL)
- Sorting works (clicking headers updates URL)
- Changing date range resets to page 1
- Column visibility toggle works
- Expanded row works
- Timeline chart renders

- [ ] **Step 5: Write a test for the migrated route**

```tsx
// src/routes/detection-events/index.test.tsx
```

Create a test that renders the route component with MSW mocking the events API endpoint (`/rules/es/alerts_tail`). Reference the existing test patterns from `src/pages/threats/incidents/index.test.tsx` for how to set up the router test wrapper and MSW handlers.

Test:
- Component renders with loading state
- Component renders table with mock data
- Empty state when no results

- [ ] **Step 6: Run tests**

Run: `pnpm vitest run src/routes/detection-events/`
Expected: PASS

- [ ] **Step 7: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 8: Delete the old page files**

Remove:
- `src/pages/events/index.tsx` (if this was the file used by detection-events)

Check that no other route imports from this page file before deleting. Use grep:
```bash
# Search for imports of the old page
grep -r "pages/events" src/routes/
```

Only delete files that are no longer imported anywhere.

- [ ] **Step 9: Run full test suite**

Run: `pnpm vitest run`
Expected: All tests pass (no broken imports from deleted files)

- [ ] **Step 10: Commit**

```bash
git add src/routes/detection-events/ src/pages/events/
git commit -m "feat: migrate /detection-events to fat orchestrator route"
```

---

## Task 7: Create HostSummary Entity

An entity component that fetches and displays host summary data based on `hostId`.

**Files:**
- Create: `src/features/hosts/entities/host-summary.tsx`
- Create: `src/features/hosts/entities/host-summary.test.tsx`
- Reference: `src/pages/hosts/[hostId]/index.tsx` (current HostDetails — extract summary section)
- Reference: `src/features/analytics/hosts/api/hosts.api.ts` (API for host data)

- [ ] **Step 1: Read the current host detail page**

Read `src/pages/hosts/[hostId]/index.tsx` to understand what the host summary displays (IP, hostname, network info, badges/counts, etc.). Identify which parts belong in the entity vs the route layout.

- [ ] **Step 2: Write the failing test**

```tsx
// src/features/hosts/entities/host-summary.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HostSummary } from './host-summary';
// ... test setup with MSW handler for host API and Redux provider
```

Mock the host API endpoint and test that `<HostSummary hostId="192.168.1.1" />` renders the expected summary UI (loading, loaded, error states).

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run src/features/hosts/entities/host-summary.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 4: Implement HostSummary entity**

Extract the host summary section from `src/pages/hosts/[hostId]/index.tsx`. The entity:
- Accepts `hostId` as prop
- Calls `useGetHostWithAlertsQuery(hostId)` from `src/features/analytics/hosts/api/hosts.api.ts`
- Renders the full host header area including:
  - Host info (IP, hostname, network details, threat indicators, badges) — existing `HostSummary` from `features/analytics/hosts/components/host-summary/`
  - `HostDetectionsRadar` — radar chart of detection categories
  - `HostProfile` — host profile/classification info
- Handles loading/error/empty states

**Important:** The current page at `src/pages/hosts/[hostId]/index.tsx` fetches ~7 queries at the layout level (host, entities, incidents, signatures, beaconing, sightings, outlier events). Some of this data feeds the summary area, and some feeds the tab badge counts. The new `HostSummary` entity should own the queries needed for the summary/radar/profile section. Tab badge count queries are handled separately in the route layout (see Task 8).

Reference the current layout in `src/pages/hosts/[hostId]/index.tsx` carefully — identify which queries feed the summary area vs the badge counts, and only include the summary-related queries in this entity.

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run src/features/hosts/entities/host-summary.test.tsx`
Expected: PASS

- [ ] **Step 6: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/features/hosts/entities/
git commit -m "feat: add HostSummary entity component"
```

---

## Task 8: Migrate `/hosts/$hostId` Route Layout

Convert the parent route layout from a thin wrapper to a fat orchestrator with inline tab navigation.

**Files:**
- Modify: `src/routes/_enterprise/hosts/$hostId/route.tsx`
- Reference: `src/pages/hosts/[hostId]/index.tsx` (current HostDetails layout)

- [ ] **Step 1: Read the current route and page layout**

Read:
- `src/routes/_enterprise/hosts/$hostId/route.tsx` — current route
- `src/pages/hosts/[hostId]/index.tsx` — current HostDetails layout (breadcrumbs, summary, tabs, outlet)

Understand what the layout renders: breadcrumbs, host validation, summary section, tab navigation with badges, and `<Outlet />`.

- [ ] **Step 2: Implement the fat orchestrator layout**

Replace the current thin wrapper. The layout should:

1. Use `Route.useParams()` to get `hostId`
2. Validate the hostId (use existing `isIP()` check)
3. Render `<HostSummary hostId={hostId} />` from `@/features/hosts/entities`
4. Fetch tab badge counts (incidents, detection methods, beaconing, sightings, outlier events, detection events)
5. Render inline tab navigation using `<Link>` components with badge counts
6. Render `<Outlet />` for tab content

```tsx
function HostDetailLayout() {
  const { hostId } = Route.useParams();
  const globals = useGlobalQueryParams(['tenant', 'dates']);

  if (!isIP(hostId)) {
    return <HostNotFound hostId={hostId} />;
  }

  // Fetch badge counts for tabs
  // Reference src/pages/hosts/[hostId]/index.tsx for the exact queries used
  // These are the count queries that feed TabsBadge components
  const { data: incidentsCounts } = useGetThreatsStatusCountQuery({ hostId, ...globals });
  const { data: signaturesCounts } = useGetSignaturesCountQuery({ hostId, ...globals });
  const { data: beaconingCounts } = useGetBeaconingEventsCountQuery({ hostId, ...globals });
  const { data: sightingsCounts } = useGetSightingEventsCountQuery({ hostId, ...globals });
  const { data: outlierCounts } = useGetOutlierEventsCountQuery({ hostId, ...globals });
  const { data: detectionEventsCounts } = useGetEventsCountQuery({ hostId, ...globals });

  return (
    <Page>
      <PageHeader title={hostId} />
      <HostSummary hostId={hostId} />
      <nav>
        <Link to="/hosts/$hostId" params={{ hostId }} activeOptions={{ exact: true }}>
          Insights
        </Link>
        <Link to="/hosts/$hostId/detection-events" params={{ hostId }}>
          Detection Events <TabsBadge count={detectionEventsCounts} />
        </Link>
        <Link to="/hosts/$hostId/incidents" params={{ hostId }}>
          Incidents <TabsBadge count={incidentsCounts} />
        </Link>
        <Link to="/hosts/$hostId/detection-methods" params={{ hostId }}>
          Detection Methods <TabsBadge count={signaturesCounts} />
        </Link>
        <Link to="/hosts/$hostId/sightings" params={{ hostId }}>
          Sightings <TabsBadge count={sightingsCounts} />
        </Link>
        <Link to="/hosts/$hostId/outlier-events" params={{ hostId }}>
          Outlier Events <TabsBadge count={outlierCounts} />
        </Link>
        <Link to="/hosts/$hostId/beacons" params={{ hostId }}>
          Beacons <TabsBadge count={beaconingCounts} />
        </Link>
        <Link to="/hosts/$hostId/timeline" params={{ hostId }}>
          Timeline
        </Link>
      </nav>
      <Outlet />
    </Page>
  );
}
```

**Important:** The exact count query hooks and their parameters must be taken from the current `src/pages/hosts/[hostId]/index.tsx`. The pseudocode above is illustrative — use the actual hook names and params from the existing page. Some count queries may share data with the `HostSummary` entity; avoid duplicate fetches by using the same RTK Query cache tags.

Reference the current tab implementation in `src/pages/hosts/[hostId]/index.tsx` for the exact tabs, badge counts, active tab styling, and `TabsBadge` component usage.

- [ ] **Step 3: Run the app and manually verify**

Run: `pnpm dev`
Navigate to `/hosts/<valid-ip>` and verify:
- Host summary renders
- Tab navigation shows all tabs
- Active tab is highlighted
- Clicking tabs navigates correctly
- Invalid IP shows error state

- [ ] **Step 4: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/routes/_enterprise/hosts/\$hostId/route.tsx
git commit -m "feat: migrate hosts/$hostId layout to fat orchestrator with HostSummary"
```

---

## Task 9: Migrate `/hosts/$hostId/detection-events` Tab Route

Convert the detection events tab from a page wrapper to a fat orchestrator.

**Files:**
- Modify: `src/routes/_enterprise/hosts/$hostId/detection-events.tsx`
- Reference: `src/pages/hosts/[hostId]/detection-events/index.tsx` (current implementation)

- [ ] **Step 1: Read the current tab implementation**

Read `src/pages/hosts/[hostId]/detection-events/index.tsx` to understand:
- What global params it uses
- How it builds the qfilter for host-scoped events
- What columns it renders (filters out 'tag')
- The timeline chart it shows

- [ ] **Step 2: Add Zod search schema**

```tsx
import { z } from 'zod';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-timestamp'),
});

export const Route = createFileRoute('/_enterprise/hosts/$hostId/detection-events')({
  validateSearch: searchSchema,
  component: HostDetectionEventsPage,
  errorComponent: PageBoundary,
});
```

- [ ] **Step 3: Implement the fat orchestrator tab component**

```tsx
function HostDetectionEventsPage() {
  const { hostId } = Route.useParams();
  const globals = useGlobalQueryParams(['tenant', 'dates']);

  const { page, pageSize, sorting, setPage, setPageSize, setSorting } =
    usePaginatedSearch(Route, {
      resetOn: [globals.start_date, globals.end_date, globals.tenant],
    });

  const qfilter = `(src_ip:"${esEscape(hostId)}" OR dest_ip:"${esEscape(hostId)}")`;

  const { data, isFetching } = useGetEventsQuery({
    page,
    page_size: pageSize,
    ordering: serializeSorting(sorting),
    ...globals,
    qfilter,
    stamus: true,
    alert: true,
    discovery: true,
  });

  const { data: timeline } = useGetCountsTimelineQuery({
    ...globals,
    qfilter,
    target: 'true',
    alert: true,
    discovery: true,
    stamus: true,
  });

  // All columns except tag
  const columns = [
    EXPANDER_COLUMN,
    TIMESTAMP_COLUMN,
    METHOD_COLUMN,
    SOURCE_COLUMN,
    DESTINATION_COLUMN,
    PROTOCOL_COLUMN,
    HOST_COLUMN,
    CATEGORY_COLUMN,
  ];

  return (
    <>
      <BarChartTimeline data={timeline} />
      <Table
        data={data?.results ?? []}
        columns={columns}
        isLoading={isFetching}
        sorting={sorting}
        onSortingChange={setSorting}
        ExpandedRow={ExpandedEventRow}
        Empty={<DataTableEmpty entity="detection events" />}
      />
      <PaginationFooter
        page={page}
        pageSize={pageSize}
        total={data?.count ?? 0}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </>
  );
}
```

- [ ] **Step 4: Run the app and manually verify**

Run: `pnpm dev`
Navigate to `/hosts/<valid-ip>/detection-events` and verify:
- Timeline chart renders
- Table shows host-scoped detection events
- Pagination works
- Sorting works
- Expanded row works
- Changing dates resets to page 1

- [ ] **Step 5: Write a test for the migrated tab**

Create a test with MSW mocking both the events and timeline API endpoints, scoped to a specific hostId.

- [ ] **Step 6: Run tests**

Run: `pnpm vitest run src/routes/_enterprise/hosts/`
Expected: PASS

- [ ] **Step 7: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 8: Delete old page files**

Remove `src/pages/hosts/[hostId]/detection-events/index.tsx` after verifying no other routes import it.

- [ ] **Step 9: Commit**

```bash
git add src/routes/_enterprise/hosts/\$hostId/detection-events.tsx src/pages/hosts/
git commit -m "feat: migrate hosts/$hostId/detection-events tab to fat orchestrator"
```

---

## Task 10: Delete old HostDetails page and run final verification

Clean up the old page files for the host detail layout now that the route handles it.

**Files:**
- Delete: `src/pages/hosts/[hostId]/index.tsx` (if only used by the migrated route)

- [ ] **Step 1: Check for remaining imports of old page files**

Search for any remaining imports of the old host detail page:
```bash
grep -r "pages/hosts" src/routes/ src/pages/
```

Only delete files that are no longer imported by any route.

Note: Other host tabs (insights, incidents, detection-methods, sightings, beacons, timeline) still use their `/pages` components. Only delete the layout (`index.tsx`) and the detection-events tab page that were migrated.

- [ ] **Step 2: Delete confirmed unused files**

Remove files confirmed as unused in Step 1.

- [ ] **Step 3: Run full test suite**

Run: `pnpm vitest run`
Expected: All tests pass

- [ ] **Step 4: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove migrated page files for detection-events and hosts layout"
```

---

## Post-Migration Notes

After these two pattern routes are validated, the remaining routes can be migrated incrementally following the same pattern:

1. Extract feature column constants (if not already done for that feature)
2. Rewrite the route as a fat orchestrator with Zod search schema
3. Wire `usePaginatedSearch` + RTK Query + `Table` + `PaginationFooter`
4. Delete old `/pages` entry

Once all routes are migrated:
- Remove the old `DataTable` component
- Remove `useServerTableState`, `usePaginationUrlState`, `useSortingUrlState` hooks
- Remove `nuqs` dependency
- Remove the `/pages` directory entirely
