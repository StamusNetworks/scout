import { useState } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { DateTime } from '@/common/design-system/entities/date-time';

import { TimelineEventType, TimelineGroup } from '../hunting-trail.model';
import { CardEventsTable } from './card-events-table';
import { CardSummary } from './card-summary';

const TYPE_LABEL: Record<TimelineEventType, string> = {
  nrd: 'NRD',
  sightings: 'Sightings',
  file: 'File',
  lateral: 'Lateral',
  hunting: 'Hunting',
};

const TYPE_COLOR: Record<TimelineEventType, string> = {
  nrd: 'border-blue-500 text-blue-400',
  sightings: 'border-purple-500 text-purple-400',
  file: 'border-orange-500 text-orange-400',
  lateral: 'border-red-500 text-red-400',
  hunting: 'border-green-500 text-green-400',
};

export const HuntingTrailCard = ({ group }: { group: TimelineGroup }) => {
  const [showEvents, setShowEvents] = useState(false);
  const { type, events } = group;

  return (
    <div className={`border-l-2 ${TYPE_COLOR[type]} bg-card overflow-hidden`}>
      <Row className="bg-muted/40 border-border items-center gap-2 border-b px-3 py-2 text-xs">
        <span
          className={`font-bold tracking-wide uppercase ${TYPE_COLOR[type].split(' ')[1]}`}
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
