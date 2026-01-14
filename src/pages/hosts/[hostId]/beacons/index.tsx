import { Radar } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetBeaconingEventsQuery } from '@/features/analytics/beaconing/api/beaconing.api';
import { beaconingTableColumns } from '@/features/analytics/beaconing/components/beaconing-table/beaconing-table.columns';

export const HostBeaconing = () => {
  const { hostId } = useParams();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [pagination, setPagination] = usePaginationUrlState();
  const [sorting, setSorting, ordering] = useSortingUrlState();
  const { data: beaconingData, isFetching: isFetchingBeaconing } =
    useGetBeaconingEventsQuery({
      ...params,
      ...pagination,
      ordering,
      qfilter: `beacon_report.assets:${hostId}`,
    });

  return (
    <DataTable
      data={beaconingData}
      isLoading={isFetchingBeaconing}
      columns={beaconingTableColumns}
      serverSide
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      Empty={
        <DataTableEmpty
          Icon={Radar}
          entity="beacons"
        />
      }
    />
  );
};
