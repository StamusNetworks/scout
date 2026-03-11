import { useParams } from '@tanstack/react-router';

import { DefaultPage } from '@/common/design-system/atoms/default-page';
import { Column } from '@/common/design-system/atoms/layout/column';
import { CardTitle } from '@/common/design-system/atoms/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/common/design-system/atoms/ui/pillTabs';
import {
  ScrollArea,
  ScrollBar,
} from '@/common/design-system/atoms/ui/scroll-area';
import { Spin } from '@/common/design-system/atoms/ui/spin';
import { DateTime } from '@/common/design-system/entities/date-time';
import { OutletBreadcrumb } from '@/common/design-system/molecules/breadcrumbs';
import { SightingEventsCountsTimeline } from '@/features/analytics/sightings/components/events-counts-timeline/sighting-events-counts-timeline';
import { EventsStream } from '@/features/analytics/sightings/components/events-stream/events-stream';
import { SightingEventsTailFlow } from '@/features/analytics/sightings/components/events-tail-flow/sighting-events-tail-flow';
import { SightingsMetadata } from '@/features/analytics/sightings/components/metadata/sightings-metadata';
import { PatientZeroDetails } from '@/features/analytics/sightings/components/patient-zero-details/patient-zero-details';
import { useGetSightingById } from '@/features/analytics/sightings/hooks/use-get-sighting-by-id';
import { EventValue } from '@/features/hunt/filtering/query-filters/components/event-value/event-value';
import { getFilterDef } from '@/features/hunt/filtering/query-filters/constants/query-filter.definition';

export const SightingDetails = () => {
  const { sightingId } = useParams({ strict: false }) as { sightingId: string };
  const { data: sighting, isFetching } = useGetSightingById(sightingId!);
  return (
    <>
      <OutletBreadcrumb>{sightingId}</OutletBreadcrumb>
      <DefaultPage
        title="Sighting"
        className="space-y-8"
        stats={[
          {
            label:
              (sighting?.discovery?.key &&
                getFilterDef(sighting?.discovery.key)?.label) ??
              '',
            value: isFetching ? (
              <Spin />
            ) : sighting?.discovery?.key ? (
              <EventValue
                query_key={sighting?.discovery.key}
                value={sighting?.discovery.value}
                className="line-clamp-2 max-w-64 break-all whitespace-pre-wrap"
              />
            ) : (
              <div>Error.</div>
            ),
          },
          {
            label: 'Probe',
            value: isFetching ? (
              <Spin />
            ) : sighting?.host ? (
              <EventValue
                query_key="host"
                value={sighting?.host}
              />
            ) : (
              <div>Error.</div>
            ),
          },
          {
            label: 'Seen at',
            value: sighting?.timestamp ? (
              <DateTime date={sighting.timestamp} />
            ) : (
              'n/a'
            ),
          },
        ]}
      >
        <Column>
          <CardTitle className="mb-3">Patient Zero</CardTitle>
          <PatientZeroDetails sightingId={sightingId!} />
        </Column>
        <Column>
          <CardTitle className="mb-3">Metadata</CardTitle>
          <ScrollArea
            className="overflow-auto pb-2"
            type="always"
          >
            <SightingsMetadata sightingId={sightingId!} />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Column>
        <Column>
          <CardTitle className="mb-3">Events Timeline</CardTitle>
          <SightingEventsCountsTimeline sightingId={sightingId!} />
        </Column>
        <Tabs defaultValue="flow">
          <TabsList>
            <TabsTrigger value="flow">Flow Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
          <TabsContent value="flow">
            <ScrollArea
              className="overflow-auto pb-2"
              type="always"
            >
              <SightingEventsTailFlow sightingId={sightingId!} />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="table">
            <EventsStream sightingId={sightingId!} />
          </TabsContent>
        </Tabs>
      </DefaultPage>
    </>
  );
};
