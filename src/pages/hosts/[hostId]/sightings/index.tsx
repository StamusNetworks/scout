import { Radar } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetSightingEventsQuery } from '@/features/analytics/sightings/api/sightings.api';
import { hostSightingTableColumns } from '@/features/analytics/sightings/components/sightings-table/sightings-table.columns';
import { ExpandedEventRow } from '@/features/hunt/events/components/events-table/events.expanded-row';

export const HostSightings = () => {
  const { hostId } = useParams();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState(params);
  const { data: sightingsData, isFetching: isFetchingSightings } =
    useGetSightingEventsQuery({
      ...queryParams,
      qfilter: `discovery.asset:${hostId}`,
    });
  return (
    <DataTable
      columns={hostSightingTableColumns}
      data={sightingsData}
      isLoading={isFetchingSightings}
      serverSide
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      ExpandedRow={ExpandedEventRow}
      Empty={
        <DataTableEmpty
          Icon={Radar}
          entity="sightings"
        />
      }
    />
  );
};
