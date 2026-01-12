import { Badge } from '@/common/design-system/atoms/ui/badge';
import { ExportColumn } from '@/common/design-system/molecules/data-table/data-table';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { formatNumber } from '@/common/lib/numbers';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import { Signature } from '../../model/signature';

export const detectionMethodsColumns: CustomColumnDef<Signature>[] = [
  {
    id: 'sid-expanded',
    cell: ({ row }) => <DataTableRowExpander row={row} />,
    enableHiding: false,
  },
  {
    id: 'sid',
    accessorKey: 'sid',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Signature ID"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="alert.signature_id"
        value={row.original.sid}
      />
    ),
    meta: { viewLabel: 'Signature ID' },
  },
  {
    id: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Category"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="category.name"
        value={row.original.category?.name}
      />
    ),
  },
  {
    id: 'msg',
    accessorKey: 'msg',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Message"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="msg"
        value={row.original.msg}
      />
    ),
    meta: { viewLabel: 'Message' },
  },
  {
    id: 'created',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Created"
      />
    ),
    accessorFn: (row) => row.created,
  },
  {
    id: 'hits',
    accessorKey: 'hits',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Hits"
      />
    ),
    cell: ({ row }) =>
      row.original.hits >= 0 ? (
        <Badge variant="secondary">{formatNumber(row.original.hits)}</Badge>
      ) : null,
  },
  {
    id: 'hits_min',
    visible: false,
    enableHiding: false,
  },
];

export const exportColumns: ExportColumn<Signature>[] = [
  {
    label: 'Signature ID',
    value: ({ sid }) => sid?.toString(),
  },
  {
    label: 'Category',
    value: ({ category }) => category?.name,
  },
  {
    label: 'Message',
    value: ({ msg }) => msg,
  },
  {
    label: 'Created',
    value: ({ created }) => created,
  },
  {
    label: 'Hits',
    value: ({ hits }) => hits?.toString(),
  },
];
