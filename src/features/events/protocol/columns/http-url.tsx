import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import type { Event } from '../../common/model/event.schema';

export const HTTP_URL_COLUMN: CustomColumnDef<Event> = {
  id: 'http_url',
  visible: false,
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="HTTP URL"
    />
  ),
  cell: ({ row }) =>
    row.original.app_proto === 'http' && (
      <EventValue
        query_key="http.url"
        value={row.original.http?.url}
      />
    ),
};
