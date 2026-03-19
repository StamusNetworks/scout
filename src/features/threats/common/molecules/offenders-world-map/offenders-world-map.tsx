import { WorldMap } from '@/common/design-system/graphs/world-map/world-map';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';
import { useGetWorldMapOffendersCountsQuery } from '@/features/threats/common/threats.api';

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
