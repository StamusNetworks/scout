import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { SipEvent } from '@/features/events/model/app-proto/sip.schema';

export const relatedFlowColumns: CustomColumnDef<SipEvent>[] = [
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
    id: 'version',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Version"
      />
    ),
    accessorFn: (row) => row.sip.version,
  },
  // {
  //   id: 'code',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader
  //       column={column}
  //       title="Code"
  //     />
  //   ),
  //   accessorFn: (row) => row.sip.code,
  // },
  {
    id: 'method',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Method"
      />
    ),
    accessorFn: (row) => row.sip.method,
  },
  {
    id: 'uri',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Uri"
      />
    ),
    accessorFn: (row) => row.sip.uri,
  },
];
