import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostOutlierEvents } from '@/pages/hosts/[hostId]/outlier-events';

export const Route = createFileRoute(
  '/_enterprise/hosts/$hostId/outlier-events',
)({
  component: () => (
    <PageBoundary key="host-outlier-events">
      <HostOutlierEvents />
    </PageBoundary>
  ),
});
