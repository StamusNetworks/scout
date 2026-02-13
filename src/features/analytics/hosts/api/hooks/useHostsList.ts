import { PaginationState } from '@tanstack/react-table';

import { useGlobalQueryParams } from '@/common/fetching/useQueryParams.tsx';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder.ts';

import { useGetHostsQuery } from '../hosts.api.ts';

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
