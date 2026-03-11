import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostDetectionEvents } from '@/pages/hosts/[hostId]/detection-events';

export const Route = createFileRoute(
  '/_enterprise/hosts/$hostId/detection-events',
)({
  component: () => (
    <PageBoundary key="host-detection-events">
      <HostDetectionEvents />
    </PageBoundary>
  ),
});
