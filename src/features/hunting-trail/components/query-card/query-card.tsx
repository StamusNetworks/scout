import { useState } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Markdown } from '@/common/design-system/atoms/markdown';
import { Button } from '@/common/design-system/atoms/ui/button';
import { DateTime } from '@/features/preferences';

import { TYPE_COLOR } from '../../model/hunting-trail';
import { type QueryGroup } from '../../model/purpose-grouping';
import { CardEventsTable } from '../card-events-table/card-events-table';
import { CardSummary } from '../card-summary/card-summary';

export const QueryCard = ({ group }: { group: QueryGroup }) => {
  const [showEvents, setShowEvents] = useState(false);
  const { type, events, name, description } = group;
  const { text, border } = TYPE_COLOR[type];

  return (
    <div className={`bg-card overflow-hidden border-l-2 ${border}`}>
      <div className="bg-muted/40 border-border flex flex-col gap-2 border-t px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`${text} text-[11px] font-semibold`}>{name}</span>
          <span className="text-muted-foreground text-xs">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </span>
          <span className="text-muted-foreground text-xs">/</span>
          <Row className="text-muted-foreground gap-1 text-xs whitespace-nowrap">
            <DateTime date={group.startTime} />
            <span>—</span>
            <DateTime date={group.endTime} />
          </Row>
        </div>
        <Markdown
          content={description}
          className="text-muted-foreground text-xs leading-relaxed"
        />
      </div>

      <div className="border-border border-t">
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
      </div>

      <div className="border-border border-t px-3 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={() => setShowEvents((v) => !v)}
        >
          {showEvents ? 'Show summary' : 'Show events'}
        </Button>
      </div>
    </div>
  );
};
