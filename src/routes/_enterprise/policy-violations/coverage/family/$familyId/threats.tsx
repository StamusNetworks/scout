import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { PolicyViolationThreatsListPage } from '@/pages/policy-violations/coverage/family/threats';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/coverage/family/$familyId/threats',
)({
  component: () => (
    <PageBoundary key="pv-family-threats">
      <PolicyViolationThreatsListPage />
    </PageBoundary>
  ),
});
