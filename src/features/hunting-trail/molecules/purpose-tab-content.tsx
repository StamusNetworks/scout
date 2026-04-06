import { useMemo } from 'react';

import {
  PurposeGroupData,
  TaggedEvent,
  TimelineEventType,
} from '@/features/hunting-trail/hunting-trail.model';
import {
  QueryCard,
  QueryGroup,
} from '@/features/hunting-trail/molecules/query-card';

function buildQueryGroups(events: TaggedEvent[]): QueryGroup[] {
  const byType = new Map<TimelineEventType, TaggedEvent[]>();
  for (const event of events) {
    const list = byType.get(event.timelineType);
    if (list) {
      list.push(event);
    } else {
      byType.set(event.timelineType, [event]);
    }
  }

  const groups: QueryGroup[] = [];
  for (const [type, evts] of byType) {
    const sorted = [...evts].toSorted(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    groups.push({
      type,
      events: sorted,
      startTime: sorted[0].timestamp,
      endTime: sorted[sorted.length - 1].timestamp,
    });
  }
  return groups;
}

export function PurposeTabContent({ group }: { group: PurposeGroupData }) {
  const queryGroups = useMemo(
    () => buildQueryGroups(group.events),
    [group.events],
  );

  if (group.isLoading) {
    return (
      <div className="flex flex-col gap-2 p-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-muted h-16 animate-pulse rounded-md"
          />
        ))}
      </div>
    );
  }

  if (group.isError) {
    return (
      <div className="text-destructive p-4 text-sm">
        Failed to load data for this category.
      </div>
    );
  }

  if (queryGroups.length === 0) {
    return (
      <div className="text-muted-foreground p-4 text-sm">
        No events found for this category in the selected time range.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      {queryGroups.map((qg) => (
        <QueryCard
          key={qg.type}
          group={qg}
        />
      ))}
    </div>
  );
}
