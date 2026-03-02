import type {
  OnChangeFn,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table';
import { createParser, parseAsInteger, useQueryState } from 'nuqs';
import { useCallback, useMemo, useRef, useState } from 'react';

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

  // URL-backed pagination — read initial values from URL
  const [urlPage, setUrlPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1),
  );
  const [urlPageSize, setUrlPageSize] = useQueryState(
    'page_size',
    parseAsInteger.withDefault(defaultPageSize),
  );

  // Local state initialized from URL, kept in sync via handlers
  const [localPage, setLocalPage] = useState(urlPage);
  const [localPageSize, setLocalPageSize] = useState(urlPageSize);

  // Use the maximum of URL and local state on first render, local thereafter
  // This ensures URL params are picked up on initial load
  const page = localPage;
  const pageSize = localPageSize;

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
    setLocalPage(1);
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
      setLocalPage(newPage);
      setLocalPageSize(next.pageSize);
      setUrlPage(newPage);
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
