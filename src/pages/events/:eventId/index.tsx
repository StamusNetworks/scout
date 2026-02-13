import { ArrowRight, Binary, MessageCircleWarning } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { Link } from 'react-router-dom';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Column } from '@/common/design-system/atoms/layout/column';
import { Grid } from '@/common/design-system/atoms/layout/grid';
import { Row } from '@/common/design-system/atoms/layout/row';
import { StatsBlock } from '@/common/design-system/atoms/page-stats';
import { Button } from '@/common/design-system/atoms/ui/button';
import { Card } from '@/common/design-system/atoms/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import { DateTime } from '@/common/design-system/entities/date-time';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
import { useFeatureFlags } from '@/common/lib/use-feature-flags';
import { useGetHostWithAlertsQuery } from '@/features/analytics/hosts/api/hosts.api';
import { HostSummary } from '@/features/analytics/hosts/components/host-summary/host-summary';
import { useGetImpactedEntitiesQuery } from '@/features/hunt/entities/api/entities.api';
import { useGetEventsQuery } from '@/features/hunt/events/api/events.api';
import {
  DetectionMethodTab,
  EventDetailTabs,
  FilesTab,
  JsonTab,
  MetaViewTab,
  PcapTab,
  RelatedEventsTabs,
  SyntheticTab,
} from '@/features/hunt/events/components/event-detail-tabs';
import { Event } from '@/features/hunt/events/model/event.schema';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';
import { selectDefaultEventDetailTab } from '@/features/ui/preferences/preferences.slice';
import { routes } from '@/pages/routes.config';
import { useAppSelector } from '@/store/store';

export const EventByIdPage = () => {
  const [_id] = useQueryState('_id', parseAsString);
  const [uuid] = useQueryState('uuid', parseAsString);
  const params = useGlobalQueryParams(['tenant', 'dates']);
  const {
    data: eventData,
    isLoading: isLoadingEvent,
    isError: isErrorEvents,
  } = useGetEventsQuery(
    {
      ...params,
      start_date: 1,
      qfilter: uuid ? `uuid:"${uuid}"` : `_id:"${_id}"`,
      pageIndex: 0,
      pageSize: 1,
      stamus: true,
      alert: true,
      discovery: true,
    },
    {
      skip: !_id && !uuid,
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

  return (
    <>
      <OutletBreadcrumb link={routes.events}>Events</OutletBreadcrumb>
      <OutletBreadcrumb>{event?.uuid || event?._id}</OutletBreadcrumb>
      <DefaultPage title="Event details">
        {isLoadingEvent ? (
          <div>Loading...</div>
        ) : !_id && !uuid ? (
          <Empty className="min-h-96 border">
            <EmptyMedia variant="icon">
              <Binary />
            </EmptyMedia>
            <EmptyHeader>No event id provided</EmptyHeader>
            <EmptyDescription className="flex flex-col gap-2">
              An event id is required to view an event.
              <Link to="/events">
                <Button>View events</Button>
              </Link>
            </EmptyDescription>
          </Empty>
        ) : isErrorEvents || !event ? (
          <div>Error</div>
        ) : (
          <Column>
            <EventDetails event={event} />
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
        )}
      </DefaultPage>
    </>
  );
};

export const EventDetails = ({ event }: { event: Event }) => (
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

export const HostsInfos = ({
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
