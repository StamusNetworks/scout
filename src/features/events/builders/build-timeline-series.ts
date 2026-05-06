import {
  computeInterval,
  type SeriesConfig,
  type TimelinePoint,
  type TimelineSeries,
} from '../definitions/timeline-series';

export const buildTimelineSeries = (
  configs: SeriesConfig[],
  dataByKey: Record<string, TimelinePoint[] | undefined>,
): TimelineSeries[] =>
  configs.map((config) => {
    const data = dataByKey[config.key] ?? [];
    return {
      key: config.key,
      label: config.label,
      color: config.color,
      data,
      interval: computeInterval(data),
    };
  });
