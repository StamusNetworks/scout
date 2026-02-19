import {
  Binary,
  Crosshair,
  LayoutDashboard,
  PencilRuler,
  Swords,
} from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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
import { DataTableRowExpander } from '@/common/design-system/molecules/data-table/data-table.row-expander';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { isIP } from '@/common/lib/ips';
import { KillchainTag } from '@/features/hunt/killchain/components/killchain-tag';
import { ThreatTag } from '@/features/hunt/threats/components/threat-tag';
import { routes } from '@/pages/routes.config';
import { useAppDispatch } from '@/store/store';

import { replaceFilters } from '../../../../features/hunt/filtering/query-filters/store/query-filters.slice';
import { useThreat } from '../../../../features/hunt/threats/hooks/use-threat';
import { ThreatStatus } from '../../../../features/hunt/threats/model/threat-status.schema';

export const threatStatusColumns: CustomColumnDef<ThreatStatus>[] = [
  {
    id: 'event-expanded',
    cell: ({ row }) => <DataTableRowExpander row={row} />,
    enableHiding: false,
    meta: {
      canReorder: false,
    },
  },
  {
    id: 'first_seen',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="First seen"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.first_seen} />,
  },
  {
    id: 'last_seen',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last seen"
      />
    ),
    cell: ({ row }) => <DateTime date={row.original.last_seen} />,
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
        threat_id={row.original.threat_id}
        is_offender={row.original.is_offender}
        kill_chain={row.original.kill_chain}
        first_seen={row.original.first_seen}
        last_seen={row.original.last_seen}
        status={row.original.status}
      />
    ),
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
  const { data, isLoading } = useThreat(row.threat_id);
  if (isLoading) return <Spin />;
  return (
    <KillchainTag
      kc={row.is_offender ? row.kill_chain_offender : row.kill_chain}
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
  const dispatch = useAppDispatch();
  const { data, isLoading } = useThreat(row.threat_id);
  const handleClick = useCallback(
    (route: string) => {
      dispatch(
        replaceFilters([
          { key: 'ip', value: row.asset },
          { key: 'stamus.threat_name', value: data?.name || '' },
        ]),
      );
      navigate(route);
    },
    [navigate, dispatch, row.asset, data?.name],
  );

  return (
    <Row className="gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => handleClick(routes.explorer)}
        disabled={isLoading}
      >
        <LayoutDashboard />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => handleClick(routes.events)}
        disabled={isLoading}
      >
        <Binary />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => handleClick(routes.detection_methods)}
        disabled={isLoading}
      >
        <PencilRuler />
      </Button>
    </Row>
  );
};
