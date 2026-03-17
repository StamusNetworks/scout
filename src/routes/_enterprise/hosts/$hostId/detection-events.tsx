import {
  createFileRoute,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { Binary } from 'lucide-react';
import { useMemo } from 'react';
import { z } from 'zod';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { usePaginatedSearch } from '@/common/design-system/molecules/data-table/hooks/use-paginated-search';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { esEscape } from '@/common/lib/strings';
import { useGetEventsQuery } from '@/features/events/common/events.api';
import type { Event } from '@/features/events/common/events.model';
import {
  DESTINATION_COLUMN,
  EXPANDER_COLUMN,
  HOST_COLUMN,
  HOSTNAME_HOST_COLUMN,
  PROTOCOL_COLUMN,
  SOURCE_COLUMN,
  TIMESTAMP_COLUMN,
} from '@/features/events/common/events.table';
import {
  CATEGORY_COLUMN,
  LATERAL_COLUMN,
  METHOD_COLUMN,
  OUTLIER_COLUMN,
} from '@/features/events/detection-events/detection-events.table';
import {
  HTTP_REQUEST_COLUMN,
  HTTP_RESPONSE_COLUMN,
  HTTP_URL_COLUMN,
  PAYLOAD_COLUMN,
  TLS_SNI_COLUMN,
} from '@/features/events/network-events/network-events.table';
import { ExpandedEventRow } from '@/features/hunt/events/components/events-table/events.expanded-row';
import { useGetCountsTimelineQuery } from '@/features/hunt/timeline/api/timeline.api';

// --- Search schema ---

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-timestamp'),
});

export const Route = createFileRoute(
  '/_enterprise/hosts/$hostId/detection-events',
)({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary key="host-detection-events">
      <HostDetectionEventsTab />
    </PageBoundary>
  ),
});

// --- Build columns (all except TAG) ---

const COLUMNS = [
  EXPANDER_COLUMN,
  TIMESTAMP_COLUMN,
  METHOD_COLUMN,
  SOURCE_COLUMN,
  DESTINATION_COLUMN,
  PROTOCOL_COLUMN,
  HOST_COLUMN,
  CATEGORY_COLUMN,
  HOSTNAME_HOST_COLUMN,
  LATERAL_COLUMN,
  TLS_SNI_COLUMN,
  HTTP_URL_COLUMN,
  PAYLOAD_COLUMN,
  HTTP_REQUEST_COLUMN,
  HTTP_RESPONSE_COLUMN,
  OUTLIER_COLUMN,
];

// --- Row ID ---

const getRowId = (originalRow: Event) => originalRow._id;

// --- Tab component ---

function HostDetectionEventsTab() {
  const { hostId } = useParams({ strict: false }) as { hostId: string };

  // Global state from Redux
  const globals = useGlobalQueryParams(['tenant', 'dates']);

  const search = Route.useSearch();
  const tanstackNavigate = useNavigate();
  const navigate = (opts: {
    search: (prev: Record<string, unknown>) => Record<string, unknown>;
    replace?: boolean;
  }) => tanstackNavigate(opts as Parameters<typeof tanstackNavigate>[0]);

  // Page-level state from URL search params
  const { page, pageSize, sorting, setPage, setPageSize, onSortingChange } =
    usePaginatedSearch(
      { search, navigate },
      {
        resetOn: [globals.tenant, globals.start_date, globals.end_date],
      },
    );

  // Build query params for the API
  const hostQfilter = `(src_ip:"${esEscape(hostId ?? '')}" OR dest_ip:"${esEscape(hostId ?? '')}")`;
  const ordering = serializeSorting(sorting);
  const queryParams = useMemo(
    () => ({
      ...globals,
      pageIndex: page - 1,
      pageSize,
      ...(ordering !== undefined && { ordering }),
      qfilter: hostQfilter,
      stamus: true,
      alert: true,
      discovery: true,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      page,
      pageSize,
      ordering,
      hostQfilter,
      globals.tenant,
      globals.start_date,
      globals.end_date,
    ],
  );

  // Fetch events
  const { data, isFetching } = useGetEventsQuery(queryParams);

  // Fetch timeline
  const { data: timelineData } = useGetCountsTimelineQuery({
    ...globals,
    qfilter: hostQfilter,
    target: 'true',
    alert: true,
    discovery: true,
    stamus: true,
  });

  // Table preferences (column order/visibility persistence)
  const {
    columnOrder,
    onColumnOrderChange,
    columnVisibility,
    onColumnVisibilityChange,
  } = useTablePreferences({
    tableId: 'hostDetectionEventsTable',
    columns: COLUMNS,
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
        columns={COLUMNS}
        isLoading={isFetching}
        sorting={sorting}
        onSortingChange={onSortingChange}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        columnOrder={columnOrder}
        onColumnOrderChange={onColumnOrderChange}
        ExpandedRow={ExpandedEventRow}
        getRowId={getRowId}
        Empty={
          <DataTableEmpty
            Icon={Binary}
            entity="detection events"
          />
        }
      />

      {total > 0 && (
        <PaginationFooter
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
