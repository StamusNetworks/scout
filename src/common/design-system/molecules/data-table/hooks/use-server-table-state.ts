import type {
  OnChangeFn,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table';
import { useCallback, useMemo, useRef } from 'react';

import { parseSorting, serializeSorting } from './sorting-parser';

export type PaginationSearch = {
  page: number;
  page_size: number;
  sort?: string;
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

export function useServerTableState<
  TSearch extends PaginationSearch,
  TParams extends Record<string, unknown>,
>(
  search: TSearch,
  params: TParams,
  navigate: (opts: { search: (prev: TSearch) => TSearch }) => void,
): ServerTableState<TParams> {
  const { page, page_size, sort } = search;
  const sorting = parseSorting(sort);
  const ordering = serializeSorting(sorting);

  // --- Page reset on param change ---
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
    navigate({ search: (prev) => ({ ...prev, page: 1 }) });
  }

  const effectivePage = shouldReset ? 1 : page;

  // --- Handlers ---
  const handlePaginationUpdate = useCallback(
    (updater: Updater<PaginationState>) => {
      const prev = { pageIndex: effectivePage - 1, pageSize: page_size };
      const next = typeof updater === 'function' ? updater(prev) : updater;
      navigate({
        search: (s) => ({
          ...s,
          page: next.pageIndex + 1,
          page_size: next.pageSize,
        }),
      });
    },
    [effectivePage, page_size, navigate],
  );

  const handleSortingUpdate: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      const prev = sorting;
      const next = typeof updater === 'function' ? updater(prev) : updater;
      navigate({
        search: (s) => ({ ...s, sort: serializeSorting(next) }),
      });
    },
    [sorting, navigate],
  );

  const pagination = useMemo(
    () => ({ pageIndex: effectivePage - 1, pageSize: page_size }),
    [effectivePage, page_size],
  );

  const queryParams = useMemo(
    () => ({
      ...params,
      pageIndex: effectivePage - 1,
      pageSize: page_size,
      ...(ordering !== undefined && { ordering }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectivePage, page_size, ordering, paramsChanged],
  ) as TParams & { pageIndex: number; pageSize: number; ordering?: string };

  return useMemo(
    () => ({
      queryParams,
      pagination,
      setPagination: handlePaginationUpdate,
      sorting,
      setSorting: handleSortingUpdate,
    }),
    [queryParams, pagination, handlePaginationUpdate, sorting, handleSortingUpdate],
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
