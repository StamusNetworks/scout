import { Column } from '@/common/design-system/atoms/layout/column';

import { TaggedEvent } from '../hunting-trail.model';
import { HuntingTrailCard } from '../molecules/hunting-trail-card';
import { aggregateTimelineEvents } from '../utils/aggregate-timeline-events';

export const AggregatedTimeline = ({ events }: { events: TaggedEvent[] }) => {
  const groups = aggregateTimelineEvents(events);

  return (
    <Column className="gap-2 p-2">
      {groups.map((group, idx) => (
        <HuntingTrailCard
          key={`${group.type}-${group.startTime}-${idx}`}
          group={group}
        />
      ))}
    </Column>
  );
};
