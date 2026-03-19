import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Event } from '@/features/events/common/events.model';
import { EventValue } from '@/features/filtering/query-filters/use-cases/interactive-value/event-value';

import { ProtocolLabel } from './protocol-label';

export const TlsCardContent = ({ event }: { event: Event }) => (
  <Row className="gap-4">
    {event.tls?.sni && (
      <Column>
        <ProtocolLabel query_key="tls.sni" />
        <EventValue
          query_key="tls.sni"
          value={event.tls?.sni}
        />
      </Column>
    )}
    {event.tls?.ja3?.hash && (
      <Column className="max-w-80">
        <ProtocolLabel query_key="tls.ja3.hash" />
        <EventValue
          query_key="tls.ja3.hash"
          className="line-clamp-3 text-wrap break-all"
          value={
            Array.isArray(event.tls.ja3.hash)
              ? event.tls.ja3.hash[0]
              : event.tls.ja3.hash
          }
        />
      </Column>
    )}
    {event.tls?.ja3s && (
      <Column>
        <ProtocolLabel query_key="tls.ja3s" />
        <EventValue
          query_key="tls.ja3s"
          value={event.tls?.ja3s.hash}
        />
      </Column>
    )}
    {event.tls?.ja4 && (
      <Column>
        <ProtocolLabel query_key="tls.ja4" />
        <EventValue
          query_key="tls.ja4"
          value={event.tls?.ja4}
        />
      </Column>
    )}
  </Row>
);
