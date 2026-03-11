import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatByIdDetectionMethodsPage } from '@/pages/threats/coverage/threat/detection-methods';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/threat/$threatId/detection-methods',
)({
  component: () => (
    <PageBoundary key="threat-by-id-detection-methods">
      <ThreatByIdDetectionMethodsPage />
    </PageBoundary>
  ),
});
