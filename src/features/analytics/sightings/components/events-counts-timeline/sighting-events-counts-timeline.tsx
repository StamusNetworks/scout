import { useMemo } from 'react';

import { BarChartTimeline } from '@/common/design-system/graphs/bar-chart-timeline/bar-chart-timeline';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetEventsTimelineQuery } from '@/features/hunt/events/api/events.api';
import { CountsTimeline } from '@/features/hunt/timeline/models/counts-timeline.model';

import { useGetSightingById } from '../../hooks/use-get-sighting-by-id';
import { getSightingQfilter } from '../../utils/get-sighting-qfilter';

interface SightingEventsCountsTimelineProps {
  sightingId: string;
}
export const SightingEventsCountsTimeline = ({
  sightingId,
}: SightingEventsCountsTimelineProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const start_date = useMemo(() => {
    return params.start_date || 0;
  }, [params.start_date]);
  const end_date = useMemo(() => {
    return params.end_date || new Date().getTime();
  }, [params.end_date]);
  const interval = Math.floor((end_date - start_date) / 24 / 1000);
  const { data: sighting } = useGetSightingById(sightingId);
  const qfilter = getSightingQfilter(
    sighting?.discovery.key,
    sighting?.discovery.value,
    sighting?.app_proto,
  );
  const { data: timeline } = useGetEventsTimelineQuery(
    {
      start_date,
      end_date,
      qfilter,
      interval,
    },
    {
      skip: !qfilter,
      selectFromResult: (result) => ({
        ...result,
        data: {
          from_date: start_date.toString(),
          to_date: end_date.toString(),
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
