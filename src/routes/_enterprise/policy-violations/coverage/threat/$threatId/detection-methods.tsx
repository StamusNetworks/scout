import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { PolicyViolationByIdDetectionMethods } from '@/pages/policy-violations/coverage/policy-violation/detection-methods';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/threat/$threatId/detection-methods',
)({
  component: () => (
    <PageBoundary key="pv-by-id-detection-methods">
      <PolicyViolationByIdDetectionMethods />
    </PageBoundary>
  ),
});
