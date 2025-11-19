import { formatDuration, intervalToDuration } from 'date-fns';

import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';

import { DhcpEvent } from '../../../model/event-types/dhcp.schema';

export const relatedFlowColumns: CustomColumnDef<DhcpEvent>[] = [
  {
    id: 'expander',
    cell: ({ row }) => <DataTableRowExpander row={row} />,
  },
  {
    id: 'timestamp',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Timestamp"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.timestamp} />,
  },
  {
    id: 'client_mac',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Client MAC"
      />
    ),
    accessorFn: (row) => row.dhcp.client_mac,
  },
  {
    id: 'dhcp_type',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="DHCP Type"
      />
    ),
    accessorFn: (row) => row.dhcp.dhcp_type,
  },
  {
    id: 'dns_servers',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="DNS Servers"
      />
    ),
    accessorFn: (row) => row.dhcp.dns_servers?.map((ip) => ip).join(', '),
  },
  {
    id: 'hostname',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Hostname"
      />
    ),
    accessorFn: (row) => row.dhcp.hostname,
  },
  {
    id: 'client_ip',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Client IP"
      />
    ),
    accessorFn: (row) => row.dhcp.client_ip,
  },
  {
    id: 'lease_time',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Lease Time"
      />
    ),
    accessorFn: (row) =>
      !!row.dhcp.lease_time &&
      formatDuration(
        intervalToDuration({ start: 0, end: row.dhcp.lease_time }),
      ),
  },
];
