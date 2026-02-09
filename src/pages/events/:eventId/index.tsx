import { Binary } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { Link } from 'react-router-dom';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Button } from '@/common/design-system/atoms/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '@/common/design-system/atoms/ui/empty';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { useGlobalQueryParams } from '@/common/fetching/useQueryParams';
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
import { routes } from '@/pages/routes.config';

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
          <EventDetailTabs
            event={event}
            variant="border"
            defaultTab="meta_view"
          >
            <MetaViewTab event={event} />
            <SyntheticTab event={event} />
            <JsonTab event={event} />
            <DetectionMethodTab event={event} />
            <RelatedEventsTabs />
            <PcapTab event={event} />
            <FilesTab />
          </EventDetailTabs>
        )}
      </DefaultPage>
    </>
  );
};
