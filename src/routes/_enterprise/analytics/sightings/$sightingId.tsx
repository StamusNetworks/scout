import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { SightingDetails } from '@/pages/analytics/sightings/[id]';

export const Route = createFileRoute(
  '/_enterprise/analytics/sightings/$sightingId',
)({
  component: () => (
    <PageBoundary key="sighting-details">
      <SightingDetails />
    </PageBoundary>
  ),
});
