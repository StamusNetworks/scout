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
import { useGetSightingById } from '@/features/events/sightings/common/hooks/use-get-sighting-by-id';
import { SightingEventsCountsTimeline } from '@/features/events/sightings/common/molecules/events-counts-timeline';
import { EventsStream } from '@/features/events/sightings/common/molecules/events-stream';
import { SightingEventsTailFlow } from '@/features/events/sightings/common/molecules/events-tail-flow';
import { PatientZeroDetails } from '@/features/events/sightings/common/molecules/patient-zero-details';
import { SightingsMetadata } from '@/features/events/sightings/common/molecules/sightings-metadata';
import { EventValue } from '@/features/filtering/query-filters/components/event-value/event-value';
import { getFilterDef } from '@/features/filtering/query-filters/constants/query-filter.definition';

interface SightingDetailsProps {
  sightingId: string;
}

export const SightingDetails = ({ sightingId }: SightingDetailsProps) => {
  const { data: sighting, isFetching } = useGetSightingById(sightingId);

  return (
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
        <PatientZeroDetails sightingId={sightingId} />
      </Column>
      <Column>
        <CardTitle className="mb-3">Metadata</CardTitle>
        <ScrollArea
          className="overflow-auto pb-2"
          type="always"
        >
          <SightingsMetadata sightingId={sightingId} />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Column>
      <Column>
        <CardTitle className="mb-3">Events Timeline</CardTitle>
        <SightingEventsCountsTimeline sightingId={sightingId} />
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
            <SightingEventsTailFlow sightingId={sightingId} />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="table">
          <EventsStream sightingId={sightingId} />
        </TabsContent>
      </Tabs>
    </DefaultPage>
  );
};
