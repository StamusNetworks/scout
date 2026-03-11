import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatFamilyDetectionMethodsPage } from '@/pages/threats/coverage/family/detection-methods';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/family/$familyId/detection-methods',
)({
  component: () => (
    <PageBoundary key="threat-family-detection-methods">
      <ThreatFamilyDetectionMethodsPage />
    </PageBoundary>
  ),
});
