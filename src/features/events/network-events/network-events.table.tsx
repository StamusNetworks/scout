import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import type { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/filtering/query-filters/use-cases/interactive-value/event-value';

import { Scrollable } from '../common/atoms/scrollable';
import type { Event } from '../common/events.model';

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

export const HTTP_REQUEST_COLUMN: CustomColumnDef<Event> = {
  id: 'http_request',
  visible: false,
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="HTTP Request"
    />
  ),
  cell: ({ row }) =>
    row.original.app_proto === 'http' &&
    row.original.http?.http_request_body_printable && (
      <Scrollable string={row.original.http.http_request_body_printable} />
    ),
};

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

export const PAYLOAD_COLUMN: CustomColumnDef<Event> = {
  id: 'payload_printable',
  visible: false,
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="Payload"
    />
  ),
  cell: ({ row }) =>
    row.original.payload_printable && (
      <Scrollable string={row.original.payload_printable} />
    ),
};
