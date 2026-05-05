import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { DnsEvent } from '@/features/events/common/model/app-proto/dns.schema';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';

export const relatedFlowColumns: CustomColumnDef<DnsEvent>[] = [
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
    id: 'proto',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Protocol"
      />
    ),
    accessorFn: (row) => row.proto,
    cell: ({ row }) => (
      <EventValue
        query_key="proto"
        value={row.original.proto}
      />
    ),
  },
  {
    id: 'rrname',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Rrname"
      />
    ),
    accessorFn: (row) => row.dns.rrname,
  },
  {
    id: 'rrtype',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Rrtype"
      />
    ),
    accessorFn: (row) => row.dns.rrtype,
  },
  {
    id: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Type"
      />
    ),
    accessorFn: (row) => row.dns.type,
  },
];
