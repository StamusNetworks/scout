import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { FileinfoEvent } from '@/features/events/common/model/event-types/fileinfo.schema';
import { EventValue } from '@/features/filtering/filters/query-filters/use-cases/interactive-value/event-value';

export const relatedFileinfoColumns: CustomColumnDef<FileinfoEvent>[] = [
  {
    id: 'expander',
    cell: ({ row }) => <DataTableRowExpander row={row} />,
  },
  {
    id: 'timestamp',
    cell: ({ row }) => <DateTime date={row.original.timestamp} />,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Timestamp"
      />
    ),
  },
  {
    id: 'sha256',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Sha256"
      />
    ),
    accessorFn: (row) => row.fileinfo.sha256,
    cell: ({ row }) =>
      !!row.original.fileinfo.sha256 && (
        <EventValue
          query_key="files.sha256"
          value={row.original.fileinfo.sha256}
        />
      ),
  },
  {
    id: 'file type',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="File type"
      />
    ),
    accessorFn: (row) => row.fileinfo.mimetype || row.fileinfo.type,
  },
  {
    id: 'size',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Size"
      />
    ),
    accessorFn: (row) => row.fileinfo.size,
  },
  {
    id: 'filename',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Filename"
      />
    ),
    cell: ({ row }) =>
      !!row.original.fileinfo.filename && (
        <div className="text-xs break-all">
          {row.original.fileinfo.filename}
        </div>
      ),
  },
  {
    id: 'stored',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Stored"
      />
    ),
    accessorFn: (row) => (row.fileinfo.stored ? 'Yes' : 'No'),
  },
];
