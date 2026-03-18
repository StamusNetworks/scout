import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Event } from '@/features/events/common/events.model';
import { EventValue } from '@/features/filtering/query-filters/components/event-value/event-value';

import { ProtocolLabel } from './protocol-label';

export const AnomalyCardContent = ({ event }: { event: Event }) => (
  <Row className="gap-4">
    <Column className="max-w-80 wrap-break-word">
      <ProtocolLabel query_key="anomaly.app_proto" />
      <EventValue
        query_key="anomaly.app_proto"
        value={event.anomaly?.app_proto ?? ''}
      />
    </Column>
    <Column className="max-w-24 truncate">
      <ProtocolLabel query_key="anomaly.layer" />
      <EventValue
        query_key="anomaly.layer"
        value={event.anomaly?.layer}
      />
    </Column>
    <Column className="max-w-96 truncate">
      <ProtocolLabel query_key="anomaly.event" />
      <EventValue
        query_key="anomaly.event"
        value={event.anomaly?.event}
      />
    </Column>
  </Row>
);
