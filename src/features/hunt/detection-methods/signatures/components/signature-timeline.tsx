import { Card, CardContent } from '@/common/design-system/atoms/ui/card';
import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useQFBuilder } from '@/features/hunt/filtering/query-filters/hooks/use-qf-builder';
import { useGetCountsTimelineQuery } from '@/features/hunt/timeline/api/timeline.api';

export const SignaturesTableTimeline = ({ sid }: { sid: number }) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const QFBuilder = useQFBuilder();
  const { data } = useGetCountsTimelineQuery({
    ...params,
    alert: true,
    stamus: true,
    discovery: true,
    qfilter: QFBuilder.toQFString(
      [QFBuilder.createFilter('alert.signature_id', sid)],
      { untagged: true, informational: true, relevant: true },
    ),
    target: 'true',
  });
  if (!data) return null;

  return (
    <Card className="rounded-md">
      <CardContent className="px-2 sm:p-6">
        <BarChartTimeline data={data} />
      </CardContent>
    </Card>
  );
};
