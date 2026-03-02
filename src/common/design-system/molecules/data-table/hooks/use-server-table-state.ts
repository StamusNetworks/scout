import type {
  OnChangeFn,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useCallback, useMemo, useRef, useState } from 'react';

import { parseAsSorting, serializeSorting } from './sorting-parser';

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

  // URL state (syncs page/page_size to URL)
  const [urlPage, setUrlPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1),
  );
  const [urlPageSize, setUrlPageSize] = useQueryState(
    'page_size',
    parseAsInteger.withDefault(defaultPageSize),
  );

  // Local state drives rendering; URL state kept in sync via handlers.
  // nuqs defers URL updates via startTransition, so local state ensures
  // immediate, synchronous propagation for pagination reads and resets.
  const [page, setPage] = useState(urlPage);
  const [pageSize, setPageSize] = useState(urlPageSize);

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
    setUrlPage(1);
  }

  // Use page 1 immediately when reset is triggered
  const effectivePage = shouldReset ? 1 : page;

  // --- Handlers ---
  const handlePaginationUpdate = useCallback(
    (updater: Updater<PaginationState>) => {
      const prev = { pageIndex: effectivePage - 1, pageSize };
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const newPage = next.pageIndex + 1;
      setPage(newPage);
      setPageSize(next.pageSize);
      setUrlPage(newPage, { history: 'push' });
      setUrlPageSize(next.pageSize);
    },
    [effectivePage, pageSize, setUrlPage, setUrlPageSize],
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
