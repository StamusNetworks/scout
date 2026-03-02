# Pagination Reset on Query Param Change

## Problem

Tables with server-side pagination break when filters change and the current page exceeds the new result count. The current `usePaginationUrlState` only resets on tenant/qfilter changes, missing dates, event types, sorting, and local filters. This causes "invalid page" errors caught reactively by `useResetPaginationOnError`, and produces duplicate requests.

## Design

### `useServerTableState<TParams>(params, options?)`

A single hook that manages pagination and sorting (URL-backed via nuqs), resets the page synchronously when query params or sorting change, and returns merged `queryParams` for RTK Query.

```ts
function useServerTableState<TParams extends Record<string, unknown>>(
  params: TParams,
  options?: { defaultPageSize?: number },
): {
  queryParams: TParams & { pageIndex: number; pageSize: number; ordering?: string };
  pagination: PaginationState;
  setPagination: (updater: Updater<PaginationState>) => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
}
```

### Synchronous Reset Mechanism

Uses the React pattern for adjusting state during rendering:

1. Each render, shallow-compare `params` and `ordering` against refs of previous values
2. When a change is detected, return `page=1` immediately and schedule `setPage(1)` for URL sync
3. Next render: page state is 1, same RTK Query cache key, no second request

This eliminates duplicate requests entirely.

### Hard Constraint

`queryParams` is the only output containing pagination. All params flow through the hook input — adding a filter automatically triggers page reset AND appears in the query. Params that bypass the hook won't reach RTK Query.

### Filter Groups

All three groups trigger page reset via the single `params` input:

- **Tenant**: passed via `useGlobalQueryParams`
- **Global** (qfilter, dates, event types, alert tags): passed via `useGlobalQueryParams`
- **Implementation-specific**: passed directly as additional params

Sorting resets pagination via internal ordering change detection.

## Usage

```tsx
const globalParams = useGlobalQueryParams(['tenant', 'dates', 'qfilter']);
const { queryParams, pagination, setPagination, sorting, setSorting } =
  useServerTableState({ ...globalParams, inHomeNetwork });

const { data, isFetching } = useGetHostsQuery(queryParams);

<DataTable
  data={data}
  isLoading={isFetching}
  serverSide
  pagination={pagination}
  onPaginationChange={setPagination}
  sorting={sorting}
  onSortingChange={setSorting}
/>
```

## Removals

- `useResetPaginationOnError` — deleted
- Manual `useEffect` page resets in table components
- Redux imports (tenant, qfilters) from `usePaginationUrlState`

## Kept As-Is

- `usePaginationUrlState` / `useSortingUrlState` — for non-migrated tables
- `useGlobalQueryParams` — assembles global params
- `buildQueryParams` — transforms params in API endpoints

## File Location

- Hook: `src/common/design-system/molecules/data-table/hooks/use-server-table-state.ts`
- Tests: `src/common/design-system/molecules/data-table/hooks/use-server-table-state.test.ts`

## Scope

New hook + migrate `InventoryTable` as reference implementation.
