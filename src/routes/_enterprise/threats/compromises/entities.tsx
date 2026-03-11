import { createFileRoute } from '@tanstack/react-router';

import { PageBoundary } from '@/common/design-system/atoms/error-boundary';
import { ThreatsImpactedEntities } from '@/pages/threats/impacted-entities';

export const Route = createFileRoute(
  '/_enterprise/threats/compromises/entities',
)({
  component: () => (
    <PageBoundary key="threats-entities">
      <ThreatsImpactedEntities />
    </PageBoundary>
  ),
});
