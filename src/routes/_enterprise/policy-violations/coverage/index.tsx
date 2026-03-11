import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { PolicyViolationsCoveragePage } from '@/pages/policy-violations/coverage';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/',
)({
  component: () => (
    <PageBoundary key="pv-coverage">
      <PolicyViolationsCoveragePage />
    </PageBoundary>
  ),
});
