import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { SNI } from '@/common/design-system/molecules/sni';
import { getDuration } from '@/common/lib/duration';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import { BeaconingEvent } from '../../models/beaconing-event.model';

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
