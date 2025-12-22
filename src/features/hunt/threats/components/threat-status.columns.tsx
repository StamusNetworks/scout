import { Crosshair, Swords } from 'lucide-react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { Hostname } from '@/features/analytics/hosts/components/host-details/hostname';
import { Network } from '@/features/analytics/hosts/components/host-details/network';
import { Username } from '@/features/analytics/hosts/components/host-details/username';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';
import { KillchainTag } from '@/features/hunt/killchain/components/killchain-tag';
import { ThreatTagById } from '@/features/hunt/threats/components/threat-tag';

import { useThreat } from '../hooks/use-threat';
import { ThreatStatus } from '../model/threat-status.schema';

export const threatStatusColumns: CustomColumnDef<ThreatStatus>[] = [
  {
    id: 'first_seen',
    accessorKey: 'first_seen',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="First seen"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.first_seen} />,
  },
  {
    id: 'threat',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Threat"
      />
    ),
    cell: ({ row }) => (
      <ThreatTagById
        threatId={row.original.threat_id}
        is_offender={row.original.is_offender}
      />
    ),
  },
  {
    id: 'entity',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Entity"
      />
    ),
    cell: ({ row }) => (
      <EventValue
        query_key="stamus.asset"
        value={row.original.asset}
      />
    ),
  },
  {
    id: 'network_info',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Network info"
      />
    ),
    cell: ({ row }) => (
      <Column>
        <Hostname
          host={row.original.asset}
          size="small"
        />
        <Username
          host={row.original.asset}
          size="small"
        />
        <Network
          host={row.original.asset}
          size="small"
        />
      </Column>
    ),
  },
  {
    id: 'kill_chain',
    visible: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Kill chain"
      />
    ),
    cell: ({ row }) => <KillChainTagWithContext row={row.original} />,
  },
  {
    id: 'is_offender',
    accessorKey: 'is_offender',
    visible: false,
    header: () => null,
    cell: ({ row }) =>
      row.original.is_offender ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Swords />
            </TooltipTrigger>
            <TooltipContent>Entity is an Offender</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Crosshair />
            </TooltipTrigger>
            <TooltipContent>Entity is a Victim</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
  },
];

export const KillChainTagWithContext = ({ row }: { row: ThreatStatus }) => {
  const { data, isLoading } = useThreat(row.threat_id);
  if (isLoading) return <Spin />;
  return (
    <KillchainTag
      kc={row.is_offender ? row.kill_chain_offender : row.kill_chain}
      context={[
        { es_key: 'stamus.asset', value: row.asset },
        { es_key: 'stamus.threat_name', value: data?.name || '' },
      ]}
    />
  );
};
