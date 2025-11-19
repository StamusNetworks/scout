import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';

import { useGetBeaconingEventsQuery } from '../api/beaconing.api';

export const useBeaconReport = (type: 'ja3s' | 'ip', value: string) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const doctype = type === 'ja3s' ? 'agg_ja3s_src_only' : 'agg_serving_ip';
  return useGetBeaconingEventsQuery(
    {
      ...params,
      page_size: 1,
      qfilter: `beacon_report.document_type:${doctype} AND beacon_report.value:${value}`,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        reports: result.data?.results?.map((e) => e.beacon_report),
      }),
    },
  );
};
