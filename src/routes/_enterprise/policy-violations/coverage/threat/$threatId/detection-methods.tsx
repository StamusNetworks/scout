import { createFileRoute, useParams } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatDetectionMethods } from '@/features/threats';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/threat/$threatId/detection-methods',
)({
  component: () => {
    const { threatId } = useParams({ strict: false }) as { threatId: string };
    return (
      <PageBoundary key="pv-by-id-detection-methods">
        <ThreatDetectionMethods threatId={threatId} />
      </PageBoundary>
    );
  },
});
