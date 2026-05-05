import { ArrowRight, MessageCircleWarning } from 'lucide-react';

import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { StatsBlock } from '@/common/design-system/atoms/page-stats';
import { Card } from '@/common/design-system/atoms/ui/card';
import { DateTime } from '@/common/design-system/entities/date-time';
import { Event } from '@/features/events/common/events.model';
import { EventValue } from '@/features/query-filters/use-cases/interactive-value/event-value';

export const EventDetails = ({ event }: { event: Event }) => (
  <Row className="mt-3 mb-4 gap-6">
    {event.stamus_novel && (
      <div className="flex size-7 items-center justify-center rounded-full bg-yellow-100 p-1">
        <MessageCircleWarning className="text-yellow-600" />
      </div>
    )}
    <StatsBlock
      label="Signature"
      value={
        <EventValue
          query_key="alert.signature"
          value={event.alert?.signature}
          className="mb-2 line-clamp-3 max-w-80 font-bold whitespace-normal"
        />
      }
    />
    <StatsBlock
      label="Mitre Tactic"
      value={
        <EventValue
          query_key="alert.metadata.mitre_tactic_name"
          value={event.alert?.metadata?.mitre_tactic_name?.[0]}
        />
      }
    />
    <StatsBlock
      label="Mitre Technique"
      value={
        <EventValue
          query_key="alert.metadata.mitre_technique_name"
          value={event.alert?.metadata?.mitre_technique_name?.[0]}
        />
      }
    />
    <StatsBlock
      label="Date"
      value={<DateTime date={event.timestamp} />}
    />
  </Row>
);

export const HostsInfos = ({
  source,
  destination,
}: {
  source: React.ReactNode;
  destination: React.ReactNode;
}) => (
  <Grid className="grid-cols-[1fr_min-content_1fr] gap-2">
    <Card className="p-4">
      Source IP
      {source}
    </Card>
    <div className="self-center">
      <ArrowRight />
    </div>
    <Card className="p-4">
      Destination IP
      {destination}
    </Card>
  </Grid>
);
