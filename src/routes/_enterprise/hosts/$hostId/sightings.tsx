import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostSightings } from '@/pages/hosts/[hostId]/sightings';

export const Route = createFileRoute('/_enterprise/hosts/$hostId/sightings')({
  component: () => (
    <PageBoundary key="host-sightings">
      <HostSightings />
    </PageBoundary>
  ),
});
