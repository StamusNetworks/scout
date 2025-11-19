import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetHostsQuery } from '../api/hosts.api';

export const useGetHostInsights = (host: string) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  return useGetHostsQuery(
    {
      ...params,
      host_id_qfilter: `ip:"${host}"`,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        data: result.data?.results[0],
      }),
    },
  );
};
