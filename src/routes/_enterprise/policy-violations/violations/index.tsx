import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatEntitiesOverview } from '@/features/threats';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/violations/',
)({
  component: () => (
    <PageBoundary key="pv-entities">
      <ThreatEntitiesOverview kind="policyViolation" />
    </PageBoundary>
  ),
});
