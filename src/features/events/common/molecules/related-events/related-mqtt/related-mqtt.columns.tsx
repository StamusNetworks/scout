import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { MqttEvent } from '@/features/events/common/model/app-proto/mqtt.schema';

export const relatedFlowColumns: CustomColumnDef<MqttEvent>[] = [
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
    id: 'topic',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Topic"
      />
    ),
    accessorFn: (row) => row.mqtt.publish?.topic,
  },
  {
    id: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Username"
      />
    ),
    accessorFn: (row) => (row.mqtt.connect?.flags?.username ? 'Yes' : 'No'),
  },
  {
    id: 'protocol string',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Protocol String"
      />
    ),
    accessorFn: (row) => row.mqtt.connect?.protocol_string,
  },
  {
    id: 'protocol version',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Protocol Version"
      />
    ),
    accessorFn: (row) => row.mqtt.connect?.protocol_version,
  },
];
