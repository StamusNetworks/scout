import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { NfsEvent } from '@/features/events/model/app-proto/nfs.schema';
import { DateTime } from '@/features/preferences';

export const relatedFlowColumns: CustomColumnDef<NfsEvent>[] = [
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
    id: 'filename',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Filename"
      />
    ),
    accessorFn: (row) => row.nfs.filename,
  },
  {
    id: 'procedure',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Procedure"
      />
    ),
    accessorFn: (row) => row.nfs.procedure,
  },
  {
    id: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Type"
      />
    ),
    accessorFn: (row) => row.nfs.type,
  },
  {
    id: 'version',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Version"
      />
    ),
    accessorFn: (row) => row.nfs.version,
  },
];
