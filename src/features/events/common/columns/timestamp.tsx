import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';

import type { Event } from '../model/event.schema';

export const TIMESTAMP_COLUMN: CustomColumnDef<Event> = {
  id: 'timestamp',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Timestamp"
    />
  ),
  cell: ({ row }) => <DateTime date={row.original.timestamp} />,
};
