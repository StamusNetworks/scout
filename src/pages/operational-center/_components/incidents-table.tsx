import { Row as TanstackRow } from '@tanstack/react-table';
import { Biohazard, Crosshair, Swords } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/common/design-system/atoms/ui/tooltip';
import { DateTime } from '@/common/design-system/entities/date-time';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableColumnHeader } from '@/common/design-system/molecules/data-table/data-table.columnHeader';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { CommandFilterMultiple } from '@/common/design-system/molecules/data-table/filters/command-filter-multiple';
import { CustomColumnDef } from '@/common/design-system/molecules/data-table/filters/filters.types';
import { usePaginationState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { Hostname } from '@/features/analytics/hosts/components/host-details/hostname';
import { Network } from '@/features/analytics/hosts/components/host-details/network';
import { Username } from '@/features/analytics/hosts/components/host-details/username';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';
import { replaceFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { KillchainTag } from '@/features/hunt/killchain/components/killchain-tag';
import {
  KillChainKeysWithoutPolicies,
  killChainsConfig,
  killChainWithoutPoliciesOptions,
} from '@/features/hunt/killchain/killchain';
import { useGetThreatsStatusQuery } from '@/features/hunt/threats/api/threats.api';
import { ThreatTagById } from '@/features/hunt/threats/components/threat-tag';
import { useThreat } from '@/features/hunt/threats/hooks/use-threat';
import { useThreats } from '@/features/hunt/threats/hooks/use-threats';
import { ThreatStatus } from '@/features/hunt/threats/model/threat-status.schema';
import { routes } from '@/pages/routes.config';
import { useAppDispatch } from '@/store/store';

export const IndicidentsTable = () => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [killChain, setKillChain] = useState<string[]>([]);
  const [pagination, setPagination] = usePaginationState();
  const { data, isFetching } = useGetThreatsStatusQuery({
    ...pagination,
    tenant: params.tenant,
    ordering: '-first_seen',
    first_seen__gte: params.start_date,
    first_seen__lte: params.end_date,
    kill_chain:
      killChain.length === 0
        ? KillChainKeysWithoutPolicies.join(',')
        : killChain?.join(','),
  });
  const threats = useThreats({});

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onRowClick = (row: TanstackRow<ThreatStatus>) => {
    dispatch(
      replaceFilters([
        {
          key: row.original.is_offender ? 'stamus.source' : 'stamus.asset',
          value: row.original.asset,
        },
        {
          key: 'stamus.threat_name',
          value:
            threats.data?.find((threat) => threat.pk === row.original.threat_id)
              ?.name || '',
        },
      ]),
    );
    navigate(routes.explorer);
  };
  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={threatStatusColumns}
      pagination={pagination}
      onPaginationChange={setPagination}
      onRowClick={onRowClick}
      toolBar={
        <DataTableToolbar>
          <CommandFilterMultiple
            title="Kill chain"
            value={killChain}
            onChange={setKillChain}
            options={killChainWithoutPoliciesOptions}
          />
        </DataTableToolbar>
      }
      Empty={
        <Empty>
          <EmptyMedia variant="icon">
            <Biohazard />
          </EmptyMedia>
          <EmptyContent>
            <EmptyHeader>No incidents during this period</EmptyHeader>
            {killChain.length === 0 ||
            killChain.length === KillChainKeysWithoutPolicies.length ? (
              <>
                <EmptyDescription className="max-w-full">
                  Awesome, there are no incidents during this period ! You
                  finally have time to go through the Policy Violations or do
                  some hunting.
                </EmptyDescription>
                <Row className="gap-2">
                  <Button
                    variant="outline"
                    asChild
                  >
                    <Link to={routes.policy_violations}>Policy Violations</Link>
                  </Button>
                  <Button asChild>
                    <Link to={routes.explorer}>Go hunting</Link>
                  </Button>
                </Row>
              </>
            ) : (
              <EmptyDescription>
                You might be missing incidents for kill chains:{' '}
                {KillChainKeysWithoutPolicies.filter(
                  (kc) => !killChain.includes(kc),
                )
                  .map((kc) => killChainsConfig[kc].name)
                  .join(', ')}
              </EmptyDescription>
            )}
          </EmptyContent>
        </Empty>
      }
      serverSide
    />
  );
};

const threatStatusColumns: CustomColumnDef<ThreatStatus>[] = [
  {
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
