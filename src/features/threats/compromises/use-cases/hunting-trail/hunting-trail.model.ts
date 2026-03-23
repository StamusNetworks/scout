import { Event } from '@/features/events/common/events.model';

export type TimelineEventType =
  | 'nrd'
  | 'sightings'
  | 'file'
  | 'lateral'
  | 'hunting';

export const TIMELINE_TYPE_PRIORITY: Record<TimelineEventType, number> = {
  nrd: 0,
  sightings: 1,
  file: 2,
  lateral: 3,
  hunting: 4,
};

export type TaggedEvent = Event & { timelineType: TimelineEventType };

export type TimelineGroup = {
  type: TimelineEventType;
  events: TaggedEvent[];
  startTime: string;
  endTime: string;
};
