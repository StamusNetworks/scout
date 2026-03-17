import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import type { Event } from '../../common/model/event.schema';

export const TLS_SNI_COLUMN: CustomColumnDef<Event> = {
  id: 'tls_sni',
  visible: false,
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="TLS SNI"
    />
  ),
  cell: ({ row }) =>
    row.original.app_proto === 'tls' && (
      <EventValue
        query_key="tls.sni"
        value={row.original.tls?.sni}
      />
    ),
};
