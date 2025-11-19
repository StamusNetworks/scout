import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import { Krb5Event } from '../../../model/event-types/krb5.schema';

export const relatedFlowColumns: CustomColumnDef<Krb5Event>[] = [
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
    id: 'src ip',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Source IP"
      />
    ),
    accessorFn: (row) => row.src_ip,
    cell: ({ row }) => (
      <EventValue
        query_key="src_ip"
        value={row.original.src_ip}
      />
    ),
  },
  {
    id: 'src port',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Source Port"
      />
    ),
    accessorFn: (row) => row.src_port,
    cell: ({ row }) => (
      <EventValue
        query_key="src_port"
        value={row.original.src_port}
      />
    ),
  },
  {
    id: 'dest ip',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Destination IP"
      />
    ),
    accessorFn: (row) => row.dest_ip,
    cell: ({ row }) => (
      <EventValue
        query_key="dest_ip"
        value={row.original.dest_ip}
      />
    ),
  },
  {
    id: 'dest port',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Destination Port"
      />
    ),
    accessorFn: (row) => row.dest_port,
    cell: ({ row }) => (
      <EventValue
        query_key="dest_port"
        value={row.original.dest_port}
      />
    ),
  },
  {
    id: 'cname',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="CName"
      />
    ),
    accessorFn: (row) => row.krb5.cname.replace(/^<|>$/g, ''),
  },
  {
    id: 'msg type',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Message Type"
      />
    ),
    accessorFn: (row) => row.krb5.msg_type,
  },
  {
    id: 'realm',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Realm"
      />
    ),
    accessorFn: (row) => row.krb5.realm.replace(/^<|>$/g, ''),
  },
  {
    id: 'sname',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="SName"
      />
    ),
    accessorFn: (row) => row.krb5.sname,
  },
  {
    id: 'weak encryption',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Weak Encryption"
      />
    ),
    accessorFn: (row) => (row.krb5.weak_encryption ? 'Yes' : 'No'),
  },
];
