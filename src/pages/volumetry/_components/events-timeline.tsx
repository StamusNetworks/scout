import { memo, useMemo } from 'react';

import { Spin } from '@/common/design-system/atoms/ui/spin';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetEventsTimelineQuery } from '@/features/hunt/events/api/events.api';

import {
  DualAxisLineChart,
  DualAxisTimelineData,
} from './dual-axis-line-chart';
import {
  ALERTS_COLOR,
  ALERTS_QFILTER,
  computeInterval,
  NETWORK_EVENTS_COLOR,
  NETWORK_EVENTS_QFILTER,
} from './timeline.constants';

type EventsTimelineProps = {
  qfilterPrefix?: string;
  className?: string;
};

export const EventsTimeline = memo(function EventsTimeline({
  qfilterPrefix,
  className,
}: EventsTimelineProps) {
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const networkQFilter = qfilterPrefix
    ? `${qfilterPrefix} AND ${NETWORK_EVENTS_QFILTER}`
    : NETWORK_EVENTS_QFILTER;
  const alertsQFilter = qfilterPrefix
    ? `${qfilterPrefix} AND ${ALERTS_QFILTER}`
    : ALERTS_QFILTER;

  const {
    data: networkEventsData,
    isFetching: isNetworkLoading,
    isError: isNetworkError,
  } = useGetEventsTimelineQuery({
    ...params,
    qfilter: networkQFilter,
  });

  const {
    data: alertsData,
    isFetching: isAlertsLoading,
    isError: isAlertsError,
  } = useGetEventsTimelineQuery({
    ...params,
    qfilter: alertsQFilter,
  });

  const isLoading = isNetworkLoading || isAlertsLoading;
  const isError = isNetworkError || isAlertsError;

  const leftSeries: DualAxisTimelineData = useMemo(
    () => ({
      data: networkEventsData ?? [],
      interval: computeInterval(networkEventsData ?? []),
    }),
    [networkEventsData],
  );

  const rightSeries: DualAxisTimelineData = useMemo(
    () => ({
      data: alertsData ?? [],
      interval: computeInterval(alertsData ?? []),
    }),
    [alertsData],
  );

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Spin />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive flex h-[200px] items-center justify-center text-sm">
        Failed to load timeline data
      </div>
    );
  }

  if (!networkEventsData?.length && !alertsData?.length) {
    return (
      <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
        No data for this time range
      </div>
    );
  }

  return (
    <DualAxisLineChart
      leftSeries={leftSeries}
      rightSeries={rightSeries}
      leftLabel="Network Events"
      rightLabel="Alerts"
      leftColor={NETWORK_EVENTS_COLOR}
      rightColor={ALERTS_COLOR}
      className={className}
    />
  );
});
