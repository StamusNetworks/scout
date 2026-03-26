import { useMemo, useState } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { DateTime } from '@/common/design-system/entities/date-time';

import {
  TaggedEvent,
  TimelineEventType,
  TYPE_COLOR,
  TYPE_LABEL,
} from '../hunting-trail.model';
import { CardEventsTable } from '../molecules/card-events-table';
import { CardSummary } from '../molecules/card-summary';

// --- Transform ---

type QueryGroup = {
  type: TimelineEventType;
  events: TaggedEvent[];
  startTime: string;
  endTime: string;
};

function groupByQuery(events: TaggedEvent[]): QueryGroup[] {
  const map = new Map<TimelineEventType, TaggedEvent[]>();
  for (const event of events) {
    const list = map.get(event.timelineType);
    if (list) {
      list.push(event);
    } else {
      map.set(event.timelineType, [event]);
    }
  }

  return Array.from(map.entries()).map(([type, evts]) => {
    const sorted = evts.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    return {
      type,
      events: sorted,
      startTime: sorted[0].timestamp,
      endTime: sorted[sorted.length - 1].timestamp,
    };
  });
}

// --- UI ---

const QueryCard = ({ group }: { group: QueryGroup }) => {
  const [showEvents, setShowEvents] = useState(false);
  const { type, events } = group;

  return (
    <div
      className={`border-l-2 ${TYPE_COLOR[type].border} ${TYPE_COLOR[type].text} bg-card overflow-hidden`}
    >
      <Row className="bg-muted/40 border-border items-center gap-2 border-t border-b px-3 py-2 text-xs">
        <span
          className={`font-bold tracking-wide uppercase ${TYPE_COLOR[type].text}`}
        >
          {TYPE_LABEL[type]}
        </span>
        <span className="text-muted-foreground">
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </span>
        <span className="text-muted-foreground">/</span>
        <Row className="text-muted-foreground gap-1 whitespace-nowrap">
          <DateTime date={group.startTime} />
          <span>—</span>
          <DateTime date={group.endTime} />
        </Row>
      </Row>

      {showEvents ? (
        <CardEventsTable
          type={type}
          events={events}
        />
      ) : (
        <CardSummary
          type={type}
          events={events}
        />
      )}

      <div className="border-border border-t px-3 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={() => setShowEvents((v) => !v)}
        >
          {showEvents ? 'Hide events' : 'Show events'}
        </Button>
      </div>
    </div>
  );
};

export const QueryAggregated = ({ events }: { events: TaggedEvent[] }) => {
  const groups = useMemo(() => groupByQuery(events), [events]);

  return (
    <div className="flex flex-col gap-2 p-2">
      {groups.map((group) => (
        <QueryCard
          key={group.type}
          group={group}
        />
      ))}
    </div>
  );
};
