import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { useNetworkEventsQfilter } from '@/features/events/hooks/use-network-events-qfilter';
import { CountsTimeline } from '@/features/events/model/counts-timeline';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetEventsTimelineQuery } from '../../api/events.api';

export const NetworkEventsTimeline = () => {
  const params = useGlobalQueryParams(['dates', 'tenant']);
  const qfilter = useNetworkEventsQfilter();

  const { data } = useGetEventsTimelineQuery(
    { ...params, qfilter },
    {
      selectFromResult: (result) => ({
        data: {
          from_date: params.from || 0,
          to_date: params.to || new Date().getTime(),
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
