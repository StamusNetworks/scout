import { Row } from '@/common/design-system/atoms/layout/row';
import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';

import { FlowAlert } from '../../../model/event-types/alert.schema';

export const relatedAlertsColumns: CustomColumnDef<FlowAlert>[] = [
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
    id: 'method',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Method"
      />
    ),
    accessorFn: (row) => row.alert.signature,
    cell: ({ row }) => (
      <EventValue
        query_key="alert.signature"
        value={row.original.alert.signature}
      />
    ),
  },
  {
    id: 'method id',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Method ID"
      />
    ),
    accessorFn: (row) => row.alert.signature_id,
    cell: ({ row }) => (
      <EventValue
        query_key="alert.signature_id"
        value={row.original.alert.signature_id}
      />
    ),
  },
  {
    id: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Category"
      />
    ),
    accessorFn: (row) => row.alert.category,
    cell: ({ row }) => (
      <EventValue
        query_key="alert.category"
        value={row.original.alert.category}
      />
    ),
  },
  {
    id: 'mitre tactic',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Mitre Tactic"
      />
    ),
    accessorFn: (row) => row.alert.metadata?.mitre_tactic_name?.[0],
    cell: ({ row }) => (
      <Row className="flex-wrap gap-1">
        {row.original.alert.metadata?.mitre_tactic_name?.map((name) => (
          <EventValue
            key={name}
            query_key="alert.metadata.mitre_tactic_name"
            value={name}
          />
        ))}
      </Row>
    ),
  },
  {
    id: 'mitre technique',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Mitre Technique"
      />
    ),
    accessorFn: (row) => row.alert.metadata?.mitre_technique_name?.[0],
    cell: ({ row }) => (
      <Row className="flex-wrap gap-1">
        {row.original.alert.metadata?.mitre_technique_name?.map((name) => (
          <EventValue
            key={name}
            query_key="alert.metadata.mitre_technique_name"
            value={name}
          />
        ))}
      </Row>
    ),
  },
];
