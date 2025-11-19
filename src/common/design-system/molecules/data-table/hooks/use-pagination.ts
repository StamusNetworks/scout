import { PaginationState, Updater } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useCallback, useMemo, useState } from 'react';

import { useUpdateEffect } from '@/common/lib/use-update-effect';
import { selectTenant } from '@/features/user/tenancy/tenancy.selector';
import { useAppSelector } from '@/store/store';

export const usePaginationState = () =>
  useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

export const usePaginationUrlState = (
  defaultPageSize = 10,
): [PaginationState, (updater: Updater<PaginationState>) => void] => {
  const tenant = useAppSelector(selectTenant);
  const qfilters = useAppSelector(
    (state) => state.filters.queryFilters.queryFilters,
  );
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    'page_size',
    parseAsInteger.withDefault(defaultPageSize),
  );
  const handlePaginationUpdate = useCallback(
    (updater: Updater<PaginationState>) => {
      const prev = { pageIndex: page - 1, pageSize };
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setPage(next.pageIndex + 1, { history: 'push' });
      setPageSize(next.pageSize);
    },
    [page, pageSize, setPage, setPageSize],
  );

  useUpdateEffect(() => {
    setPage(1);
  }, [tenant, qfilters]);

  return useMemo(
    () => [{ pageIndex: page - 1, pageSize }, handlePaginationUpdate],
    [page, pageSize, handlePaginationUpdate],
  );
};
