import Flow from '@/common/design-system/graphs/proto-flow/flow';
import protoColumns from '@/common/design-system/graphs/proto-flow/flow.columns';
import { FlowSkeleton } from '@/common/design-system/graphs/proto-flow/flow.skeleton';

import { useGetSightingById } from '../../../hooks/use-get-sighting-by-id';

interface SightingsMetadataProps {
  sightingId: string;
}
export const SightingsMetadata = ({ sightingId }: SightingsMetadataProps) => {
  const { data: sighting, isFetching } = useGetSightingById(sightingId);

  if (isFetching) return <FlowSkeleton rowCount={1} />;

  if (!sighting) return <div>Error.</div>;

  return (
    <Flow
      events={[sighting]}
      columns={protoColumns[sighting.app_proto]}
    />
  );
};
