import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';

import { Route } from '@/routes/_enterprise/volumetry';

import {
  DEFAULT_ENABLED_SERIES,
  type SeriesKey,
} from '../definitions/timeline-series';

export function useTimelineVisibility() {
  const { series } = Route.useSearch();
  const navigate = useNavigate();

  const enabledSeries: SeriesKey[] = series ?? DEFAULT_ENABLED_SERIES;

  const setEnabledSeries = useCallback(
    (value: SeriesKey[]) => {
      navigate({
        to: '.',
        search: (prev) => ({ ...prev, series: value }),
        replace: true,
      });
    },
    [navigate],
  );

  return [enabledSeries, setEnabledSeries] as const;
}
