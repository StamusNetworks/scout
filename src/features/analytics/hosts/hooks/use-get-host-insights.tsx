import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetHostsQuery } from '../api/hosts.api';

export const useGetHostInsights = (host: string, enabled = true) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  return useGetHostsQuery(
    {
      ...params,
      host_id_qfilter: `ip:"${host}"`,
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
