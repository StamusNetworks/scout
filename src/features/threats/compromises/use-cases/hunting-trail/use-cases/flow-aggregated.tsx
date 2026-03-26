import { Link } from '@tanstack/react-router';
import { Binary } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Row } from '@/common/design-system/atoms/layout/row';
import { Button } from '@/common/design-system/atoms/ui/button';
import { DateTime } from '@/common/design-system/entities/date-time';
import { EventValue } from '@/features/filtering/filters/query-filters/use-cases/interactive-value/event-value';

import {
  TaggedEvent,
  TimelineEventType,
  TYPE_COLOR,
  TYPE_LABEL,
} from '../hunting-trail.model';

// --- Transform ---

type FlowGroup = {
  flowId: number | null;
  srcIp: string;
  srcPort: number | undefined;
  destIp: string;
  destPort: number | undefined;
  appProto: string | undefined;
  startTime: string;
  endTime: string;
  events: TaggedEvent[];
  queryCounts: Map<TimelineEventType, number>;
};

function groupByFlow(events: TaggedEvent[]): FlowGroup[] {
  const flowMap = new Map<number, TaggedEvent[]>();
  const noFlow: TaggedEvent[] = [];

  for (const event of events) {
    if (event.flow_id != null) {
      const list = flowMap.get(event.flow_id);
      if (list) {
        list.push(event);
      } else {
        flowMap.set(event.flow_id, [event]);
      }
    } else {
      noFlow.push(event);
    }
  }

  const toGroup = (flowId: number | null, evts: TaggedEvent[]): FlowGroup => {
    const sorted = [...evts].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const first = sorted[0];
    const queryCounts = new Map<TimelineEventType, number>();
    for (const e of sorted) {
      queryCounts.set(
        e.timelineType,
        (queryCounts.get(e.timelineType) ?? 0) + 1,
      );
    }
    return {
      flowId,
      srcIp: first.flow?.src_ip ?? first.src_ip,
      srcPort: first.flow?.src_port ?? first.src_port,
      destIp: first.flow?.dest_ip ?? first.dest_ip,
      destPort: first.flow?.dest_port ?? first.dest_port,
      appProto: first.app_proto,
      startTime: sorted[0].timestamp,
      endTime: sorted[sorted.length - 1].timestamp,
      events: sorted,
      queryCounts,
    };
  };

  const groups: FlowGroup[] = [];
  for (const [flowId, evts] of flowMap) {
    groups.push(toGroup(flowId, evts));
  }
  groups.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  if (noFlow.length > 0) {
    groups.push(toGroup(null, noFlow));
  }

  return groups;
}

// --- UI ---

const QueryBadge = ({
  type,
  count,
}: {
  type: TimelineEventType;
  count?: number;
}) => {
  const { text, bg } = TYPE_COLOR[type];
  return (
    <span
      className={`${text} ${bg} inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium`}
    >
      {TYPE_LABEL[type]}
      {count != null && <strong>{count}</strong>}
    </span>
  );
};

const FlowCard = ({ group }: { group: FlowGroup }) => {
  const [showEvents, setShowEvents] = useState(false);

  return (
    <div className="bg-card border-border overflow-hidden border">
      {/* Header */}
      <Row className="bg-muted/40 border-border items-center gap-3 border-b px-3 py-2 text-xs">
        {group.flowId != null ? (
          <Row className="items-center gap-1">
            <EventValue
              query_key="src_ip"
              value={group.srcIp}
            />
            <span className="text-muted-foreground">:</span>
            <EventValue
              query_key="src_port"
              value={group.srcPort}
            />
            <span className="text-muted-foreground mx-1">→</span>
            <EventValue
              query_key="dest_ip"
              value={group.destIp}
            />
            <span className="text-muted-foreground">:</span>
            <EventValue
              query_key="dest_port"
              value={group.destPort}
            />
          </Row>
        ) : (
          <span className="text-foreground">Unassociated events</span>
        )}
        {group.appProto && group.flowId != null && (
          <span className="text-muted-foreground uppercase">
            {group.appProto}
          </span>
        )}
        {group.flowId != null && (
          <EventValue
            query_key="flow_id"
            value={group.flowId}
          />
        )}
        <Row className="text-muted-foreground ml-auto gap-1 whitespace-nowrap">
          <DateTime date={group.startTime} />
          <span>—</span>
          <DateTime date={group.endTime} />
        </Row>
      </Row>

      {/* Badge row */}
      <div className="flex flex-wrap gap-1.5 px-3 py-2">
        {Array.from(group.queryCounts.entries()).map(([type, count]) => (
          <QueryBadge
            key={type}
            type={type}
            count={count}
          />
        ))}
      </div>

      {/* Expandable events */}
      {showEvents && (
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/40 border-border border-t border-b">
              <th className="text-muted-foreground px-3 py-1.5 text-left font-normal">
                Time
              </th>
              <th className="text-muted-foreground px-3 py-1.5 text-left font-normal">
                Type
              </th>
              <th className="text-muted-foreground px-3 py-1.5 text-left font-normal">
                Signature
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            {group.events.map((event) => (
              <tr
                key={event._id}
                className="border-border border-b last:border-0"
              >
                <td className="text-muted-foreground px-3 py-1.5 whitespace-nowrap">
                  <DateTime date={event.timestamp} />
                </td>
                <td className="px-3 py-1.5">
                  <QueryBadge type={event.timelineType} />
                </td>
                <td className="px-3 py-1.5">
                  {event.alert?.signature ? (
                    <EventValue
                      query_key="alert.signature"
                      value={event.alert.signature}
                    />
                  ) : event.discovery?.key ? (
                    <EventValue
                      query_key="discovery.key"
                      value={event.discovery.key}
                    />
                  ) : event.fileinfo?.filename ? (
                    <EventValue
                      query_key="fileinfo.filename"
                      value={event.fileinfo.filename}
                    />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
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
      )}

      <div className="border-border border-t px-3 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={() => setShowEvents((v) => !v)}
        >
          {showEvents ? 'Hide events' : `Show ${group.events.length} events`}
        </Button>
      </div>
    </div>
  );
};

export const FlowAggregated = ({ events }: { events: TaggedEvent[] }) => {
  const groups = useMemo(() => groupByFlow(events), [events]);

  return (
    <div className="flex flex-col gap-2 p-2">
      {groups.map((group, idx) => (
        <FlowCard
          key={group.flowId ?? `noflow-${idx}`}
          group={group}
        />
      ))}
    </div>
  );
};
