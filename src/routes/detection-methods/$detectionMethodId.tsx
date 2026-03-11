import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { DetectionMethods } from '@/pages/detection-methods';

export const Route = createFileRoute('/detection-methods/$detectionMethodId')({
  component: () => (
    <PageBoundary key="detection-method-by-id">
      <DetectionMethods />
    </PageBoundary>
  ),
});
