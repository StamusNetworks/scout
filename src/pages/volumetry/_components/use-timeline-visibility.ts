import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';

import { DEFAULT_ENABLED_SERIES, type SeriesKey } from './timeline.constants';

export function useTimelineVisibility() {
  const [enabledSeries, setEnabledSeries] = useQueryState(
    'series',
    parseAsArrayOf(parseAsString, ',').withDefault(DEFAULT_ENABLED_SERIES),
  );

  return [enabledSeries as SeriesKey[], setEnabledSeries] as const;
}
