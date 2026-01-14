import { Radar } from 'lucide-react';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetBeaconingEventsQuery } from '../../api/beaconing.api';
import { beaconingTableColumns } from './beaconing-table.columns';

export const BeaconingTable = () => {
  const [pagination, setPagination] = usePaginationUrlState();
  const [sorting, setSorting, ordering] = useSortingUrlState();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data, isLoading } = useGetBeaconingEventsQuery({
    ...params,
    ...pagination,
    ordering,
    qfilter: 'beacon_report.document_type:agg_serving_ip',
  });
  return (
    <DataTable
      data={data}
      isLoading={isLoading}
      columns={beaconingTableColumns}
      serverSide
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      Empty={
        <DataTableEmpty
          Icon={Radar}
          entity="beaconing ips"
        />
      }
    />
  );
};
