import { Country } from '@/common/design-system/atoms/flag';
import { Badge } from '@/common/design-system/atoms/ui/badge';
import { DateTime } from '@/common/design-system/entities/date-time';
import { ExportColumn } from '@/common/design-system/molecules/data-table/data-table';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { SNI } from '@/common/design-system/molecules/sni';
import { getDuration } from '@/common/lib/duration';
import { formatBeaconMetric } from '@/features/events/beaconing/common/utils/format-beacon-metric';
import { BeaconingEvent } from '@/features/events/model/beaconing-event';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';

export const servingIpsTableColumns: CustomColumnDef<BeaconingEvent>[] = [
  {
    id: 'value',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Destination"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="ip"
        value={row.original.beacon_report?.value}
      />
    ),
  },
  {
    id: 'geoip',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="GeoIP"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="geoip.country_name"
        value={row.original.beacon_report?.geoip_serving_ip?.ip_country}
      >
        <Country
          code={row.original.beacon_report?.geoip_serving_ip?.country_code}
          country={row.original.beacon_report?.geoip_serving_ip?.ip_country}
        />
      </EventValue>
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
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Entities"
      />
    ),
    cell: ({ row }) => row.original.beacon_report?.assets?.length,
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
    label: 'Destination',
    value: ({ beacon_report }) => beacon_report?.value,
  },
  {
    label: 'GeoIP',
    value: ({ beacon_report }) => beacon_report?.geoip_serving_ip?.ip_country,
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
    label: 'Entities',
    value: ({ beacon_report }) => beacon_report?.assets?.length.toString(),
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
