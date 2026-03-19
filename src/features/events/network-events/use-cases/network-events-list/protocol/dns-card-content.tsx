import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Event } from '@/features/events/common/events.model';
import { EventValue } from '@/features/filtering/query-filters/use-cases/interactive-value/event-value';

import { ProtocolLabel } from './protocol-label';

export const DnsCardContent = ({ event }: { event: Event }) => (
  <Row className="gap-4">
    {event.dns?.rrname && (
      <Column className="max-w-80 wrap-break-word">
        <ProtocolLabel query_key="dns.rrname" />
        <EventValue
          query_key="dns.rrname"
          value={event.dns?.rrname}
        />
      </Column>
    )}
    {event.dns?.rrtype && (
      <Column className="max-w-80 wrap-break-word">
        <ProtocolLabel query_key="dns.rrtype" />
        <EventValue
          query_key="dns.rrtype"
          value={event.dns?.rrtype}
        />
      </Column>
    )}
  </Row>
);
