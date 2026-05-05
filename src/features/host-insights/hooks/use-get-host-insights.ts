import { esEscape } from '@/common/lib/strings';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetHostsQuery } from '../api/hosts.api';

export const useGetHostInsights = (host: string, enabled = true) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  return useGetHostsQuery(
    {
      ...params,
      host_id_qfilter: `ip:"${esEscape(host)}"`,
    },
    {
      skip: !enabled,
      selectFromResult: (result) => ({
        ...result,
        data: result.data?.results[0],
      }),
    },
  );
};
