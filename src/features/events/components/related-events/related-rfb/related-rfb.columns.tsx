import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { RfbEvent } from '@/features/events/model/app-proto/rfb.schema';
import { DateTime } from '@/features/preferences';

export const relatedFlowColumns: CustomColumnDef<RfbEvent>[] = [
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
    id: 'client_protocol_version',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Client protocol version (major)"
      />
    ),
    accessorFn: (row) => row.rfb.client_protocol_version.major,
  },
  {
    id: 'server_protocol_version',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Server protocol version (major)"
      />
    ),
    accessorFn: (row) => row.rfb.server_protocol_version.major,
  },
  {
    id: 'security_type',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Security type"
      />
    ),
    accessorFn: (row) => row.rfb.authentication.security_type,
  },
  {
    id: 'server_security_failure_reason',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Server security failure reason"
      />
    ),
    accessorFn: (row) => row.rfb.server_security_failure_reason,
  },
];
