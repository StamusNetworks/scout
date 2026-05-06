import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetWorldMapOffendersCountsQuery } from '../../api/threats.api';
import { WorldMap } from './world-map/world-map';

export const OffendersWorldMap = () => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data, isFetching } = useGetWorldMapOffendersCountsQuery(params, {
    selectFromResult: (result) => ({
      ...result,
      data:
        result.data?.res.map((d) => ({
          country: d.key,
          value: d.offenders?.value || 0,
        })) || [],
    }),
  });

  if (isFetching) return <div>Loading...</div>;

  return <WorldMap data={data} />;
};
