import { useMemo } from 'react';

import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { CountsTimeline } from '@/features/events/model/counts-timeline';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetEventsTimelineQuery } from '../../api/events.api';
import { buildSightingQfilter } from '../../builders/build-sighting-qfilter';
import { useGetSightingById } from '../../hooks/use-get-sighting-by-id';

interface SightingEventsCountsTimelineProps {
  sightingId: string;
}
export const SightingEventsCountsTimeline = ({
  sightingId,
}: SightingEventsCountsTimelineProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const from = useMemo(() => {
    return params.from || 0;
  }, [params.from]);
  const to = useMemo(() => {
    return params.to || new Date().getTime();
  }, [params.to]);
  const interval = Math.floor((to - from) / 24 / 1000);
  const { data: sighting } = useGetSightingById(sightingId);
  const qfilter = buildSightingQfilter(
    sighting?.discovery?.key,
    sighting?.discovery?.value,
    sighting?.app_proto,
  );
  const { data: timeline } = useGetEventsTimelineQuery(
    {
      from,
      to,
      qfilter,
      interval,
    },
    {
      skip: !qfilter,
      selectFromResult: (result) => ({
        ...result,
        data: {
          from_date: from.toString(),
          to_date: to.toString(),
          interval: interval.toString(),
          events: {
            entries: result.data,
          },
        } as unknown as CountsTimeline,
      }),
    },
  );
  if (!qfilter) return <div>No data.</div>;
  return <BarChartTimeline data={timeline} />;
};
