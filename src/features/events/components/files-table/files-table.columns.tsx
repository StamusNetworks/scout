import { Button } from '@/common/design-system/atoms/ui/button';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/query-filters/components/interactive-value/event-value';

import { EventFileInfo } from '../../model/event-types/fileinfo.schema';

export const getColumns = (
  isDownloading: boolean,
  onDownload: (file: EventFileInfo & { host: string }) => void,
): CustomColumnDef<EventFileInfo & { host: string }>[] => [
  {
    id: 'sha256',
    accessorKey: 'sha256',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="SHA256"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="files.sha256"
        value={row.original.sha256}
      />
    ),
  },
  {
    id: 'filename',
    accessorKey: 'filename',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Filename"
      />
    ),
    cell: ({ row }) => <div>{row.original.filename}</div>,
  },
  {
    id: 'mimetype',
    accessorKey: 'mimetype',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Mimetype"
      />
    ),
    cell: ({ row }) => <div>{row.original.mimetype}</div>,
  },
  {
    id: 'size',
    accessorKey: 'size',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Size"
      />
    ),
    cell: ({ row }) => <div>{row.original.size}</div>,
  },
  {
    id: 'download',
    accessorKey: 'download',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Download"
      />
    ),
    cell: ({ row }) => (
      <Button onClick={() => onDownload(row.original)}>
        {isDownloading ? 'Please wait...' : 'Download'}
      </Button>
    ),
  },
];
