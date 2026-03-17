import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import type { Event } from '../model/event.schema';

export const PROTOCOL_COLUMN: CustomColumnDef<Event> = {
  id: 'protocol',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Proto"
    />
  ),
  cell: ({ row }) => (
    <EventValue
      query_key="app_proto"
      value={row.original.app_proto}
    />
  ),
};
