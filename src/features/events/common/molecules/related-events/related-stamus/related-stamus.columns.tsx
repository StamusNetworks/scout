import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { StamusEvent } from '@/features/events/common/model/event-types/stamus.schema';
import { EventValue } from '@/features/filtering/query-filters/use-cases/interactive-value/event-value';
import { KillchainTag } from '@/features/threats/common/killchain/components/killchain-tag';
import { KillChainPhase } from '@/features/threats/common/killchain/killchain';

export const relatedStamusColumns: CustomColumnDef<StamusEvent>[] = [
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
    id: 'threat name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Threat name"
      />
    ),
    accessorFn: (row) => row.stamus.threat_name,
    cell: ({ row }) => (
      <EventValue
        query_key="stamus.threat_name"
        value={row.original.stamus.threat_name}
      />
    ),
  },
  {
    id: 'family name',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Family name"
      />
    ),
    accessorFn: (row) => row.stamus.family_name,
    cell: ({ row }) => (
      <EventValue
        query_key="stamus.family_name"
        value={row.original.stamus.family_name}
      />
    ),
  },
  {
    id: 'kill chain',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Kill chain"
      />
    ),
    cell: ({ row }) => (
      <KillchainTag kc={row.original.stamus.kill_chain as KillChainPhase} />
    ),
  },
];
