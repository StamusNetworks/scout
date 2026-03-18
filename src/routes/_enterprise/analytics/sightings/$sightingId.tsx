import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { SightingDetails } from '@/features/events/sightings/use-cases/sighting-details/entities/sighting-details';

export const Route = createFileRoute(
  '/_enterprise/analytics/sightings/$sightingId',
)({
  component: () => (
    <PageBoundary key="sighting-details">
      <SightingDetailPage />
    </PageBoundary>
  ),
});

function SightingDetailPage() {
  const { sightingId } = Route.useParams();
  return <SightingDetails sightingId={sightingId} />;
}
