import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostBeaconing } from '@/pages/hosts/[hostId]/beacons';

export const Route = createFileRoute('/_enterprise/hosts/$hostId/beacons')({
  component: () => (
    <PageBoundary key="host-beacons">
      <HostBeaconing />
    </PageBoundary>
  ),
});
