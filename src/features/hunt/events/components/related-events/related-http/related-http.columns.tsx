import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/filtering/query-filters/components/event-value/event-value';

import { HttpEvent } from '../../../model/app-proto/http.schema';

export const relatedHttpColumns: CustomColumnDef<HttpEvent>[] = [
  {
    id: 'expander',
    cell: ({ row }) => <DataTableRowExpander row={row} />,
  },
  {
    id: 'timestamp',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Timestamp"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.timestamp} />,
  },
  {
    id: 'host',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Host"
      />
    ),
    accessorFn: (row) => row.http.hostname,
    cell: ({ row }) => (
      <EventValue
        query_key="http.hostname"
        value={row.original.http.hostname}
      />
    ),
  },
  {
    id: 'url',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="URL"
      />
    ),
    accessorFn: (row) => row.http.url,
    cell: ({ row }) => (
      <EventValue
        query_key="http.url"
        value={row.original.http.url}
      />
    ),
  },
  {
    id: 'user agent',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="User Agent"
      />
    ),
    accessorFn: (row) => row.http.http_user_agent,
    cell: ({ row }) => (
      <EventValue
        query_key="http.http_user_agent"
        value={row.original.http.http_user_agent}
      />
    ),
  },
  {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Status"
      />
    ),
    accessorFn: (row) => row.http.status,
    cell: ({ row }) => (
      <EventValue
        query_key="http.status"
        value={row.original.http.status}
      />
    ),
  },
  {
    id: 'http method',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="HTTP Method"
      />
    ),
    accessorFn: (row) => row.http.http_method,
    cell: ({ row }) => (
      <EventValue
        query_key="http.http_method"
        value={row.original.http.http_method}
      />
    ),
  },
];
