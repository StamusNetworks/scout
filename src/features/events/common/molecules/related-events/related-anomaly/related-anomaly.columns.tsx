import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { Anomaly } from '@/features/events/common/model/event-types/anomaly.schema';
import { EventValue } from '@/features/filtering/query-filters/components/event-value/event-value';

export const relatedFlowColumns: CustomColumnDef<Anomaly>[] = [
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
    id: 'proto',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Protocol"
      />
    ),
    accessorFn: (row) => row.proto,
    cell: ({ row }) => (
      <EventValue
        query_key="proto"
        value={row.original.proto}
      />
    ),
  },
  {
    id: 'event',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Event"
      />
    ),
    accessorFn: (row) => row.anomaly.event,
  },
];
