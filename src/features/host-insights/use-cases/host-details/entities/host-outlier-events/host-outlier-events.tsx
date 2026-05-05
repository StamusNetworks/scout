import type { SortingState, Updater } from '@tanstack/react-table';
import { Binary } from 'lucide-react';
import { useMemo } from 'react';

import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { esEscape } from '@/common/lib/strings';
import { useGetEventsQuery } from '@/features/events/common/events.api';
import type { Event } from '@/features/events/common/events.model';
import {
  DESTINATION_COLUMN,
  HOST_COLUMN,
  PROTOCOL_COLUMN,
  SOURCE_COLUMN,
  TIMESTAMP_COLUMN,
} from '@/features/events/common/events.table';
import { ExpandedEventRow } from '@/features/events/common/molecules/expanded-event-row';
import { useGetCountsTimelineQuery } from '@/features/events/counts-timeline/counts-timeline.api';
import {
  CATEGORY_COLUMN,
  LATERAL_COLUMN,
  METHOD_COLUMN,
  OUTLIER_COLUMN,
} from '@/features/events/detection-events/detection-events.table';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

const outlierColumns = [
  TIMESTAMP_COLUMN,
  METHOD_COLUMN,
  SOURCE_COLUMN,
  DESTINATION_COLUMN,
  PROTOCOL_COLUMN,
  HOST_COLUMN,
  CATEGORY_COLUMN,
  LATERAL_COLUMN,
  OUTLIER_COLUMN,
];

const getRowId = (row: Event) => row._id;

interface HostOutlierEventsProps {
  hostId: string;
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
}

export function HostOutlierEvents({
  hostId,
  page,
  pageSize,
  sorting,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
}: HostOutlierEventsProps) {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const ordering = serializeSorting(sorting);

  const qfilter = `(src_ip:"${esEscape(hostId ?? '')}" OR dest_ip:"${esEscape(hostId ?? '')}") AND stamus_novel:true`;

  const queryParams = useMemo(
    () => ({
      ...params,
      qfilter,
      stamus: true,
      alert: true,
      discovery: true,
      pageIndex: page - 1,
      pageSize,
      ordering,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      hostId,
      params.tenant,
      params.start_date,
      params.end_date,
      page,
      pageSize,
      ordering,
    ],
  );

  const { data, isFetching } = useGetEventsQuery(queryParams);

  const { data: timelineData } = useGetCountsTimelineQuery({
    ...params,
    qfilter,
    target: 'true',
    alert: true,
    discovery: true,
    stamus: true,
  });

  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <div className="space-y-2">
      {timelineData && (
        <BarChartTimeline
          data={timelineData}
          className="mb-2 h-32"
        />
      )}

      <Table
        data={results}
        columns={outlierColumns}
        isLoading={isFetching}
        sorting={sorting}
        onSortingChange={onSortingChange}
        ExpandedRow={ExpandedEventRow}
        getRowId={getRowId}
        Empty={
          <DataTableEmpty
            Icon={Binary}
            entity="outlier events"
          />
        }
      />

      {total > 0 && (
        <PaginationFooter
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
