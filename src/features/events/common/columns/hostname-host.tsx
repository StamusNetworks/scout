import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import type { Event } from '../model/event.schema';

export const HOSTNAME_HOST_COLUMN: CustomColumnDef<Event> = {
  id: 'hostname_host',
  visible: false,
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Hostname host"
    />
  ),
  cell: ({ row }) => (
    <EventValue
      query_key="hostname_info.host"
      value={row.original.hostname_info?.host}
    />
  ),
};
