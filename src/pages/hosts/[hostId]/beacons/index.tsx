import { Radar } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { esEscape } from '@/common/lib/strings';
import { useGetBeaconingEventsQuery } from '@/features/analytics/beaconing/api/beaconing.api';
import { beaconingTableColumns } from '@/features/analytics/beaconing/components/beaconing-table/beaconing-table.columns';

export const HostBeaconing = () => {
  const { hostId } = useParams();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState(params);
  const { data: beaconingData, isFetching: isFetchingBeaconing } =
    useGetBeaconingEventsQuery({
      ...queryParams,
      qfilter: `beacon_report.assets:${esEscape(hostId ?? '')}`,
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
