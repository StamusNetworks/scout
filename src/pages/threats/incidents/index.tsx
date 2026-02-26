import { Row as TanstackRow } from '@tanstack/react-table';
import { Biohazard } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import { DataTable } from '@/common/design-system/molecules/data-table';
import { DataTableToolbar } from '@/common/design-system/molecules/data-table/data-table.toolbar';
import { CommandFilterMultiple } from '@/common/design-system/molecules/data-table/filters/command-filter-multiple';
import { usePaginationUrlState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useSortingUrlState } from '@/common/design-system/molecules/data-table/hooks/use-sorting';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { isIP } from '@/common/lib/strings';
import { useGetImpactedEntitiesQuery } from '@/features/hunt/entities/api/entities.api';
import { replaceFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import {
  KillChainKeysWithoutPolicies,
  killChainsConfig,
  killChainWithoutPoliciesOptions,
} from '@/features/hunt/killchain/killchain';
import { useGetThreatsStatusQuery } from '@/features/hunt/threats/api/threats.api';
import { threatStatusColumnDefs } from '@/features/hunt/threats/components/threat-status-columns';
import { useThreats } from '@/features/hunt/threats/hooks/use-threats';
import { ThreatStatus } from '@/features/hunt/threats/model/threat-status.schema';
import { routes } from '@/pages/routes.config';
import { useAppDispatch } from '@/store/store';

const threatIncidentsColumns = [
  { ...threatStatusColumnDefs.first_seen, enableSorting: true },
  threatStatusColumnDefs.entity,
  threatStatusColumnDefs.role,
  threatStatusColumnDefs.threat,
  { ...threatStatusColumnDefs.kill_chain, visible: true },
  threatStatusColumnDefs.network_info,
  { ...threatStatusColumnDefs.last_seen, enableSorting: true },
];

export const ThreatsIncidentsPage = () => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [killChain, setKillChain] = useState<string[]>([]);
  const [pagination, setPagination] = usePaginationUrlState();
  const [sorting, setSorting, ordering] = useSortingUrlState();
  const { data, isFetching } = useGetThreatsStatusQuery({
    ...pagination,
    tenant: params.tenant,
    ordering: ordering || '-first_seen',
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
    if (isIP(row.original.asset)) {
      navigate(
        routes.hosts_host_timeline.replace(':hostId', row.original.asset),
      );
    } else {
      dispatch(
        replaceFilters([
          {
            key: row.original.is_offender ? 'stamus.source' : 'stamus.asset',
            value: row.original.asset,
          },
          {
            key: 'stamus.threat_name',
            value:
              threats.data?.find(
                (threat) => threat.pk === row.original.threat_id,
              )?.name || '',
          },
        ]),
      );
      navigate(routes.explorer);
    }
  };

  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={threatIncidentsColumns}
      pagination={pagination}
      onPaginationChange={setPagination}
      onRowClick={onRowClick}
      sorting={sorting}
      onSortingChange={setSorting}
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
      Empty={<IncidentsEmpty killChain={killChain} />}
      serverSide
    />
  );
};

const IncidentsEmpty = ({ killChain }: { killChain: string[] }) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data: entitiesData } = useGetImpactedEntitiesQuery({
    page: 1,
    page_size: 1,
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
    family_class: 'doc',
  });

  const entityCount = entitiesData?.count ?? 0;
  const hasFilters =
    killChain.length > 0 &&
    killChain.length !== KillChainKeysWithoutPolicies.length;

  return (
    <Empty>
      <EmptyMedia variant="icon">
        <Biohazard />
      </EmptyMedia>
      <EmptyContent>
        <EmptyHeader>No incidents during this period</EmptyHeader>
        {hasFilters ? (
          <EmptyDescription>
            You might be missing incidents for kill chains:{' '}
            {KillChainKeysWithoutPolicies.filter(
              (kc) => !killChain.includes(kc),
            )
              .map((kc) => killChainsConfig[kc].name)
              .join(', ')}
          </EmptyDescription>
        ) : entityCount > 0 ? (
          <>
            <EmptyDescription className="max-w-full">
              No incidents during this period, but there{' '}
              {entityCount === 1 ? 'is' : 'are'} {entityCount} impacted{' '}
              {entityCount === 1 ? 'entity' : 'entities'}. Review{' '}
              {entityCount === 1 ? 'it' : 'them'} to assess your exposure.
            </EmptyDescription>
            <Button asChild>
              <Link to={routes.threats_entities}>
                View impacted {entityCount === 1 ? 'entity' : 'entities'}
              </Link>
            </Button>
          </>
        ) : (
          <>
            <EmptyDescription className="max-w-full">
              Awesome, there are no incidents during this period ! You finally
              have time to go through the Policy Violations or do some hunting.
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
        )}
      </EmptyContent>
    </Empty>
  );
};
