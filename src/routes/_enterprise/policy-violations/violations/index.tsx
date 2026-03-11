import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { PolicyViolationsImpactedEntities } from '@/pages/policy-violations/impacted-entities';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/violations/',
)({
  component: () => (
    <PageBoundary key="pv-impacted-entities">
      <PolicyViolationsImpactedEntities />
    </PageBoundary>
  ),
});
