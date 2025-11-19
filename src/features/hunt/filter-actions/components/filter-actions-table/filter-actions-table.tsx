import { DataTable } from '@/common/design-system/molecules/data-table';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetFilterActionsQuery } from '../../api/filter-actions.api';
import { filterActionsColumns } from './filter-actions-table.columns';
import { ExpandedFilterActionRow } from './filter-actions-table.expanded-row';

export const FiltersActionsTable = () => {
  const params = useGlobalQueryParams(['tenant']);
  const [pagination, setPagination] = usePaginationUrlState();
  const { data, isFetching } = useGetFilterActionsQuery({
    ...params,
    ...pagination,
  });
  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={filterActionsColumns}
      ExpandedRow={ExpandedFilterActionRow}
      serverSide
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
};
