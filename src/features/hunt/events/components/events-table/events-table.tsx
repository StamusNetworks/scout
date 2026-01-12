import { Row } from '@tanstack/react-table';
import { Binary } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty.tsx';
import { DataTable } from '@/common/design-system/molecules/data-table/data-table.tsx';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination.ts';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting.ts';
import { useTablePreferences } from '@/common/design-system/molecules/data-table/hooks/use-table-preferences';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams.tsx';
import { routes } from '@/pages/routes.config.ts';

import { useGetEventsQuery } from '../../api/events.api';
import { Event } from '../../model/event.schema';
import { columns, exportColumns } from './events.columns';
import { ExpandedEventRow } from './events.expanded-row.tsx';

const getRowId = (originalRow: Event) => originalRow._id;

export const EventsTable = () => {
  const {
    columnOrder,
    onColumnOrderChange,
    columnVisibility,
    onColumnVisibilityChange,
  } = useTablePreferences({
    tableId: 'eventsPageTable',
    columns,
  });
  const navigate = useNavigate();
  const [pagination, setPagination] = usePaginationUrlState();
  const [sorting, setSorting, ordering] = useSortingUrlState();
  const params = useGlobalQueryParams([
    'tenant',
    'qfilter',
    'dates',
    'qfilterHost',
  ]);

  const { data, isFetching } = useGetEventsQuery({
    ...params,
    ...pagination,
    ordering,
  });

  const onRowClick = (row: Row<Event>) =>
    navigate(`${routes.event}?_id=${row.original._id}`);

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
      Empty={
        <Empty>
          <EmptyMedia variant="icon">
            <Binary />
          </EmptyMedia>
          <EmptyContent>
            <EmptyHeader>No events found</EmptyHeader>
            <EmptyDescription>
              Either there is no data or the filters are too restrictive.
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      }
    />
  );
};
