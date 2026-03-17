import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';

import { Scrollable } from '../../common/atoms/scrollable';
import type { Event } from '../../common/model/event.schema';

export const HTTP_RESPONSE_COLUMN: CustomColumnDef<Event> = {
  id: 'http_response',
  visible: false,
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="HTTP Response"
    />
  ),
  cell: ({ row }) =>
    row.original.app_proto === 'http' &&
    row.original.http?.http_response_body_printable && (
      <Scrollable string={row.original.http.http_response_body_printable} />
    ),
};
