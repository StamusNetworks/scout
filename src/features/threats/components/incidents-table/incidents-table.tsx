import { Link, useNavigate } from '@tanstack/react-router';
import type {
  PaginationState,
  Row as TanstackRow,
  SortingState,
  Updater,
} from '@tanstack/react-table';
import { Biohazard } from 'lucide-react';
import { useCallback, useState } from 'react';

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
import { isIP } from '@/common/lib/strings';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useSoftReplaceFilters } from '@/features/query-filters/hooks/use-soft-replace-filters';

import { useGetImpactedEntitiesQuery } from '../../api/entities.api';
import { useGetThreatsStatusQuery } from '../../api/threats.api';
import { useThreats } from '../../hooks/use-threats';
import {
  KILL_CHAIN_PHASES_KEYS_WITHOUT_POLICIES,
  KILL_CHAIN_PHASES,
  killChainWithoutPoliciesOptions,
} from '../../model/kill-chain';
import { ThreatStatus } from '../../model/threat-status';
import { incidentsColumns } from './incidents.columns';

export interface CompromiseIncidentsTableProps {
  page: number;
  pageSize: number;
  sorting: SortingState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (updater: Updater<SortingState>) => void;
}

export const IncidentsTable = ({
  page,
  pageSize,
  sorting,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
}: CompromiseIncidentsTableProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [killChain, setKillChain] = useState<string[]>([]);

  const ordering =
    sorting.length > 0
      ? `${sorting[0].desc ? '-' : ''}${sorting[0].id}`
      : '-first_seen';

  const { data, isFetching } = useGetThreatsStatusQuery({
    page,
    pageSize: pageSize,
    ordering,
    tenant: params.tenant,
    first_seen__gte: params.from,
    first_seen__lte: params.to,
    kill_chain:
      killChain.length === 0
        ? KILL_CHAIN_PHASES_KEYS_WITHOUT_POLICIES.join(',')
        : killChain.join(','),
  });
  const threats = useThreats({});

  const navigate = useNavigate();
  const replaceFilters = useSoftReplaceFilters();

  const onRowClick = (row: TanstackRow<ThreatStatus>) => {
    if (isIP(row.original.asset)) {
      navigate({
        to: `/hosts/${row.original.asset}/timeline`,
      });
    } else {
      replaceFilters([
        {
          key: row.original.isOffender ? 'stamus.source' : 'stamus.asset',
          value: row.original.asset,
        },
        {
          key: 'stamus.threat_name',
          value:
            threats.data?.find((threat) => threat.id === row.original.threatId)
              ?.name || '',
        },
      ]);
      navigate({ to: '/explorer' });
    }
  };

  const pagination: PaginationState = {
    pageIndex: page - 1,
    pageSize,
  };

  const handlePaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex: page - 1, pageSize })
          : updater;
      if (next.pageIndex !== page - 1) {
        onPageChange(next.pageIndex + 1);
      }
      if (next.pageSize !== pageSize) {
        onPageSizeChange(next.pageSize);
      }
    },
    [page, pageSize, onPageChange, onPageSizeChange],
  );

  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={incidentsColumns}
      pagination={pagination}
      onPaginationChange={handlePaginationChange}
      onRowClick={onRowClick}
      sorting={sorting}
      onSortingChange={onSortingChange}
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
    pageSize: 1,
    tenant: params.tenant,
    from: params.from,
    to: params.to,
    family_class: 'doc',
  });

  const entityCount = entitiesData?.count ?? 0;
  const hasFilters =
    killChain.length > 0 &&
    killChain.length !== KILL_CHAIN_PHASES_KEYS_WITHOUT_POLICIES.length;

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
            {KILL_CHAIN_PHASES_KEYS_WITHOUT_POLICIES.filter(
              (kc) => !killChain.includes(kc),
            )
              .map((kc) => KILL_CHAIN_PHASES[kc].name)
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
              <Link to="/threats/compromises/entities">
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
                <Link to="/policy-violations">Policy Violations</Link>
              </Button>
              <Button asChild>
                <Link to="/explorer">Go hunting</Link>
              </Button>
            </Row>
          </>
        )}
      </EmptyContent>
    </Empty>
  );
};
