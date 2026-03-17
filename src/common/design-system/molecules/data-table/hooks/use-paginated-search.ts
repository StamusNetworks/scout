import type { SortingState } from '@tanstack/react-table';
import { useRef } from 'react';

import { parseSorting, serializeSorting } from './sorting-parser';

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

  // Shallow compare each element to detect dep changes
  let shouldReset = false;
  const prevDeps = prevDepsRef.current;
  if (
    prevDeps.length !== resetOn.length ||
    prevDeps.some((dep, i) => dep !== resetOn[i])
  ) {
    if (prevDepsRef.current !== resetOn) {
      shouldReset = true;
    }
  }
  prevDepsRef.current = resetOn;

  const page = shouldReset ? 1 : ((search.page as number) ?? 1);
  const pageSize = (search.page_size as number) ?? defaultPageSize;
  const sorting = parseSorting((search.sort as string) ?? '');

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
