import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetCountsTimelineQuery } from '@/features/threats/compromises/use-cases/timeline/api/timeline.api';

export const OutliersTimeline = () => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const { data, isFetching } = useGetCountsTimelineQuery({
    ...params,
    qfilter: `stamus_novel:true`,
    target: 'true',
    alert: true,
    discovery: true,
    stamus: true,
  });
  if (isFetching) return <div>Loading...</div>;
  if (!data) return null;
  return <BarChartTimeline data={data} />;
};
