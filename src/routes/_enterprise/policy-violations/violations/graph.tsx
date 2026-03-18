import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { PolicyViolationsGraph } from '@/features/threats/policy-violations/use-cases/graph/entities/policy-violations-graph';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/violations/graph',
)({
  component: () => (
    <PageBoundary key="pv-graph">
      <PolicyViolationsGraph />
    </PageBoundary>
  ),
});
