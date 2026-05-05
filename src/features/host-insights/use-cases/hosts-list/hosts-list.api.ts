import { PaginationState } from '@tanstack/react-table';

import { selectDates } from '@/features/dates';
import { useQFBuilder } from '@/features/filtering/filters/query-filters/hooks/use-qf-builder';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';
import {
  getAggregationBody,
  getCustomFilter,
  useFetchHostsCountsQuery,
  useGetHostsQuery,
} from '@/features/host-insights/common/host-insights.api';
import { useAppSelector } from '@/store/store';

// ── useHostsList ──────────────────────────────────────────────────────

export const useHostsList = ({
  withAlerts,
  pagination,
  inHomeNetwork,
  ordering,
}: {
  withAlerts: boolean;
  pagination: PaginationState;
  inHomeNetwork: 'true' | 'false' | 'all';
  ordering: string;
}) => {
  const QFBuilder = useQFBuilder();
  const params = useGlobalQueryParams(
    ['tenant', 'dates', 'qfilter', 'qfilterHost'],
    {
      extendQfilter: getFilterExtension(QFBuilder, inHomeNetwork),
    },
  );

  const hostsResult = useGetHostsQuery({
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
    host_id_qfilter: params.host_id_qfilter,
    qfilter: withAlerts ? params.qfilter : undefined,
    ordering,
    withAlerts,
    ...(withAlerts
      ? {
          discovery: params.discovery,
          alert: params.alert,
          stamus: params.stamus,
        }
      : {}),
    ...pagination,
  });

  return hostsResult;
};

export const getFilterExtension = (
  QFBuilder: ReturnType<typeof useQFBuilder>,
  inHomeNetwork: 'true' | 'false' | 'all',
) => {
  if (!QFBuilder || inHomeNetwork === 'all') return [];
  return [QFBuilder.createFilter('host_id.in_home_net', inHomeNetwork)];
};

// ── useFetchHostsCounts ───────────────────────────────────────────────

export const useFetchHostsCounts = ({
  inHomeNetwork,
}: {
  inHomeNetwork: 'true' | 'false' | 'all';
}) => {
  const dateFilters = useAppSelector(selectDates);
  const { tenant, start_date, end_date } = useGlobalQueryParams([
    'tenant',
    'dates',
  ]);
  const customFilter =
    dateFilters.type === 'range' || dateFilters.type === 'auto'
      ? getCustomFilter(start_date!, end_date!)
      : undefined;
  const agg = getAggregationBody(tenant, inHomeNetwork, customFilter);

  return useFetchHostsCountsQuery({
    body: agg,
    start_date,
    end_date,
    tenant,
  });
};
