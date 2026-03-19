import { Row } from '@tanstack/react-table';
import { groupBy } from 'ramda';

import { Column } from '@/common/design-system/atoms/layout/column';
import { ProtoFlow } from '@/common/design-system/graphs/proto-flow/proto-flow';
import { esEscape } from '@/common/lib/strings';
import { useGetEventsQuery } from '@/features/events/common/events.api';
import { Event } from '@/features/events/common/events.model';
import { EventValue } from '@/features/filtering/query-filters/use-cases/interactive-value/event-value';
import { ThreatStatus } from '@/features/threats/common/threat-status.schema';

export const ThreatStatusExpandedRow = ({
  row,
}: {
  row: Row<ThreatStatus>;
}) => {
  const { data } = useGetEventsQuery({
    start_date: new Date(row.original.first_seen).getTime(),
    end_date: new Date(row.original.last_seen).getTime(),
    qfilter: `stamus.threat_id:${esEscape(String(row.original.threat_id))} AND (src_ip:${esEscape(row.original.asset)} OR dest_ip:${esEscape(row.original.asset)})`,
    stamus: true,
    alert: true,
  });
  const bySigId = groupBy(
    (e: Event) => e.alert?.signature_id.toString() || 'unknown',
  )(data?.results || []);
  const uniqueSignatures = data?.results.reduce(
    (acc, e) => {
      if (!e.alert) return acc;
      if (acc.some((s) => s.signature_id === e.alert?.signature_id)) return acc;
      return [...acc, e.alert];
    },
    [] as NonNullable<Event['alert']>[],
  );
  return (
    <Column className="gap-4 p-2">
      {uniqueSignatures?.map((s) => (
        <Column
          key={s.signature_id}
          className="gap-1"
        >
          <div key={s.signature_id}>
            <EventValue
              query_key="alert.signature"
              value={s.signature}
            />
          </div>
          <ProtoFlow events={bySigId[s.signature_id.toString()] || []} />
        </Column>
      ))}
    </Column>
  );
};
