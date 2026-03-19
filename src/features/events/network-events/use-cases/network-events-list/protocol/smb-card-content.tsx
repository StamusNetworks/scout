import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Event } from '@/features/events/common/events.model';
import { EventValue } from '@/features/filtering/filters/query-filters/use-cases/interactive-value/event-value';

import { ProtocolLabel } from './protocol-label';

export const SmbCardContent = ({ event }: { event: Event }) => (
  <Row className="gap-4">
    {event.smb?.command && (
      <Column className="max-w-80 wrap-break-word">
        <ProtocolLabel query_key="smb.command" />
        <EventValue
          query_key="smb.command"
          value={event.smb?.command}
        />
      </Column>
    )}
    {event.smb?.dcerpc?.endpoint && (
      <Column className="wrap-break-word">
        <ProtocolLabel query_key="smb.dcerpc.endpoint" />
        <EventValue
          query_key="smb.dcerpc.endpoint"
          value={event.smb?.dcerpc?.endpoint}
        />
      </Column>
    )}
    {event.smb?.dcerpc?.interface && (
      <Column className="max-w-80 wrap-break-word">
        <ProtocolLabel query_key="smb.dcerpc.interface.name" />
        <EventValue
          query_key="smb.dcerpc.interface.name"
          value={event.smb?.dcerpc?.interface?.name}
        />
      </Column>
    )}
  </Row>
);
