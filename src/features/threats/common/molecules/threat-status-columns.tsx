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
import { Hostname } from '@/features/host-insights/use-cases/host-details/molecules/host-details/hostname';
import { Network } from '@/features/host-insights/use-cases/host-details/molecules/host-details/network';
import { Roles } from '@/features/host-insights/use-cases/host-details/molecules/host-details/roles';
import { Username } from '@/features/host-insights/use-cases/host-details/molecules/host-details/username';
import { KillchainTag } from '@/features/threats/common/killchain/components/killchain-tag';

import { ThreatStatus } from '../../api/threat-status.dto';
import { useThreat } from '../hooks/use-threat';
import { IpOrEntityEventValue } from '../molecules/ip-or-entity';
import { ThreatTag } from './threat-tag';

export const KillChainTagWithContext = ({ row }: { row: ThreatStatus }) => {
  const { data, isLoading } = useThreat(row.threat_id);
  if (isLoading) return <Spin />;
  return (
    <KillchainTag
      kc={row.is_offender ? row.kill_chain_offender : row.kill_chain}
      status={row.status}
      context={[
        { es_key: 'stamus.asset', value: row.asset },
        { es_key: 'stamus.threat_name', value: data?.name || '' },
      ]}
    />
  );
};

export const threatStatusColumnDefs: Record<
  string,
  CustomColumnDef<ThreatStatus>
> = {
  first_seen: {
    id: 'first_seen',
    enableSorting: false,
    accessorKey: 'first_seen',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="First seen"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.first_seen} />,
  },
  last_seen: {
    id: 'last_seen',
    enableSorting: false,
    accessorKey: 'last_seen',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last seen"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.last_seen} />,
  },
  threat: {
    id: 'threat',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Threat"
      />
    ),
    cell: ({ row }) => (
      <ThreatTag
        threat_id={row.original.threat_id}
        is_offender={row.original.is_offender}
        kill_chain={row.original.kill_chain}
        first_seen={row.original.first_seen}
        last_seen={row.original.last_seen}
        status={row.original.status}
      />
    ),
  },
  kill_chain: {
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
  is_offender: {
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
  entity: {
    id: 'entity',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Entity"
      />
    ),
    cell: ({ row }) => (
      <IpOrEntityEventValue
        entity={row.original.asset}
        offender={row.original.is_offender}
      />
    ),
  },
  role: {
    id: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Role(s)"
      />
    ),
    cell: ({ row }) => (
      <Roles
        className="flex-col"
        host={row.original.asset}
      />
    ),
  },
  network_info: {
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
};
