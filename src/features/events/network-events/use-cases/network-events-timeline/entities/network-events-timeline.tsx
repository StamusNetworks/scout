import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { useGetEventsTimelineQuery } from '@/features/events/common/events.api';
import { CountsTimeline } from '@/features/events/counts-timeline/counts-timeline.model';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useNetworkEventsQfilter } from '../../build-network-events-qfilter';

export const NetworkEventsTimeline = () => {
  const params = useGlobalQueryParams(['dates', 'tenant']);
  const qfilter = useNetworkEventsQfilter();

  const { data } = useGetEventsTimelineQuery(
    { ...params, qfilter },
    {
      selectFromResult: (result) => ({
        data: {
          from_date: params.start_date || 0,
          to_date: params.end_date || new Date().getTime(),
          interval: result.data ? result.data[1].time - result.data[0].time : 0,
          events: {
            entries: result.data,
          },
        },
      }),
    },
  );

  return (
    <BarChartTimeline
      data={data as unknown as CountsTimeline}
      className="h-[250px]"
    />
  );
};
