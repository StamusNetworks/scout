import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { DcerpcEvent } from '@/features/events/common/model/app-proto/dcerpc.schema';

export const relatedFlowColumns: CustomColumnDef<DcerpcEvent>[] = [
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
    id: 'request',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Request"
      />
    ),
    accessorFn: (row) => row.dcerpc.request,
  },
  {
    id: 'response',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Response"
      />
    ),
    accessorFn: (row) => row.dcerpc.response,
  },
  {
    id: 'opnum',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Opnum"
      />
    ),
    accessorFn: (row) => row.dcerpc.req?.opnum,
  },
  {
    id: 'uuid',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Uuid"
      />
    ),
    accessorFn: (row) => row.dcerpc.interfaces?.map((i) => i.uuid).join(', '),
  },
];
