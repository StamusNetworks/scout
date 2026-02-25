import { memo, useMemo } from 'react';

import { Spin } from '@/common/design-system/atoms/ui/spin';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useGetEventsTimelineQuery } from '@/features/hunt/events/api/events.api';

import { MultiSeriesLineChart, TimelineSeries } from './dual-axis-line-chart';
import {
  ALERTS_COLOR,
  ALERTS_QFILTER,
  COMPROMISES_COLOR,
  COMPROMISES_QFILTER,
  computeInterval,
  NETWORK_EVENTS_COLOR,
  NETWORK_EVENTS_QFILTER,
  POLICY_VIOLATIONS_COLOR,
  POLICY_VIOLATIONS_QFILTER,
  SIGHTINGS_COLOR,
  SIGHTINGS_QFILTER,
} from './timeline.constants';

type EventsTimelineProps = {
  qfilterPrefix?: string;
  className?: string;
};

function prefixed(prefix: string | undefined, qfilter: string) {
  return prefix ? `${prefix} AND ${qfilter}` : qfilter;
}

export const EventsTimeline = memo(function EventsTimeline({
  qfilterPrefix,
  className,
}: EventsTimelineProps) {
  const params = useGlobalQueryParams(['tenant', 'dates']);

  const networkEventsQuery = useGetEventsTimelineQuery({
    ...params,
    qfilter: prefixed(qfilterPrefix, NETWORK_EVENTS_QFILTER),
  });

  const alertsQuery = useGetEventsTimelineQuery({
    ...params,
    qfilter: prefixed(qfilterPrefix, ALERTS_QFILTER),
  });

  const sightingsQuery = useGetEventsTimelineQuery({
    ...params,
    qfilter: prefixed(qfilterPrefix, SIGHTINGS_QFILTER),
  });

  const compromisesQuery = useGetEventsTimelineQuery({
    ...params,
    qfilter: prefixed(qfilterPrefix, COMPROMISES_QFILTER),
  });

  const policyViolationsQuery = useGetEventsTimelineQuery({
    ...params,
    qfilter: prefixed(qfilterPrefix, POLICY_VIOLATIONS_QFILTER),
  });

  const isLoading =
    networkEventsQuery.isFetching ||
    alertsQuery.isFetching ||
    sightingsQuery.isFetching ||
    compromisesQuery.isFetching ||
    policyViolationsQuery.isFetching;

  const isError =
    networkEventsQuery.isError ||
    alertsQuery.isError ||
    sightingsQuery.isError ||
    compromisesQuery.isError ||
    policyViolationsQuery.isError;

  const hasData =
    (networkEventsQuery.data?.length ?? 0) > 0 ||
    (alertsQuery.data?.length ?? 0) > 0 ||
    (sightingsQuery.data?.length ?? 0) > 0 ||
    (compromisesQuery.data?.length ?? 0) > 0 ||
    (policyViolationsQuery.data?.length ?? 0) > 0;

  const series: TimelineSeries[] = useMemo(
    () => [
      {
        key: 'networkEvents',
        label: 'Network Events',
        color: NETWORK_EVENTS_COLOR,
        data: networkEventsQuery.data ?? [],
        interval: computeInterval(networkEventsQuery.data ?? []),
      },
      {
        key: 'alerts',
        label: 'Alerts',
        color: ALERTS_COLOR,
        data: alertsQuery.data ?? [],
        interval: computeInterval(alertsQuery.data ?? []),
      },
      {
        key: 'sightings',
        label: 'Sightings',
        color: SIGHTINGS_COLOR,
        data: sightingsQuery.data ?? [],
        interval: computeInterval(sightingsQuery.data ?? []),
      },
      {
        key: 'compromises',
        label: 'Compromises',
        color: COMPROMISES_COLOR,
        data: compromisesQuery.data ?? [],
        interval: computeInterval(compromisesQuery.data ?? []),
      },
      {
        key: 'policyViolations',
        label: 'Policy Violations',
        color: POLICY_VIOLATIONS_COLOR,
        data: policyViolationsQuery.data ?? [],
        interval: computeInterval(policyViolationsQuery.data ?? []),
      },
    ],
    [
      networkEventsQuery.data,
      alertsQuery.data,
      sightingsQuery.data,
      compromisesQuery.data,
      policyViolationsQuery.data,
    ],
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

  if (!hasData) {
    return (
      <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
        No data for this time range
      </div>
    );
  }

  return (
    <MultiSeriesLineChart
      series={series}
      className={className}
    />
  );
});
