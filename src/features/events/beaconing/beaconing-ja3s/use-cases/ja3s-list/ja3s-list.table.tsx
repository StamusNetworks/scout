import { Badge } from '@/common/design-system/atoms/ui/badge';
import { DateTime } from '@/common/design-system/entities/date-time';
import { ExportColumn } from '@/common/design-system/molecules/data-table/data-table';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { SNI } from '@/common/design-system/molecules/sni';
import { getDuration } from '@/common/lib/duration';
import { BeaconingEvent } from '@/features/events/beaconing/common/beaconing-event.model';
import { formatBeaconMetric } from '@/features/events/beaconing/common/utils/format-beacon-metric';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';

export const tlsJ3ASTableColumns: CustomColumnDef<BeaconingEvent>[] = [
  {
    id: 'JA3S',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="JA3S"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="tls.ja3s.hash"
        value={row.original.beacon_report?.value}
      />
    ),
    enableSorting: false,
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
    id: 'destinations',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Destinations"
      />
    ),
    accessorFn: (row) => row.beacon_report?.serving_ip?.length,
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
    cell: ({ row }) => (
      <Badge variant="secondary">
        {formatBeaconMetric(row.original.beacon_report.beacon_metric)}
      </Badge>
    ),
    meta: { viewLabel: 'Score' },
  },
];

export const exportColumns: ExportColumn<BeaconingEvent>[] = [
  {
    label: 'JA3S',
    value: ({ beacon_report }) => beacon_report?.value,
  },
  {
    label: 'First Seen',
    value: ({ beacon_report }) => beacon_report?.first_seen,
  },
  {
    label: 'Last Seen',
    value: ({ beacon_report }) => beacon_report?.last_seen,
  },
  {
    label: 'Duration',
    value: ({ beacon_report }) =>
      getDuration(
        new Date(beacon_report?.first_seen),
        new Date(beacon_report?.last_seen),
        { precision: 3 },
      ),
  },
  {
    label: 'Destinations',
    value: ({ beacon_report }) => beacon_report?.serving_ip?.length.toString(),
  },
  {
    label: 'SNI',
    value: ({ beacon_report }) => beacon_report?.tls_sni.join(', '),
  },
  {
    label: 'Score',
    value: ({ beacon_report }) =>
      beacon_report?.beacon_metric
        ? formatBeaconMetric(beacon_report.beacon_metric).toString()
        : 'N/A',
  },
];
