import { Link } from '@tanstack/react-router';
import { Binary } from 'lucide-react';

import { Button } from '@/common/design-system/atoms/ui/button';
import { DateTime } from '@/common/design-system/entities/date-time';
import { EventValue } from '@/features/filtering/filters/query-filters/use-cases/interactive-value/event-value';

import { TimelineEventType, TimelineGroup } from '../hunting-trail.model';

type EventItem = TimelineGroup['events'][number];

const displayIp = (event: EventItem) => event.flow?.src_ip ?? event.src_ip;
const displayDestIp = (event: EventItem) =>
  event.flow?.dest_ip ?? event.dest_ip;

const TYPE_COLUMN_HEADERS: Record<TimelineEventType, string[]> = {
  nrd: ['Domain', 'Src IP', 'Dest IP', 'Signature'],
  sightings: ['Asset', 'Key', 'Value'],
  file: ['Filename', 'MIME type', 'Size', 'Src IP', 'Dest IP'],
  lateral: ['Signature', 'Src IP', 'Dest IP', 'Movement'],
  hunting: ['Signature', 'Src IP', 'Dest IP'],
};

export const CardEventsTable = ({
  type,
  events,
}: {
  type: TimelineEventType;
  events: TimelineGroup['events'];
}) => (
  <table className="w-full text-xs">
    <thead>
      <tr className="bg-muted/40 border-border border-b">
        <th className="text-muted-foreground px-3 py-2 text-left font-normal">
          Time
        </th>
        {TYPE_COLUMN_HEADERS[type].map((header) => (
          <th
            key={header}
            className="text-muted-foreground px-3 py-2 text-left font-normal"
          >
            {header}
          </th>
        ))}
        <th />
      </tr>
    </thead>
    <tbody>
      {events.map((event) => (
        <tr
          key={event._id}
          className="border-border border-b last:border-0"
        >
          <td className="text-muted-foreground px-3 py-1.5 whitespace-nowrap">
            <DateTime date={event.timestamp} />
          </td>
          {type === 'nrd' && (
            <>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key="hostname_info.domain"
                  value={event.hostname_info?.domain}
                />
              </td>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key="src_ip"
                  value={displayIp(event)}
                />
              </td>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key="dest_ip"
                  value={displayDestIp(event)}
                />
              </td>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key="alert.signature"
                  value={event.alert?.signature}
                />
              </td>
            </>
          )}
          {type === 'sightings' && (
            <>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key="discovery.asset"
                  value={event.discovery?.asset}
                />
              </td>
              <td className="text-muted-foreground px-3 py-1.5">
                {event.discovery?.key}
              </td>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key={event.discovery?.key ?? 'discovery.value'}
                  value={event.discovery?.value}
                />
              </td>
            </>
          )}
          {type === 'file' && (
            <>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key={
                    event.fileinfo ? 'fileinfo.filename' : 'files.filename'
                  }
                  value={event.fileinfo?.filename ?? event.files?.[0]?.filename}
                />
              </td>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key={
                    event.fileinfo ? 'fileinfo.mimetype' : 'files.mimetype'
                  }
                  value={event.fileinfo?.mimetype ?? event.files?.[0]?.mimetype}
                />
              </td>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key={event.fileinfo ? 'fileinfo.size' : 'files.size'}
                  value={event.fileinfo?.size ?? event.files?.[0]?.size}
                />
              </td>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key="src_ip"
                  value={displayIp(event)}
                />
              </td>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key="dest_ip"
                  value={displayDestIp(event)}
                />
              </td>
            </>
          )}
          {type === 'lateral' && (
            <>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key="alert.signature"
                  value={event.alert?.signature}
                />
              </td>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key="src_ip"
                  value={displayIp(event)}
                />
              </td>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key="dest_ip"
                  value={displayDestIp(event)}
                />
              </td>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key="alert.lateral"
                  value={event.alert?.lateral}
                />
              </td>
            </>
          )}
          {type === 'hunting' && (
            <>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key="alert.signature"
                  value={event.alert?.signature}
                />
              </td>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key="src_ip"
                  value={displayIp(event)}
                />
              </td>
              <td className="px-3 py-1.5">
                <EventValue
                  query_key="dest_ip"
                  value={displayDestIp(event)}
                />
              </td>
            </>
          )}
          <td className="px-3 py-1.5 text-right">
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-foreground"
              asChild
            >
              <Link
                to="/detection-events/event"
                search={{ _id: event._id }}
                preload={false}
              >
                <Binary />
              </Link>
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
