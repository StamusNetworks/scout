import type { PaginationState, Updater } from '@tanstack/react-table';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetFilterActionsQuery } from '../../api/filter-actions.api';
import { filterActionsColumns } from './filter-actions-table.columns';
import { ExpandedFilterActionRow } from './filter-actions-table.expanded-row';

type Props = {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export const FiltersActionsTable = ({
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: Props) => {
  const params = useGlobalQueryParams(['tenant']);
  const pageIndex = page - 1;

  const { data, isFetching } = useGetFilterActionsQuery({
    ...params,
    pageIndex,
    pageSize,
  });

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    const prev = { pageIndex, pageSize };
    const next = typeof updater === 'function' ? updater(prev) : updater;
    if (next.pageSize !== pageSize) onPageSizeChange(next.pageSize);
    if (next.pageIndex !== pageIndex) onPageChange(next.pageIndex + 1);
  };

  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={filterActionsColumns}
      ExpandedRow={ExpandedFilterActionRow}
      serverSide
      pagination={{ pageIndex, pageSize }}
      onPaginationChange={handlePaginationChange}
    />
  );
};
