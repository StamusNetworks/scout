import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { SmbEvent } from '@/features/events/model/app-proto/smb.schema';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';

export const relatedFlowColumns: CustomColumnDef<SmbEvent>[] = [
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
    id: 'command',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Command"
      />
    ),
    accessorFn: (row) => row.smb.command,
    cell: ({ row }) => (
      <EventValue
        query_key="smb.command"
        value={row.original.smb.command}
      />
    ),
  },
  {
    id: 'severity',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Severity"
      />
    ),
    accessorFn: (row) => row.smb.ext_status?.severity,
  },
  {
    id: 'interface',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Interface"
      />
    ),
    accessorFn: (row) =>
      row.smb.dcerpc?.interfaces?.[0]?.name || row.smb.dcerpc?.interface?.name,
    cell: ({ row }) =>
      row.original.smb.dcerpc?.interfaces?.[0]?.name ? (
        <EventValue
          query_key="smb.dcerpc.interfaces.name"
          value={row.original.smb.dcerpc.interfaces[0].name}
        />
      ) : row.original.smb.dcerpc?.interface?.name ? (
        <EventValue
          query_key="smb.dcerpc.interface.name"
          value={row.original.smb.dcerpc.interface.name}
        />
      ) : null,
  },
  {
    id: 'dcerpc_endpoint',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="DCERPC Endpoint"
      />
    ),
    accessorFn: (row) => row.smb.dcerpc?.endpoint,
  },
  {
    id: 'uuid',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="UUID"
      />
    ),
    accessorFn: (row) =>
      row.smb.dcerpc?.interfaces?.[0]?.uuid || row.smb.dcerpc?.interface?.uuid,
  },
  {
    id: 'opnum',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Opnum"
      />
    ),
    accessorFn: (row) => row.smb.dcerpc?.opnum,
  },
  {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Status"
      />
    ),
    accessorFn: (row) => row.smb.status,
    cell: ({ row }) => (
      <EventValue
        query_key="smb.status"
        value={row.original.smb.status}
      />
    ),
  },
  {
    id: 'share',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Share"
      />
    ),
    accessorFn: (row) => row.smb.share,
    cell: ({ row }) => (
      <EventValue
        query_key="smb.share"
        value={row.original.smb.share}
      />
    ),
  },
  {
    id: 'filename',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Filename"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="smb.filename"
        value={row.original.smb.filename}
      />
    ),
  },
  {
    id: 'host',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Host"
      />
    ),
    accessorFn: (row) => row.smb.ntlmssp?.host,
  },
  {
    id: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="User"
      />
    ),
    accessorFn: (row) => row.smb.ntlmssp?.user,
  },
];
