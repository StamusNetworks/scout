import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';

import { TftpEvent } from '../../../model/app-proto/tftp.schema';

export const relatedFlowColumns: CustomColumnDef<TftpEvent>[] = [
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
    id: 'file',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="File"
      />
    ),
    accessorFn: (row) => row.tftp.file,
  },
  {
    id: 'mode',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Mode"
      />
    ),
    accessorFn: (row) => row.tftp.mode,
  },
  {
    id: 'packet',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Packet"
      />
    ),
    accessorFn: (row) => row.tftp.packet,
  },
];
