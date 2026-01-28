import { Binary } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetEventsQuery } from '@/features/hunt/events/api/events.api';
import { getColumns } from '@/features/hunt/events/components/events-table/events.columns';
import { ExpandedEventRow } from '@/features/hunt/events/components/events-table/events.expanded-row';
import { useGetCountsTimelineQuery } from '@/features/hunt/timeline/api/timeline.api';

const tableCols = getColumns(true).filter((col) => col.id !== 'tag');

export const HostOutlierEvents = () => {
  const { hostId } = useParams();
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [pagination, setPagination] = usePaginationUrlState();
  const [sorting, setSorting, ordering] = useSortingUrlState();
  const { data, isFetching } = useGetEventsQuery({
    ...params,
    ...pagination,
    ordering,
    qfilter: `(src_ip:"${hostId}" OR dest_ip:"${hostId}") AND stamus_novel:true`,
    stamus: true,
    alert: true,
    discovery: true,
  });

  const { data: timelineData } = useGetCountsTimelineQuery({
    ...params,
    qfilter: `(src_ip:"${hostId}" OR dest_ip:"${hostId}") AND stamus_novel:true`,
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
