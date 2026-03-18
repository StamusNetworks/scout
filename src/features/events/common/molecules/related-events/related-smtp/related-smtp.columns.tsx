import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { SmtpEvent } from '@/features/events/common/model/app-proto/smtp.schema';
import { EventValue } from '@/features/filtering/query-filters/components/event-value/event-value';

export const relatedFlowColumns: CustomColumnDef<SmtpEvent>[] = [
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
    id: 'helo',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Helo"
      />
    ),
    accessorFn: (row) => row.smtp.helo,
    cell: ({ row }) => (
      <EventValue
        query_key="smtp.helo"
        value={row.original.smtp.helo}
      />
    ),
  },
  {
    id: 'mail_from',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Mail From"
      />
    ),
    accessorFn: (row) => row.smtp.mail_from?.replace(/^<|>$/g, ''),
    cell: ({ row }) => (
      <EventValue
        query_key="smtp.mail_from"
        value={row.original.smtp.mail_from?.replace(/^<|>$/g, '')}
      />
    ),
  },
  {
    id: 'rcpt_to',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Rcpt to"
      />
    ),
    accessorFn: (row) =>
      row.smtp.rcpt_to?.map((str) => str.replace(/^<|>$/g, '')).join(', '),
    cell: ({ row }) =>
      row.original.smtp.rcpt_to?.map((str) => (
        <EventValue
          key={str}
          query_key="smtp.rcpt_to"
          value={str.replace(/^<|>$/g, '')}
        />
      )),
  },
  {
    id: 'attachment',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Attachment"
      />
    ),
    accessorFn: (row) => row.email?.attachment?.join(', '),
  },
];
