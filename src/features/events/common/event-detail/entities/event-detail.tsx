import { ArrowRight, MessageCircleWarning } from 'lucide-react';

import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { StatsBlock } from '@/common/design-system/atoms/page-stats';
import { Card } from '@/common/design-system/atoms/ui/card';
import { DateTime } from '@/common/design-system/entities/date-time';
import { esEscape } from '@/common/lib/strings';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { Event } from '@/features/events/common/events.model';
import { EventValue } from '@/features/filtering/filters/query-filters/use-cases/interactive-value/event-value';
import { useGlobalQueryParams } from '@/features/filtering/use-global-query-params';
import { useGetHostWithAlertsQuery } from '@/features/host-insights/common/host-insights.api';
import { HostSummary } from '@/features/host-insights/use-cases/host-details/molecules/host-summary';
import { useGetImpactedEntitiesQuery } from '@/features/threats/common/entities.api';
import { selectDefaultEventDetailTab } from '@/features/ui/preferences/preferences.slice';
import { useAppSelector } from '@/store/store';

import { useGetEventsQuery } from '../../events.api';
import {
  DetectionMethodTab,
  EventDetailTabs,
  FilesTab,
  JsonTab,
  MetaViewTab,
  PcapTab,
  RelatedEventsTabs,
  SyntheticTab,
} from '..';

interface EventDetailProps {
  eventId: string;
}

export const EventDetail = ({ eventId }: EventDetailProps) => {
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const {
    data: eventData,
    isLoading: isLoadingEvent,
    isError: isErrorEvents,
  } = useGetEventsQuery(
    {
      ...params,
      start_date: 1,
      qfilter: `_id:"${esEscape(eventId)}"`,
      pageIndex: 0,
      pageSize: 1,
      stamus: true,
      alert: true,
      discovery: true,
    },
    {
      skip: !eventId,
    },
  );
  const event = eventData?.results?.[0];

  const { enterprise } = useFeatureFlags();
  const defaultTab = useAppSelector(selectDefaultEventDetailTab);

  const { data: sourceHost } = useGetHostWithAlertsQuery(
    {
      entity: event?.flow?.src_ip || event?.src_ip || '',
      tenant: params.tenant,
    },
    {
      skip: !event,
    },
  );
  const { data: sourceEntitiesList } = useGetImpactedEntitiesQuery(
    {
      asset: event?.flow?.src_ip || event?.src_ip,
      tenant: params.tenant,
      start_date: params.start_date,
      end_date: params.end_date,
    },
    {
      skip: !event,
    },
  );
  const sourceEntity = sourceEntitiesList?.results?.[0];

  const { data: destinationHost } = useGetHostWithAlertsQuery(
    {
      entity: event?.flow?.dest_ip || event?.dest_ip || '',
      tenant: params.tenant,
    },
    {
      skip: !event,
    },
  );
  const { data: destinationEntitiesList } = useGetImpactedEntitiesQuery(
    {
      asset: event?.flow?.dest_ip || event?.dest_ip,
      tenant: params.tenant,
      start_date: params.start_date,
      end_date: params.end_date,
    },
    {
      skip: !event,
    },
  );
  const destinationEntity = destinationEntitiesList?.results?.[0];

  const source = enterprise ? (
    <HostSummary
      host={sourceHost}
      entity={sourceEntity}
    />
  ) : (
    <EventValue
      query_key={event?.flow?.src_ip ? 'flow.src_ip' : 'src_ip'}
      value={event?.flow?.src_ip || event?.src_ip}
    />
  );
  const destination = enterprise ? (
    <HostSummary
      host={destinationHost}
      entity={destinationEntity}
    />
  ) : (
    <EventValue
      query_key={event?.flow?.dest_ip ? 'flow.dest_ip' : 'dest_ip'}
      value={event?.flow?.dest_ip || event?.dest_ip}
    />
  );

  if (isLoadingEvent) {
    return <div>Loading...</div>;
  }

  if (isErrorEvents || !event) {
    return <div>Error</div>;
  }

  return (
    <Column>
      <EventHeader event={event} />
      <div className="mb-4">
        <HostsInfos
          source={source}
          destination={destination}
        />
      </div>
      <EventDetailTabs
        event={event}
        variant="border"
        defaultTab={defaultTab}
      >
        <MetaViewTab event={event} />
        <SyntheticTab event={event} />
        <JsonTab event={event} />
        <DetectionMethodTab event={event} />
        <RelatedEventsTabs />
        <PcapTab event={event} />
        <FilesTab />
      </EventDetailTabs>
    </Column>
  );
};

const EventHeader = ({ event }: { event: Event }) => (
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

const HostsInfos = ({
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
