import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { HostDetectionMethods } from '@/pages/hosts/[hostId]/detection-methods';

export const Route = createFileRoute(
  '/_enterprise/hosts/$hostId/detection-methods',
)({
  component: () => (
    <PageBoundary key="host-detection-methods">
      <HostDetectionMethods />
    </PageBoundary>
  ),
});
