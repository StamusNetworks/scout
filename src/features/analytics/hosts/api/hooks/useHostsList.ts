import { PaginationState } from '@tanstack/react-table';

import { useGlobalQueryParams } from '@/common/fetching/useQueryParams.tsx';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder.ts';

import { useGetHostsQuery, useGetHostsWithAlertsQuery } from '../hosts.api.ts';

export const useHostsList = ({
  withAlerts,
  pagination,
  inHomeNetwork,
}: {
  withAlerts: boolean;
  pagination: PaginationState;
  inHomeNetwork: 'true' | 'false' | 'all';
}) => {
  const QFBuilder = useQFBuilder();
  const params = useGlobalQueryParams(
    ['tenant', 'dates', 'qfilter', 'qfilterHost'],
    {
      extendQfilter: getFilterExtension(QFBuilder, inHomeNetwork),
    },
  );

  // Call both hooks unconditionally to satisfy Rules of Hooks
  const hostsWithAlertsResult = useGetHostsWithAlertsQuery({
    ...params,
    ...pagination,
  });
  const hostsResult = useGetHostsQuery({
    tenant: params.tenant,
    start_date: params.start_date,
    end_date: params.end_date,
    host_id_qfilter: params.host_id_qfilter,
    ...pagination,
  });

  // Return the appropriate result based on the condition
  return withAlerts ? hostsWithAlertsResult : hostsResult;
};

export const getFilterExtension = (
  QFBuilder: ReturnType<typeof useQFBuilder>,
  inHomeNetwork: 'true' | 'false' | 'all',
) => {
  if (!QFBuilder || inHomeNetwork === 'all') return [];
  return [QFBuilder.createFilter('host_id.in_home_net', inHomeNetwork)];
};
