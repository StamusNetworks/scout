import { useNavigate } from '@tanstack/react-router';
import type { SortingState, Updater } from '@tanstack/react-table';
import { Row as TableRow } from '@tanstack/react-table';
import { Binary, RotateCcw } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { serializeSorting } from '@/common/design-system/molecules/data-table/hooks/sorting-parser';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';
import { PaginationFooter } from '@/common/design-system/molecules/pagination-footer';
import { Table } from '@/common/design-system/molecules/table';
import { esEscape } from '@/common/lib/strings';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { ExpandedEventRow } from '@/features/events/components/expanded-event-row/expanded-event-row';
import {
  CATEGORY_COLUMN,
  EXPORT_COLUMNS,
  LATERAL_COLUMN,
  METHOD_COLUMN,
  OUTLIER_COLUMN,
  TAG_COLUMN,
} from '@/features/events/definitions/detection-event-columns';
import {
  DESTINATION_COLUMN,
  HOST_COLUMN,
  HOSTNAME_HOST_COLUMN,
  PROTOCOL_COLUMN,
  SOURCE_COLUMN,
  TIMESTAMP_COLUMN,
} from '@/features/events/definitions/event-columns';
import {
  HTTP_REQUEST_COLUMN,
  HTTP_RESPONSE_COLUMN,
  HTTP_URL_COLUMN,
  PAYLOAD_COLUMN,
  TLS_SNI_COLUMN,
} from '@/features/events/definitions/network-event-columns';
import type { Event } from '@/features/events/model/event';
import { ExportButton } from '@/features/preferences';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetEventsQuery } from '../../api/events.api';

// --- Props ---

interface DetectionEventsTableProps {
  page: number;
  pageSize: number;
  sorting: SortingState;
  hostId?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
}

// --- Columns ---

function useColumns(enterprise: boolean, hostId?: string) {
  return useMemo(
    () => [
      ...(hostId ? [] : [TAG_COLUMN]),
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
    [enterprise, hostId],
  );
}

// --- Export columns ---

const exportColumns = EXPORT_COLUMNS;

// --- Row ID ---

const getRowId = (originalRow: Event) => originalRow._id;

// --- Component ---

export function DetectionEventsTable({
  page,
  pageSize,
  sorting,
  hostId,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
}: DetectionEventsTableProps) {
  const { enterprise } = useFeatureFlags();
  const tanstackNavigate = useNavigate();

  // Global state from Redux: host-scoped tables only subscribe to tenant + dates
  const globals = useGlobalQueryParams(
    hostId
      ? ['tenant', 'dates']
      : ['tenant', 'dates', 'qfilter', 'qfilterHost'],
  );

  // Build query params for the API
  const hostQfilter = hostId
    ? `(src_ip:"${esEscape(hostId)}" OR dest_ip:"${esEscape(hostId)}")`
    : undefined;
  const ordering = serializeSorting(sorting);

  const queryParams = useMemo(
    () => ({
      ...globals,
      page,
      pageSize,
      ...(ordering !== undefined && { ordering }),
      ...(hostId
        ? {
            qfilter: hostQfilter,
            stamus: true,
            alert: true,
            discovery: true,
          }
        : {}),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      page,
      pageSize,
      ordering,
      hostQfilter,
      globals.tenant,
      globals.from,
      globals.to,
      ...(hostId ? [] : [globals.qfilter, globals.host_id_qfilter]),
    ],
  );

  // Fetch data
  const { data, isFetching } = useGetEventsQuery(queryParams);

  // Columns
  const columns = useColumns(enterprise, hostId);

  // Table preferences (column order/visibility persistence)
  const tableId = hostId ? 'hostDetectionEventsTable' : 'eventsPageTable';
  const {
    columnOrder,
    onColumnOrderChange,
    columnVisibility,
    onColumnVisibilityChange,
    canReset,
    onClickReset,
  } = useTablePreferences({ tableId, columns });

  // Row click navigates to event detail (only when not host-scoped)
  const onRowClick = useCallback(
    (row: TableRow<Event>) =>
      tanstackNavigate({
        to: `/detection-events/event?_id=${row.original._id}`,
      }),
    [tanstackNavigate],
  );

  const results = data?.results ?? [];
  const total = data?.count ?? 0;

  return (
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
        {...(!hostId && { onRowClick })}
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
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
