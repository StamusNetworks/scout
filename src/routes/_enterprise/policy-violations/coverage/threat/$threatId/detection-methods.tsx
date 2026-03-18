import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatByIdDetectionMethods } from '@/features/threats/common/templates/threat-by-id/threat-by-id.detection-methods';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/threat/$threatId/detection-methods',
)({
  component: () => (
    <PageBoundary key="pv-by-id-detection-methods">
      <ThreatByIdDetectionMethods />
    </PageBoundary>
  ),
});
