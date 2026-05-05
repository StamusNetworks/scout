import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatGraph } from '@/features/threats';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/violations/graph',
)({
  component: () => (
    <PageBoundary key="pv-graph">
      <ThreatGraph kind="policyViolation" />
    </PageBoundary>
  ),
});
