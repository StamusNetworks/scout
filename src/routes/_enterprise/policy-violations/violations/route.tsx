import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ViolationsPage } from '@/pages/policy-violations/violations';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/violations',
)({
  component: () => (
    <PageBoundary key="violations">
      <ViolationsPage />
    </PageBoundary>
  ),
});
