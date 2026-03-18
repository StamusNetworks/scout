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
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { isIP } from '@/common/lib/strings';
import { replaceFilters } from '@/features/filtering/query-filters/store/query-filters.slice';
import {
  KillChainKeysWithoutPolicies,
  killChainsConfig,
  killChainWithoutPoliciesOptions,
} from '@/features/hunt/killchain/killchain';
import { useGetImpactedEntitiesQuery } from '@/features/threats/common/entities.api';
import { useThreats } from '@/features/threats/common/hooks/use-threats';
import { ThreatStatus } from '@/features/threats/common/threat-status.schema';
import { useGetThreatsStatusQuery } from '@/features/threats/common/threats.api';
import { useAppDispatch } from '@/store/store';

import { threatIncidentsColumns } from '../incidents.table';

export interface IncidentsTableProps {
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
}: IncidentsTableProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [killChain, setKillChain] = useState<string[]>([]);

  const ordering =
    sorting.length > 0
      ? `${sorting[0].desc ? '-' : ''}${sorting[0].id}`
      : '-first_seen';

  const { data, isFetching } = useGetThreatsStatusQuery({
    page,
    page_size: pageSize,
    ordering,
    tenant: params.tenant,
    first_seen__gte: params.start_date,
    first_seen__lte: params.end_date,
    kill_chain:
      killChain.length === 0
        ? KillChainKeysWithoutPolicies.join(',')
        : killChain.join(','),
  });
  const threats = useThreats({});

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onRowClick = (row: TanstackRow<ThreatStatus>) => {
    if (isIP(row.original.asset)) {
      navigate({
        to: `/hosts/${row.original.asset}/timeline`,
      });
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
      columns={threatIncidentsColumns}
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
