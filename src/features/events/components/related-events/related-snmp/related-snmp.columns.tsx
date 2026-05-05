import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { SnmpEvent } from '@/features/events/model/app-proto/snmp.schema';

export const relatedFlowColumns: CustomColumnDef<SnmpEvent>[] = [
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
    id: 'community',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Community"
      />
    ),
    accessorFn: (row) => row.snmp.community,
  },
  {
    id: 'pdu_type',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Pdu type"
      />
    ),
    accessorFn: (row) => row.snmp.pdu_type,
  },
  {
    id: 'vars',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Vars"
      />
    ),
    accessorFn: (row) => row.snmp.vars?.join(', '),
  },
  {
    id: 'version',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Version"
      />
    ),
    accessorFn: (row) => row.snmp.version,
  },
];
