import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';

import { Scrollable } from '../../common/atoms/scrollable';
import type { Event } from '../../common/model/event.schema';

export const PAYLOAD_COLUMN: CustomColumnDef<Event> = {
  id: 'payload_printable',
  visible: false,
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Payload"
    />
  ),
  cell: ({ row }) =>
    row.original.payload_printable && (
      <Scrollable string={row.original.payload_printable} />
    ),
};
