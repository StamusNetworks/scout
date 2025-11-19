import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { getDuration } from '@/common/lib/duration';

import { FlowEvent } from '../../../model/event-types/flow.schema';

export const relatedFlowColumns: CustomColumnDef<FlowEvent>[] = [
  {
    id: 'expander',
    cell: ({ row }) => <DataTableRowExpander row={row} />,
  },
  {
    id: 'start',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Start"
      />
    ),
    cell: ({ row }) =>
      row.original.flow.start && <DateTime date={row.original.flow.start} />,
  },
  {
    id: 'end',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="End"
      />
    ),
    cell: ({ row }) =>
      row.original.flow.end && <DateTime date={row.original.flow.end} />,
  },
  {
    id: 'duration',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Duration"
      />
    ),
    accessorFn: (row) => {
      if (!row.flow.start || !row.flow.end) return;
      const start = new Date(row.flow.start);
      const end = new Date(row.flow.end);
      return getDuration(start, end);
    },
  },
  {
    id: 'bytes_toserver',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Bytes to server"
      />
    ),
    accessorFn: (row) => row.flow.bytes_toserver,
  },
  {
    id: 'bytes_toclient',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Bytes to client"
      />
    ),
    accessorFn: (row) => row.flow.bytes_toclient,
  },
  {
    id: 'pkts_toserver',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Pkts to server"
      />
    ),
    accessorFn: (row) => row.flow.pkts_toserver,
  },
  {
    id: 'pkts_toclient',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Pkts to client"
      />
    ),
    accessorFn: (row) => row.flow.pkts_toclient,
  },
];
