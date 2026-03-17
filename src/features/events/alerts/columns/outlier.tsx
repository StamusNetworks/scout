import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import type { Event } from '../../common/model/event.schema';

export const OUTLIER_COLUMN: CustomColumnDef<Event> = {
  id: 'outlier',
  visible: false,
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Outlier"
    />
  ),
  cell: ({ row }) => (
    <EventValue
      query_key="stamus_novel"
      value={(!!row.original.stamus_novel).toString()}
    />
  ),
};
