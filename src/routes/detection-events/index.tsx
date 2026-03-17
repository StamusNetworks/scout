import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Row as TableRow } from '@tanstack/react-table';
import { Binary, RotateCcw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { usePaginatedSearch } from '@/common/design-system/molecules/data-table/hooks/use-paginated-search';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';
import { ExportButton } from '@/common/design-system/molecules/export-button';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { usePageTitle } from '@/common/lib/use-page-title';
import {
  CATEGORY_COLUMN,
  LATERAL_COLUMN,
  METHOD_COLUMN,
  OUTLIER_COLUMN,
  TAG_COLUMN,
} from '@/features/events/alerts/columns';
import { useGetEventsQuery } from '@/features/events/common/api/events.api';
import {
  DESTINATION_COLUMN,
  EXPANDER_COLUMN,
  HOST_COLUMN,
  HOSTNAME_HOST_COLUMN,
  PROTOCOL_COLUMN,
  SOURCE_COLUMN,
  TIMESTAMP_COLUMN,
} from '@/features/events/common/columns';
import type { Event } from '@/features/events/common/model/event.schema';
import {
  HTTP_REQUEST_COLUMN,
  HTTP_RESPONSE_COLUMN,
  HTTP_URL_COLUMN,
  PAYLOAD_COLUMN,
  TLS_SNI_COLUMN,
} from '@/features/events/protocol/columns';
import { EventsCounter } from '@/features/hunt/dashboard/components/events-counter';
import { ExpandedEventRow } from '@/features/hunt/events/components/events-table/events.expanded-row';
import { useTimeline } from '@/features/hunt/timeline/api/hooks/useTimeline';

const searchSchema = z.object({
  page: z.number().default(1),
  page_size: z.number().default(10),
  sort: z.string().default('-timestamp'),
});

export const Route = createFileRoute('/detection-events/')({
  validateSearch: searchSchema,
  component: () => (
    <PageBoundary key="events">
      <DetectionEventsPage />
    </PageBoundary>
  ),
});

// --- Export columns for CSV ---

const exportColumns: { label: string; value: (event: Event) => string }[] = [
  {
    label: 'Timestamp',
    value: (event) => event.timestamp,
  },
  {
    label: 'Method',
    value: (event) =>
      event.alert?.signature ||
      (event.event_type === 'stamus' && event.stamus?.threat_name) ||
      '',
  },
  {
    label: 'Source IP',
    value: (event) => event.src_ip || event.flow?.src_ip || '',
  },
  {
    label: 'Destination IP',
    value: (event) => event.dest_ip || event.flow?.dest_ip || '',
  },
  {
    label: 'Proto',
    value: (event) => event.app_proto || '',
  },
  {
    label: 'Probe',
    value: (event) => event.host || '',
  },
  {
    label: 'Category',
    value: (event) => event.alert?.category || '',
  },
];

// --- Build columns ---

function useColumns(enterprise: boolean) {
  return useMemo(
    () => [
      EXPANDER_COLUMN,
      TAG_COLUMN,
      TIMESTAMP_COLUMN,
      METHOD_COLUMN,
      SOURCE_COLUMN,
      DESTINATION_COLUMN,
      PROTOCOL_COLUMN,
      HOST_COLUMN,
      CATEGORY_COLUMN,
      ...(enterprise ? [HOSTNAME_HOST_COLUMN] : []),
      LATERAL_COLUMN,
      TLS_SNI_COLUMN,
      HTTP_URL_COLUMN,
      PAYLOAD_COLUMN,
      HTTP_REQUEST_COLUMN,
      HTTP_RESPONSE_COLUMN,
      OUTLIER_COLUMN,
    ],
    [enterprise],
  );
}

// --- Row ID ---

const getRowId = (originalRow: Event) => originalRow._id;

// --- Timeline widget ---

function EventsCountTimeline() {
  const { enterprise } = useFeatureFlags();
  const [chartTarget, setChartTarget] = useState<boolean>(true);
  const compChartTarget = enterprise ? chartTarget : false;

  const { data } = useTimeline(compChartTarget);

  return (
    <Column>
      {enterprise && (
        <Row className="mb-2 justify-end">
          <Tabs value={compChartTarget.toString()}>
            <TabsList>
              <TabsTrigger
                value="true"
                onClick={() => setChartTarget(true)}
              >
                Tags
              </TabsTrigger>
              <TabsTrigger
                value="false"
                onClick={() => setChartTarget(false)}
              >
                Probes
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Row>
      )}
      {!data ? null : (
        <BarChartTimeline
          data={data}
          className="h-[250px]"
        />
      )}
    </Column>
  );
}

// --- Main page component ---

function DetectionEventsPage() {
  usePageTitle('Events');

  const { enterprise } = useFeatureFlags();
  const navigate = useNavigate();

  // Global state from Redux
  const globals = useGlobalQueryParams([
    'tenant',
    'dates',
    'qfilter',
    'qfilterHost',
  ]);

  // Page-level state from URL search params
  const { page, pageSize, sorting, setPage, setPageSize, onSortingChange } =
    usePaginatedSearch(Route, {
      resetOn: [
        globals.tenant,
        globals.start_date,
        globals.end_date,
        globals.qfilter,
        globals.host_id_qfilter,
      ],
    });

  // Build query params for the API
  const ordering = serializeSorting(sorting);
  const queryParams = useMemo(
    () => ({
      ...globals,
      pageIndex: page - 1,
      pageSize,
      ...(ordering !== undefined && { ordering }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      page,
      pageSize,
      ordering,
      globals.tenant,
      globals.start_date,
      globals.end_date,
      globals.qfilter,
      globals.host_id_qfilter,
    ],
  );

  // Fetch data
  const { data, isFetching } = useGetEventsQuery(queryParams);

  // Columns
  const columns = useColumns(enterprise);

  // Table preferences (column order/visibility persistence)
  const {
    columnOrder,
    onColumnOrderChange,
    columnVisibility,
    onColumnVisibilityChange,
    canReset,
    onClickReset,
  } = useTablePreferences({
    tableId: 'eventsPageTable',
    columns,
  });

  // Row click navigates to event detail
  const onRowClick = useCallback(
    (row: TableRow<Event>) =>
      navigate({ to: `/detection-events/event?_id=${row.original._id}` }),
    [navigate],
  );

  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
    <DefaultPage
      title="Events"
      description="Monitor, explore, and analyze your organization's security events in real time. Gain actionable insight and accelerate investigations by exploring the detailed events data."
    >
      <Grid className="grid-cols-[1fr_300px] items-center gap-4">
        <EventsCountTimeline />
        <EventsCounter />
      </Grid>

      <div className="space-y-2">
        <Row className="items-center justify-end gap-2">
          <ExportButton
            data={results.map((row) =>
              exportColumns.map((col) => col.value(row)),
            )}
            headers={exportColumns.map((col) => col.label)}
            className="h-8"
          />
          {canReset && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden h-8 border-dashed lg:flex"
              onClick={onClickReset}
              aria-label="Reset table view"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </Row>

        <Table
          data={results}
          columns={columns}
          isLoading={isFetching}
          sorting={sorting}
          onSortingChange={onSortingChange}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
          columnOrder={columnOrder}
          onColumnOrderChange={onColumnOrderChange}
          ExpandedRow={ExpandedEventRow}
          getRowId={getRowId}
          onRowClick={onRowClick}
          Empty={
            <DataTableEmpty
              Icon={Binary}
              entity="events"
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
    </DefaultPage>
  );
}
