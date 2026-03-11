import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { Sightings } from '@/pages/analytics/sightings';

export const Route = createFileRoute('/_enterprise/analytics/sightings/')({
  component: () => (
    <PageBoundary key="sightings">
      <Sightings />
    </PageBoundary>
  ),
});
