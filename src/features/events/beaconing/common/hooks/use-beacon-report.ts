import { esEscape } from '@/common/lib/strings';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';

import { useGetBeaconingEventsQuery } from '../beaconing.api';

export const useBeaconReport = (type: 'ja3s' | 'ip', value: string) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const doctype = type === 'ja3s' ? 'agg_ja3s_src_only' : 'agg_serving_ip';
  return useGetBeaconingEventsQuery(
    {
      ...params,
      page_size: 1,
      qfilter: `beacon_report.document_type:${esEscape(doctype)} AND beacon_report.value:${esEscape(value)}`,
    },
    {
      selectFromResult: (result) => ({
        ...result,
        reports: result.data?.results?.map((e) => e.beacon_report),
      }),
    },
  );
};
