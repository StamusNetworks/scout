import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { formatBytes } from '@/common/lib/numbers';
import { Event } from '@/features/events/common/events.model';
import { EventValue } from '@/features/filtering/query-filters/use-cases/interactive-value/event-value';

import { ProtocolLabel } from './protocol-label';

export const FileinfoCardContent = ({ event }: { event: Event }) => (
  <Row className="gap-4">
    <Column className="max-w-80 wrap-break-word">
      <ProtocolLabel query_key="fileinfo.filename" />
      <EventValue
        query_key="fileinfo.filename"
        value={event.fileinfo?.filename}
      />
    </Column>
    <Column className="max-w-24 truncate">
      <ProtocolLabel query_key="fileinfo.size" />
      <EventValue
        query_key="fileinfo.size"
        value={event.fileinfo?.size}
      >
        {formatBytes(event.fileinfo?.size ?? 0)}
      </EventValue>
    </Column>
    <Column className="max-w-48 truncate">
      <ProtocolLabel query_key="fileinfo.sha256" />
      <EventValue
        query_key="fileinfo.sha256"
        value={event.fileinfo?.sha256}
      />
    </Column>
    <Column className="max-w-48 truncate">
      <ProtocolLabel query_key="fileinfo.mimetype" />
      <EventValue
        query_key="fileinfo.mimetype"
        value={event.fileinfo?.mimetype}
      />
    </Column>
  </Row>
);
