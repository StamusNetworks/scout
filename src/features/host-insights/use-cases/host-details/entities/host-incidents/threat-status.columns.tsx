import { useNavigate } from '@tanstack/react-router';
import {
  Binary,
  Crosshair,
  LayoutDashboard,
  PencilRuler,
  Swords,
} from 'lucide-react';
import { useCallback } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
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
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { isIP } from '@/common/lib/ips';
import { useReplaceFilters } from '@/features/query-filters/hooks/use-replace-filters';
import { KillchainTag } from '@/features/threats/components/kill-chain-tag/kill-chain-tag';
import { ThreatTag } from '@/features/threats/components/threat-tag/threat-tag';
import { useThreat } from '@/features/threats/hooks/use-threat';
import { ThreatStatus } from '@/features/threats/model/threat-status';

export const threatStatusColumns: CustomColumnDef<ThreatStatus>[] = [
  {
    id: 'first_seen',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="First seen"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.firstSeen} />,
  },
  {
    id: 'last_seen',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last seen"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.lastSeen} />,
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
      <ThreatTag
        threat_id={row.original.threatId}
        is_offender={row.original.isOffender}
        kill_chain={row.original.phase}
        first_seen={row.original.firstSeen.toISOString()}
        last_seen={row.original.lastSeen.toISOString()}
        status={row.original.status}
      />
    ),
  },
  {
    id: 'is_offender',
    accessorKey: 'isOffender',
    visible: false,
    header: () => null,
    cell: ({ row }) =>
      row.original.isOffender ? (
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
    id: 'kill_chain',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Kill chain"
      />
    ),
    cell: ({ row }) => <KillChainTagWithContext row={row.original} />,
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
    cell: ({ row }) => <ExploreButtons row={row.original} />,
  },
];

export const KillChainTagWithContext = ({ row }: { row: ThreatStatus }) => {
  const { data, isLoading } = useThreat(row.threatId);
  if (isLoading) return <Spin />;
  return (
    <KillchainTag
      kc={row.isOffender ? row.offenderPhase : row.phase}
      status={row.status}
      context={[
        { es_key: isIP(row.asset) ? 'ip' : 'stamus.asset', value: row.asset },
        { es_key: 'stamus.threat_name', value: data?.name || '' },
      ]}
    />
  );
};

export const ExploreButtons = ({ row }: { row: ThreatStatus }) => {
  const navigate = useNavigate();
  const replaceFilters = useReplaceFilters();
  const { data, isLoading } = useThreat(row.threatId);
  const handleClick = useCallback(
    (route: string) => {
      replaceFilters([
        { key: 'ip', value: row.asset },
        { key: 'stamus.threat_name', value: data?.name || '' },
      ]);
      navigate({ to: route });
    },
    [navigate, replaceFilters, row.asset, data?.name],
  );

  return (
    <Row className="gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => handleClick('/explorer')}
        disabled={isLoading}
      >
        <LayoutDashboard />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => handleClick('/detection-events')}
        disabled={isLoading}
      >
        <Binary />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => handleClick('/detection-methods')}
        disabled={isLoading}
      >
        <PencilRuler />
      </Button>
    </Row>
  );
};
