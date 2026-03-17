import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';

import type { Event } from '../model/event.schema';

export const EXPANDER_COLUMN: CustomColumnDef<Event> = {
  id: 'event-expanded',
  cell: ({ row }) => <DataTableRowExpander row={row} />,
  enableHiding: false,
  meta: {
    canReorder: false,
  },
};
