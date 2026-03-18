import { Column } from '@/common/design-system/atoms/layout/column';
import { Row } from '@/common/design-system/atoms/layout/row';
import { Event } from '@/features/events/common/events.model';
import { EventValue } from '@/features/filtering/query-filters/components/event-value/event-value';

import { ProtocolLabel } from './protocol-label';

export const HttpCardContent = ({ event }: { event: Event }) => (
  <Row className="flex-wrap gap-4">
    {event.http?.url && (
      <Column className="max-w-80">
        <ProtocolLabel query_key="http.url" />
        <EventValue
          query_key="http.url"
          className="line-clamp-3 text-wrap break-all"
          value={event.http?.url}
        />
      </Column>
    )}
    {event.http?.http_method && (
      <Column>
        <ProtocolLabel query_key="http.http_method" />
        <EventValue
          query_key="http.http_method"
          value={event.http?.http_method}
        />
      </Column>
    )}
    {event.http?.http_content_type && (
      <Column>
        <ProtocolLabel query_key="http.http_content_type" />
        <EventValue
          query_key="http.http_content_type"
          value={event.http?.http_content_type}
        />
      </Column>
    )}
    {event.http?.status && (
      <Column className="max-w-24 truncate">
        <ProtocolLabel query_key="http.status" />
        <EventValue
          query_key="http.status"
          value={event.http?.status}
        />
      </Column>
    )}
    {event.http?.protocol && (
      <Column className="truncate">
        <ProtocolLabel query_key="http.protocol" />
        <EventValue
          query_key="http.protocol"
          value={event.http?.protocol}
        />
      </Column>
    )}
    {event.http?.server && (
      <Column className="truncate">
        <ProtocolLabel query_key="http.server" />
        <EventValue
          query_key="http.server"
          value={event.http?.server}
        />
      </Column>
    )}
    {event.http?.http_user_agent && (
      <Column className="max-w-80 truncate">
        <ProtocolLabel query_key="http.http_user_agent" />
        <EventValue
          query_key="http.http_user_agent"
          className="line-clamp-3 text-wrap"
          value={event.http?.http_user_agent}
        />
      </Column>
    )}
  </Row>
);
