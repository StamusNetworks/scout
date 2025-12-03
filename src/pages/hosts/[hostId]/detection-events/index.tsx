import { useParams } from 'react-router-dom';

import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetEventsQuery } from '@/features/hunt/events/api/events.api';
import { columns } from '@/features/hunt/events/components/events-table/events.columns';
import { ExpandedEventRow } from '@/features/hunt/events/components/events-table/events.expanded-row';
import { useGetCountsTimelineQuery } from '@/features/hunt/timeline/api/timeline.api';

const tableCols = columns.filter((col) => col.id !== 'tag');

export const HostDetectionEvents = () => {
  const { hostId } = useParams();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [pagination, setPagination] = usePaginationUrlState();
  const [sorting, setSorting, ordering] = useSortingUrlState();
  const { data, isFetching } = useGetEventsQuery({
    ...params,
    ...pagination,
    ordering,
    qfilter: `stamus.asset:"${hostId}"`,
    stamus: true,
    alert: true,
    discovery: true,
  });

  const { data: timelineData } = useGetCountsTimelineQuery({
    ...params,
    qfilter: `stamus.asset:"${hostId}"`,
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
      />
    </>
  );
};
