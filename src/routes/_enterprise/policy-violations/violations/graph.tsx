import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { PolicyViolationsGraphPage } from '@/pages/policy-violations/graph';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/violations/graph',
)({
  component: () => (
    <PageBoundary key="pv-graph">
      <PolicyViolationsGraphPage />
    </PageBoundary>
  ),
});
