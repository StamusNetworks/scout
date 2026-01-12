import { format } from 'date-fns';

import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';

import { OperationRecord } from '../../model/operation-record.schema';

export const columns: CustomColumnDef<OperationRecord>[] = [
  {
    id: 'expander',
    cell: ({ row }) =>
      row.original.comment && <DataTableRowExpander row={row} />,
  },
  {
    id: 'title',
    accessorKey: 'title',
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Title"
      />
    ),
  },
  {
    id: 'description',
    accessorKey: 'description',
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Description"
      />
    ),
  },
  {
    id: 'date',
    accessorKey: 'date',
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Date"
      />
    ),
    accessorFn: (row) => format(new Date(row.date), 'yyyy-MM-dd HH:mm:ss'),
  },
  {
    id: 'username',
    accessorKey: 'username',
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="User"
      />
    ),
  },
];
