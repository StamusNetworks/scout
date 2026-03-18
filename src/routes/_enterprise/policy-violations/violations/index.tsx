import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { PolicyViolationsEntities } from '@/features/threats/policy-violations/use-cases/entities/entities/policy-violations-entities';

export const Route = createFileRoute(
  '/_enterprise/policy-violations/violations/',
)({
  component: () => (
    <PageBoundary key="pv-entities">
      <PolicyViolationsEntities />
    </PageBoundary>
  ),
});
