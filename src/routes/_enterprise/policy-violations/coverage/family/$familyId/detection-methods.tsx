import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { FamilyDetectionMethods } from '@/features/threats/components/family-detection-methods/family-detection-methods';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/family/$familyId/detection-methods',
)({
  component: () => (
    <PageBoundary key="pv-family-detection-methods">
      <FamilyDetectionMethods />
    </PageBoundary>
  ),
});
