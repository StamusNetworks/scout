import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { formatBytes } from '@/common/lib/numbers';
import { Event } from '@/features/events';
import { DateTime } from '@/features/preferences';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';

export const hostFilesTableColumns: CustomColumnDef<Event>[] = [
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
    id: 'filename',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Filename"
      />
    ),
    accessorFn: (row) => row.fileinfo?.filename,
    cell: ({ row }) =>
      !!row.original.fileinfo?.filename && (
        <EventValue
          query_key="fileinfo.filename"
          value={row.original.fileinfo.filename}
          className="max-w-80 break-all whitespace-normal"
        />
      ),
  },
  {
    id: 'sha256',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="SHA256"
      />
    ),
    accessorFn: (row) => row.fileinfo?.sha256,
    cell: ({ row }) => {
      const sha = row.original.fileinfo?.sha256;
      if (!sha) return null;
      const mid = Math.ceil(sha.length / 2);
      return (
        <EventValue
          query_key="fileinfo.sha256"
          value={sha}
          className="font-mono whitespace-pre"
        >
          {`${sha.slice(0, mid)}\n${sha.slice(mid)}`}
        </EventValue>
      );
    },
  },
  {
    id: 'mimetype',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Mimetype"
      />
    ),
    accessorFn: (row) => row.fileinfo?.mimetype ?? row.fileinfo?.type,
  },
  {
    id: 'size',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Size"
      />
    ),
    accessorFn: (row) =>
      typeof row.fileinfo?.size === 'number'
        ? formatBytes(row.fileinfo.size)
        : '',
  },
  {
    id: 'chunk',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Chunk"
      />
    ),
    accessorFn: (row) => row.http?.content_range?.raw ?? '',
  },
];
