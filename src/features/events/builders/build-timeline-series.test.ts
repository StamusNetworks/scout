import { describe, expect, test } from 'vitest';

import { type SeriesConfig } from '../definitions/timeline-series';
import { buildTimelineSeries } from './build-timeline-series';

const config = (key: string, label: string, color: string): SeriesConfig => ({
  key: key as SeriesConfig['key'],
  label,
  qfilter: '',
  color,
  defaultEnabled: false,
});

describe('buildTimelineSeries', () => {
  test('maps each config to a TimelineSeries with its data', () => {
    const result = buildTimelineSeries([config('alerts', 'Alerts', '#f00')], {
      alerts: [
        { time: 1000, count: 5 },
        { time: 2000, count: 6 },
      ],
    });
    expect(result).toEqual([
      {
        key: 'alerts',
        label: 'Alerts',
        color: '#f00',
        data: [
          { time: 1000, count: 5 },
          { time: 2000, count: 6 },
        ],
        interval: 1000,
      },
    ]);
  });

  test('falls back to empty data when the key is missing', () => {
    const result = buildTimelineSeries(
      [config('alerts', 'Alerts', '#f00')],
      {},
    );
    expect(result[0].data).toEqual([]);
    expect(result[0].interval).toBe(0);
  });

  test('preserves config order', () => {
    const result = buildTimelineSeries(
      [config('a', 'A', '#1'), config('b', 'B', '#2'), config('c', 'C', '#3')],
      {},
    );
    expect(result.map((r) => r.key)).toEqual(['a', 'b', 'c']);
  });
});
