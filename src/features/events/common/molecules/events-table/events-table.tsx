import { useNavigate } from '@tanstack/react-router';
import { Row } from '@tanstack/react-table';
import { Binary } from 'lucide-react';
import { useMemo } from 'react';

import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty.tsx';
import { DataTable } from '@/common/design-system/molecules/data-table/data-table.tsx';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';
import { useFeatureFlags } from '@/common/lib/use-feature-flags.ts';
import { useGetEventsQuery } from '@/features/events/common/events.api';
import { Event } from '@/features/events/common/events.model';
import { ExpandedEventRow } from '@/features/events/common/molecules/expanded-event-row';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

import { exportColumns, getColumns } from './events.columns';

const getRowId = (originalRow: Event) => originalRow._id;

export const EventsTable = () => {
  const { enterprise } = useFeatureFlags();
  const columns = useMemo(() => getColumns(enterprise), [enterprise]);
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
  const navigate = useNavigate();
  const params = useGlobalQueryParams([
    'tenant',
    'qfilter',
    'dates',
    'qfilterHost',
  ]);
  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState(params);

  const { data, isFetching } = useGetEventsQuery(queryParams);

  const onRowClick = (row: Row<Event>) =>
    navigate({ to: `/detection-events/event?_id=${row.original._id}` });

  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={columns}
      serverSide
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      ExpandedRow={ExpandedEventRow}
      getRowId={getRowId}
      onRowClick={onRowClick}
      exportColumns={exportColumns}
      columnOrder={columnOrder}
      onColumnOrderChange={onColumnOrderChange}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      canReset={canReset}
      onClickReset={onClickReset}
      Empty={
        <DataTableEmpty
          Icon={Binary}
          entity="events"
        />
      }
    />
  );
};
