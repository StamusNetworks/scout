import {
  TaggedEvent,
  TIMELINE_TYPE_PRIORITY,
  TimelineGroup,
} from '../hunting-trail.model';

export function aggregateTimelineEvents(
  events: TaggedEvent[],
): TimelineGroup[] {
  const sorted = [...events].sort((a, b) => {
    const tA = new Date(a.timestamp).getTime();
    const tB = new Date(b.timestamp).getTime();
    if (tA !== tB) return tA - tB;
    return (
      TIMELINE_TYPE_PRIORITY[a.timelineType] -
      TIMELINE_TYPE_PRIORITY[b.timelineType]
    );
  });

  const groups: TimelineGroup[] = [];
  for (const event of sorted) {
    const last = groups[groups.length - 1];
    if (last && last.type === event.timelineType) {
      last.events.push(event);
      last.endTime = event.timestamp;
    } else {
      groups.push({
        type: event.timelineType,
        events: [event],
        startTime: event.timestamp,
        endTime: event.timestamp,
      });
    }
  }
  return groups;
}
