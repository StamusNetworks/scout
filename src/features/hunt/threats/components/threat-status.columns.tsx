import { Crosshair, LayoutDashboard, Swords } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { Hostname } from '@/features/analytics/hosts/components/host-details/hostname';
import { Network } from '@/features/analytics/hosts/components/host-details/network';
import { Username } from '@/features/analytics/hosts/components/host-details/username';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';
import { KillchainTag } from '@/features/hunt/killchain/components/killchain-tag';
import { ThreatTagById } from '@/features/hunt/threats/components/threat-tag';
import { routes } from '@/pages/routes.config';
import { useAppDispatch } from '@/store/store';

import { replaceFilters } from '../../filtering/query-filters/store/query-filters.slice';
import { useThreat } from '../hooks/use-threat';
import { ThreatStatus } from '../model/threat-status.schema';

export const threatStatusColumns: CustomColumnDef<ThreatStatus>[] = [
  {
    id: 'event-expanded',
    cell: ({ row }) => <DataTableRowExpander row={row} />,
    visible: false,
    enableHiding: false,
    meta: {
      canReorder: false,
    },
  },
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
    id: 'explore',
    visible: false,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Explore"
      />
    ),
    cell: ({ row }) => <ExploreButton row={row.original} />,
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

export const ExploreButton = ({ row }: { row: ThreatStatus }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data, isLoading } = useThreat(row.threat_id);
  const handleClick = useCallback(() => {
    dispatch(
      replaceFilters([
        { key: 'ip', value: row.asset },
        { key: 'stamus.threat_name', value: data?.name || '' },
      ]),
    );
    navigate(routes.explorer);
  }, [navigate, dispatch, row.asset, data?.name]);

  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={handleClick}
      disabled={isLoading}
    >
      <LayoutDashboard />
    </Button>
  );
};
