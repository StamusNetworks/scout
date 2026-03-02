import { DataTable } from '@/common/design-system/molecules/data-table';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetFilterActionsQuery } from '../../api/filter-actions.api';
import { filterActionsColumns } from './filter-actions-table.columns';
import { ExpandedFilterActionRow } from './filter-actions-table.expanded-row';

export const FiltersActionsTable = () => {
  const params = useGlobalQueryParams(['tenant']);
  const { queryParams, pagination, setPagination } =
    useServerTableState(params);
  const { data, isFetching } = useGetFilterActionsQuery(queryParams);
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
