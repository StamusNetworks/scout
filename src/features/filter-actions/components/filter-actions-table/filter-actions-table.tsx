import { getRouteApi } from '@tanstack/react-router';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetFilterActionsQuery } from '../../api/filter-actions.api';
import { filterActionsColumns } from './filter-actions-table.columns';
import { ExpandedFilterActionRow } from './filter-actions-table.expanded-row';

const routeApi = getRouteApi('/filters-actions');

export const FiltersActionsTable = () => {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const params = useGlobalQueryParams(['tenant']);
  const { queryParams, pagination, setPagination } = useServerTableState(
    search,
    params,
    navigate,
  );
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
