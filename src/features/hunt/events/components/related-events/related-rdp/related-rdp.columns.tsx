import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';

import { RdpEvent } from '../../../model/app-proto/rdp.schema';

export const relatedFlowColumns: CustomColumnDef<RdpEvent>[] = [
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
    id: 'client_version',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Client version"
      />
    ),
    accessorFn: (row) => row.rdp.client?.version,
  },
  {
    id: 'client_keyboard_layout',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Client keyboard layout"
      />
    ),
    accessorFn: (row) => row.rdp.client?.keyboard_layout,
  },
  {
    id: 'client_name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Client name"
      />
    ),
    accessorFn: (row) => row.rdp.client?.client_name,
  },
];
