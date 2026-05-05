import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { FamilyDetectionMethods } from '@/features/threats';

export const Route = createFileRoute(
  '/_enterprise/threats/coverage/family/$familyId/detection-methods',
)({
  component: () => (
    <PageBoundary key="threat-family-detection-methods">
      <FamilyDetectionMethods />
    </PageBoundary>
  ),
});
