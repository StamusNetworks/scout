import Flow from '@/common/design-system/graphs/proto-flow/flow';
import protoColumns from '@/common/design-system/graphs/proto-flow/flow.columns';
import { FlowSkeleton } from '@/common/design-system/graphs/proto-flow/flow.skeleton';

import { useGetSightingById } from '../../../hooks/use-get-sighting-by-id';
import { useGetSightingEventsTail } from '../../../hooks/use-get-sighting-events-tail';

interface SightingEventsTailFlowProps {
  sightingId: string;
}
export const SightingEventsTailFlow = ({
  sightingId,
}: SightingEventsTailFlowProps) => {
  const {
    data: sighting,
    isFetching: sightingFetching,
    isError: sightingError,
  } = useGetSightingById(sightingId);
  const invalidSighting =
    !sightingFetching &&
    sighting &&
    (!sighting.discovery?.key ||
      !sighting.discovery?.value ||
      !sighting.app_proto);
  const {
    data: events,
    isFetching: eventsFetching,
    isError: eventsError,
  } = useGetSightingEventsTail({
    key: sighting?.discovery?.key,
    value: sighting?.discovery?.value,
    protocol: sighting?.app_proto,
  });

  if (sightingFetching || eventsFetching) return <FlowSkeleton rowCount={4} />;
  if (sightingError || eventsError || invalidSighting) return <div>Error.</div>;
  if (!sighting || !events?.results?.length) return <div>No data.</div>;

  return (
    <Flow
      events={events.results}
      columns={protoColumns[sighting?.app_proto]}
    />
  );
};
