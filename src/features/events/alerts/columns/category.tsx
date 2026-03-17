import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import type { Event } from '../../common/model/event.schema';

export const CATEGORY_COLUMN: CustomColumnDef<Event> = {
  id: 'category',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Category"
    />
  ),
  cell: ({ row }) => (
    <div className="max-w-48">
      <EventValue
        query_key="alert.category"
        value={row.original.alert?.category}
      />
    </div>
  ),
};
