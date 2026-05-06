import { describe, expect, test } from 'vitest';

import { type TaggedEvent, type TimelineEventType } from './hunting-trail';
import { groupEventsByType } from './purpose-grouping';

const taggedEvent = (type: TimelineEventType, timestamp: string): TaggedEvent =>
  ({ timelineType: type, timestamp }) as unknown as TaggedEvent;

describe('groupEventsByType', () => {
  test('returns empty for no events', () => {
    expect(groupEventsByType([])).toEqual([]);
  });

  test('groups events by their timelineType', () => {
    const result = groupEventsByType([
      taggedEvent('sightings', '2024-01-01T00:00:00Z'),
      taggedEvent('file', '2024-01-02T00:00:00Z'),
      taggedEvent('sightings', '2024-01-03T00:00:00Z'),
    ]);
    expect(result).toHaveLength(2);
    expect(result.find((g) => g.type === 'sightings')?.events).toHaveLength(2);
    expect(result.find((g) => g.type === 'file')?.events).toHaveLength(1);
  });

  test('sorts events within a group by timestamp ascending', () => {
    const [group] = groupEventsByType([
      taggedEvent('sightings', '2024-01-03T00:00:00Z'),
      taggedEvent('sightings', '2024-01-01T00:00:00Z'),
      taggedEvent('sightings', '2024-01-02T00:00:00Z'),
    ]);
    expect(group.events.map((e) => e.timestamp)).toEqual([
      '2024-01-01T00:00:00Z',
      '2024-01-02T00:00:00Z',
      '2024-01-03T00:00:00Z',
    ]);
  });

  test('reports startTime/endTime from sorted events', () => {
    const [group] = groupEventsByType([
      taggedEvent('sightings', '2024-01-03T00:00:00Z'),
      taggedEvent('sightings', '2024-01-01T00:00:00Z'),
    ]);
    expect(group.startTime).toBe('2024-01-01T00:00:00Z');
    expect(group.endTime).toBe('2024-01-03T00:00:00Z');
  });
});
