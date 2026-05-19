import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';
import { useQFBuilder } from '@/features/query-filters/hooks/use-qf-builder';

import { useGetHostsQuery } from '../api/hosts.api';

export const useHostsList = ({
  withAlerts,
  page,
  pageSize,
  inHomeNetwork,
  ordering,
}: {
  withAlerts: boolean;
  page: number;
  pageSize: number;
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
    from: params.from,
    to: params.to,
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
    page,
    pageSize,
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
