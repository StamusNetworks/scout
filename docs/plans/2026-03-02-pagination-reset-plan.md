# Pagination Reset Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a `useServerTableState` hook that resets pagination to page 1 when query params or sorting change, with zero duplicate requests.

**Architecture:** A single hook manages pagination + sorting (URL-backed via nuqs), detects param changes synchronously during render (React's "adjust state during rendering" pattern), and returns merged `queryParams` ready for RTK Query. All filter params flow through the hook input — if you add a filter, it automatically triggers page reset AND appears in the query.

**Tech Stack:** React, nuqs 2.8.5, @tanstack/react-table, RTK Query, vitest, @testing-library/react 16

---

### Task 1: Write failing tests for `useServerTableState`

**Files:**
- Create: `src/common/design-system/molecules/data-table/hooks/use-server-table-state.test.ts`

**Step 1: Write the test file**

```ts
import { act, renderHook } from '@testing-library/react';
import { withNuqsTestingAdapter } from 'nuqs/adapters/testing';
import { describe, expect, it, vi } from 'vitest';

import { useServerTableState } from './use-server-table-state';

const wrapper = (searchParams?: string) =>
  withNuqsTestingAdapter({ searchParams, hasMemory: true });

describe('useServerTableState', () => {
  it('returns page 1 and empty sorting on initial render', () => {
    const { result } = renderHook(
      () => useServerTableState({ tenant: 1 }),
      { wrapper: wrapper() },
    );

    expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 10 });
    expect(result.current.sorting).toEqual([]);
    expect(result.current.queryParams).toEqual({
      tenant: 1,
      pageIndex: 0,
      pageSize: 10,
    });
  });

  it('respects defaultPageSize option', () => {
    const { result } = renderHook(
      () => useServerTableState({ tenant: 1 }, { defaultPageSize: 25 }),
      { wrapper: wrapper() },
    );

    expect(result.current.pagination.pageSize).toBe(25);
    expect(result.current.queryParams.pageSize).toBe(25);
  });

  it('resets page to 1 when a param value changes', () => {
    const { result, rerender } = renderHook(
      ({ params }) => useServerTableState(params),
      {
        wrapper: wrapper(),
        initialProps: { params: { tenant: 1 } },
      },
    );

    // Navigate to page 3
    act(() => {
      result.current.setPagination({ pageIndex: 2, pageSize: 10 });
    });
    expect(result.current.pagination.pageIndex).toBe(2);

    // Change tenant — page should reset to 0
    rerender({ params: { tenant: 2 } });
    expect(result.current.pagination.pageIndex).toBe(0);
    expect(result.current.queryParams.pageIndex).toBe(0);
  });

  it('resets page to 1 when a new param key appears', () => {
    const { result, rerender } = renderHook(
      ({ params }) => useServerTableState(params),
      {
        wrapper: wrapper(),
        initialProps: { params: { tenant: 1 } as Record<string, unknown> },
      },
    );

    act(() => {
      result.current.setPagination({ pageIndex: 2, pageSize: 10 });
    });

    rerender({ params: { tenant: 1, qfilter: 'src_ip:1.2.3.4' } });
    expect(result.current.pagination.pageIndex).toBe(0);
  });

  it('does NOT reset page when params are value-equal', () => {
    const { result, rerender } = renderHook(
      ({ params }) => useServerTableState(params),
      {
        wrapper: wrapper(),
        initialProps: { params: { tenant: 1, filter: 'abc' } },
      },
    );

    act(() => {
      result.current.setPagination({ pageIndex: 2, pageSize: 10 });
    });
    expect(result.current.pagination.pageIndex).toBe(2);

    // Re-render with new object reference but same values
    rerender({ params: { tenant: 1, filter: 'abc' } });
    expect(result.current.pagination.pageIndex).toBe(2);
  });

  it('resets page when sorting changes', () => {
    const { result } = renderHook(
      () => useServerTableState({ tenant: 1 }),
      { wrapper: wrapper() },
    );

    act(() => {
      result.current.setPagination({ pageIndex: 2, pageSize: 10 });
    });
    expect(result.current.pagination.pageIndex).toBe(2);

    // Change sorting
    act(() => {
      result.current.setSorting([{ id: 'timestamp', desc: true }]);
    });
    expect(result.current.pagination.pageIndex).toBe(0);
    expect(result.current.queryParams.ordering).toBe('-timestamp');
  });

  it('includes ordering in queryParams when sorting is set', () => {
    const { result } = renderHook(
      () => useServerTableState({ tenant: 1 }),
      { wrapper: wrapper('?sort=-timestamp') },
    );

    expect(result.current.queryParams.ordering).toBe('-timestamp');
    expect(result.current.sorting).toEqual([{ id: 'timestamp', desc: true }]);
  });

  it('omits ordering from queryParams when no sorting', () => {
    const { result } = renderHook(
      () => useServerTableState({ tenant: 1 }),
      { wrapper: wrapper() },
    );

    expect(result.current.queryParams).not.toHaveProperty('ordering');
  });

  it('reads initial page and page_size from URL', () => {
    const { result } = renderHook(
      () => useServerTableState({ tenant: 1 }),
      { wrapper: wrapper('?page=3&page_size=25') },
    );

    expect(result.current.pagination).toEqual({ pageIndex: 2, pageSize: 25 });
    expect(result.current.queryParams.pageIndex).toBe(2);
    expect(result.current.queryParams.pageSize).toBe(25);
  });
});
```

**Step 2: Create a stub hook so the test file compiles**

Create `src/common/design-system/molecules/data-table/hooks/use-server-table-state.ts`:

```ts
import type { OnChangeFn, PaginationState, SortingState, Updater } from '@tanstack/react-table';

export type ServerTableStateOptions = {
  defaultPageSize?: number;
};

export type ServerTableState<TParams> = {
  queryParams: TParams & {
    pageIndex: number;
    pageSize: number;
    ordering?: string;
  };
  pagination: PaginationState;
  setPagination: (updater: Updater<PaginationState>) => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
};

export function useServerTableState<TParams extends Record<string, unknown>>(
  _params: TParams,
  _options?: ServerTableStateOptions,
): ServerTableState<TParams> {
  throw new Error('Not implemented');
}
```

**Step 3: Run the tests to verify they fail**

Run: `pnpm vitest run src/common/design-system/molecules/data-table/hooks/use-server-table-state.test.ts`

Expected: All tests FAIL with "Not implemented"

**Step 4: Commit**

```bash
git add src/common/design-system/molecules/data-table/hooks/use-server-table-state.ts \
        src/common/design-system/molecules/data-table/hooks/use-server-table-state.test.ts
git commit -m "test: add failing tests for useServerTableState hook"
```

---

### Task 2: Implement `useServerTableState`

**Files:**
- Modify: `src/common/design-system/molecules/data-table/hooks/use-server-table-state.ts`

**Step 1: Implement the hook**

Replace the stub with the full implementation:

```ts
import type {
  OnChangeFn,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table';
import { createParser, parseAsInteger, useQueryState } from 'nuqs';
import { useCallback, useMemo, useRef } from 'react';

export type ServerTableStateOptions = {
  defaultPageSize?: number;
};

export type ServerTableState<TParams> = {
  queryParams: TParams & {
    pageIndex: number;
    pageSize: number;
    ordering?: string;
  };
  pagination: PaginationState;
  setPagination: (updater: Updater<PaginationState>) => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
};

export function useServerTableState<TParams extends Record<string, unknown>>(
  params: TParams,
  options?: ServerTableStateOptions,
): ServerTableState<TParams> {
  const defaultPageSize = options?.defaultPageSize ?? 10;

  // URL-backed pagination
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1),
  );
  const [pageSize, setPageSize] = useQueryState(
    'page_size',
    parseAsInteger.withDefault(defaultPageSize),
  );

  // URL-backed sorting
  const [sorting, setSortingRaw] = useQueryState(
    'sort',
    parseAsSorting.withDefault([]),
  );
  const ordering = serializeSorting(sorting) || undefined;

  // --- Synchronous page reset on param/ordering change ---
  const prevParamsRef = useRef(params);
  const prevOrderingRef = useRef(ordering);

  const paramsChanged = !shallowEqual(prevParamsRef.current, params);
  const orderingChanged = prevOrderingRef.current !== ordering;
  const shouldReset = (paramsChanged || orderingChanged) && page !== 1;

  if (paramsChanged) {
    prevParamsRef.current = params;
  }
  if (orderingChanged) {
    prevOrderingRef.current = ordering;
  }
  if (shouldReset) {
    setPage(1);
  }

  // Use page 1 immediately when reset is triggered
  const effectivePage = shouldReset ? 1 : page;

  // --- Handlers ---
  const handlePaginationUpdate = useCallback(
    (updater: Updater<PaginationState>) => {
      const prev = { pageIndex: effectivePage - 1, pageSize };
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setPage(next.pageIndex + 1, { history: 'push' });
      setPageSize(next.pageSize);
    },
    [effectivePage, pageSize, setPage, setPageSize],
  );

  const handleSortingUpdate: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      const prev = Array.isArray(sorting) ? sorting : [];
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setSortingRaw(next);
    },
    [sorting, setSortingRaw],
  );

  const pagination = useMemo(
    () => ({ pageIndex: effectivePage - 1, pageSize }),
    [effectivePage, pageSize],
  );

  const queryParams = useMemo(
    () => ({
      ...params,
      pageIndex: effectivePage - 1,
      pageSize,
      ...(ordering !== undefined && { ordering }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- params is shallow-compared via ref
    [effectivePage, pageSize, ordering, paramsChanged],
  ) as TParams & { pageIndex: number; pageSize: number; ordering?: string };

  return useMemo(
    () => ({
      queryParams,
      pagination,
      setPagination: handlePaginationUpdate,
      sorting,
      setSorting: handleSortingUpdate,
    }),
    [
      queryParams,
      pagination,
      handlePaginationUpdate,
      sorting,
      handleSortingUpdate,
    ],
  );
}

// --- Internal utilities ---

function shallowEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => Object.is(a[key], b[key]));
}

const serializeSorting = (sorting: SortingState) =>
  sorting.map(({ id, desc }) => `${desc ? '-' : ''}${id}`).join(',');

const parseAsSorting = createParser({
  parse(value: string) {
    return value
      .split(',')
      .map((v) => ({ id: v.replace('-', ''), desc: v[0] === '-' }));
  },
  serialize: serializeSorting,
});
```

**Step 2: Run the tests to verify they pass**

Run: `pnpm vitest run src/common/design-system/molecules/data-table/hooks/use-server-table-state.test.ts`

Expected: All tests PASS

**Step 3: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`

Expected: No errors

**Step 4: Commit**

```bash
git add src/common/design-system/molecules/data-table/hooks/use-server-table-state.ts
git commit -m "feat: implement useServerTableState hook

Synchronously resets page to 1 when query params or sorting change.
Returns merged queryParams for RTK Query with zero duplicate requests."
```

---

### Task 3: Migrate InventoryTable

**Files:**
- Modify: `src/features/analytics/hosts/components/hostsTable/inventory-table.tsx`

**Step 1: Refactor InventoryTable to use `useServerTableState`**

Replace the current hook usage:

```tsx
import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/common/design-system/molecules/data-table/data-table.tsx';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams.tsx';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder.ts';
import { routes } from '@/pages/routes.config.ts';

import { useGetHostsQuery } from '../../api/hosts.api.ts';
import { getFilterExtension } from '../../api/hooks/useHostsList.ts';
import { columns, exportColumns } from './hostsTable.columns.tsx';
import { HostsTableExpandedRow } from './hostsTable.expandedRow.tsx';

export const InventoryTable = ({
  inHomeNetwork,
}: {
  inHomeNetwork: 'true' | 'false' | 'all';
}) => {
  const {
    columnOrder,
    onColumnOrderChange,
    columnVisibility,
    onColumnVisibilityChange,
    canReset,
    onClickReset,
  } = useTablePreferences({
    tableId: 'inventoryTable',
    columns,
  });
  const navigate = useNavigate();

  const QFBuilder = useQFBuilder();
  const globalParams = useGlobalQueryParams(
    ['tenant', 'dates', 'qfilter', 'qfilterHost'],
    { extendQfilter: getFilterExtension(QFBuilder, inHomeNetwork) },
  );

  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState({
      tenant: globalParams.tenant,
      start_date: globalParams.start_date,
      end_date: globalParams.end_date,
      host_id_qfilter: globalParams.host_id_qfilter,
      inHomeNetwork,
    });

  const { data, isFetching } = useGetHostsQuery({
    ...queryParams,
    withAlerts: false,
    ordering: queryParams.ordering ?? '-host_id.last_seen',
  });

  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={columns.filter((col) => col.id !== 'hits')}
      ExpandedRow={HostsTableExpandedRow}
      onRowClick={(row) => navigate(`${routes.hosts}/${row.original.ip}`)}
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      exportColumns={exportColumns.filter((col) => col.label !== 'Hits')}
      columnOrder={columnOrder}
      onColumnOrderChange={onColumnOrderChange}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      canReset={canReset}
      onClickReset={onClickReset}
    />
  );
};
```

Key changes from the original:
- Removed `usePaginationUrlState`, `useSortingUrlState` imports
- Removed manual `useEffect` for `inHomeNetwork` page reset
- Inlined `useGlobalQueryParams` + `useQFBuilder` (previously inside `useHostsList`)
- `useServerTableState` now manages pagination + sorting + page reset
- `inHomeNetwork` is in the params → page resets automatically when it changes

**Step 2: Run lint and type check**

Run: `pnpm run lint --fix && pnpm run check`

Expected: No errors. Note: `useHostsList` is still used by other components (check before removing).

**Step 3: Commit**

```bash
git add src/features/analytics/hosts/components/hostsTable/inventory-table.tsx
git commit -m "refactor: migrate InventoryTable to useServerTableState

Removes manual useEffect page reset and separate pagination/sorting hooks.
All query params now flow through useServerTableState for automatic page reset."
```

---

### Task 4: Final verification

**Step 1: Run full test suite**

Run: `pnpm vitest run`

Expected: All tests pass (no regressions)

**Step 2: Run quality checks**

Run: `pnpm run lint --fix && pnpm run check`

Expected: No lint or TypeScript errors
