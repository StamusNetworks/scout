import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { esEscape } from '@/common/lib/strings';
import { useGetHostsQuery } from '@/features/host-insights/common/host-insights.api';

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
