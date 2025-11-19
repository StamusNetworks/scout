import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { routes } from '@/pages/routes.config';

import { useGetBeaconingEventsQuery } from '../../api/beaconing.api';
import {
  exportColumns,
  servingIpsTableColumns,
} from './serving-ips-table.columns';

export const ServingIpsTable = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = usePaginationUrlState();
  const [sorting, setSorting, ordering] = useSortingUrlState();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data, isFetching } = useGetBeaconingEventsQuery({
    ...params,
    ...pagination,
    ordering,
    qfilter: 'beacon_report.document_type:agg_serving_ip',
  });
  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={servingIpsTableColumns}
      serverSide
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      onRowClick={(row) =>
        navigate(
          routes.beaconing_ips_details.replace(
            ':ip',
            row.original.beacon_report.value,
          ),
        )
      }
      exportColumns={exportColumns}
    />
  );
};
