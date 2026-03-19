import { Card, CardContent } from '@/common/design-system/atoms/ui/card';
import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { useGetCountsTimelineQuery } from '@/features/threats/compromises/use-cases/timeline/api/timeline.api';

import { useSignatureDetailsParams } from './signatures-table/signatures-table.utils';

export const SignaturesTableTimeline = ({
  sid,
  applyGlobalFilters,
}: {
  sid: number;
  applyGlobalFilters: boolean;
}) => {
  const params = useSignatureDetailsParams(sid, applyGlobalFilters);
  const { data } = useGetCountsTimelineQuery({
    ...params,
    target: 'true',
  });
  if (!data) return null;

  return (
    <Card className="rounded-md p-0">
      <CardContent className="px-2 sm:p-6">
        <BarChartTimeline
          data={data}
          className="h-32"
        />
      </CardContent>
    </Card>
  );
};
