import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/filtering/query-filters/components/event-value/event-value';

import { SshEvent } from '../../../model/app-proto/ssh.schema';

export const relatedFlowColumns: CustomColumnDef<SshEvent>[] = [
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
    id: 'server proto version',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Server proto version"
      />
    ),
    accessorFn: (row) => row.ssh.server?.proto_version,
    cell: ({ row }) => (
      <EventValue
        query_key="ssh.server.proto_version"
        value={row.original.ssh.server?.proto_version}
      />
    ),
  },
  {
    id: 'server software version',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Server software version"
      />
    ),
    accessorFn: (row) => row.ssh.server?.software_version,
    cell: ({ row }) => (
      <EventValue
        query_key="ssh.server.software_version"
        value={row.original.ssh.server?.software_version}
      />
    ),
  },
  {
    id: 'client proto version',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Client proto version"
      />
    ),
    accessorFn: (row) => row.ssh.client?.proto_version,
    cell: ({ row }) => (
      <EventValue
        query_key="ssh.client.proto_version"
        value={row.original.ssh.client?.proto_version}
      />
    ),
  },
  {
    id: 'client software version',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Client software version"
      />
    ),
    accessorFn: (row) => row.ssh.client?.software_version,
    cell: ({ row }) => (
      <EventValue
        query_key="ssh.client.software_version"
        value={row.original.ssh.client?.software_version}
      />
    ),
  },
];
