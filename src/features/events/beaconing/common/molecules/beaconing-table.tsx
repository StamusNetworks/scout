import { Radar } from 'lucide-react';

import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableEmpty } from '@/common/design-system/molecules/data-table/data-table-empty';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { useServerTableState } from '@/common/design-system/molecules/data-table/hooks/use-server-table-state.ts';
import { SNI } from '@/common/design-system/molecules/sni';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { getDuration } from '@/common/lib/duration';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import { useGetBeaconingEventsQuery } from '../beaconing.api';
import { BeaconingEvent } from '../beaconing-event.model';

// Columns

export const beaconingTableColumns: CustomColumnDef<BeaconingEvent>[] = [
  {
    id: 'value',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Value"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key={
          row.original.beacon_report?.document_type === 'agg_serving_ip'
            ? 'ip'
            : 'tls.ja3s.hash'
        }
        value={row.original.beacon_report?.value}
      />
    ),
  },
  {
    id: 'beacon_report.first_seen',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="First Seen"
      />
    ),
    cell: ({ row }) => (
      <DateTime date={row.original.beacon_report?.first_seen} />
    ),
    meta: { viewLabel: 'First Seen' },
  },
  {
    id: 'beacon_report.last_seen',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last Seen"
      />
    ),
    cell: ({ row }) => (
      <DateTime date={row.original.beacon_report?.last_seen} />
    ),
    meta: { viewLabel: 'Last Seen' },
  },
  {
    id: 'duration',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Duration"
      />
    ),
    accessorFn: (row) =>
      getDuration(
        new Date(row.beacon_report?.first_seen),
        new Date(row.beacon_report?.last_seen),
        { precision: 3 },
      ),
    enableSorting: false,
  },
  {
    id: 'entities',
    accessorKey: 'entities',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Entities"
      />
    ),
    accessorFn: (row) => row.beacon_report?.assets?.length,
    enableSorting: false,
  },
  {
    id: 'SNI',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="SNI"
      />
    ),
    cell: ({ row }) => <SNI values={row.original.beacon_report?.tls_sni} />,
  },
  {
    id: 'beacon_report.beacon_metric',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Score"
      />
    ),
    accessorFn: (row) => Math.floor(row.beacon_report?.beacon_metric * 100),
    meta: { viewLabel: 'Score' },
  },
];

// Component

export const BeaconingTable = () => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { queryParams, pagination, setPagination, sorting, setSorting } =
    useServerTableState(params);
  const { data, isLoading } = useGetBeaconingEventsQuery({
    ...queryParams,
    qfilter: 'beacon_report.document_type:agg_serving_ip',
  });
  return (
    <DataTable
      data={data}
      isLoading={isLoading}
      columns={beaconingTableColumns}
      serverSide
      pagination={pagination}
      onPaginationChange={setPagination}
      sorting={sorting}
      onSortingChange={setSorting}
      Empty={
        <DataTableEmpty
          Icon={Radar}
          entity="beaconing ips"
        />
      }
    />
  );
};
