import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { DetectionMethods } from '@/pages/detection-methods';

export const Route = createFileRoute('/detection-methods/')({
  component: () => (
    <PageBoundary key="detection-methods">
      <DetectionMethods />
    </PageBoundary>
  ),
});
