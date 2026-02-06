import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { getDuration } from '@/common/lib/duration';

import { NetflowEvent } from '../../../model/app-proto/netflow.schema';

export const relatedFlowColumns: CustomColumnDef<NetflowEvent>[] = [
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
      row.original.netflow.start && (
        <DateTime date={row.original.netflow.start} />
      ),
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
      row.original.netflow.end && <DateTime date={row.original.netflow.end} />,
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
      if (!row.netflow.start || !row.netflow.end) return;
      const start = new Date(row.netflow.start);
      const end = new Date(row.netflow.end);
      return getDuration(start, end);
    },
  },
  {
    id: 'packets',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Packets"
      />
    ),
    accessorFn: (row) => row.netflow.pkts,
  },
  {
    id: 'bytes',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Bytes"
      />
    ),
    accessorFn: (row) => row.netflow.bytes,
  },
  {
    id: 'age',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Age"
      />
    ),
    accessorFn: (row) => row.netflow.age,
  },
];
