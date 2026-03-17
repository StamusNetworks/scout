import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import type { Event } from '../../common/model/event.schema';

export const LATERAL_COLUMN: CustomColumnDef<Event> = {
  id: 'lateral',
  visible: false,
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Lateral"
    />
  ),
  cell: ({ row }) => (
    <EventValue
      query_key="alert.lateral"
      value={row.original.alert?.lateral}
    />
  ),
};
