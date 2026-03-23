import { describe, expect, it } from 'vitest';

import {
  makeFileEvent,
  makeHuntingEvent,
  makeLateralEvent,
  makeNrdEvent,
  makeSightingEvent,
} from '@/features/events/common/events.mocks';

import { TaggedEvent } from '../hunting-trail.model';
import { aggregateTimelineEvents } from './aggregate-timeline-events';

const tag = (
  event: ReturnType<typeof makeNrdEvent>,
  timelineType: TaggedEvent['timelineType'],
): TaggedEvent => ({ ...event, timelineType });

describe('aggregateTimelineEvents', () => {
  it('returns empty array for empty input', () => {
    expect(aggregateTimelineEvents([])).toEqual([]);
  });

  it('wraps a single event in one group', () => {
    const events = [tag(makeNrdEvent(), 'nrd')];
    const groups = aggregateTimelineEvents(events);
    expect(groups).toHaveLength(1);
    expect(groups[0].type).toBe('nrd');
    expect(groups[0].events).toHaveLength(1);
    expect(groups[0].startTime).toBe(groups[0].endTime);
  });

  it('groups consecutive same-type events', () => {
    const events = [
      tag(makeNrdEvent({ _id: 'a', timestamp: '2026-01-12T08:00:00Z' }), 'nrd'),
      tag(makeNrdEvent({ _id: 'b', timestamp: '2026-01-12T09:00:00Z' }), 'nrd'),
    ];
    const groups = aggregateTimelineEvents(events);
    expect(groups).toHaveLength(1);
    expect(groups[0].events).toHaveLength(2);
    expect(groups[0].startTime).toBe('2026-01-12T08:00:00Z');
    expect(groups[0].endTime).toBe('2026-01-12T09:00:00Z');
  });

  it('does NOT group same-type events separated by a different type', () => {
    const events = [
      tag(
        makeSightingEvent({ _id: 'a', timestamp: '2026-01-12T08:00:00Z' }),
        'sightings',
      ),
      tag(
        makeSightingEvent({ _id: 'b', timestamp: '2026-01-12T09:00:00Z' }),
        'sightings',
      ),
      tag(makeFileEvent({ timestamp: '2026-01-12T10:00:00Z' }), 'file'),
      tag(makeHuntingEvent({ timestamp: '2026-01-12T11:00:00Z' }), 'hunting'),
      tag(
        makeHuntingEvent({ _id: 'c', timestamp: '2026-01-12T12:00:00Z' }),
        'hunting',
      ),
      tag(makeLateralEvent({ timestamp: '2026-01-12T13:00:00Z' }), 'lateral'),
      tag(
        makeSightingEvent({ _id: 'd', timestamp: '2026-01-12T14:00:00Z' }),
        'sightings',
      ),
      tag(
        makeSightingEvent({ _id: 'e', timestamp: '2026-01-12T15:00:00Z' }),
        'sightings',
      ),
      tag(
        makeSightingEvent({ _id: 'f', timestamp: '2026-01-12T16:00:00Z' }),
        'sightings',
      ),
      tag(
        makeHuntingEvent({ _id: 'g', timestamp: '2026-01-12T17:00:00Z' }),
        'hunting',
      ),
    ];
    const groups = aggregateTimelineEvents(events);
    expect(groups.map((g) => `${g.type}×${g.events.length}`)).toEqual([
      'sightings×2',
      'file×1',
      'hunting×2',
      'lateral×1',
      'sightings×3',
      'hunting×1',
    ]);
  });

  it('sorts events by timestamp before grouping', () => {
    const events = [
      tag(makeNrdEvent({ _id: 'b', timestamp: '2026-01-12T09:00:00Z' }), 'nrd'),
      tag(makeLateralEvent({ timestamp: '2026-01-12T10:00:00Z' }), 'lateral'),
      tag(makeNrdEvent({ _id: 'a', timestamp: '2026-01-12T08:00:00Z' }), 'nrd'),
    ];
    const groups = aggregateTimelineEvents(events);
    expect(groups).toHaveLength(2);
    expect(groups[0].type).toBe('nrd');
    expect(groups[0].events).toHaveLength(2);
    expect(groups[1].type).toBe('lateral');
  });

  it('uses type-priority as a tie-breaker for identical timestamps', () => {
    const ts = '2026-01-12T08:00:00Z';
    const events = [
      tag(makeHuntingEvent({ _id: 'h', timestamp: ts }), 'hunting'),
      tag(makeNrdEvent({ _id: 'n', timestamp: ts }), 'nrd'),
    ];
    const groups = aggregateTimelineEvents(events);
    expect(groups[0].type).toBe('nrd');
    expect(groups[1].type).toBe('hunting');
  });
});
