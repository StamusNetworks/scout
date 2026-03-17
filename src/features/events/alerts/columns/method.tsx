import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import type { Event } from '../../common/model/event.schema';

export const METHOD_COLUMN: CustomColumnDef<Event> = {
  id: 'method',
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Method"
    />
  ),
  cell: ({ row }) =>
    row.original.alert?.signature ? (
      <EventValue
        query_key="alert.signature"
        value={row.original.alert?.signature}
        className="line-clamp-2 max-w-112 min-w-80 whitespace-break-spaces"
      />
    ) : row.original.event_type === 'stamus' ? (
      row.original.stamus?.threat_name
    ) : null,
};
