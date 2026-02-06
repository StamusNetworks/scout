import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';

import { FtpDataEvent } from '../../../model/app-proto/ftp_data.schema';

export const relatedFlowColumns: CustomColumnDef<FtpDataEvent>[] = [
  {
    id: 'expander',
    cell: ({ row }) => <DataTableRowExpander row={row} />,
  },
  {
    id: 'filename',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Filename"
      />
    ),
    accessorFn: (row) => row.ftp_data.filename,
  },
  {
    id: 'command',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Command"
      />
    ),
    accessorFn: (row) => row.ftp_data.command,
  },
];
