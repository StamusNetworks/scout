import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';

import { FtpEvent } from '../../../model/app-proto/ftp.schema';

export const relatedFlowColumns: CustomColumnDef<FtpEvent>[] = [
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
    accessorFn: (row) => row.ftp.command,
  },
  {
    id: 'command data',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Command data"
      />
    ),
    accessorFn: (row) => row.ftp.command_data,
  },
  {
    id: 'reply',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Reply"
      />
    ),
    accessorFn: (row) => row.ftp.reply?.join(', '),
    cell: ({ row }) =>
      row.original.ftp?.reply?.map((str, i) => <div key={i}>{str}</div>),
  },
  {
    id: 'completion code',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Completion code"
      />
    ),
    accessorFn: (row) => row.ftp.completion_code?.join(', '),
    cell: ({ row }) =>
      row.original.ftp?.completion_code?.map((str, i) => (
        <div key={i}>{str}</div>
      )),
  },
];
