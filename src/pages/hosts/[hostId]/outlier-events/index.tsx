import { Binary } from 'lucide-react';
import { useParams } from '@tanstack/react-router';

import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { esEscape } from '@/common/lib/strings';
import { useGetEventsQuery } from '@/features/hunt/events/api/events.api';
import { getColumns } from '@/features/hunt/events/components/events-table/events.columns';
import { ExpandedEventRow } from '@/features/hunt/events/components/events-table/events.expanded-row';
import { useGetCountsTimelineQuery } from '@/features/hunt/timeline/api/timeline.api';

const tableCols = getColumns(true).filter((col) => col.id !== 'tag');

export const HostOutlierEvents = () => {
  const { hostId } = useParams({ strict: false }) as { hostId: string };
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState(params);
  const { data, isFetching } = useGetEventsQuery({
    ...queryParams,
    qfilter: `(src_ip:"${esEscape(hostId ?? '')}" OR dest_ip:"${esEscape(hostId ?? '')}") AND stamus_novel:true`,
    stamus: true,
    alert: true,
    discovery: true,
  });

  const { data: timelineData } = useGetCountsTimelineQuery({
    ...params,
    qfilter: `(src_ip:"${esEscape(hostId ?? '')}" OR dest_ip:"${esEscape(hostId ?? '')}") AND stamus_novel:true`,
    target: 'true',
    alert: true,
    discovery: true,
    stamus: true,
  });

  return (
    <>
      {timelineData && (
        <BarChartTimeline
          data={timelineData}
          className="mb-2 h-32"
        />
      )}
      <DataTable
        data={data}
        isLoading={isFetching}
        columns={tableCols}
        serverSide
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        ExpandedRow={({ row }) => <ExpandedEventRow row={row} />}
        Empty={
          <DataTableEmpty
            Icon={Binary}
            entity="outlier events"
          />
        }
      />
    </>
  );
};
