import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/filtering/query-filters/components/event-value/event-value';

import { TlsEvent } from '../../../model/app-proto/tls.schema';

export const relatedTlsColumns: CustomColumnDef<TlsEvent>[] = [
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
    id: 'SNI',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="SNI"
      />
    ),
    accessorFn: (row) => row.tls.sni,
    cell: ({ row }) => (
      <EventValue
        query_key="tls.sni"
        value={row.original.tls.sni}
      />
    ),
  },
  {
    id: 'subject',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Subject"
      />
    ),
    accessorFn: (row) => row.tls.subject,
    cell: ({ row }) => (
      <EventValue
        query_key="tls.subject"
        value={row.original.tls.subject}
      />
    ),
  },
  {
    id: 'issuerDn',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Issuer DN"
      />
    ),
    accessorFn: (row) => row.tls.issuerdn,
    cell: ({ row }) => (
      <EventValue
        query_key="tls.issuerdn"
        value={row.original.tls.issuerdn}
      />
    ),
  },
];
