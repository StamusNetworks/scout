import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatFamilyDetectionMethods } from '@/features/threats/common/templates/family-by-id/family-by-id.detection-methods';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/family/$familyId/detection-methods',
)({
  component: () => (
    <PageBoundary key="threat-family-detection-methods">
      <ThreatFamilyDetectionMethods />
    </PageBoundary>
  ),
});
