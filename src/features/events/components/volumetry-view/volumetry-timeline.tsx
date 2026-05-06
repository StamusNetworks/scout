import { memo, useMemo } from 'react';

import { Spin } from '@/common/design-system/atoms/ui/spin';
import { cn } from '@/common/lib/utils';
import { useGlobalQueryParams } from '@/features/query-filters/hooks/use-global-query-params';

import { useGetEventsTimelineQuery } from '../../api/events.api';
import {
  computeInterval,
  SeriesKey,
  TIMELINE_SERIES,
} from '../../definitions/timeline-series';
import { useTimelineVisibility } from '../../hooks/use-timeline-visibility';
import {
  type ChartScale,
  MultiSeriesLineChart,
  type TimelineSeries,
} from './dual-axis-line-chart';

type EventsTimelineProps = {
  qfilterPrefix?: string;
  scale?: ChartScale;
  className?: string;
};

function prefixed(prefix: string | undefined, qfilter: string) {
  return prefix ? `${prefix} AND ${qfilter}` : qfilter;
}

type QueryResult = ReturnType<typeof useGetEventsTimelineQuery>;

// Series configs by key for explicit hook calls below.
const S = Object.fromEntries(TIMELINE_SERIES.map((s) => [s.key, s])) as {
  [K in (typeof TIMELINE_SERIES)[number]['key']]: (typeof TIMELINE_SERIES)[number];
};

/**
 * One explicit useGetEventsTimelineQuery call per series.
 * Uses `skip` for disabled ones so hook call count is always stable.
 * Each call references its config by literal key to avoid index-based coupling.
 */
function useAllSeriesQueries(
  params: { from?: number; to?: number; tenant?: number },
  qfilterPrefix: string | undefined,
  enabledKeys: string[],
) {
  const enabled = new Set(enabledKeys);
  const q = (key: string) => ({
    ...params,
    qfilter: prefixed(qfilterPrefix, S[key as keyof typeof S].qfilter),
  });

  const networkEvents = useGetEventsTimelineQuery(q('networkEvents'), {
    skip: !enabled.has('networkEvents'),
  });
  const flows = useGetEventsTimelineQuery(q('flows'), {
    skip: !enabled.has('flows'),
  });
  const alerts = useGetEventsTimelineQuery(q('alerts'), {
    skip: !enabled.has('alerts'),
  });
  const compromises = useGetEventsTimelineQuery(q('compromises'), {
    skip: !enabled.has('compromises'),
  });
  const policyViolations = useGetEventsTimelineQuery(q('policyViolations'), {
    skip: !enabled.has('policyViolations'),
  });
  const sightings = useGetEventsTimelineQuery(q('sightings'), {
    skip: !enabled.has('sightings'),
  });
  const outlierEvents = useGetEventsTimelineQuery(q('outlierEvents'), {
    skip: !enabled.has('outlierEvents'),
  });

  return {
    networkEvents,
    flows,
    alerts,
    compromises,
    policyViolations,
    sightings,
    outlierEvents,
  };
}

export const EventsTimeline = memo(function EventsTimeline({
  qfilterPrefix,
  scale,
  className,
}: EventsTimelineProps) {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const [enabledSeries] = useTimelineVisibility();

  const queries = useAllSeriesQueries(params, qfilterPrefix, enabledSeries);

  const activeConfigs = TIMELINE_SERIES.filter((s) =>
    enabledSeries.includes(s.key),
  );

  const qByKey = queries as Record<SeriesKey, QueryResult>;

  const isFetching = activeConfigs.some((s) => qByKey[s.key].isFetching);
  const isError = activeConfigs.some((s) => qByKey[s.key].isError);
  const hasData = activeConfigs.some(
    (s) => (qByKey[s.key].data?.length ?? 0) > 0,
  );

  const series: TimelineSeries[] = useMemo(
    () =>
      activeConfigs.map((config) => ({
        key: config.key,
        label: config.label,
        color: config.color,
        data: qByKey[config.key].data ?? [],
        interval: computeInterval(qByKey[config.key].data ?? []),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabledSeries, ...activeConfigs.map((s) => qByKey[s.key].data)],
  );

  if (activeConfigs.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
        No series selected
      </div>
    );
  }

  // Full spinner only when there's no data at all yet
  if (!hasData && isFetching) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Spin />
      </div>
    );
  }

  if (isError && !hasData) {
    return (
      <div className="text-destructive flex h-[200px] items-center justify-center text-sm">
        Failed to load timeline data
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
        No data for this time range
      </div>
    );
  }

  return (
    <div className="relative">
      <MultiSeriesLineChart
        series={series}
        scale={scale}
        className={className}
      />
      {isFetching && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              'bg-background/60 flex items-center gap-2 rounded-md px-3 py-1.5',
              'text-muted-foreground text-xs shadow-sm backdrop-blur-sm',
            )}
          >
            <Spin className="h-3 w-3 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
});
