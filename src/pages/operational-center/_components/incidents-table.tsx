import { Link, useNavigate } from '@tanstack/react-router';
import { Row as TanstackRow } from '@tanstack/react-table';
import { Biohazard } from 'lucide-react';

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
import { usePaginationState } from '@/common/design-system/molecules/data-table/hooks/use-pagination';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { isIP } from '@/common/lib/strings';
import { replaceFilters } from '@/features/hunt/filtering/query-filters/store/query-filters.slice';
import { KillChainKeysWithoutPolicies } from '@/features/hunt/killchain/killchain';
import { useGetThreatsStatusQuery } from '@/features/hunt/threats/api/threats.api';
import { threatStatusColumnDefs } from '@/features/hunt/threats/components/threat-status-columns';
import { useThreats } from '@/features/hunt/threats/hooks/use-threats';
import { ThreatStatus } from '@/features/hunt/threats/model/threat-status.schema';
import { useAppDispatch } from '@/store/store';

export const IndicidentsTable = () => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [pagination, setPagination] = usePaginationState();
  const { data, isFetching } = useGetThreatsStatusQuery({
    ...pagination,
    tenant: params.tenant,
    ordering: '-first_seen',
    kill_chain: KillChainKeysWithoutPolicies.join(','),
    first_seen__gte: params.start_date,
    first_seen__lte: params.end_date,
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
  return (
    <DataTable
      data={data}
      isLoading={isFetching}
      columns={threatStatusColumns}
      pagination={pagination}
      onPaginationChange={setPagination}
      onRowClick={onRowClick}
      Empty={
        <Empty>
          <EmptyMedia variant="icon">
            <Biohazard />
          </EmptyMedia>
          <EmptyContent>
            <EmptyHeader>No incidents during this period</EmptyHeader>

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
          </EmptyContent>
        </Empty>
      }
      toolBar={false}
      reorder={false}
      serverSide
    />
  );
};

const threatStatusColumns = [
  { ...threatStatusColumnDefs.first_seen, header: 'First seen' },
  { ...threatStatusColumnDefs.threat, header: 'Threat' },
  { ...threatStatusColumnDefs.entity, header: 'Entity' },
  { ...threatStatusColumnDefs.network_info, header: 'Network info' },
];
